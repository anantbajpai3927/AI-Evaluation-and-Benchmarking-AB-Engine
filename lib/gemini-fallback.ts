import { GoogleGenAI } from '@google/genai';

/**
 * Free-tier Gemini models in descending order of coding and marathon SWE reasoning:
 * 1. 'gemini-3.8-flash': Best available free tier model for complex reasoning and coding
 * 2. 'gemini-flash-latest': High-throughput reliable fallback
 * 3. 'gemini-3.1-flash-lite': Minimal latency and lowest quota usage when upper tiers hit rate limits
 */
export const FREE_TIER_SWE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
] as const;

export type FreeTierModelName = (typeof FREE_TIER_SWE_MODELS)[number];

export interface CascadeOptions {
  preferredModel?: string;
  systemInstruction?: string;
  responseMimeType?: string;
  tools?: Array<{ googleSearch?: Record<string, unknown> }>;
  timeoutMs?: number;
}

export interface CascadeResult {
  text: string;
  modelUsed: string;
  wasFallback: boolean;
  groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
}

/**
 * Executes a Gemini content generation request with automatic cascading fallback
 * across free-tier models when rate limits, 429 quota exhaustion, or timeouts occur.
 */
export async function generateWithFallbackCascade(
  contents: string,
  options: CascadeOptions = {}
): Promise<CascadeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Determine model sequence starting with the preferred or default to gemini-3.8-flash
  let modelSequence: string[] = [...FREE_TIER_SWE_MODELS];
  if (options.preferredModel && options.preferredModel !== 'auto-cascade') {
    const preferred = options.preferredModel;
    modelSequence = [
      preferred,
      ...FREE_TIER_SWE_MODELS.filter((m) => m !== preferred),
    ];
  }

  const timeoutMs = options.timeoutMs ?? 7000;
  let lastError: unknown = null;

  for (let i = 0; i < modelSequence.length; i++) {
    const model = modelSequence[i];
    try {
      // Build config object
      const config: Record<string, unknown> = {};
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.tools) {
        config.tools = options.tools;
      }

      // Execute with per-model timeout
      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const response = (await Promise.race([
        generatePromise,
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Timeout (${timeoutMs}ms) exceeded for model ${model}`
                ),
              ),
            timeoutMs
          )
        ),
      ])) as {
        text?: string;
        candidates?: Array<{
          groundingMetadata?: {
            groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
          };
        }>;
      };

      if (response && typeof response.text === 'string') {
        const groundingChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        return {
          text: response.text,
          modelUsed: model,
          wasFallback: i > 0,
          groundingChunks,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = String(err);
      console.warn(
        `[ApexProof Cascade] Model ${model} encountered error or rate limit, cascading to next model... Details: ${errorMsg}`
      );
      // Continue loop to try next model in fallback cascade
    }
  }

  throw lastError || new Error('All free-tier models in cascade failed');
}
