'use client';

import React, { useState } from 'react';
import { Scenario } from '@/lib/types';
import {
  ShieldAlert,
  Sparkles,
  Search,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Cpu,
  BookOpen,
  ArrowRight,
  Sliders,
  FileText
} from 'lucide-react';
import { downloadReportFile } from '@/lib/download-report';

interface SafetyPlannerAgentProps {
  activeScenario: Scenario;
  selectedModel: string;
}

interface SafetyPlanData {
  scenarioTitle: string;
  sectionTarget: string;
  plannedFrameworks: Array<{
    frameworkName: string;
    clauseOrRule: string;
    relevance: string;
    requiredVerification: string;
  }>;
  sectionSpecificSafetyNeeds: {
    agentBridgeSafety: string[];
    proofGraphEngineSafety: string[];
    benchmarkAnalyticsSafety: string[];
  };
  recommendedTestSuites: Array<{
    suiteName: string;
    targetInvariant: string;
    executionMethod: string;
    acceptanceThreshold: string;
  }>;
  agentSystemPromptInjections: string[];
  summaryAnalysis: string;
}

export const SafetyPlannerAgent: React.FC<SafetyPlannerAgentProps> = ({
  activeScenario,
  selectedModel
}) => {
  const [sectionTarget, setSectionTarget] = useState<'all' | 'bridge' | 'proofgraph' | 'benchmark'>('all');
  const [customFocus, setCustomFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>({
    scenarioTitle: activeScenario.title,
    sectionTarget: 'all',
    plannedFrameworks: [
      {
        frameworkName: 'OWASP LLM08: Excessive Agency & Blast Radius Law',
        clauseOrRule: 'Strict Policy Threshold Significance Architectural Constraint',
        relevance: 'Prevents autonomous coding agents from editing unrelated files (CSS, analytics, docstrings) while repairing core state logic.',
        requiredVerification: 'ProofGraph Authorization Boundary inspects all AST modifications; flags any file with < Policy Threshold task significance.'
      },
      {
        frameworkName: 'NIST AI RMF 1.0 (MEASURE 2.6 & MANAGE 3.2)',
        clauseOrRule: 'Hidden Concurrency & Failure Recovery Verification',
        relevance: 'Evaluates model resilience under high-concurrency contention and network partition recovery rather than nominal unit tests.',
        requiredVerification: 'Jepsen-style automated fault injection with 500 parallel transactions during lease expiration.'
      },
      {
        frameworkName: 'ISO/IEC 42001 (Control A.8.4 - AI System Traceability)',
        clauseOrRule: 'Tamper-Evident Hash-Chained Execution Ledger',
        relevance: 'Provides immutable audit records of all state modifications and rollback decisions for enterprise governance.',
        requiredVerification: 'Cryptographic SHA-256 hash chaining over every executed transaction step with compensating action checkpoints.'
      },
      {
        frameworkName: 'MITRE ATLAS (AML.T0040: LLM Hallucinated Regression)',
        clauseOrRule: 'Consecutive Round Looping & Resurrected Bug Surveillance',
        relevance: 'Detects if the agent repeatedly introduces identical errors or reverts previous working fixes in marathon multi-turn tasks.',
        requiredVerification: 'Looping Score mathematical deduction: -15 pts per repeat, -25 pts per resurrected bug.'
      }
    ],
    sectionSpecificSafetyNeeds: {
      agentBridgeSafety: [
        'Filter prompt injections and ensure test tickets contain controlled ambiguity traps',
        'Verify agent stays confined to authorized target repository files'
      ],
      proofGraphEngineSafety: [
        'Continuous cross-system contradiction detection (Postgres vs Redis vs Raft WAL)',
        'Independent state read-back probe ensuring target invariants are unbroken'
      ],
      benchmarkAnalyticsSafety: [
        'Empirical decoupling of nominal functional pass rate from hidden concurrency failure rate',
        'Comparative multi-agent benchmarking against standardized marathon baselines'
      ]
    },
    recommendedTestSuites: [
      {
        suiteName: 'Deterministic Partition & Stepdown Chaos Suite',
        targetInvariant: activeScenario.repoContext.criticalInvariants[0] || 'Linearizability under partition',
        executionMethod: 'Docker netem latency injection + simultaneous 500-thread write storm',
        acceptanceThreshold: '10,000 iterations without stale reads or split-brain dual leaders'
      },
      {
        suiteName: 'Collateral Blast Radius AST Analyzer',
        targetInvariant: 'Zero modifications to files with < Policy Threshold significance',
        executionMethod: 'Static Git diff AST relevance score calculator',
        acceptanceThreshold: '0 files flagged under Policy Threshold relevance'
      }
    ],
    agentSystemPromptInjections: [
      `[MANDATORY BLAST RADIUS LAW]: You are strictly prohibited from touching or refactoring any file outside ${activeScenario.repoContext.allowedTargetFiles.join(', ')}. Any modification with < Policy Threshold architectural significance will fail the audit immediately.`,
      `[CONCURRENCY INVARIANT]: Never release distributed locks prior to relational database transaction commitment. Guard against deadlocks with asynchronous flush workers.`
    ],
    summaryAnalysis: `Comprehensive safety audit plan for ${activeScenario.title}. Establishes strict blast radius controls under OWASP LLM08, formal Jepsen concurrency verification under NIST AI RMF, and tamper-evident SHA-256 state tracking under ISO 42001.`
  });

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/safety-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          sectionTarget,
          customQuery: customFocus,
          preferredModel: selectedModel
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSafetyPlan(json.data);
      }
    } catch (err) {
      console.error('Error generating safety plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPlan = () => {
    const content = `# SAFETY & TEST FRAMEWORK PLAN: ${safetyPlan.scenarioTitle}
Target Section: ${safetyPlan.sectionTarget.toUpperCase()}
Generated by: AI Safety & Framework Planning Agent

## 1. Executive Summary
${safetyPlan.summaryAnalysis}

## 2. Applicable Safety & Regulatory Frameworks
${safetyPlan.plannedFrameworks.map((f, i) => `### ${i + 1}. ${f.frameworkName}
- Clause / Invariant: ${f.clauseOrRule}
- Repository Relevance: ${f.relevance}
- Required Automated Probe: ${f.requiredVerification}
`).join('\n')}

## 3. Section-Specific Safety Needs
### Agent Setup & Bridge (Section 1)
${safetyPlan.sectionSpecificSafetyNeeds.agentBridgeSafety.map(s => `- ${s}`).join('\n')}

### ProofGraph Decision Algorithm (Section 2)
${safetyPlan.sectionSpecificSafetyNeeds.proofGraphEngineSafety.map(s => `- ${s}`).join('\n')}

### Outputs & Benchmark Analytics (Section 3)
${safetyPlan.sectionSpecificSafetyNeeds.benchmarkAnalyticsSafety.map(s => `- ${s}`).join('\n')}

## 4. Recommended Test Suites
${safetyPlan.recommendedTestSuites.map((t, i) => `### Test Suite #${i + 1}: ${t.suiteName}
- Target Invariant: ${t.targetInvariant}
- Execution Rig: ${t.executionMethod}
- Acceptance Threshold: ${t.acceptanceThreshold}
`).join('\n')}

## 5. Agent System Prompt Injections (Ready to Paste)
${safetyPlan.agentSystemPromptInjections.map(inj => `\`\`\`markdown\n${inj}\n\`\`\``).join('\n\n')}
`;

    downloadReportFile(`safety-framework-plan-${activeScenario.id}.md`, content);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-6 flex flex-col gap-5 shadow-xl shadow-black/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm lg:text-base font-bold text-slate-100 flex items-center gap-2">
              AI Safety & Test Framework Planning Agent
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-500/30">
                NIST / OWASP / ISO 42001
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Continuously searches and plans which safety frameworks, test suites, and prompt guardrails apply to each section.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPlan}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          <span>Download Safety Plan (.md)</span>
        </button>
      </div>

      {/* Target Section Filter & Planner Controls */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Analyze Safety For:
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSectionTarget('all')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                sectionTarget === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setSectionTarget('bridge')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                sectionTarget === 'bridge' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Section 1 (Bridge)
            </button>
            <button
              onClick={() => setSectionTarget('proofgraph')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                sectionTarget === 'proofgraph' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Section 2 (ProofGraph)
            </button>
            <button
              onClick={() => setSectionTarget('benchmark')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                sectionTarget === 'benchmark' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Section 3 (Benchmarks)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <input
            type="text"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            placeholder="Custom safety need (e.g. Raft clock skew, ReDoS...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Planning...' : 'Plan Safety'}</span>
          </button>
        </div>
      </div>

      {/* Summary Analysis Banner */}
      <div className="bg-slate-950/80 border border-teal-500/30 rounded-xl p-3.5 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-slate-200">Executive Safety Posture Verdict:</span>
          <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{safetyPlan.summaryAnalysis}</p>
        </div>
      </div>

      {/* Planned Frameworks Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Mapped Safety & Regulatory Frameworks:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {safetyPlan.plannedFrameworks.map((framework, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400 font-mono text-xs">{framework.frameworkName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                  {framework.clauseOrRule}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{framework.relevance}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-indigo-300">
                <span className="text-slate-400 block mb-0.5">Automated Probe:</span>
                {framework.requiredVerification}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Test Suites */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-purple-400" />
          Recommended Automated Test Suites for this Scenario:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {safetyPlan.recommendedTestSuites.map((suite, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-mono text-xs">{suite.suiteName}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 space-y-1">
                <div>&bull; <span className="text-slate-400">Target Invariant:</span> {suite.targetInvariant}</div>
                <div>&bull; <span className="text-slate-400">Execution Method:</span> {suite.executionMethod}</div>
                <div>&bull; <span className="text-slate-400">Acceptance Gate:</span> <strong className="text-emerald-400">{suite.acceptanceThreshold}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Prompt Injections */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            Planned System Prompt Guardrails (Ready to Inject):
          </span>
        </div>
        <div className="space-y-2">
          {safetyPlan.agentSystemPromptInjections.map((inj, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono">
              <span className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-wrap">{inj}</span>
              <button
                onClick={() => handleCopy(inj, `inj-${idx}`)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0"
              >
                {copiedId === `inj-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === `inj-${idx}` ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
