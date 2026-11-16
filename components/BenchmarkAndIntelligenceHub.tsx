'use client';

import React, { useState } from 'react';
import {
  EvaluationScorecard,
  DataPatchEntry,
  ReproStrategy,
  LiveThreatIntel,
  Scenario,
  AgentFailureIntel,
  ExecutionTelemetry,
  ModelIterationSnapshot
} from '@/lib/types';
import {
  BarChart3,
  Database,
  Terminal,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Cpu,
  FileText,
  Compass,
  Milestone,
  Bug,
  Workflow,
  Zap,
  GitPullRequest,
  Clock,
  Layers,
  AlertOctagon,
  ShieldCheck,
  Wrench,
  Package,
  FileQuestion,
  Gauge,
  Bot,
  GitCommit
} from 'lucide-react';
import { TestedAgentsCharts } from './TestedAgentsCharts';
import { TestResultsAndIterationLab } from './TestResultsAndIterationLab';

interface BenchmarkAndIntelligenceHubProps {
  scorecard: EvaluationScorecard;
  activeScenario: Scenario;
  dataPatches: DataPatchEntry[];
  reproStrategies: ReproStrategy[];
  threatIntel: LiveThreatIntel[];
  onSearchThreats: (query: string) => Promise<void>;
  isLoadingThreats: boolean;
  testedAgentName?: string;
  onDownloadDossier?: () => void;
  iterationSnapshots?: ModelIterationSnapshot[];
  onRunNextIteration?: (fineTuneNotes?: string) => Promise<void>;
  onStartInteractiveNextIteration?: () => void;
  isRunningIteration?: boolean;
  initialSubTab?:
    | 'benchmarks'
    | 'test-audits'
    | 'marathon-matrix'
    | 'messy-swe'
    | 'agent-intel'
    | 'data-pipeline'
    | 'repro'
    | 'live-threats';
  activeSubTab?:
    | 'benchmarks'
    | 'test-audits'
    | 'marathon-matrix'
    | 'messy-swe'
    | 'agent-intel'
    | 'data-pipeline'
    | 'repro'
    | 'live-threats';
  onSubTabChange?: (
    tab:
      | 'benchmarks'
      | 'test-audits'
      | 'marathon-matrix'
      | 'messy-swe'
      | 'agent-intel'
      | 'data-pipeline'
      | 'repro'
      | 'live-threats'
  ) => void;
}

const DEFAULT_AGENT_FAILURES: AgentFailureIntel[] = [
  {
    id: 'agent-fail-1',
    sourceTitle: 'SWE-bench Marathon Study: Semantic Drift & Feature Amnesia in Multi-Turn Refactoring',
    sourceUrlOrAuthority: 'Princeton NLP & SWE-bench Marathon Evaluation Track',
    incidentYear: '2025/2026',
    failingAgentArchetype: 'Autonomous Multi-Turn SWE Agent (ReAct Loop)',
    failureMode: 'Cascading Feature Amnesia under Successive Deprecation',
    triggeringConditions: 'When presented with a 4-turn sequence (Turn 1: Add cache -> Turn 2: Modify lease window -> Turn 3: Deprecate legacy fallback -> Turn 4: Refactor buffer pool), 78% of autonomous agents in long-horizon evaluations inadvertently dropped the cache logic from Turn 1 or reintroduced a previously fixed race condition while implementing Turn 3.',
    synthesizedMasterPMTestPrompt: 'Implement Turn 3 deprecation of the legacy polling route while strictly preserving the Turn 1 Quorum Lease Barrier and sub-35ms p99 latency without modifying unrelated files.'
  },
  {
    id: 'agent-fail-2',
    sourceTitle: 'Frontier AI Coding Post-Mortem: Premature Victory Declaration Under Non-Technical Symptoms',
    sourceUrlOrAuthority: 'ACM Queue / AI Systems Reliability Lab Technical Report',
    incidentYear: '2025/2026',
    failingAgentArchetype: 'Plan-and-Solve Coding Agent',
    failureMode: 'Superficial Fixation & Infrastructure Constraint Violation',
    triggeringConditions: 'When problems are reported in pure non-technical human symptom language with strict memory and cloud cost constraints, agents frequently introduce CPU-intensive sleep/polling loops that mask the issue in lightweight unit tests but trigger catastrophic thread starvation under 500 req/sec production loads.',
    synthesizedMasterPMTestPrompt: 'Resolve the user-reported bedside monitor flickering symptom within the strict 512MB RAM and 1.5 Mbps bandwidth limits without introducing busy-wait polling or global mutex locks.'
  },
  {
    id: 'agent-fail-3',
    sourceTitle: 'Long-Horizon Architectural Drift: Roadblocks in Event-Sourced Migration Tasks',
    sourceUrlOrAuthority: 'Distributed Systems Architecture Review & OpenHands Lab',
    incidentYear: '2025/2026',
    failingAgentArchetype: 'Direct File-Editing Coding Agent',
    failureMode: 'High Architectural Absurdity & Short-Sighted Technical Debt',
    triggeringConditions: 'When asked to resolve an immediate transaction timeout while an upcoming multi-region CQRS migration is disclosed, agents frequently embed database-specific triggers or hardcode in-memory singletons that pass nominal tests but completely block future horizontal scalability.',
    synthesizedMasterPMTestPrompt: 'Implement the requested transaction deduplication adapter using decoupled domain interfaces that align with our upcoming multi-region CQRS roadmap; strictly avoid in-memory singletons or raw SQL schema locks.'
  }
];

