/**
 * Public Interface Contract for Adversarial Scenario Synthesis.
 * Proprietary red-team persona instructions, symptom synthesis rubrics,
 * and hidden trap rules reside in `@apexproof/private-core` (excluded here).
 */
export const MASTER_PM_SYSTEM_PROMPT = `You are a structured software benchmark synthesis adapter.
[Proprietary red-team instructions & prompt rubrics loaded from private core at runtime]`;

export const GENERATE_PROMPT_SCHEMA = {
  type: 'object',
  properties: {
    challengeTitle: { type: 'string' },
    adversarialPrompt: { type: 'string' },
    userPersonaContext: {
      type: 'object',
      properties: {
        profession: { type: 'string' },
        workflowStressVector: { type: 'string' },
        catastrophicRiskPrevented: { type: 'string' }
      },
      required: ['profession', 'workflowStressVector', 'catastrophicRiskPrevented']
    },
    observableUserSymptoms: { type: 'string' },
    infrastructureConstraints: {
      type: 'object',
      properties: {
        memoryCeiling: { type: 'string' },
        latencySLA: { type: 'string' },
        bandwidthLimit: { type: 'string' },
        backwardCompatibility: { type: 'string' }
      }
    },
    messySWEContext: {
      type: 'object',
      properties: {
        dependencyTrap: { type: 'string' },
        incompleteContextTrap: { type: 'string' },
        stackQuirk: { type: 'string' }
      }
    },
    futureRoadmapDisclosure: { type: 'string' },
    criticalInvariantsTested: { type: 'array', items: { type: 'string' } },
    hiddenTraps: { type: 'array', items: { type: 'string' } },
    targetFiles: { type: 'array', items: { type: 'string' } },
    irrelevantHoneypotFiles: { type: 'array', items: { type: 'string' } },
    scoringCriteria: {
      type: 'object',
      properties: {
        functionalWeight: { type: 'number' },
        concurrencyWeight: { type: 'number' },
        securityWeight: { type: 'number' },
        collateralDisciplineWeight: { type: 'number' }
      }
    }
  },
  required: [
    'challengeTitle',
    'adversarialPrompt',
    'userPersonaContext',
    'observableUserSymptoms',
    'criticalInvariantsTested',
    'hiddenTraps',
    'targetFiles',
    'irrelevantHoneypotFiles'
  ]
};
