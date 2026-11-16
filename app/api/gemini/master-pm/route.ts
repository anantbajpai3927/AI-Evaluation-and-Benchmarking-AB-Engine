import { NextRequest, NextResponse } from 'next/server';
import { FLAGSHIP_SCENARIOS } from '@/lib/data/scenarios';
import { generateWithFallbackCascade } from '@/lib/gemini-fallback';
import { MarathonEngine } from '@/lib/engine/marathon-engine';
import { MASTER_PM_SYSTEM_PROMPT } from '@/lib/prompts/master-pm';

/**
 * Public Challenge Dispatch Route.
 * Proprietary prompt choreography & domain traps reside in @apexproof/private-core.
 */
export async function POST(req: NextRequest) {
  try {
    const { scenarioId, preferredModel, mutationTurnIndex } = await req.json();
    const scenario = FLAGSHIP_SCENARIOS.find((s) => s.id === scenarioId) || FLAGSHIP_SCENARIOS[0];
    const activeMutation = scenario.successiveFeatureMutations[Math.min(mutationTurnIndex || 0, Math.max(0, scenario.successiveFeatureMutations.length - 1))];

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const promptText = `Synthesize a structured validation brief JSON for scenario "${scenario.title}" (${scenario.category}).`;
        const cascadeResult = await generateWithFallbackCascade(promptText, {
          preferredModel: preferredModel || 'gemini-3.8-flash',
          systemInstruction: MASTER_PM_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          timeoutMs: 6500,
        });
        if (cascadeResult.text) {
          return NextResponse.json({ success: true, data: JSON.parse(cascadeResult.text), modelUsed: cascadeResult.modelUsed, wasFallback: cascadeResult.wasFallback });
        }
      } catch (err) {
        console.warn('[MasterPM] Reference fallback:', err);
      }
    }

    const challengeText = MarathonEngine.formatNaturalSymptomChallenge({
      scenarioTitle: scenario.title,
      profession: scenario.userPersonaProfile.profession,
      symptomBrief: scenario.naturalLanguageSymptomBrief,
      constraints: scenario.realWorldConstraints,
      roadmap: scenario.futureArchitecturalRoadmap,
      mutation: activeMutation,
    });

    return NextResponse.json({
      success: true,
      data: {
        challengeTitle: `${scenario.title} — Reference Probe`,
        observableUserSymptoms: scenario.naturalLanguageSymptomBrief,
        adversarialPrompt: challengeText,
        userPersonaContext: {
          profession: scenario.userPersonaProfile.profession,
          workflowStressVector: scenario.userPersonaProfile.adversarialVectors[0]?.actionTitle || 'Standard Stress',
          catastrophicRiskPrevented: scenario.userPersonaProfile.highStakesRiskStatement
        },
        criticalInvariantsTested: scenario.repoContext.criticalInvariants,
        hiddenTraps: ['[Loaded from @apexproof/private-core in full engine]'],
        targetFiles: scenario.repoContext.allowedTargetFiles,
        irrelevantHoneypotFiles: ['styles/unrelated.css']
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to generate challenge' }, { status: 500 });
  }
}
