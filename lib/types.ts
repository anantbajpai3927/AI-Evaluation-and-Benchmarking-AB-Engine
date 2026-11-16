export interface AdversarialVector {
  vectorId: string;
  actionTitle: string;
  howUserExecutesIt: string;
  underlyingSystemStress: string;
  catastrophicFailureMode: string;
  testPromptInjection: string;
}

export interface UserPersonaProfile {
  profession: string;
  industry: string;
  roleDescription: string;
  workflowContext: string;
  highStakesRiskStatement: string;
  regulatoryStandard: string;
  adversarialVectors: AdversarialVector[];
}

export interface RealWorldInfrastructureConstraints {
  maxMemoryLimitMb?: number;
  maxP99LatencyMs?: number;
  bandwidthLimitDesc?: string;
  cloudBudgetCapMonthly?: string;
  backwardCompatibilitySLA?: string;
  hardwareOrOsBoundaries?: string;
}

export interface FeatureMutationTurn {
  turnIndex: number;
  mutationType: 'add_feature' | 'modify_feature' | 'delete_feature' | 'conflicting_refactor';
  featureTitle: string;
  naturalHumanSymptomPrompt: string;
  realWorldConstraints: RealWorldInfrastructureConstraints;
  conflictingPriorFeatures: string[];
  underlyingTechnicalTrap: string;
}

export interface FutureArchitecturalRoadmap {
  targetTimeframe: string;
  intendedEvolution: string;
  upcomingScaleTarget: string;
  architecturalRequirements: string[];
  absurdityPitfallsToAvoid: string[];
}

export interface MarathonForesightAudit {
  directionalAlignmentScore: number; // 0 - 100
  absurdityScore: number; // 0 - 100 (high absurdity = destructive short-term hack)
  marathonGrade: 'EXEMPLARY_FORESIGHT' | 'TACTICALLY_SOUND' | 'ARCHITECTURAL_DEBT' | 'HIGH_ABSURDITY_FAILURE';
  identifiedFutureBlockers: string[];
  alignmentRationale: string;
  absurdityDetails: string;
}

export interface AgentFailureIntel {
  id: string;
  sourceTitle: string;
  sourceUrlOrAuthority: string;
  incidentYear: string;
  failingAgentArchetype: string;
  failureMode: string;
  triggeringConditions: string;
  synthesizedMasterPMTestPrompt: string;
}

export interface FragileDependencyTrap {
  pkg: string;
  pinnedVersion: string;
  issueRisk: string;
  failureTrap: string;
}

export interface IncompleteContextClue {
  fileOrArea: string;
  undocumentedRule: string;
  missingContextImpact: string;
}

export interface MessySWEContextProbe {
  fragileDependencies: FragileDependencyTrap[];
  incompleteContextClues: IncompleteContextClue[];
  technicalStackQuirks: string[];
  adversarialMessyPrompt: string;
}

export interface ExecutionTelemetry {
  timeComplexity: string; // e.g. "O(N log N) - Log-index quorum check"
  spaceComplexity: string; // e.g. "O(K) - Fixed memory ring buffer"
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costDollars: number;
  evaluationDurationMs: number;
  bigOTimeComplexity?: string;
  bigOSpaceComplexity?: string;
  durationMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  bottleneckAnalysis?: string;
}

export interface CustomPromptEvaluation {
  promptTitle: string;
  promptText: string;
  passRate: number; // 0 - 100
  status: 'VERIFIED' | 'PARTIAL' | 'VIOLATED' | 'NOT_TESTED';
  feedback: string;
  invariantsMaintained: boolean;
}

