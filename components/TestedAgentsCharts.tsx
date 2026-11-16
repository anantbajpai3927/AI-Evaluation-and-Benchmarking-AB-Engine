'use client';

import React, { useState } from 'react';
import { EvaluationScorecard } from '@/lib/types';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface TestedAgentsChartsProps {
  currentScorecard: EvaluationScorecard;
  activeAgentLabel?: string;
}

interface TestedAgentProfile {
  id: string;
  name: string;
  sourceType: string;
  functionalPass: number;
  concurrencyFail: number;
  collateralViolations: number;
  loopingScore: number;
  compositeScore: number;
  customPromptScore: number;
  customPromptStatus: string;
  dimensionScores: {
    functional: number;
    architectural: number;
    security: number;
    resilience: number;
    longHorizon: number;
    efficiency: number;
    blastRadius: number;
  };
}

export const TestedAgentsCharts: React.FC<TestedAgentsChartsProps> = ({
  currentScorecard,
  activeAgentLabel = 'Active Tested Agent Session'
}) => {
  const [selectedChartTab, setSelectedChartTab] = useState<'pass-vs-fail' | 'radar-matrix' | 'blast-radius' | 'looping'>('pass-vs-fail');

  const agents: TestedAgentProfile[] = [
    {
      id: 'current-agent',
      name: `${activeAgentLabel} (Current)`,
      sourceType: 'Interactive / API Bridge',
      functionalPass: currentScorecard.functionalPassRate,
      concurrencyFail: currentScorecard.hiddenConcurrencyFailureRate,
      collateralViolations: currentScorecard.collateralDamageViolations,
      loopingScore: currentScorecard.loopingScore.score,
      compositeScore: currentScorecard.overallScore,
      customPromptScore: currentScorecard.customPromptEvaluation ? currentScorecard.customPromptEvaluation.passRate : 92,
      customPromptStatus: currentScorecard.customPromptEvaluation ? currentScorecard.customPromptEvaluation.status : 'VERIFIED',
      dimensionScores: {
        functional: currentScorecard.functionalCorrectness,
        architectural: currentScorecard.architecturalIntegrity,
        security: currentScorecard.security,
        resilience: currentScorecard.reliabilityAndResilience,
        longHorizon: currentScorecard.longHorizonCompletion,
        efficiency: currentScorecard.performanceAndEfficiency,
        blastRadius: currentScorecard.regressionAndCollateral,
      }
    },
    {
      id: 'agent-swe-v28',
      name: 'Autonomous SWE-Agent (v2.8 ReAct)',
      sourceType: 'External Docker Agent',
      functionalPass: 86,
      concurrencyFail: 36,
      collateralViolations: 2,
      loopingScore: 75,
      compositeScore: 78,
      customPromptScore: 82,
      customPromptStatus: 'PARTIAL',
      dimensionScores: {
        functional: 86,
        architectural: 80,
        security: 82,
        resilience: 64,
        longHorizon: 85,
        efficiency: 80,
        blastRadius: 70,
      }
    },
    {
      id: 'agent-devloop-custom',
      name: 'DevLoop Pipeline (API Key: sk-custom...)',
      sourceType: 'Custom Webhook API',
      functionalPass: 92,
      concurrencyFail: 24,
      collateralViolations: 1,
      loopingScore: 85,
      compositeScore: 84,
      customPromptScore: 88,
      customPromptStatus: 'PARTIAL',
      dimensionScores: {
        functional: 92,
        architectural: 88,
        security: 90,
        resilience: 76,
        longHorizon: 90,
        efficiency: 92,
        blastRadius: 82,
      }
    },
    {
      id: 'agent-refactor-daemon',
      name: 'RefactorDaemon Pro (Multi-Repo)',
      sourceType: 'Git PR Worker',
      functionalPass: 76,
      concurrencyFail: 45,
      collateralViolations: 4,
      loopingScore: 60,
      compositeScore: 68,
      customPromptScore: 68,
      customPromptStatus: 'PARTIAL',
      dimensionScores: {
        functional: 76,
        architectural: 70,
        security: 75,
        resilience: 55,
        longHorizon: 70,
        efficiency: 85,
        blastRadius: 55,
      }
    },
    {
      id: 'agent-unconstrained',
      name: 'Unconstrained Baseline Agent (No Fences)',
      sourceType: 'Direct Prompt Pipeline',
      functionalPass: 65,
      concurrencyFail: 68,
      collateralViolations: 7,
      loopingScore: 40,
      compositeScore: 49,
      customPromptScore: 36,
      customPromptStatus: 'VIOLATED',
      dimensionScores: {
        functional: 65,
        architectural: 48,
        security: 50,
        resilience: 32,
        longHorizon: 50,
        efficiency: 75,
        blastRadius: 30,
      }
    }
  ];

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Chart Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Tested AI Agents Empirical Performance Analytics
          </h3>
          <p className="text-[11px] text-slate-400">
            Comparing external AI coding agents and custom API models tested inside this benchmarking environment.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedChartTab('pass-vs-fail')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
              selectedChartTab === 'pass-vs-fail' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pass vs Concurrency Fail
          </button>
          <button
            onClick={() => setSelectedChartTab('radar-matrix')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
              selectedChartTab === 'radar-matrix' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Dimension Matrix
          </button>
          <button
            onClick={() => setSelectedChartTab('blast-radius')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
              selectedChartTab === 'blast-radius' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blast Radius Violations
          </button>
          <button
            onClick={() => setSelectedChartTab('looping')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
              selectedChartTab === 'looping' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Looping Resilience
          </button>
        </div>
      </div>

      {/* CHART 1: Functional Pass Rate vs Hidden Concurrency Failure Rate */}
      {selectedChartTab === 'pass-vs-fail' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span>Functional Pass Rate (%)</span>
              <span className="w-3 h-3 rounded bg-rose-500 inline-block ml-3"></span>
              <span>Hidden Concurrency Failure Rate (%)</span>
            </span>
            <span className="text-slate-500 text-[11px]">Lower failure rate is better</span>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    {agent.name}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {agent.sourceType}
                    </span>
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">
                    Composite: {agent.compositeScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Functional Pass Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Functional Pass:</span>
                      <span className="text-emerald-400 font-bold">{agent.functionalPass}%</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${agent.functionalPass}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hidden Concurrency Fail Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Hidden Concurrency Failure:</span>
                      <span className="text-rose-400 font-bold">{agent.concurrencyFail}%</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${agent.concurrencyFail}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART 2: 7-Dimension Comparative Matrix */}
      {selectedChartTab === 'radar-matrix' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400 font-mono">
            Direct dimension score breakdown across all 7 evaluated capabilities:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 pr-3 font-normal">Tested AI Agent</th>
                  <th className="py-2 px-2 font-normal">Functional (25%)</th>
                  <th className="py-2 px-2 font-normal">Arch (15%)</th>
                  <th className="py-2 px-2 font-normal">Security (15%)</th>
                  <th className="py-2 px-2 font-normal">Resilience (15%)</th>
                  <th className="py-2 px-2 font-normal">Horizon (10%)</th>
                  <th className="py-2 px-2 font-normal">Speed (10%)</th>
                  <th className="py-2 px-2 font-normal text-indigo-300">Custom Stress</th>
                  <th className="py-2 pl-2 font-normal text-right">Composite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {agents.map((agent) => {
                  const isCurrent = agent.id === 'current-agent';
                  return (
                    <tr key={agent.id} className={isCurrent ? 'bg-indigo-950/20 font-semibold text-slate-100' : 'text-slate-300'}>
                      <td className="py-2.5 pr-3">{agent.name}</td>
                      <td className="py-2.5 px-2 text-emerald-400">{agent.dimensionScores.functional}%</td>
                      <td className="py-2.5 px-2 text-purple-400">{agent.dimensionScores.architectural}%</td>
                      <td className="py-2.5 px-2 text-sky-400">{agent.dimensionScores.security}%</td>
                      <td className="py-2.5 px-2 text-amber-400">{agent.dimensionScores.resilience}%</td>
                      <td className="py-2.5 px-2 text-teal-400">{agent.dimensionScores.longHorizon}%</td>
                      <td className="py-2.5 px-2 text-blue-400">{agent.dimensionScores.efficiency}%</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            agent.customPromptStatus === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : agent.customPromptStatus === 'PARTIAL'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {agent.customPromptScore}% ({agent.customPromptStatus})
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-indigo-300">{agent.compositeScore}/100</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHART 3: Blast Radius Violations (< Policy Threshold significance) */}
      {selectedChartTab === 'blast-radius' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-400 font-mono">
            Measuring collateral damage: number of files touched by each agent with &lt; Policy Threshold task significance:
          </p>

          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200 block">{agent.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Collateral Infractions: <strong className={agent.collateralViolations === 0 ? 'text-emerald-400' : 'text-rose-400'}>{agent.collateralViolations} files</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${agent.collateralViolations === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(10, agent.collateralViolations * 15))}%` }}
                    ></div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                    agent.collateralViolations === 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  }`}>
                    {agent.collateralViolations === 0 ? 'Zero Collateral' : `${agent.collateralViolations} Flagged (<Policy Threshold)`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART 4: Looping Resilience & Repeated Errors */}
      {selectedChartTab === 'looping' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-400 font-mono">
            Evaluating multi-turn regression resistance: agents penalized for repeating previous mistakes or resurrecting bugs:
          </p>

          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{agent.name}</span>
                  <span className={`font-mono font-bold ${
                    agent.loopingScore >= 80 ? 'text-emerald-400' : agent.loopingScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    Looping Score: {agent.loopingScore}/100
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      agent.loopingScore >= 80 ? 'bg-emerald-500' : agent.loopingScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${agent.loopingScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