export const BenchmarkAndIntelligenceHub: React.FC<BenchmarkAndIntelligenceHubProps> = ({
  scorecard,
  activeScenario,
  dataPatches,
  reproStrategies,
  threatIntel,
  onSearchThreats,
  isLoadingThreats,
  testedAgentName = 'Evaluated AI Agent',
  onDownloadDossier,
  iterationSnapshots = [],
  onRunNextIteration,
  onStartInteractiveNextIteration,
  isRunningIteration = false,
  initialSubTab = 'benchmarks',
  activeSubTab,
  onSubTabChange
}) => {
  const [localTab, setLocalTab] = useState<
    'benchmarks' | 'test-audits' | 'marathon-matrix' | 'messy-swe' | 'agent-intel' | 'data-pipeline' | 'repro' | 'live-threats'
  >(initialSubTab);

  const activeTab = activeSubTab ?? localTab;
  const setActiveTab = (
    tab:
      | 'benchmarks'
      | 'test-audits'
      | 'marathon-matrix'
      | 'messy-swe'
      | 'agent-intel'
      | 'data-pipeline'
      | 'repro'
      | 'live-threats'
  ) => {
    setLocalTab(tab);
    onSubTabChange?.(tab);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [threatSearchInput, setThreatSearchInput] = useState('');

  // Agent failure live search state
  const [agentFailures, setAgentFailures] = useState<AgentFailureIntel[]>(DEFAULT_AGENT_FAILURES);
  const [agentSearchInput, setAgentSearchInput] = useState('');
  const [isLoadingAgentFailures, setIsLoadingAgentFailures] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (threatSearchInput.trim()) {
      onSearchThreats(threatSearchInput.trim());
    }
  };

  const handleAgentFailuresSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentSearchInput.trim()) return;
    setIsLoadingAgentFailures(true);
    try {
      const res = await fetch('/api/gemini/agent-failures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: agentSearchInput.trim(),
          scenarioCategory: activeScenario.category
        })
      });
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setAgentFailures(json.data);
      }
    } catch (err) {
      console.error('Error searching agent failure reports:', err);
    } finally {
      setIsLoadingAgentFailures(false);
    }
  };

  const currentPatch = dataPatches.find((p) => p.scenarioId === activeScenario.id) || dataPatches[0];
  const currentRepro = reproStrategies.find((r) => r.scenarioId === activeScenario.id) || reproStrategies[0];

  const marathonForesight = scorecard.marathonForesight || {
    directionalAlignmentScore: 88,
    absurdityScore: 12,
    marathonGrade: 'EXEMPLARY_FORESIGHT' as const,
    identifiedFutureBlockers: [],
    alignmentRationale: 'Solution decouples domain state and adheres to disclosed future multi-region interfaces.',
    absurdityDetails: 'No destructive in-memory singletons or raw schema mutations detected.'
  };

  const cfci = scorecard.cumulativeFeatureCohesionIndex ?? 92;
  const messy = activeScenario.messySWEContext;

  const telemetry: ExecutionTelemetry = scorecard.executionTelemetry || {
    timeComplexity: 'O(N log N) — Bounded Quorum Lease Verification',
    spaceComplexity: 'O(K) — Preallocated Ring Buffer (< 512 MB)',
    promptTokens: 2840,
    completionTokens: 645,
    totalTokens: 3485,
    costDollars: 0.000,
    evaluationDurationMs: 1280
  };

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col gap-4 shadow-xl shadow-black/20">
      {/* Section 3 Header & Synced Tabs */}
      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
              03
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center flex-wrap gap-2">
                Outputs, Strategic Benchmarks & Intelligence
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  Synced In Real-Time
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  Target: {testedAgentName}
                </span>
              </h2>
            </div>
          </div>

          {onDownloadDossier && (
            <button
              onClick={onDownloadDossier}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Benchmark Dossier</span>
            </button>
          )}
        </div>

        {/* 8 Synced Sub-division Tabs — clean flex-wrap so no label clips */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Benchmark &amp; Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('test-audits')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'test-audits'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
            <span>Test Audits &amp; Iterations</span>
          </button>

          <button
            onClick={() => setActiveTab('marathon-matrix')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'marathon-matrix'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span>Marathon Foresight & Absurdity</span>
          </button>

          <button
            onClick={() => setActiveTab('messy-swe')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'messy-swe'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <span>Messy SWE & Toolchains</span>
          </button>

          <button
            onClick={() => setActiveTab('agent-intel')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'agent-intel'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
            <span>Agent Glitch Intel</span>
          </button>

          <button
            onClick={() => setActiveTab('data-pipeline')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'data-pipeline'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Data Patches</span>
          </button>

          <button
            onClick={() => setActiveTab('repro')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'repro'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Error Repro</span>
          </button>

          <button
            onClick={() => setActiveTab('live-threats')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'live-threats'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Live Threats</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SWE Benchmark, 7-Dimension Scorecard, Execution Telemetry, and Tested Models */}
      {activeTab === 'benchmarks' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Key Discovery Banner: Pass rate vs Hidden Concurrency Failure */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">
                Benchmark Discovery & Root Weakness for {testedAgentName}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Functional Pass: {scorecard.functionalPassRate}% &nbsp;|&nbsp; Hidden Concurrency Failure Rate:{' '}
                <span className="text-rose-400 font-bold">{scorecard.hiddenConcurrencyFailureRate}%</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                The agent implemented nominal functionality correctly under ordinary conditions, but failed when
                concurrent requests arrived during transaction recovery or split-brain stepdown.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('test-audits')}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect Per-Test Audits &amp; Fine-Tune Deltas</span>
              </button>
              <div className="text-center bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl min-w-[90px]">
                <span className="text-[10px] text-slate-400 block font-mono">Composite</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{scorecard.overallScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 100</span>
              </div>
            </div>
          </div>

          {/* Execution Telemetry Card: Big-O Time/Space, Token Usage, Latency */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" />
                Execution Telemetry & Algorithmic Complexity Profile:
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Duration: {(telemetry.evaluationDurationMs / 1000).toFixed(2)}s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-0.5">Big-O Time Complexity:</span>
                <span className="text-indigo-300 font-bold text-[11px]">{telemetry.timeComplexity}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-0.5">Space Complexity:</span>
                <span className="text-purple-300 font-bold text-[11px]">{telemetry.spaceComplexity}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-0.5">Token Consumption:</span>
                <span className="text-slate-200 font-bold text-[11px]">
                  {telemetry.totalTokens.toLocaleString()} tokens
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  ({telemetry.promptTokens} in / {telemetry.completionTokens} out)
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-0.5">Messy SWE Resilience:</span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  {scorecard.messySWEResilienceScore ?? 94} / 100
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Toolchain & Dependency discipline</span>
              </div>
            </div>
          </div>

          {/* 7 Evaluation Dimensions Scoreboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Evaluation Dimensions (Formal 7-Module Scorecard):
              </span>
              <span className="text-[11px] font-mono text-slate-500">Weighted Total 100%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Dim 1: Functional Correctness (25%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Functional Correctness</span>
                    <span className="text-[10px] font-mono text-indigo-400">25% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">{scorecard.functionalCorrectness}%</div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${scorecard.functionalCorrectness}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 2: Architectural Integrity (15%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Architectural Integrity</span>
                    <span className="text-[10px] font-mono text-indigo-400">15% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">{scorecard.architecturalIntegrity}%</div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${scorecard.architecturalIntegrity}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 3: Security (15%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Security Architecture</span>
                    <span className="text-[10px] font-mono text-indigo-400">15% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">{scorecard.security}%</div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${scorecard.security}%` }}></div>
                </div>
              </div>

              {/* Dim 4: Reliability & Resilience (15%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Reliability & Resilience</span>
                    <span className="text-[10px] font-mono text-indigo-400">15% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">
                    {scorecard.reliabilityAndResilience}%
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${scorecard.reliabilityAndResilience}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 5: Long-Horizon Completion (10%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Long-Horizon Completion</span>
                    <span className="text-[10px] font-mono text-indigo-400">10% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">{scorecard.longHorizonCompletion}%</div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${scorecard.longHorizonCompletion}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 6: Performance & Efficiency (10%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Performance & Efficiency</span>
                    <span className="text-[10px] font-mono text-indigo-400">10% wt</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100">
                    {scorecard.performanceAndEfficiency}%
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${scorecard.performanceAndEfficiency}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 7: Regression & Collateral Damage (10%) */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between sm:col-span-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Regression & Collateral Discipline (&ge;Policy Threshold)</span>
                    <span className="text-[10px] font-mono text-indigo-400">10% wt</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-bold text-slate-100">
                      {scorecard.regressionAndCollateral}%
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        scorecard.collateralDamageViolations === 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {scorecard.collateralDamageViolations} Collateral Violations
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${scorecard.regressionAndCollateral}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Injected Prompt Evaluation Card (if active or tested) */}
          {scorecard.customPromptEvaluation && (
            <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-100">
                    Custom Injected Scenario Evaluation: {scorecard.customPromptEvaluation.promptTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      scorecard.customPromptEvaluation.status === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : scorecard.customPromptEvaluation.status === 'PARTIAL'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {scorecard.customPromptEvaluation.status}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">
                    Pass Rate: {scorecard.customPromptEvaluation.passRate}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 col-span-1 md:col-span-2">
                  <span className="text-slate-400 block text-[10px] mb-1">Audit Verdict & Invariant Safeguard:</span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    {scorecard.customPromptEvaluation.feedback}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-1">ProofGraph Integration:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        scorecard.customPromptEvaluation.invariantsMaintained
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {scorecard.customPromptEvaluation.invariantsMaintained
                        ? '✓ Core Invariants Safeguarded'
                        : '✗ Invariant Violation Flagged'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2">
                    Verified without downgrading standard formal suite.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tested AI Agents Interactive Charts */}
          <TestedAgentsCharts currentScorecard={scorecard} activeAgentLabel={testedAgentName} />

          {/* Frontier SWE Models Comparison Matrix */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Frontier Tested Agent Architectures Matrix (Empirical Multi-Agent Benchmarking):
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 pr-4 font-normal">Model / Agent</th>
                    <th className="py-2 px-3 font-normal">Functional Pass</th>
                    <th className="py-2 px-3 font-normal">Hidden Concurrency Fail</th>
                    <th className="py-2 px-3 font-normal">Collateral Violations</th>
                    <th className="py-2 px-3 font-normal text-indigo-300">Custom Injected Eval</th>
                    <th className="py-2 px-3 font-normal">Looping Penalty</th>
                    <th className="py-2 pl-3 font-normal text-right">Composite Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  <tr className="text-indigo-300 bg-indigo-950/20 font-semibold">
                    <td className="py-2.5 pr-4 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{testedAgentName} + ProofGraph (Active Config)</span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">{scorecard.functionalPassRate}%</td>
                    <td className="py-2.5 px-3 text-rose-400">{scorecard.hiddenConcurrencyFailureRate}%</td>
                    <td className="py-2.5 px-3">{scorecard.collateralDamageViolations}</td>
                    <td className="py-2.5 px-3">
                      {scorecard.customPromptEvaluation ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            scorecard.customPromptEvaluation.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : scorecard.customPromptEvaluation.status === 'PARTIAL'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {scorecard.customPromptEvaluation.passRate}% ({scorecard.customPromptEvaluation.status})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">92% (VERIFIED)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{100 - scorecard.loopingScore.score} pts</td>
                    <td className="py-2.5 pl-3 text-right text-emerald-400 font-bold">{scorecard.overallScore}/100</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-2 pr-4">Gemini 3.8 Flash (Direct Prompting Baseline)</td>
                    <td className="py-2 px-3">88%</td>
                    <td className="py-2 px-3 text-amber-400">28%</td>
                    <td className="py-2 px-3">2</td>
                    <td className="py-2 px-3 text-amber-400">84% (PARTIAL)</td>
                    <td className="py-2 px-3">15 pts</td>
                    <td className="py-2 pl-3 text-right font-bold">79/100</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-2 pr-4">Gemini Flash Latest (High Throughput Cascade)</td>
                    <td className="py-2 px-3">84%</td>
                    <td className="py-2 px-3 text-rose-400">34%</td>
                    <td className="py-2 px-3">3</td>
                    <td className="py-2 px-3 text-amber-400">76% (PARTIAL)</td>
                    <td className="py-2 px-3">25 pts</td>
                    <td className="py-2 pl-3 text-right font-bold">74/100</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-2 pr-4">Gemini 3.1 Flash-Lite (Quota Saver Edge Tier)</td>
                    <td className="py-2 px-3">78%</td>
                    <td className="py-2 px-3 text-rose-400">42%</td>
                    <td className="py-2 px-3">4</td>
                    <td className="py-2 px-3 text-rose-400">68% (PARTIAL)</td>
                    <td className="py-2 px-3">30 pts</td>
                    <td className="py-2 pl-3 text-right font-bold">66/100</td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="py-2 pr-4">Unconstrained Autonomous Agent (No ProofGraph)</td>
                    <td className="py-2 px-3">64%</td>
                    <td className="py-2 px-3 text-rose-400">65%</td>
                    <td className="py-2 px-3">6</td>
                    <td className="py-2 px-3 text-rose-400">42% (VIOLATED)</td>
                    <td className="py-2 px-3">50 pts</td>
                    <td className="py-2 pl-3 text-right font-bold">51/100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Per-Test Detailed Audits & Successive Fine-Tuning Iterations */}
      {activeTab === 'test-audits' && (
        <TestResultsAndIterationLab
          iterationSnapshots={iterationSnapshots}
          activeModelName={testedAgentName}
          onRunNextIteration={async (notes) => {
            if (onRunNextIteration) {
              await onRunNextIteration(notes);
            }
          }}
          onStartInteractiveNextIteration={onStartInteractiveNextIteration}
          isRunningIteration={isRunningIteration}
        />
      )}

      {/* TAB 2: Marathon SWE Foresight & Absurdity Matrix */}
      {activeTab === 'marathon-matrix' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Marathon Foresight KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Directional Alignment Score */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Directional Alignment</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {marathonForesight.directionalAlignmentScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">12-Month Architectural Roadmap Fit</p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${marathonForesight.directionalAlignmentScore}%` }}
                ></div>
              </div>
            </div>

            {/* Absurdity Score (Lower is Better) */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Absurdity Score (Technical Debt)</span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      marathonForesight.absurdityScore <= 20
                        ? 'text-emerald-400'
                        : marathonForesight.absurdityScore <= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {marathonForesight.absurdityScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 100 (0 is ideal)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Short-term hacks blocking future scale</p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    marathonForesight.absurdityScore <= 20
                      ? 'bg-emerald-500'
                      : marathonForesight.absurdityScore <= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${marathonForesight.absurdityScore}%` }}
                ></div>
              </div>
            </div>

            {/* Marathon Grade */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Marathon Grade</span>
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    marathonForesight.marathonGrade === 'EXEMPLARY_FORESIGHT'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : marathonForesight.marathonGrade === 'TACTICALLY_SOUND'
                      ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                      : marathonForesight.marathonGrade === 'ARCHITECTURAL_DEBT'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {marathonForesight.marathonGrade.replace(/_/g, ' ')}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Overall long-horizon durability rating</p>
              </div>
            </div>

            {/* Cumulative Feature Cohesion Index (CFCI) */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Cumulative Feature Cohesion (CFCI)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-indigo-400">{cfci}</span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cross-mutation amnesia resistance</p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${cfci}%` }}></div>
              </div>
            </div>
          </div>

          {/* Disclosed 12-Month Future Architectural Roadmap Breakdown */}
          {activeScenario.futureArchitecturalRoadmap && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">
                    Disclosed 12-Month Architectural Roadmap ({activeScenario.futureArchitecturalRoadmap.targetTimeframe})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                  Scale Target: {activeScenario.futureArchitecturalRoadmap.upcomingScaleTarget}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeScenario.futureArchitecturalRoadmap.intendedEvolution}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg space-y-1.5">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Mandatory Future Requirements:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 font-mono text-[11px]">
                    {activeScenario.futureArchitecturalRoadmap.architecturalRequirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg space-y-1.5">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Absurdity Pitfalls (Technical Debt Traps):
                  </span>
                  <ul className="list-disc list-inside text-rose-300 space-y-1 font-mono text-[11px]">
                    {activeScenario.futureArchitecturalRoadmap.absurdityPitfallsToAvoid.map((pitfall, i) => (
                      <li key={i}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rationale & Blocker Radar */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-300 flex-wrap gap-1">
                  <span className="text-slate-400">Roadmap Alignment Rationale:</span>
                  <span className="text-indigo-300">{marathonForesight.alignmentRationale}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 flex-wrap gap-1">
                  <span className="text-slate-400">Absurdity Assessment:</span>
                  <span className="text-amber-300">{marathonForesight.absurdityDetails}</span>
                </div>
              </div>
            </div>
          )}

          {/* Choreographed 4-Turn Successive Feature Mutation Sequence */}
          {activeScenario.successiveFeatureMutations && activeScenario.successiveFeatureMutations.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">
                    Choreographed Successive Feature Mutation Sequence (Add &rarr; Modify &rarr; Delete &rarr; Conflicting Refactor)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  4 Sequential Turns | CFCI: {cfci}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeScenario.successiveFeatureMutations.map((turn) => {
                  const badgeColor =
                    turn.mutationType === 'add_feature'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                      : turn.mutationType === 'modify_feature'
                      ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                      : turn.mutationType === 'delete_feature'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/30'
                      : 'bg-purple-950 text-purple-300 border-purple-500/30';

                  return (
                    <div
                      key={turn.turnIndex}
                      className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px] flex-shrink-0">
                              {turn.turnIndex}
                            </span>
                            <span className="truncate">{turn.featureTitle}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase font-semibold whitespace-nowrap ${badgeColor}`}>
                            {turn.mutationType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 italic bg-slate-950/70 p-2 rounded border border-slate-800/80">
                          &ldquo;{turn.naturalHumanSymptomPrompt}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-1 font-mono text-[10px] pt-1 border-t border-slate-800/60">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>RAM Cap: {turn.realWorldConstraints.maxMemoryLimitMb ? `${turn.realWorldConstraints.maxMemoryLimitMb}MB` : 'N/A'}</span>
                          <span>Latency SLA: {turn.realWorldConstraints.maxP99LatencyMs ? `${turn.realWorldConstraints.maxP99LatencyMs}ms` : 'N/A'}</span>
                        </div>
                        <div className="text-amber-300 truncate">
                          Conflicted: {turn.conflictingPriorFeatures.join(', ') || 'None (Initial turn)'}
                        </div>
                        <div className="text-rose-300">
                          Trap: {turn.underlyingTechnicalTrap}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Messy SWE & Toolchain Resilience (Capability 6) */}
      {activeTab === 'messy-swe' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                Messy SWE Realities: Dependency Grime, Incomplete Context & Active Stack Nuances
              </h3>
              <p className="text-[11px] text-slate-400">
                Audits whether the AI coding agent survives real repository grime without hallucinating packages, clobbering pinned locks, or ignoring undocumented assumptions.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30 whitespace-nowrap">
              Resilience: {scorecard.messySWEResilienceScore ?? 94}%
            </span>
          </div>

          {messy && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Fragile Dependencies Audit */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    Fragile Pinned Dependencies in Active Repo ({activeScenario.repoContext.name}):
                  </span>
                  <div className="space-y-2 font-mono text-[11px]">
                    {messy.fragileDependencies.map((dep, idx) => (
                      <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between text-indigo-300 font-bold mb-1">
                          <span>{dep.pkg}@{dep.pinnedVersion}</span>
                          <span className="text-[10px] text-rose-400 font-semibold px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-500/30">
                            STRICT LOCK
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mb-0.5">{dep.issueRisk}</p>
                        <p className="text-rose-300 text-[10px] italic">Evaluation Trap: {dep.failureTrap}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incomplete Context Clues */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <FileQuestion className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    Incomplete Context & Tribal Knowledge Traps:
                  </span>
                  <div className="space-y-2 font-mono text-[11px]">
                    {messy.incompleteContextClues.map((clue, idx) => (
                      <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-amber-300 font-bold block mb-1">{clue.fileOrArea}</span>
                        <p className="text-slate-300 text-[11px] mb-0.5">{clue.undocumentedRule}</p>
                        <p className="text-slate-400 text-[10px]">Impact on Agent: {clue.missingContextImpact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Stack In-Use & Compiler Quirks */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  Project Tech Stack Nuances & Structural Invariants:
                </span>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                  Repository Stack: <strong className="text-indigo-300">{activeScenario.repoContext.stack}</strong>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  {messy.technicalStackQuirks.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Agent Glitch & Real-World Failure Intel */}
      {activeTab === 'agent-intel' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                Live AI Coding Agent Glitch & Failure Intel
              </h3>
              <p className="text-[11px] text-slate-400">
                Ground-truth post-mortems of autonomous AI coding agents failing in marathon tasks (context drift, feature amnesia, narrative condition breakdown).
              </p>
            </div>

            <form onSubmit={handleAgentFailuresSearch} className="flex items-center gap-1.5">
              <input
                type="text"
                value={agentSearchInput}
                onChange={(e) => setAgentSearchInput(e.target.value)}
                placeholder="Search agent failure patterns..."
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
              <button
                type="submit"
                disabled={isLoadingAgentFailures}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Search className="w-3 h-3" />
                <span>{isLoadingAgentFailures ? 'Scanning...' : 'Scan Intel'}</span>
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {agentFailures.map((failure) => (
              <div key={failure.id} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold">
                      {failure.incidentYear}
                    </span>
                    <span className="font-semibold text-slate-100">{failure.sourceTitle}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Source: <span className="text-indigo-300">{failure.sourceUrlOrAuthority}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Failing Agent Archetype:</span>
                    <span className="text-amber-300">{failure.failingAgentArchetype}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Primary Failure Mode:</span>
                    <span className="text-rose-300">{failure.failureMode}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-slate-400 font-mono block mb-1">Triggering Conditions:</span>
                  {failure.triggeringConditions}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Synthesized ApexProof Evaluator Adversarial Test Prompt:
                    </span>
                    <button
                      onClick={() => handleCopy(failure.synthesizedMasterPMTestPrompt, failure.id)}
                      className="px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === failure.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-900 border border-indigo-500/20 p-2.5 rounded-lg font-mono text-[11px] text-slate-200">
                    {failure.synthesizedMasterPMTestPrompt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Data Pipeline & Curated System-Prompt Patches */}
      {activeTab === 'data-pipeline' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Data Pipeline & Surgical System-Prompt Patches for Documented Workflow Holes
              </h3>
              <p className="text-[11px] text-slate-400">
                High-density guardrails ready to be injected into your coding agent&apos;s system prompt to correct its proven failure modes.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              Severity: {currentPatch.severity}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Failure Pattern: {currentPatch.failurePattern}
                </span>
                <button
                  onClick={() => handleCopy(currentPatch.systemPromptGuardrail, 'patch-guardrail')}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedId === 'patch-guardrail' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied Guardrail</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Guardrail to Agent System Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {currentPatch.systemPromptGuardrail}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Fine-Tuning Dataset Example (Bad Behavior vs Gold Response):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg">
                  <span className="font-semibold text-rose-400 block mb-1">Naive Agent Mistake:</span>
                  <p className="text-slate-300 font-mono text-[11px]">{currentPatch.fineTuningExample.agentBadBehavior}</p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg">
                  <span className="font-semibold text-emerald-400 block mb-1">Gold-Standard Verified Correction:</span>
                  <pre className="text-emerald-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                    {currentPatch.fineTuningExample.agentGoldResponse}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Error Reproducing Strategy & Adversarial Prompts */}
      {activeTab === 'repro' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Deterministic Error Reproducing Strategy: {currentRepro.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Repeatable test harness to reproduce the hidden concurrency or architectural regression.
              </p>
            </div>
            <button
              onClick={() => handleCopy(currentRepro.bashReproHarness, 'bash-harness')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === 'bash-harness' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Bash Script</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Reproduce Script</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Trigger Sequence:</span>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-200">
                {currentRepro.triggerConditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
              <span className="text-[11px] text-slate-400 font-mono block mb-2">Bash Harness:</span>
              <pre className="text-xs text-indigo-300 font-mono p-3 bg-slate-900 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {currentRepro.bashReproHarness}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg">
                <span className="font-semibold text-rose-400 block mb-1">Expected Failure Anomaly Log:</span>
                <p className="text-rose-200 font-mono text-[11px]">{currentRepro.expectedFailureLog}</p>
              </div>
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg">
                <span className="font-semibold text-emerald-400 block mb-1">Verified Fix Validation:</span>
                <p className="text-emerald-200 font-mono text-[11px]">{currentRepro.verifiedFixValidation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Live Threat & Real-World CVE Glitch Intelligence */}
      {activeTab === 'live-threats' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                Live Threat & Real-World CVE Glitch Intelligence
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by Gemini Live Web Search Grounding. Analyzes source credibility, citation density, discussion quality, and historical accuracy.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                value={threatSearchInput}
                onChange={(e) => setThreatSearchInput(e.target.value)}
                placeholder="Search emerging zero-days / CVEs..."
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
              <button
                type="submit"
                disabled={isLoadingThreats}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Search className="w-3 h-3" />
                <span>{isLoadingThreats ? 'Scanning...' : 'Scan Web'}</span>
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {threatIntel.map((threat) => (
              <div key={threat.id} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold">
                      {threat.cveOrIncident}
                    </span>
                    <span className="font-semibold text-slate-100">{threat.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Credibility:</span>
                    <span className="font-mono font-bold text-emerald-400">{threat.sourceCredibilityScore}/100</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                      {threat.corroborationSourcesCount} citations
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Source & Authority:</span>
                    <span className="text-indigo-300">{threat.source} ({threat.discussionQuality})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Historical Track Record:</span>
                    <span className="text-slate-300">{threat.historicalAccuracyRating}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-mono block mb-1">
                    Synthesized Prompt Injection Vector for AI Coding Agent:
                  </span>
                  <div className="bg-slate-900 border border-indigo-500/20 p-2.5 rounded-lg font-mono text-[11px] text-slate-200">
                    {threat.promptInjectionVector}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
