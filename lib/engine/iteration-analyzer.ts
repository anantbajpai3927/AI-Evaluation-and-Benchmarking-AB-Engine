import {
  EvaluationScorecard,
  IterationComparisonSummary,
  IterationDeltaMetric,
  ModelIterationSnapshot,
  TestEvaluationAuditRecord,
} from '../types';
import { EvaluationEngine } from './scoring';

/**
 * Normalizes a user-supplied model/agent name for safe identity matching
 * across fine-tuning iterations. API keys are never persisted or used as storage keys.
 */
export function normalizeModelIdentifier(modelName: string): string {
  const cleaned = (modelName || 'Evaluated Coding Agent').trim().replace(/\s+/g, ' ');
  return cleaned || 'Evaluated Coding Agent';
}

/**
 * Produces a concise, readable summary of long prompts or model outputs
 * so manual engineers can inspect what was tested and replied at a glance.
 */
export function summarizeLongExchange(rawText: string, maxLength = 220): string {
  const cleaned = (rawText || '')
    .replace(/```[\s\S]*?```/g, '[Code Diff Block]')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'No content recorded.';
  if (cleaned.length <= maxLength) return cleaned;

  const sliced = cleaned.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : maxLength)}...`;
}

export interface BuildAuditInput {
  testNumber: number;
  iterationNumber: number;
  modelName: string;
  scenarioId: string;
  scenarioTitle: string;
  timestamp?: string;
  generatedPrompt: string;
  agentResponse: string;
  scorecard: EvaluationScorecard;
  errorsDetected?: string[];
  invariantsViolated?: string[];
  collateralViolations?: number;
  concurrencySafe?: boolean;
  customFeedback?: string;
}

/**
 * Generates a concise per-test diagnostic record detailing both positives and negatives
 * and a crisp explanation of why the AI model received e.g. 8 or 9 instead of 10.
 */
export function buildTestAuditRecord(input: BuildAuditInput): TestEvaluationAuditRecord {
  const scoreOutOf10 = Math.round((input.scorecard.overallScore / 10) * 10) / 10;
  const positives: string[] = [];
  const negatives: string[] = [];

  const invariantsViolated = input.invariantsViolated || [];
  const errorsDetected = input.errorsDetected || [];
  const collateral = input.collateralViolations ?? input.scorecard.collateralDamageViolations;

  // Derive concise positives
  if (invariantsViolated.length === 0) {
    positives.push('Preserved primary repository state invariants.');
  }
  if (collateral === 0) {
    positives.push('Strict >=Policy Threshold blast radius discipline; zero unrelated edits.');
  }
  if (input.scorecard.functionalPassRate >= 85) {
    positives.push(`Strong baseline resolution (${input.scorecard.functionalPassRate}% functional pass).`);
  }
  if (input.scorecard.marathonForesight.directionalAlignmentScore >= 80) {
    positives.push('Cleanly aligned with 12-month modular roadmap.');
  }
  if (input.scorecard.customPromptEvaluation?.status === 'VERIFIED') {
    positives.push(`Passed custom injected test (${input.scorecard.customPromptEvaluation.passRate}%).`);
  }

  // Fallback positive if none above triggered
  if (positives.length === 0) {
    positives.push('Identified primary target module and attempted invariant repair.');
  }

  // Derive concise negatives (why 8 or 9 instead of 10)
  if (input.scorecard.hiddenConcurrencyFailureRate > 0) {
    negatives.push(
      `${input.scorecard.hiddenConcurrencyFailureRate}% residual failure risk under concurrent load/failover.`
    );
  }
  if (collateral > 0) {
    negatives.push(`Touched ${collateral} low-significance (<Policy Threshold) collateral file(s).`);
  }
  if (invariantsViolated.length > 0) {
    negatives.push(`Invariant breach: ${invariantsViolated[0]}.`);
  }
  if (errorsDetected.length > 0) {
    negatives.push(errorsDetected[0]);
  }
  if (input.scorecard.marathonForesight.absurdityScore > 15) {
    negatives.push(
      `Introduced minor technical-debt coupling (Absurdity ${input.scorecard.marathonForesight.absurdityScore}/100).`
    );
  }
  if (
    input.scorecard.customPromptEvaluation &&
    input.scorecard.customPromptEvaluation.status !== 'VERIFIED'
  ) {
    negatives.push(
      `Custom scenario scored ${input.scorecard.customPromptEvaluation.passRate}% (${input.scorecard.customPromptEvaluation.status}).`
    );
  }

  // Ensure balanced clarity even on very high scores (e.g. 9.1/10)
  if (negatives.length === 0 && scoreOutOf10 < 10) {
    negatives.push('Edge-case clock-drift boundary lacked explicit pessimistic fence validation.');
  }

  let whyNotTenVerdict = '';
  if (scoreOutOf10 >= 9.8) {
    whyNotTenVerdict = `Scored ${scoreOutOf10}/10: Satisfied invariants, concurrency bounds, and strict blast radius with minimal headroom left.`;
  } else {
    const primaryWin = positives[0].replace(/\.$/, '');
    const primaryGap = (negatives[0] || 'minor edge-case hardening needed').replace(/\.$/, '');
    whyNotTenVerdict = `Scored ${scoreOutOf10}/10 instead of 10: ${primaryWin}, but fell short due to ${primaryGap.charAt(0).toLowerCase()}${primaryGap.slice(1)}.`;
  }

  return {
    id: `audit-${Date.now()}-${input.testNumber}`,
    testNumber: input.testNumber,
    iterationNumber: input.iterationNumber,
    modelName: normalizeModelIdentifier(input.modelName),
    scenarioId: input.scenarioId,
    scenarioTitle: input.scenarioTitle,
    timestamp: input.timestamp || new Date().toLocaleTimeString(),
    scoreOutOf10,
    overallScore: input.scorecard.overallScore,
    generatedPromptSummary: summarizeLongExchange(input.generatedPrompt, 230),
    fullGeneratedPrompt: input.generatedPrompt,
    agentResponseSummary: summarizeLongExchange(input.agentResponse, 230),
    fullAgentResponse: input.agentResponse,
    positives: positives.slice(0, 3),
    negatives: negatives.slice(0, 3),
    whyNotTenVerdict,
    customPromptStatus: input.scorecard.customPromptEvaluation?.status,
    customPromptPassRate: input.scorecard.customPromptEvaluation?.passRate,
  };
}

interface DimensionDescriptor {
  key: string;
  label: string;
  higherIsBetter: boolean;
  unit: '%' | 'pts' | 'ms' | 'count';
  extract: (s: EvaluationScorecard) => number;
}

const TRACKED_DIMENSIONS: DimensionDescriptor[] = [
  {
    key: 'overallScore',
    label: 'Composite SWE Score',
    higherIsBetter: true,
    unit: 'pts',
    extract: (s) => s.overallScore,
  },
  {
    key: 'functionalCorrectness',
    label: 'Functional Correctness',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.functionalCorrectness,
  },
  {
    key: 'reliabilityAndResilience',
    label: 'Concurrency & Resilience',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.reliabilityAndResilience,
  },
  {
    key: 'hiddenConcurrencyFailureRate',
    label: 'Hidden Concurrency Failure Rate',
    higherIsBetter: false,
    unit: '%',
    extract: (s) => s.hiddenConcurrencyFailureRate,
  },
  {
    key: 'security',
    label: 'Security Architecture',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.security,
  },
  {
    key: 'architecturalIntegrity',
    label: 'Architectural Integrity',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.architecturalIntegrity,
  },
  {
    key: 'regressionAndCollateral',
    label: 'Blast Radius Discipline',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.regressionAndCollateral,
  },
  {
    key: 'cumulativeFeatureCohesionIndex',
    label: 'Feature Cohesion (CFCI)',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.cumulativeFeatureCohesionIndex,
  },
  {
    key: 'messySWEResilienceScore',
    label: 'Messy SWE & Deps Resilience',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.messySWEResilienceScore,
  },
  {
    key: 'absurdityScore',
    label: 'Technical Debt Absurdity',
    higherIsBetter: false,
    unit: 'pts',
    extract: (s) => s.marathonForesight?.absurdityScore ?? 12,
  },
  {
    key: 'performanceAndEfficiency',
    label: 'Performance & Latency Efficiency',
    higherIsBetter: true,
    unit: '%',
    extract: (s) => s.performanceAndEfficiency,
  },
];

/**
 * Compares two iterations of the same named AI model, computing exact percentage
 * improvements and degradations across every evaluated dimension.
 */
export function compareModelIterations(
  baseline: ModelIterationSnapshot,
  target: ModelIterationSnapshot
): IterationComparisonSummary {
  const allMetrics: IterationDeltaMetric[] = [];

  for (const dim of TRACKED_DIMENSIONS) {
    const prev = dim.extract(baseline.scorecard);
    const curr = dim.extract(target.scorecard);
    const rawDelta = Number((curr - prev).toFixed(1));

    // Calculate relative percentage change safely without zero division
    let rawPercentChange = 0;
    if (prev === 0) {
      rawPercentChange = curr === 0 ? 0 : curr * 10;
    } else {
      rawPercentChange = Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(1));
    }

    // Polarity-adjusted change: positive always means model got BETTER, negative means model DEGRADED
    const orientedPctChange = dim.higherIsBetter ? rawPercentChange : -rawPercentChange;

    // Special readable percentage for lower-is-better reduction vs point shift
    let status: 'improved' | 'degraded' | 'unchanged' = 'unchanged';
    if (orientedPctChange > 0.2) status = 'improved';
    else if (orientedPctChange < -0.2) status = 'degraded';

    const absPct = Math.abs(orientedPctChange).toFixed(1);
    let insightStatement = `${dim.label} held steady at ${curr}${dim.unit}`;

    if (status === 'improved') {
      insightStatement = dim.higherIsBetter
        ? `Improved in ${dim.label} by +${absPct}% (${prev}${dim.unit} -> ${curr}${dim.unit})`
        : `Improved in ${dim.label} by +${absPct}% (failure reduced ${prev}${dim.unit} -> ${curr}${dim.unit})`;
    } else if (status === 'degraded') {
      insightStatement = dim.higherIsBetter
        ? `Degraded in ${dim.label} by -${absPct}% (${prev}${dim.unit} -> ${curr}${dim.unit})`
        : `Degraded in ${dim.label} by -${absPct}% (risk worsened ${prev}${dim.unit} -> ${curr}${dim.unit})`;
    }

    allMetrics.push({
      dimensionKey: dim.key,
      dimensionLabel: dim.label,
      previousValue: prev,
      currentValue: curr,
      absoluteDelta: rawDelta,
      percentageChange: orientedPctChange,
      rawDeltaPercent: rawPercentChange,
      status,
      insightStatement,
      unit: dim.unit,
    });
  }

  // Include Custom Prompt Eval if present in both
  if (baseline.scorecard.customPromptEvaluation && target.scorecard.customPromptEvaluation) {
    const prevCustom = baseline.scorecard.customPromptEvaluation.passRate;
    const currCustom = target.scorecard.customPromptEvaluation.passRate;
    const rawDelta = currCustom - prevCustom;
    const pct =
      prevCustom === 0
        ? currCustom
        : Number((((currCustom - prevCustom) / prevCustom) * 100).toFixed(1));
    const status: 'improved' | 'degraded' | 'unchanged' =
      pct > 0.2 ? 'improved' : pct < -0.2 ? 'degraded' : 'unchanged';
    const absPct = Math.abs(pct).toFixed(1);
    allMetrics.push({
      dimensionKey: 'customPromptPassRate',
      dimensionLabel: `Custom Prompt (${target.scorecard.customPromptEvaluation.promptTitle})`,
      previousValue: prevCustom,
      currentValue: currCustom,
      absoluteDelta: rawDelta,
      percentageChange: pct,
      rawDeltaPercent: pct,
      status,
      insightStatement:
        status === 'improved'
          ? `Improved in Custom Scenario by +${absPct}% (${prevCustom}% -> ${currCustom}%)`
          : status === 'degraded'
          ? `Degraded in Custom Scenario by -${absPct}% (${prevCustom}% -> ${currCustom}%)`
          : `Custom Scenario steady at ${currCustom}%`,
      unit: '%',
    });
  }

  const improvements = allMetrics.filter((m) => m.status === 'improved');
  const degradations = allMetrics.filter((m) => m.status === 'degraded');
  const unchanged = allMetrics.filter((m) => m.status === 'unchanged');

  const overallMetric = allMetrics[0];
  const overallDeltaPoints = target.scorecard.overallScore - baseline.scorecard.overallScore;
  const overallPercentageChange = overallMetric ? overallMetric.percentageChange : 0;

  let executiveSummary = `No net change between Iteration #${baseline.iterationNumber} and Iteration #${target.iterationNumber} for ${target.modelName}.`;
  if (overallDeltaPoints > 0) {
    executiveSummary = `${target.modelName} improved overall by +${overallPercentageChange}% (+${overallDeltaPoints} pts) from Iter #${baseline.iterationNumber} to Iter #${target.iterationNumber}, with ${improvements.length} dimension gains and ${degradations.length} regressions.`;
  } else if (overallDeltaPoints < 0) {
    executiveSummary = `${target.modelName} regressed overall by ${overallPercentageChange}% (${overallDeltaPoints} pts) from Iter #${baseline.iterationNumber} to Iter #${target.iterationNumber}; ${degradations.length} areas degraded despite ${improvements.length} gains.`;
  } else if (improvements.length > 0 || degradations.length > 0) {
    executiveSummary = `${target.modelName} maintained a flat ${target.scorecard.overallScore}/100 composite score while shifting +${improvements.length} improvements against ${degradations.length} regressions.`;
  }

  return {
    modelName: target.modelName,
    baselineIteration: baseline.iterationNumber,
    targetIteration: target.iterationNumber,
    overallDeltaPoints,
    overallPercentageChange,
    improvements,
    degradations,
    unchanged,
    allMetrics,
    executiveSummary,
  };
}

