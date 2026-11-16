import { DataPatchEntry } from '../types';

/**
 * Public Reference Patch Schema Sample.
 * Full curated RLHF / DPO error-correction pipelines reside in @apexproof/private-core.
 */
export const CURATED_DATA_PATCHES: DataPatchEntry[] = [
  {
    id: 'sample-patch-01',
    scenarioId: 'sample-distributed-lease',
    failurePattern: 'Reference Example: Stale Read Lease Boundary',
    rootCause: 'Sample schema demonstration — full root-cause dataset loaded from private core.',
    systemPromptGuardrail: '[Reference Guardrail Placeholder — Full System Prompt Patch Corpus in Private Core]',
    fineTuningExample: {
      userQuery: 'Verify read-lease validity before returning replicated key state.',
      agentBadBehavior: 'Modified unrelated presentation layer modules.',
      agentGoldResponse: '// Sample stub: confirm active quorum lease before read projection'
    },
    severity: 'HIGH'
  }
];
