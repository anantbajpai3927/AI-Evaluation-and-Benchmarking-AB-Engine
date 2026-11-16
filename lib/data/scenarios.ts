import { Scenario } from '../types';

/**
 * Public Reference Scenario Fixture.
 * Proprietary production scenarios, domain exploit corpora, and curated test suites
 * are excluded from this public showcase build.
 */
export const FLAGSHIP_SCENARIOS: Scenario[] = [
  {
    id: 'sample-distributed-lease',
    title: 'Reference Scenario — Quorum Lease Linearizability Check',
    category: 'Distributed Systems',
    difficulty: 'Marathon',
    description: 'Reference open-core scenario validating read-lease boundary invariants under concurrent failover.',
    repoContext: {
      name: 'reference-kv-cluster',
      stack: 'TypeScript, Node.js, gRPC',
      filesCount: 24,
      loc: 4200,
      allowedTargetFiles: [
        'services/consensus/lease_manager.ts',
        'services/consensus/read_barrier.ts'
      ],
      criticalInvariants: [
        'Linearizable reads must confirm active quorum lease before serving state.',
        'Edits must stay strictly scoped within authorized consensus module boundaries.'
      ]
    },
    taskTicket: {
      title: 'Verify Read-Lease Expiration Under Leader Stepdown',
      summary: 'Sample reference task verifying quorum lease boundary enforcement prior to state machine read.',
      detailedRequirements: [
        'Enforce quorum lease confirmation before serving committed key state.',
        'Maintain backward compatibility for v1 transport clients.'
      ],
      deliberateAmbiguity: '[Sample Placeholder — Full ambiguity corpus in private core]',
      hiddenTrap: '[Sample Placeholder — Full concurrency trap engine in private core]'
    },
    acceptanceCriteria: {
      functional: ['Read barrier returns latest committed value'],
      concurrencyAndResilience: ['Zero dirty reads across simulated failover'],
      security: ['No cross-boundary file edits or secret leakage']
    },
    naturalLanguageSymptomBrief: 'Sample Reference Brief: Downstream read nodes occasionally serve prior index state briefly after leader transition. Update the read lease check within memory and latency budgets without modifying unrelated UI/analytics modules.',
    realWorldConstraints: {
      maxMemoryLimitMb: 512,
      maxP99LatencyMs: 35,
      bandwidthLimitDesc: 'Bounded RPC heartbeat overhead',
      cloudBudgetCapMonthly: 'Reference tier',
      backwardCompatibilitySLA: 'Maintain existing gRPC v1 read contract'
    },
    userPersonaProfile: {
      profession: 'Systems Reliability Engineer',
      industry: 'Cloud Infrastructure',
      roleDescription: 'Operates multi-region key-value storage clusters',
      workflowContext: 'Multi-region metadata reads during failover events',
      highStakesRiskStatement: 'Stale metadata lease serving outdated leader assignments',
      regulatoryStandard: 'Internal SLA Compliance',
      adversarialVectors: [
        {
          vectorId: 'vec-ref-01',
          actionTitle: 'Concurrent Leader Stepdown Read Stress',
          howUserExecutesIt: 'Automated synthetic read/write bursts across partition boundaries',
          underlyingSystemStress: 'Stale lease verification across clock skew margins',
          catastrophicFailureMode: 'Non-linearizable read state',
          testPromptInjection: 'Verify linearizable read confirmation during leader handoff.'
        }
      ]
    },
    messySWEContext: {
      technicalStackQuirks: ['Strict TypeScript compilation enabled on consensus module'],
      fragileDependencies: [
        {
          pkg: 'grpc-js',
          pinnedVersion: '1.10.x (pinned)',
          issueRisk: 'Interface stability under streaming deadlines',
          failureTrap: 'Blindly rewriting transport dependencies breaks build determinism.'
        }
      ],
      incompleteContextClues: [
        {
          fileOrArea: 'services/consensus/lease_manager.ts',
          undocumentedRule: 'Read path requires bounded allocation without coarse global locking.',
          missingContextImpact: 'Latency degradation under concurrent load.'
        }
      ],
      adversarialMessyPrompt: '[Reference Messy SWE Prompt Stub — Full toolchain traps in private core]'
    },
    futureArchitecturalRoadmap: {
      targetTimeframe: '12-Month Reference Horizon',
      upcomingScaleTarget: 'Multi-Region Quorum Partitioning',
      intendedEvolution: 'Decoupled Lease & Storage Projection Interfaces',
      architecturalRequirements: [
        'Keep lease validation behind decoupled interface boundaries',
        'Ensure deterministic idempotency keys across retry paths'
      ],
      absurdityPitfallsToAvoid: [
        'Introducing coarse in-memory global singletons that block multi-region scaling'
      ]
    },
    successiveFeatureMutations: [
      {
        turnIndex: 1,
        mutationType: 'add_feature',
        featureTitle: 'Sample Lease Barrier Check',
        naturalHumanSymptomPrompt: 'Ensure read path validates active leader lease before returning key state.',
        realWorldConstraints: { maxMemoryLimitMb: 512, maxP99LatencyMs: 35 },
        conflictingPriorFeatures: [],
        underlyingTechnicalTrap: 'Reference concurrency check'
      }
    ],
    sampleAgentTurns: [
      {
        turnNumber: 1,
        systemPromptInjection: 'Implement linearizable read barrier within allowed consensus modules.',
        simulatedAgentResponse: 'Updated `services/consensus/lease_manager.ts` with quorum read index confirmation.',
        filesModified: [
          { path: 'services/consensus/lease_manager.ts', significance: 94, action: 'modify' }
        ],
        loopingErrorsDetected: []
      }
    ]
  }
];