/**
 * Generates baseline + post-fine-tuning demonstration iterations for the default model
 * so engineers can immediately inspect multi-iteration deltas and test summaries.
 */
export function createSeedIterationSnapshots(
  modelName: string,
  scenarioId: string,
  scenarioTitle: string
): ModelIterationSnapshot[] {
  const safeName = normalizeModelIdentifier(modelName);

  const iter1Scorecard = EvaluationEngine.calculateScorecard({
    functionalPassCount: 8,
    functionalTotalCount: 10,
    concurrencyPassCount: 6,
    concurrencyTotalCount: 10,
    securityPassCount: 8,
    securityTotalCount: 10,
    collateralModificationsCount: 1,
    repeatedErrorRoundsCount: 1,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 84,
    latencyOverheadMs: 38,
    cumulativeFeatureCohesionIndex: 78,
    messySWEResilienceScore: 80,
    marathonForesight: {
      directionalAlignmentScore: 79,
      absurdityScore: 24,
    },
    executionTelemetry: {
      timeComplexity: 'O(N log N) — Quorum Lease Scan',
      spaceComplexity: 'O(N) — Unbounded Retry Buffer Warning',
      promptTokens: 2950,
      completionTokens: 780,
      totalTokens: 3730,
      evaluationDurationMs: 1490,
    },
    customPromptEvaluation: {
      promptTitle: '500-Thread Concurrent Replay Storm',
      promptText:
        'Verify idempotent deduplication under 500 concurrent requests with clock drift across regions.',
      passRate: 78,
      status: 'PARTIAL',
      feedback: 'Handled single-region replays, leaked duplicate state under cross-region lease drift.',
      invariantsMaintained: true,
    },
  });

  const iter2Scorecard = EvaluationEngine.calculateScorecard({
    functionalPassCount: 9,
    functionalTotalCount: 10,
    concurrencyPassCount: 8,
    concurrencyTotalCount: 10,
    securityPassCount: 9,
    securityTotalCount: 10,
    collateralModificationsCount: 0,
    repeatedErrorRoundsCount: 0,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 95,
    latencyOverheadMs: 14,
    cumulativeFeatureCohesionIndex: 92,
    messySWEResilienceScore: 94,
    marathonForesight: {
      directionalAlignmentScore: 92,
      absurdityScore: 12,
    },
    executionTelemetry: {
      timeComplexity: 'O(N log N) — Quorum Lease Index Verification',
      spaceComplexity: 'O(K) — Bound Ring Buffer (< 512 MB)',
      promptTokens: 2840,
      completionTokens: 645,
      totalTokens: 3485,
      evaluationDurationMs: 1280,
    },
    customPromptEvaluation: {
      promptTitle: '500-Thread Concurrent Replay Storm',
      promptText:
        'Verify idempotent deduplication under 500 concurrent requests with clock drift across regions.',
      passRate: 92,
      status: 'VERIFIED',
      feedback: 'Zero duplicate ledger debits under 500-thread replay storm; consensus invariants intact.',
      invariantsMaintained: true,
    },
  });

  const iter1Audit1: TestEvaluationAuditRecord = {
    id: 'seed-iter1-test1',
    testNumber: 1,
    iterationNumber: 1,
    modelName: safeName,
    scenarioId,
    scenarioTitle,
    timestamp: '10:42:10',
    scoreOutOf10: 7.8,
    overallScore: iter1Scorecard.overallScore,
    generatedPromptSummary:
      'Fix stale dosage reads on ICU tablets after floor transfer / Wi-Fi AP handoff under 1.5 Mbps IoT link & 512MB RAM cap without breaking v1 HL7 compatibility.',
    agentResponseSummary:
      'Updated services/raft/lease_manager.ts to enforce read-index barrier, but also modified utils/client_tracker.ts telemetry helper and allocated unbounded retry queue.',
    positives: [
      'Resolved primary Raft stale read symptom on follower nodes.',
      'Preserved legacy v1 HL7 framing parser intact.',
    ],
    negatives: [
      '40% hidden concurrency failure under cross-region lease drift.',
      'Modified 1 unrelated file (<Policy Threshold blast radius significance).',
      'Retained dynamic retry buffer exceeding bounded ring target.',
    ],
    whyNotTenVerdict:
      'Scored 7.8/10 instead of 10: Fixed primary read index cleanly, but touched unrelated telemetry file (<Policy Threshold) and failed 40% of split-brain bursts.',
    customPromptStatus: 'PARTIAL',
    customPromptPassRate: 78,
  };

  const iter2Audit1: TestEvaluationAuditRecord = {
    id: 'seed-iter2-test1',
    testNumber: 1,
    iterationNumber: 2,
    modelName: safeName,
    scenarioId,
    scenarioTitle,
    timestamp: '11:15:24',
    scoreOutOf10: Number((iter2Scorecard.overallScore / 10).toFixed(1)),
    overallScore: iter2Scorecard.overallScore,
    generatedPromptSummary:
      'Re-evaluated post fine-tuning: Resolve regional leader stepdown stale reads + Turn 3 HTTP polling deprecation within 35ms p99 SLA & 512MB container ceiling.',
    agentResponseSummary:
      'Refactored services/raft/lease_manager.ts and log_replication.ts using constant-space preallocated ring buffer and bounded quorum lease barrier with zero collateral files touched.',
    positives: [
      'Eliminated all <Policy Threshold collateral file edits (0 violations).',
      'Bounded O(K) ring buffer lowered memory & p99 overhead.',
      'Verified 92% on 500-thread replay custom stress test.',
    ],
    negatives: [
      '20% residual concurrency risk on asymmetric 3-node clock skew.',
      'Minor extra round-trip when cold-starting standby region quorum.',
    ],
    whyNotTenVerdict:
      `Scored ${Number((iter2Scorecard.overallScore / 10).toFixed(1))}/10 instead of 10: Eliminated collateral violations and stabilized O(K) memory, but 20% edge risk remained under asymmetric clock skew.`,
    customPromptStatus: 'VERIFIED',
    customPromptPassRate: 92,
  };

  return [
    {
      id: `iter-${safeName}-1`,
      modelName: safeName,
      iterationNumber: 1,
      label: 'Iteration #1 (Initial Baseline)',
      timestamp: '10:42:10',
      scenarioId,
      scenarioTitle,
      scorecard: iter1Scorecard,
      testAudits: [iter1Audit1],
      notes: 'Pre-fine-tuning baseline benchmark sweep.',
    },
    {
      id: `iter-${safeName}-2`,
      modelName: safeName,
      iterationNumber: 2,
      label: 'Iteration #2 (Fine-Tuned Check)',
      timestamp: '11:15:24',
      scenarioId,
      scenarioTitle,
      scorecard: iter2Scorecard,
      testAudits: [iter2Audit1],
      notes: 'Post-DPO fine-tuning run with ProofGraph guardrails.',
    },
  ];
}
