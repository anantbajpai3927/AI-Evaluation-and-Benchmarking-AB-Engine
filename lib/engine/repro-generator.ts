import { ReproStrategy } from '../types';

/**
 * Public Reference Reproduction Schema Sample.
 * Full chaos engineering & adversarial bash stress suites reside in @apexproof/private-core.
 */
export const REPRO_STRATEGIES: ReproStrategy[] = [
  {
    id: 'sample-repro-01',
    scenarioId: 'sample-distributed-lease',
    title: 'Sample Boundary Verification Harness',
    triggerConditions: ['Reference condition placeholder — full chaos suite loaded from private core'],
    bashReproHarness: `#!/usr/bin/env bash
set -euo pipefail
echo "[Reference Harness Stub] Running public unit & boundary verification..."
npm run test`,
    chaosInjectionSequence: 'Reference sequence stub (private core injects network fault profiles).',
    expectedFailureLog: 'Sample invariant check failed prior to lease patch.',
    verifiedFixValidation: 'npm run test'
  }
];