export interface TestedAgentConfig {
  name: string;
  endpointUrl?: string;
  apiKey?: string;
  frameworkArchetype: 'autonomous_react' | 'plan_and_solve' | 'direct_diff' | 'custom_webhook';
  concurrencyStressLimit: number;
  notes?: string;
  customEvaluationPrompt?: string;
  customPromptTitle?: string;
  enableCustomPromptInEvals?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  category: 'Distributed Systems' | 'Financial Tech' | 'Production Incident' | 'Security Architecture' | 'Long-Horizon Refactoring';
  difficulty: 'Hard' | 'Marathon' | 'Adversarial';
  description: string;
  userPersonaProfile: UserPersonaProfile;
  naturalLanguageSymptomBrief: string;
  realWorldConstraints: RealWorldInfrastructureConstraints;
  futureArchitecturalRoadmap: FutureArchitecturalRoadmap;
  successiveFeatureMutations: FeatureMutationTurn[];
  messySWEContext: MessySWEContextProbe;
  repoContext: {
    name: string;
    filesCount: number;
    loc: number;
    stack: string;
    criticalInvariants: string[];
    allowedTargetFiles: string[];
  };
  taskTicket: {
    title: string;
    summary: string;
    detailedRequirements: string[];
    deliberateAmbiguity: string;
    hiddenTrap: string;
  };
  acceptanceCriteria: {
    functional: string[];
    concurrencyAndResilience: string[];
    security: string[];
  };
  sampleAgentTurns: Array<{
    turnNumber: number;
    systemPromptInjection: string;
    simulatedAgentResponse: string;
    filesModified: Array<{ path: string; significance: number; action: 'create' | 'modify' | 'delete' }>;
    loopingErrorsDetected: string[];
  }>;
}

export interface ProofGraphNode {
  id: string;
  type: 'fact' | 'version' | 'entity' | 'action' | 'invariant';
  label: string;
  source: string;
  timestamp: string;
  contradiction: boolean;
  contradictionDetails?: string;
  status: 'verified' | 'violated' | 'pending';
}

export interface IntendedTransaction {
  id: string;
  actionName: string;
  readSet: string[];
  writeSet: string[];
  dependencies: string[];
  targetInvariant: string;
  status: 'planned' | 'simulating' | 'committed' | 'rolled_back';
}

export interface AuthorizationBoundary {
  sourceAccessGranted: boolean;
  indirectLeakageDetected: boolean;
  inspectedFiles: Array<{
    path: string;
    significanceScore: number; // 0 to 100
    flaggedCollateral: boolean; // true if significanceScore < Policy Threshold
    reason: string;
  }>;
  overallSignificancePass: boolean;
}

export interface PreflightSimulation {
  staleDataConflicts: number;
  unintendedSideEffects: string[];
  missingEvidenceCount: number;
  duplicateOpsDetected: boolean;
  simulationPassed: boolean;
}

export interface LedgerEntry {
  step: number;
  timestamp: string;
  action: string;
  hash: string;
  previousHash: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED_COLLATERAL' | 'RETRYING';
  compensatingActionAvailable: boolean;
}

export interface ProofGraphState {
  evidenceNodes: ProofGraphNode[];
  transactions: IntendedTransaction[];
  authBoundary: AuthorizationBoundary;
  preflight: PreflightSimulation;
  ledger: LedgerEntry[];
  finalStateVerified: boolean;
  auditSignature: string;
}

export interface EvaluationScorecard {
  functionalCorrectness: number; // weight 25%
  architecturalIntegrity: number; // weight 15%
  security: number; // weight 15%
  reliabilityAndResilience: number; // weight 15%
  longHorizonCompletion: number; // weight 10%
  performanceAndEfficiency: number; // weight 10%
  regressionAndCollateral: number; // weight 10%
  overallScore: number;
  functionalPassRate: number;
  hiddenConcurrencyFailureRate: number;
  loopingScore: {
    repeatCount: number;
    resurrectedBugCount: number;
    score: number; // 0 to 100
  };
  collateralDamageViolations: number;
  marathonForesight: MarathonForesightAudit;
  cumulativeFeatureCohesionIndex: number; // 0 - 100
  messySWEResilienceScore: number; // 0 - 100
  executionTelemetry: ExecutionTelemetry;
  customPromptEvaluation?: CustomPromptEvaluation;
}

