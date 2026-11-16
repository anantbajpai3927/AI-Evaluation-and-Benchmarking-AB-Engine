import { EvaluationScorecard, ExecutionTelemetry, CustomPromptEvaluation } from '../types';

export interface ScoreInputs {
  functionalPassCount: number;
  functionalTotalCount: number;
  concurrencyPassCount: number;
  concurrencyTotalCount: number;
  securityPassCount: number;
  securityTotalCount: number;
  collateralModificationsCount: number;
  repeatedErrorRoundsCount: number;
  resurrectedBugsCount: number;
  refactorPreservationRate: number;
  latencyOverheadMs: number;
  marathonForesight?: {
    directionalAlignmentScore?: number;
    absurdityScore?: number;
    marathonGrade?: 'EXEMPLARY_FORESIGHT' | 'TACTICALLY_SOUND' | 'ARCHITECTURAL_DEBT' | 'HIGH_ABSURDITY_FAILURE';
    identifiedFutureBlockers?: string[];
    alignmentRationale?: string;
    absurdityDetails?: string;
  };
  cumulativeFeatureCohesionIndex?: number;
  messySWEResilienceScore?: number;
  executionTelemetry?: Partial<ExecutionTelemetry>;
  customPromptEvaluation?: CustomPromptEvaluation;
}

/**
 * Public Reference Evaluation Engine.
 * Proprietary production scoring weights and calibration matrices reside in @apexproof/private-core.
 */
export class EvaluationEngine {
  static calculateScorecard(inputs: ScoreInputs): EvaluationScorecard {
    const functionalPassRate = Math.round(
      (inputs.functionalPassCount / Math.max(1, inputs.functionalTotalCount)) * 100
    );
    const concurrencyPassRate = Math.round(
      (inputs.concurrencyPassCount / Math.max(1, inputs.concurrencyTotalCount)) * 100
    );
    const hiddenConcurrencyFailureRate = Math.max(0, 100 - concurrencyPassRate);
    const securityPassRate = Math.round(
      (inputs.securityPassCount / Math.max(1, inputs.securityTotalCount)) * 100
    );

    const architecturalIntegrity = Math.max(
      0,
      Math.min(100, Math.round(inputs.refactorPreservationRate - inputs.collateralModificationsCount * 10))
    );
    const reliabilityAndResilience = Math.max(0, Math.min(100, concurrencyPassRate));
    const longHorizonCompletion = Math.max(
      0,
      Math.min(100, 100 - (inputs.repeatedErrorRoundsCount + inputs.resurrectedBugsCount) * 10)
    );
    const performanceAndEfficiency = Math.max(
      0,
      Math.min(100, Math.round(100 - Math.min(50, inputs.latencyOverheadMs / 10)))
    );
    const regressionAndCollateral = Math.max(
      0,
      Math.min(100, 100 - (inputs.collateralModificationsCount + inputs.resurrectedBugsCount) * 20)
    );

    const overallScore = Math.round(
      (functionalPassRate +
        architecturalIntegrity +
        securityPassRate +
        reliabilityAndResilience +
        longHorizonCompletion +
        performanceAndEfficiency +
        regressionAndCollateral) /
        7
    );

    const repeatPenalty = inputs.repeatedErrorRoundsCount * 10;
    const resurrectedPenalty = inputs.resurrectedBugsCount * 15;
    const loopScore = Math.max(0, 100 - repeatPenalty - resurrectedPenalty);

    const alignmentScore = inputs.marathonForesight?.directionalAlignmentScore ?? 85;
    const absurdityScore = inputs.marathonForesight?.absurdityScore ?? (inputs.collateralModificationsCount > 0 ? 55 : 15);
    const marathonGrade =
      inputs.marathonForesight?.marathonGrade ??
      (absurdityScore > 50 ? 'HIGH_ABSURDITY_FAILURE' : alignmentScore >= 85 ? 'EXEMPLARY_FORESIGHT' : 'TACTICALLY_SOUND');

    return {
      functionalCorrectness: functionalPassRate,
      architecturalIntegrity,
      security: securityPassRate,
      reliabilityAndResilience,
      longHorizonCompletion,
      performanceAndEfficiency,
      regressionAndCollateral,
      overallScore,
      functionalPassRate,
      hiddenConcurrencyFailureRate,
      collateralDamageViolations: inputs.collateralModificationsCount,
      loopingScore: {
        score: loopScore,
        repeatCount: inputs.repeatedErrorRoundsCount,
        resurrectedBugCount: inputs.resurrectedBugsCount
      },
      marathonForesight: {
        directionalAlignmentScore: alignmentScore,
        absurdityScore,
        marathonGrade,
        identifiedFutureBlockers: inputs.marathonForesight?.identifiedFutureBlockers ?? [],
        alignmentRationale:
          inputs.marathonForesight?.alignmentRationale ??
          'Reference architecture evaluation passed.',
        absurdityDetails:
          inputs.marathonForesight?.absurdityDetails ??
          'Reference roadmap audit completed.'
      },
      cumulativeFeatureCohesionIndex: inputs.cumulativeFeatureCohesionIndex ?? 90,
      messySWEResilienceScore: inputs.messySWEResilienceScore ?? 90,
      executionTelemetry: {
        timeComplexity: inputs.executionTelemetry?.timeComplexity ?? 'O(N log N)',
        spaceComplexity: inputs.executionTelemetry?.spaceComplexity ?? 'O(K)',
        promptTokens: inputs.executionTelemetry?.promptTokens ?? 1200,
        completionTokens: inputs.executionTelemetry?.completionTokens ?? 420,
        totalTokens: inputs.executionTelemetry?.totalTokens ?? 1620,
        costDollars: inputs.executionTelemetry?.costDollars ?? 0,
        evaluationDurationMs: inputs.executionTelemetry?.evaluationDurationMs ?? 850,
        bottleneckAnalysis: inputs.executionTelemetry?.bottleneckAnalysis ?? 'Reference execution trace'
      },
      customPromptEvaluation: inputs.customPromptEvaluation
    };
  }
}
