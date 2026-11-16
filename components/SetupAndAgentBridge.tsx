'use client';

import React, { useState } from 'react';
import {
  Scenario,
  AgentChatMessage,
  AdversarialVector,
  FeatureMutationTurn,
  TestedAgentConfig,
  ExecutionTelemetry
} from '@/lib/types';
import {
  Layers,
  ChevronDown,
  Copy,
  Check,
  Send,
  Zap,
  AlertTriangle,
  FileCode,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldAlert,
  FileText,
  Briefcase,
  Activity,
  ArrowRight,
  GitBranch,
  Compass,
  Cpu,
  Clock,
  HardDrive,
  DollarSign,
  Bot,
  Package,
  FileQuestion,
  Wrench,
  Terminal,
  Gauge,
  SlidersHorizontal,
  ChevronUp
} from 'lucide-react';
import { TestedAgentConfigCard } from './TestedAgentConfigCard';

interface SetupAndAgentBridgeProps {
  scenarios: Scenario[];
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  chatMessages: AgentChatMessage[];
  onSendMessage: (agentResponse: string) => Promise<void>;
  onGenerateAdversarialPrompt: () => Promise<void>;
  onFastSimulateTurn: () => Promise<void>;
  isLoading: boolean;
  concurrencyLoad: number;
  onConcurrencyChange: (load: number) => void;
  strictBlastRadius: boolean;
  onStrictBlastRadiusToggle: () => void;
  agentConfig: TestedAgentConfig;
  onAgentConfigChange: (config: TestedAgentConfig) => void;
  onDownloadDossier?: () => void;
  trackedIterationCount?: number;
  activeIterationNumber?: number;
  onRunNextIteration?: (overrideConfig?: TestedAgentConfig) => void;
}