export interface DataPatchEntry {
  id: string;
  scenarioId: string;
  failurePattern: string;
  rootCause: string;
  systemPromptGuardrail: string;
  fineTuningExample: {
    userQuery: string;
    agentBadBehavior: string;
    agentGoldResponse: string;
  };
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ReproStrategy {
  id: string;
  scenarioId: string;
  title: string;
  triggerConditions: string[];
  bashReproHarness: string;
  chaosInjectionSequence: string;
  expectedFailureLog: string;
  verifiedFixValidation: string;
}

export interface LiveThreatIntel {
  id: string;
  cveOrIncident: string;
  title: string;
  source: string;
  sourceCredibilityScore: number; // 0 - 100
  corroborationSourcesCount: number;
  discussionQuality: 'High Authority (CVE/Kernel/Security Team)' | 'Active Exploit in Wild' | 'Unverified Forum Post';
  historicalAccuracyRating: string;
  applicableVectors: string[];
  promptInjectionVector: string;
  detectedAt: string;
}

export interface AgentChatMessage {
  id: string;
  sender: 'system' | 'user' | 'agent';
  timestamp: string;
  content: string;
  agentName?: string;
  significanceData?: {
    files: Array<{ path: string; significance: number; flagged: boolean }>;
    loopingErrors: string[];
    proofGraphStatus: 'PASSED' | 'VIOLATED' | 'BLOCKED';
  };
  executionTelemetry?: ExecutionTelemetry;
}

export interface TestEvaluationAuditRecord {
  id: string;
  testNumber: number;
  iterationNumber: number;
  modelName: string; // Identified strictly by user-supplied model/agent name (API key never persisted)
  scenarioId: string;
  scenarioTitle: string;
  timestamp: string;
  scoreOutOf10: number; // e.g., 8.4 out of 10
  overallScore: number; // 0 - 100
  generatedPromptSummary: string;
  fullGeneratedPrompt?: string;
  agentResponseSummary: string;
  fullAgentResponse?: string;
  positives: string[];
  negatives: string[];
  whyNotTenVerdict: string; // Concise diagnostic explaining why 8 or 9 instead of 10
  customPromptStatus?: 'VERIFIED' | 'PARTIAL' | 'VIOLATED' | 'NOT_TESTED';
  customPromptPassRate?: number;
}

export interface IterationDeltaMetric {
  dimensionKey: string;
  dimensionLabel: string;
  previousValue: number;
  currentValue: number;
  absoluteDelta: number;
  percentageChange: number; // Positive = improved, Negative = degraded (after polarity adjustment)
  rawDeltaPercent: number;
  status: 'improved' | 'degraded' | 'unchanged';
  insightStatement: string; // e.g., "Improved in Reliability & Resilience by +14.3%"
  unit: '%' | 'pts' | 'ms' | 'count';
}

export interface IterationComparisonSummary {
  modelName: string;
  baselineIteration: number;
  targetIteration: number;
  overallDeltaPoints: number;
  overallPercentageChange: number;
  improvements: IterationDeltaMetric[];
  degradations: IterationDeltaMetric[];
  unchanged: IterationDeltaMetric[];
  allMetrics: IterationDeltaMetric[];
  executiveSummary: string;
}

export interface ModelIterationSnapshot {
  id: string;
  modelName: string; // Primary identifier (API keys are strictly excluded and never stored)
  iterationNumber: number;
  label: string; // e.g. "Iteration #1 (Baseline)" or "Iteration #2 (Post Fine-Tune)"
  timestamp: string;
  scenarioId: string;
  scenarioTitle: string;
  scorecard: EvaluationScorecard;
  testAudits: TestEvaluationAuditRecord[];
  notes?: string;
}

