import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallbackCascade } from '@/lib/gemini-fallback';
import { AgentFailureIntel } from '@/lib/types';

/**
 * Public Reference Proxy for Research Incident Search.
 * Proprietary adversarial query templates reside in @apexproof/private-core.
 */
export async function POST(req: NextRequest) {
  try {
    const { query, scenarioCategory, preferredModel } = await req.json();
    const searchQuery = query || 'AI coding agent evaluation failure patterns';

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const systemInstruction = 'Summarize public research findings on AI coding agent reliability into structured JSON.';
        const userPrompt = `Summarize 2 public reliability failure patterns for "${searchQuery}" (${scenarioCategory || 'General SWE'}) as JSON array of AgentFailureIntel items.`;
        const cascadeResult = await generateWithFallbackCascade(userPrompt, {
          preferredModel: preferredModel || 'gemini-3.8-flash',
          systemInstruction,
          tools: [{ googleSearch: {} }],
          timeoutMs: 6500,
        });

        if (cascadeResult.text) {
          const jsonMatch = cascadeResult.text.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const parsed: AgentFailureIntel[] = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ success: true, data: parsed, modelUsed: cascadeResult.modelUsed, wasFallback: cascadeResult.wasFallback });
          }
        }
      } catch (err) {
        console.warn('[AgentFailuresSearch] Reference fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'ref-fail-1',
          sourceTitle: 'Reference Architecture Failure Pattern',
          sourceUrlOrAuthority: 'Public Showcase Fixture',
          incidentYear: '2026',
          failingAgentArchetype: 'Multi-Turn Autonomous Worker',
          failureMode: 'Scope Boundary Drift Under Sequential Changes',
          triggeringConditions: 'Full curated incident dataset is loaded from @apexproof/private-core.',
          synthesizedMasterPMTestPrompt: 'Verify invariant preservation while modifying the target consensus adapter.'
        }
      ]
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load failure patterns' }, { status: 500 });
  }
}
