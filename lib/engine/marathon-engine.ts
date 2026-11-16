import {
  FutureArchitecturalRoadmap,
  FeatureMutationTurn,
  MarathonForesightAudit,
  RealWorldInfrastructureConstraints
} from '../types';

export interface RoadmapEvaluationInput {
  agentCodeOrDiff: string;
  roadmap: FutureArchitecturalRoadmap;
  modifiedFiles: string[];
}

export interface MutationTurnHistory {
  turnIndex: number;
  mutation: FeatureMutationTurn;
  agentResponse: string;
  filesModified: string[];
  invariantsViolated: string[];
}

/**
 * Public Interface Stub for Marathon Foresight & Feature Cohesion Evaluation.
 * Proprietary AST semantic checks & heuristic scorers reside in @apexproof/private-core.
 */
export class MarathonEngine {
  static evaluateRoadmapDirection(input: RoadmapEvaluationInput): MarathonForesightAudit {
    const { agentCodeOrDiff, roadmap, modifiedFiles } = input;
    const textLower = agentCodeOrDiff.toLowerCase();

    const hasDecoupledInterface =
      textLower.includes('interface') || textLower.includes('adapter') || textLower.includes('abstract');
    const hasOutOfScopeAsset = modifiedFiles.some((f) => f.includes('css') || f.includes('public'));

    const directionalAlignmentScore = hasDecoupledInterface && !hasOutOfScopeAsset ? 90 : 65;
    const absurdityScore = hasOutOfScopeAsset ? 60 : 12;

    return {
      directionalAlignmentScore,
      absurdityScore,
      marathonGrade: absurdityScore >= 55 ? 'HIGH_ABSURDITY_FAILURE' : directionalAlignmentScore >= 85 ? 'EXEMPLARY_FORESIGHT' : 'TACTICALLY_SOUND',
      identifiedFutureBlockers: hasOutOfScopeAsset ? ['Modifications outside core module scope'] : [],
      alignmentRationale: `Reference directional compatibility check against ${roadmap.intendedEvolution}.`,
      absurdityDetails: 'Reference roadmap sanity audit.'
    };
  }

  static evaluateFeatureCohesion(history: MutationTurnHistory[]): {
    cumulativeFeatureCohesionIndex: number;
    regressionCascades: string[];
    turnBreakdowns: Array<{ turn: number; featureTitle: string; brokenPriorFeatures: string[] }>;
  } {
    if (!history || history.length <= 1) {
      return {
        cumulativeFeatureCohesionIndex: 100,
        regressionCascades: [],
        turnBreakdowns: []
      };
    }

    const cascades: string[] = [];
    const breakdowns: Array<{ turn: number; featureTitle: string; brokenPriorFeatures: string[] }> = [];
    let deductions = 0;

    for (let i = 1; i < history.length; i++) {
      const turn = history[i];
      if (turn.invariantsViolated.length > 0) {
        deductions += turn.invariantsViolated.length * 15;
        cascades.push(`Turn ${turn.turnIndex} triggered invariant violations.`);
        breakdowns.push({
          turn: turn.turnIndex,
          featureTitle: turn.mutation.featureTitle,
          brokenPriorFeatures: turn.invariantsViolated
        });
      }
    }

    return {
      cumulativeFeatureCohesionIndex: Math.max(0, 100 - deductions),
      regressionCascades: cascades,
      turnBreakdowns: breakdowns
    };
  }

  static formatNaturalSymptomChallenge(options: {
    scenarioTitle: string;
    profession: string;
    symptomBrief: string;
    constraints: RealWorldInfrastructureConstraints;
    roadmap: FutureArchitecturalRoadmap;
    mutation?: FeatureMutationTurn;
  }): string {
    const { scenarioTitle, profession, symptomBrief, constraints, roadmap, mutation } = options;
    return [
      `[REFERENCE CHALLENGE BRIEF]: ${scenarioTitle} (${profession})`,
      `SYMPTOMS: ${symptomBrief}`,
      mutation ? `MUTATION: [${mutation.mutationType.toUpperCase()}] ${mutation.featureTitle}` : '',
      `CONSTRAINTS: RAM <= ${constraints.maxMemoryLimitMb || 512}MB | SLA <= ${constraints.maxP99LatencyMs || 50}ms`,
      `ROADMAP: ${roadmap.intendedEvolution}`
    ].filter(Boolean).join('\n\n');
  }
}