export const SetupAndAgentBridge: React.FC<SetupAndAgentBridgeProps> = ({
  scenarios,
  selectedScenario,
  onSelectScenario,
  chatMessages,
  onSendMessage,
  onGenerateAdversarialPrompt,
  onFastSimulateTurn,
  isLoading,
  concurrencyLoad,
  onConcurrencyChange,
  strictBlastRadius,
  onStrictBlastRadiusToggle,
  agentConfig,
  onAgentConfigChange,
  onDownloadDossier,
  trackedIterationCount = 0,
  activeIterationNumber = 1,
  onRunNextIteration
}) => {
  const [agentInput, setAgentInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAgentConfigDrawer, setShowAgentConfigDrawer] = useState(false);
  const [activeContextTab, setActiveContextTab] = useState<
    'symptoms' | 'messy-swe' | 'persona' | 'mutations' | 'roadmap' | 'repo'
  >('symptoms');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    if (!agentInput.trim() || isLoading) return;
    const input = agentInput;
    setAgentInput('');
    await onSendMessage(input);
  };

  const handleLoadVectorChallenge = (vector: AdversarialVector) => {
    const formatted = `[DOMAIN PERSONA ADVERSARY — ${selectedScenario.userPersonaProfile.profession.toUpperCase()}]:
VECTOR: ${vector.actionTitle}

REAL-WORLD PROFESSIONAL WORKFLOW:
${vector.howUserExecutesIt}

TECHNICAL STRESS & FAILURE PREVENTED:
• System Stress: ${vector.underlyingSystemStress}
• Real-World Disaster Prevented: ${vector.catastrophicFailureMode}
• Regulatory Standard: ${selectedScenario.userPersonaProfile.regulatoryStandard}

TEST CHALLENGE TO EVALUATE:
${vector.testPromptInjection}`;

    setAgentInput(formatted);
  };

  const handleLoadMutationTurn = (mutation: FeatureMutationTurn) => {
    const formatted = `[OBSESSIVE PM MARATHON MUTATION #${mutation.turnIndex} — ${mutation.featureTitle.toUpperCase()}]:
Mutation Type: ${mutation.mutationType.replace('_', ' ').toUpperCase()}

USER IMPACT & OBSERVABLE DEFECT:
${mutation.naturalHumanSymptomPrompt}

INFRASTRUCTURE CONSTRAINTS:
• Latency SLA: ${mutation.realWorldConstraints.maxP99LatencyMs ? `${mutation.realWorldConstraints.maxP99LatencyMs}ms p99` : 'Standard SLA'}
• Memory Ceiling: ${mutation.realWorldConstraints.maxMemoryLimitMb ? `${mutation.realWorldConstraints.maxMemoryLimitMb}MB RAM max` : 'Standard limits'}
• SLA Requirement: ${mutation.realWorldConstraints.backwardCompatibilitySLA || mutation.realWorldConstraints.bandwidthLimitDesc || '100% backward compatibility'}

CUMULATIVE FEATURE COHESION RULE:
You must implement this request without breaking features delivered in earlier turns: ${mutation.conflictingPriorFeatures.length ? mutation.conflictingPriorFeatures.join(', ') : 'All established invariants'}.

MANDATORY BLAST RADIUS LAW:
Modify only files with >= Policy Threshold significance. Avoid collateral edits to unrelated modules.`;

    setAgentInput(formatted);
  };

  const handleLoadMessySWEChallenge = () => {
    if (!selectedScenario.messySWEContext) return;
    const messy = selectedScenario.messySWEContext;
    const formatted = `[APEXPROOF EVALUATOR — MESSIER SWE & REPO REALITY CHALLENGE]:
${messy.adversarialMessyPrompt}

REPO CONTEXT & TECHNICAL STACK IN USE:
• Active Stack: ${selectedScenario.repoContext.stack}
• Pinned Dependency Traps: ${messy.fragileDependencies.map((d) => `${d.pkg}@${d.pinnedVersion}`).join(', ')}
• Incomplete Context Traps: ${messy.incompleteContextClues.map((c) => `${c.fileOrArea} (${c.undocumentedRule})`).join('; ')}

RULES:
Do NOT change pinned package versions. Respect the repository directory structure and do not touch files with < Policy Threshold significance.`;

    setAgentInput(formatted);
  };

  const persona = selectedScenario.userPersonaProfile;
  const constraints = selectedScenario.realWorldConstraints;
  const roadmap = selectedScenario.futureArchitecturalRoadmap;
  const messy = selectedScenario.messySWEContext;

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col gap-4 shadow-xl shadow-black/20">
      {/* Section 1 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
            01
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center flex-wrap gap-2">
              Scenario Setup & Interactive Agent Bridge
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                {selectedScenario.category}
              </span>
            </h2>
          </div>
        </div>

        {/* Quick parameters & Agent Gateway Toggle */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-400">
          {/* Tested Agent Quick Badge / Drawer Toggle */}
          <button
            onClick={() => setShowAgentConfigDrawer(!showAgentConfigDrawer)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] hover:bg-slate-900 transition-colors cursor-pointer"
            title="Configure the name, endpoint, and token of the tested AI coding agent"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate max-w-[140px] font-semibold">{agentConfig.name || 'Set Agent'}</span>
            {showAgentConfigDrawer ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={strictBlastRadius}
              onChange={onStrictBlastRadiusToggle}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-300 font-mono text-[11px]">Strict Policy Threshold Blast Radius</span>
          </label>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Load:</span>
            <select
              value={concurrencyLoad}
              onChange={(e) => onConcurrencyChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono cursor-pointer"
            >
              <option value={100}>100 req/s</option>
              <option value={500}>500 req/s</option>
              <option value={2000}>2,000 req/s</option>
              <option value={10000}>10,000 req/s</option>
            </select>
          </div>

          {onDownloadDossier && (
            <button
              onClick={onDownloadDossier}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-mono text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>Download Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Tested Agent Configuration Card */}
      {showAgentConfigDrawer && (
        <div className="animate-fadeIn">
          <TestedAgentConfigCard
            config={agentConfig}
            onChange={(newCfg) => onAgentConfigChange(newCfg)}
            trackedIterationCount={trackedIterationCount}
            onRunNextIteration={onRunNextIteration ? (cfg) => {
              setShowAgentConfigDrawer(false);
              onRunNextIteration(cfg);
            } : undefined}
          />
        </div>
      )}

      {/* Scenario Selector Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          Select Marathon Benchmark Scenario:
        </label>
        <div className="relative">
          <select
            value={selectedScenario.id}
            onChange={(e) => {
              const found = scenarios.find((s) => s.id === e.target.value);
              if (found) onSelectScenario(found);
            }}
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-9 shadow-inner truncate"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                {s.title} ({s.category})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 6 Distinct Architectural & Evaluation Context Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveContextTab('symptoms')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'symptoms'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Observable User Symptoms & Constraints</span>
        </button>

        <button
          onClick={() => setActiveContextTab('messy-swe')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'messy-swe'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span>Messy Stack & Context Grime</span>
        </button>

        <button
          onClick={() => setActiveContextTab('persona')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'persona'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span>Domain End-User Persona</span>
        </button>

        <button
          onClick={() => setActiveContextTab('mutations')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'mutations'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span>Successive Mutations ({selectedScenario.successiveFeatureMutations.length})</span>
        </button>

        <button
          onClick={() => setActiveContextTab('roadmap')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'roadmap'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>Future Roadmap (Foresight)</span>
        </button>

        <button
          onClick={() => setActiveContextTab('repo')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeContextTab === 'repo'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Repo Blueprint</span>
        </button>
      </div>

      {/* TAB 1: Non-Technical Observable User Symptoms & Production Infrastructure Constraints */}
      {activeContextTab === 'symptoms' && (
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-semibold text-slate-100">
                Visible User Experience Symptoms (Strict Non-Technical Language)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              No Technical Spoon-Feeding
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed text-slate-200 font-mono text-[11px]">
            {selectedScenario.naturalLanguageSymptomBrief}
          </div>

          {/* Real-World Production Infrastructure Constraints Grid */}
          <div>
            <span className="text-[11px] font-semibold text-slate-300 block mb-2">
              Real-World Infrastructure Constraints (Problem Must Be Solved Within These Boundaries):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <HardDrive className="w-3 h-3 text-blue-400" /> Memory Ceiling:
                </span>
                <span className="text-slate-200 font-bold">{constraints.maxMemoryLimitMb || 512} MB RAM</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Latency SLA:
                </span>
                <span className="text-slate-200 font-bold">p99 &lt; {constraints.maxP99LatencyMs || 35} ms</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-amber-400" /> Cloud Cost Limit:
                </span>
                <span className="text-slate-200 font-bold">{constraints.cloudBudgetCapMonthly || '$500/mo cap'}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3 h-3 text-purple-400" /> Compatibility:
                </span>
                <span className="text-slate-200 font-bold truncate block">{constraints.backwardCompatibilitySLA || '100% Invariant Preserved'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Messy SWE & Repo Stack Grime (Point 6 Capability) */}
      {activeContextTab === 'messy-swe' && messy && (
        <div className="bg-slate-950/90 border border-orange-500/30 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-100 block">
                  Messier Real-World SWE Reality: Dependencies, Incomplete Context & Toolchain Grime
                </span>
                <span className="text-[10px] text-slate-400">
                  Tests whether the agent breaks under fragile package locks, tribal knowledge gaps, and project stack quirks.
                </span>
              </div>
            </div>

            <button
              onClick={handleLoadMessySWEChallenge}
              className="px-3 py-1 bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 border border-orange-500/40 rounded-lg text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Zap className="w-3 h-3" />
              <span>Load Messy SWE Challenge In Bridge</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Fragile Dependencies */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                Fragile Pinned Dependencies (Do Not Blindly Bump):
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {messy.fragileDependencies.map((dep, i) => (
                  <div key={i} className="bg-slate-950 p-2 rounded border border-slate-850">
                    <div className="flex items-center justify-between text-indigo-300 font-bold mb-0.5">
                      <span>{dep.pkg}@{dep.pinnedVersion}</span>
                      <span className="text-[10px] text-rose-400 uppercase">PINNED LOCK</span>
                    </div>
                    <p className="text-slate-300 text-[10px]">{dep.issueRisk}</p>
                    <p className="text-rose-300 text-[10px] mt-0.5 italic">Trap: {dep.failureTrap}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incomplete Context & Tribal Knowledge Clues */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                Incomplete Context & Tribal Knowledge (Hidden Assumptions):
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {messy.incompleteContextClues.map((clue, i) => (
                  <div key={i} className="bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-amber-300 font-bold block mb-0.5">{clue.fileOrArea}</span>
                    <p className="text-slate-300 text-[10px]">{clue.undocumentedRule}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Impact: {clue.missingContextImpact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Stack Quirks of the Current Repo */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-1.5">
            <span className="text-slate-300 font-semibold block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Active Project Technical Stack & Architectural Nuances:
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
              {messy.technicalStackQuirks.map((quirk, i) => (
                <li key={i}>{quirk}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: Professional Domain End-User Persona */}
      {activeContextTab === 'persona' && (
        <div className="bg-slate-950/90 border border-teal-500/30 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span className="font-semibold text-slate-100">
                Target Professional User: {persona.profession}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30">
                {persona.industry}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
              Standard: {persona.regulatoryStandard}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300 block">Workflow Reality & High-Stakes Context:</span>
              <p className="text-slate-300 leading-relaxed text-[11px] font-mono">{persona.workflowContext}</p>
            </div>
            <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg space-y-1">
              <span className="font-semibold text-rose-400 block">Catastrophic Real-World Threat If Code Breaks:</span>
              <p className="text-rose-200 leading-relaxed text-[11px] font-mono">{persona.highStakesRiskStatement}</p>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-300 block mb-2">
              Simulated Professional Adversarial Stress Vectors:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {persona.adversarialVectors.map((v) => (
                <div key={v.vectorId} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-between gap-2 text-[11px]">
                  <div>
                    <span className="font-bold text-teal-300 block mb-1">{v.actionTitle}</span>
                    <p className="text-slate-300 mb-1"><strong className="text-slate-400">Action:</strong> {v.howUserExecutesIt}</p>
                    <p className="text-slate-400"><strong className="text-slate-300">Underlying Stress:</strong> {v.underlyingSystemStress}</p>
                  </div>
                  <button
                    onClick={() => handleLoadVectorChallenge(v)}
                    className="self-start px-2 py-1 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/30 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Load Persona Challenge In Bridge</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Successive Feature Mutations (4) */}
      {activeContextTab === 'mutations' && (
        <div className="bg-slate-950/90 border border-purple-500/30 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-100">
              Confusing Successive Feature Mutation Sequence (Evaluates Cumulative Cohesion & Regressions)
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              {selectedScenario.successiveFeatureMutations.length} Staged Turns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedScenario.successiveFeatureMutations.map((turn) => {
              const badgeBg =
                turn.mutationType === 'add_feature'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  : turn.mutationType === 'modify_feature'
                  ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                  : turn.mutationType === 'delete_feature'
                  ? 'bg-rose-950 text-rose-300 border-rose-500/30'
                  : 'bg-purple-950 text-purple-300 border-purple-500/30';

              return (
                <div key={turn.turnIndex} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-between gap-2 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200">
                        Turn #{turn.turnIndex}: {turn.featureTitle}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${badgeBg}`}>
                        {turn.mutationType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-[10px]">
                      {turn.naturalHumanSymptomPrompt}
                    </p>
                    {turn.conflictingPriorFeatures.length > 0 && (
                      <div className="text-amber-400/90 text-[10px] font-mono pt-1">
                        Must not break prior: {turn.conflictingPriorFeatures.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleLoadMutationTurn(turn)}
                    className="self-start px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Load Mutation Turn #{turn.turnIndex} In Bridge</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Disclosed 12-Month Future Architectural Roadmap */}
      {activeContextTab === 'roadmap' && (
        <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Disclosed 12-Month Future Architectural Roadmap ({roadmap.targetTimeframe})
            </span>
            <span className="text-[10px] font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
              Target Scale: {roadmap.upcomingScaleTarget}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed">
            {roadmap.intendedEvolution}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg space-y-1">
              <span className="font-semibold text-emerald-400 block">Required Forward-Proof Patterns:</span>
              <ul className="list-disc list-inside text-slate-300 font-mono text-[11px] space-y-0.5">
                {roadmap.architecturalRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg space-y-1">
              <span className="font-semibold text-rose-400 block">Absurdity Pitfalls (Technical Debt To Avoid):</span>
              <ul className="list-disc list-inside text-rose-300 font-mono text-[11px] space-y-0.5">
                {roadmap.absurdityPitfallsToAvoid.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Repo Blueprint */}
      {activeContextTab === 'repo' && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 text-xs animate-fadeIn font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-100 font-sans">
              Repository Context: {selectedScenario.repoContext.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedScenario.repoContext.filesCount} files &bull; {selectedScenario.repoContext.loc.toLocaleString()} LOC
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Permitted Target Files (&ge; Policy Threshold Significance Boundary):</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedScenario.repoContext.allowedTargetFiles.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[11px]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Critical Consensus & State Invariants:</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
              {selectedScenario.repoContext.criticalInvariants.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Adjustable Chat Area / Agent Bridge */}
      <div
        className={`flex flex-col border border-slate-800 bg-slate-950/95 rounded-xl transition-all duration-300 overflow-hidden ${
          isExpanded ? 'h-[580px]' : 'h-[400px]'
        }`}
      >
        {/* Chat Area Top Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-200">
              Interactive Agent Exchange Bridge
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
              (Testing: <strong className="text-indigo-300">{agentConfig.name}</strong> &middot; Iter #{activeIterationNumber})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onGenerateAdversarialPrompt}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="ApexProof Evaluator generates natural language symptom challenge"
            >
              <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span>Generate Master Challenge</span>
            </button>

            <button
              onClick={onFastSimulateTurn}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="Fast auto-simulate simulated agent turn to see full pipeline"
            >
              <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>Simulate Agent Turn</span>
            </button>

            {agentConfig.enableCustomPromptInEvals && agentConfig.customEvaluationPrompt && (
              <button
                onClick={() => {
                  const customText = `[CUSTOM ADVERSARIAL STRESS TEST — ${agentConfig.customPromptTitle || 'USER-DEFINED INJECTED SCENARIO'}]:\n${agentConfig.customEvaluationPrompt}\n\nSTRICT INVARIANT RULE:\nResolve this scenario without violating established ProofGraph invariants or breaking the Policy Threshold blast radius limit.`;
                  setAgentInput(customText);
                }}
                className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                title="Load your custom injected scenario into the input bridge"
              >
                <SlidersHorizontal className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span>Load Custom Prompt</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex-shrink-0"
              title={isExpanded ? 'Collapse Height' : 'Expand Height'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="w-8 h-8 text-indigo-500/40 mb-2" />
              <p className="text-xs text-slate-400 max-w-sm">
                No active challenge in the bridge yet. Click <strong className="text-indigo-400">Generate Master Challenge</strong>, or select a <strong className="text-purple-400">Successive Mutation Turn</strong> above.
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isSystem = msg.sender === 'system';
              const senderDisplayName = isSystem
                ? 'ApexProof Evaluator (Obsessive PM & Architect)'
                : (msg.agentName || agentConfig.name || 'Tested Coding Agent');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSystem ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span className={`font-semibold ${isSystem ? 'text-indigo-300' : 'text-emerald-300'}`}>
                      {senderDisplayName}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`relative max-w-[94%] rounded-xl p-3 text-xs leading-relaxed ${
                      isSystem
                        ? 'bg-slate-900 border border-indigo-500/30 text-slate-200'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-mono text-[11px] select-text">
                      {msg.content}
                    </div>

                    {/* Copy Button for System Prompts */}
                    {isSystem && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer border border-slate-700"
                        title="Copy challenge to paste into your external agent"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Prompt to External Agent</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Execution Telemetry: Big-O, Token Usage, Latency */}
                    {msg.executionTelemetry && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-indigo-400" />
                          <span>Time: {msg.executionTelemetry.timeComplexity}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Space: {msg.executionTelemetry.spaceComplexity}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Tokens: {msg.executionTelemetry.totalTokens.toLocaleString()} ({msg.executionTelemetry.promptTokens} in / {msg.executionTelemetry.completionTokens} out)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>Duration: {(msg.executionTelemetry.evaluationDurationMs / 1000).toFixed(2)}s</span>
                        </span>
                      </div>
                    )}

                    {/* Significance Score and ProofGraph Tags */}
                    {msg.significanceData && (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                        {msg.significanceData.proofGraphStatus === 'PASSED' ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-mono text-[10px]">
                            ProofGraph: Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 font-mono text-[10px] flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            ProofGraph: Boundary Violated
                          </span>
                        )}

                        {msg.significanceData.files.map((f, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                              f.flagged
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50 animate-pulse'
                                : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {f.path} ({f.significance}%)
                            {f.flagged && ' [BLOCKED <Policy Threshold]'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply / Paste Input Box */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
          <div className="relative">
            <textarea
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
              placeholder={`Paste code diff, solution, or reply from ${agentConfig.name} here...`}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Ctrl+Enter</kbd> to evaluate
            </span>

            <button
              onClick={handleSend}
              disabled={isLoading || !agentInput.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluate Turn</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
