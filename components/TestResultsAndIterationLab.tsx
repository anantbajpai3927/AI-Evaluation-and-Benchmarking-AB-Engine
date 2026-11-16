'use client';

import React, { useMemo, useState } from 'react';
import {
  ModelIterationSnapshot,
  TestEvaluationAuditRecord,
} from '@/lib/types';
import {
  compareModelIterations,
  normalizeModelIdentifier,
} from '@/lib/engine/iteration-analyzer';
import {
  TrendingUp,
  TrendingDown,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BarChart2,
  GitCommit,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface TestResultsAndIterationLabProps {
  iterationSnapshots: ModelIterationSnapshot[];
  activeModelName: string;
  onRunNextIteration: (fineTuneNotes?: string) => Promise<void>;
  onStartInteractiveNextIteration?: () => void;
  isRunningIteration: boolean;
}

export const TestResultsAndIterationLab: React.FC<TestResultsAndIterationLabProps> = ({
  iterationSnapshots,
  activeModelName,
  onRunNextIteration,
  onStartInteractiveNextIteration,
  isRunningIteration,
}) => {
  const normalizedActive = normalizeModelIdentifier(activeModelName);

  // Extract distinct model names recorded in history
  const availableModels = useMemo(() => {
    const names = new Set<string>([normalizedActive]);
    iterationSnapshots.forEach((snap) => names.add(normalizeModelIdentifier(snap.modelName)));
    return Array.from(names);
  }, [iterationSnapshots, normalizedActive]);

  const [selectedModelFilter, setSelectedModelFilter] = useState<string>(normalizedActive);
  const [fineTuneNotes, setFineTuneNotes] = useState<string>('');
  const [expandedAuditIds, setExpandedAuditIds] = useState<Record<string, boolean>>({});
  const [selectedIterFilter, setSelectedIterFilter] = useState<number | 'all'>('all');

  // Ensure filter tracks active model if user switches model name and current filter has no entries
  const effectiveModel = availableModels.includes(selectedModelFilter)
    ? selectedModelFilter
    : normalizedActive;

  const modelIterations = useMemo(() => {
    return iterationSnapshots
      .filter(
        (s) =>
          normalizeModelIdentifier(s.modelName).toLowerCase() ===
          effectiveModel.toLowerCase()
      )
      .sort((a, b) => a.iterationNumber - b.iterationNumber);
  }, [iterationSnapshots, effectiveModel]);

  const latestIterationNumber =
    modelIterations.length > 0
      ? modelIterations[modelIterations.length - 1].iterationNumber
      : 0;
  const nextIterationNumber = latestIterationNumber + 1;

  // Baseline & Target selectors for successive comparison
  const defaultBaselineIdx = Math.max(0, modelIterations.length - 2);
  const defaultTargetIdx = Math.max(0, modelIterations.length - 1);

  const [baselineIterNum, setBaselineIterNum] = useState<number | null>(null);
  const [targetIterNum, setTargetIterNum] = useState<number | null>(null);

  const baselineSnap =
    modelIterations.find((m) => m.iterationNumber === baselineIterNum) ||
    modelIterations[defaultBaselineIdx];
  const targetSnap =
    modelIterations.find((m) => m.iterationNumber === targetIterNum) ||
    modelIterations[defaultTargetIdx];

  const comparison = useMemo(() => {
    if (!baselineSnap || !targetSnap || modelIterations.length < 2) return null;
    if (baselineSnap.id === targetSnap.id && modelIterations.length >= 2) {
      return compareModelIterations(
        modelIterations[modelIterations.length - 2],
        modelIterations[modelIterations.length - 1]
      );
    }
    return compareModelIterations(baselineSnap, targetSnap);
  }, [baselineSnap, targetSnap, modelIterations]);

  // Flatten per-test audit records for selected model & iteration filter
  const auditRecords: TestEvaluationAuditRecord[] = useMemo(() => {
    const filteredIters =
      selectedIterFilter === 'all'
        ? modelIterations
        : modelIterations.filter((m) => m.iterationNumber === selectedIterFilter);

    return filteredIters
      .slice()
      .reverse()
      .flatMap((iter) => iter.testAudits);
  }, [modelIterations, selectedIterFilter]);

  const toggleExpandAudit = (id: string) => {
    setExpandedAuditIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* TOP CONTROL BAR: Model Iteration Launcher (Zero API Key Persistence) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <GitCommit className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-slate-100">
                Fine-Tuning Iteration Progression & Per-Test Audit Lab
              </h3>
              <span className="text-xs font-mono text-slate-400">
                · Tracked by Model Name (API keys are never saved)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect summarized prompts, agent responses, positives/negatives explaining 8 or 9 vs. 10 scores, and run successive post-fine-tuning iterations for{' '}
              <strong className="text-indigo-300 font-mono">{effectiveModel}</strong>.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Model Name Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Model:</span>
              <select
                aria-label="Filter by tracked AI model name"
                value={effectiveModel}
                onChange={(e) => {
                  setSelectedModelFilter(e.target.value);
                  setBaselineIterNum(null);
                  setTargetIterNum(null);
                  setSelectedIterFilter('all');
                }}
                className="bg-transparent text-slate-100 font-mono font-semibold focus:outline-none cursor-pointer"
              >
                {availableModels.map((name) => (
                  <option key={name} value={name} className="bg-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {onStartInteractiveNextIteration && (
              <button
                type="button"
                onClick={onStartInteractiveNextIteration}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Manual Bridge Iter #{nextIterationNumber}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRunNextIteration(fineTuneNotes.trim() || undefined)}
              disabled={isRunningIteration}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Play className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {isRunningIteration
                  ? `Running Iteration #${nextIterationNumber}...`
                  : `Run Next Full Iteration (#${nextIterationNumber})`}
              </span>
            </button>
          </div>
        </div>

        {/* Fine-Tuning Context Input Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs">
          <label
            htmlFor="fine-tune-notes-input"
            className="text-slate-400 font-medium whitespace-nowrap"
          >
            Iteration #{nextIterationNumber} Fine-Tune Focus:
          </label>
          <input
            id="fine-tune-notes-input"
            type="text"
            value={fineTuneNotes}
            onChange={(e) => setFineTuneNotes(e.target.value)}
            placeholder={`Optional note for ${effectiveModel} Iter #${nextIterationNumber} (e.g. DPO trained on split-brain lease fences & Policy Threshold blast radius)`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap">
            {modelIterations.length} recorded iteration{modelIterations.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* SECTION A: ITERATION PROGRESSION CHARTS & POSITIVE/NEGATIVE % DELTA INSIGHTS */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              Successive Model Iterations Chart & Delta Insights ({effectiveModel})
            </h4>
            <p className="text-xs text-slate-400">
              Visualizes progression across fine-tuning iterations and pinpoints exact percentage improvements and regressions.
            </p>
          </div>

          {modelIterations.length >= 2 && baselineSnap && targetSnap && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <select
                aria-label="Baseline Iteration"
                value={baselineSnap.iterationNumber}
                onChange={(e) => setBaselineIterNum(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 cursor-pointer"
              >
                {modelIterations.map((m) => (
                  <option key={m.id} value={m.iterationNumber}>
                    Iter #{m.iterationNumber}
                  </option>
                ))}
              </select>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <select
                aria-label="Target Iteration"
                value={targetSnap.iterationNumber}
                onChange={(e) => setTargetIterNum(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-indigo-300 font-semibold cursor-pointer"
              >
                {modelIterations.map((m) => (
                  <option key={m.id} value={m.iterationNumber}>
                    Iter #{m.iterationNumber}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {modelIterations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <p>
              No full iterations recorded yet for <strong className="text-slate-200">{effectiveModel}</strong>.
            </p>
            <p className="text-slate-500">
              Click <strong className="text-indigo-400">Run Next Full Iteration (#1)</strong> above or submit turns in the Agent Test Bridge.
            </p>
          </div>
        ) : (
          <>
            {/* CHART 1: Multi-Iteration Trajectory Grouped Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Multi-Iteration Trajectory Across Fine-Tunes
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    Composite · Functional · Resilience · Cohesion
                  </span>
                </div>

                <div className="space-y-3">
                  {modelIterations.map((snap) => {
                    const s = snap.scorecard;
                    return (
                      <div
                        key={snap.id}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-slate-100">
                            {snap.label}
                          </span>
                          <span className="text-indigo-300 font-bold tabular-nums">
                            Composite: {s.overallScore}/100 ({snap.timestamp})
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono tabular-nums">
                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>Func</span>
                              <span className="text-emerald-400 font-semibold">{s.functionalCorrectness}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${s.functionalCorrectness}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>Resil</span>
                              <span className="text-amber-400 font-semibold">{s.reliabilityAndResilience}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${s.reliabilityAndResilience}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>Sec</span>
                              <span className="text-sky-400 font-semibold">{s.security}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full"
                                style={{ width: `${s.security}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>Fail Risk</span>
                              <span className="text-rose-400 font-semibold">{s.hiddenConcurrencyFailureRate}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${s.hiddenConcurrencyFailureRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHART 2: Dimension-by-Dimension % Improvement / Degradation Bar Chart */}
              <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Dimension Delta Chart (Iter #{comparison?.baselineIteration ?? 1} vs Iter #{comparison?.targetIteration ?? 1})
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    + Improved / - Degraded (%)
                  </span>
                </div>

                {!comparison ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Run a second full iteration for <strong className="text-slate-200">{effectiveModel}</strong> to generate % improvement &amp; degradation charts.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[270px] overflow-y-auto pr-1">
                    {comparison.allMetrics.map((metric) => {
                      const isPositive = metric.status === 'improved';
                      const isNegative = metric.status === 'degraded';
                      const clampedWidth =
                        metric.percentageChange === 0
                          ? 0
                          : Math.min(100, Math.max(12, Math.abs(metric.percentageChange) * 4));

                      return (
                        <div key={metric.dimensionKey} className="space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 truncate max-w-[200px]">
                              {metric.dimensionLabel}
                            </span>
                            <span
                              className={`font-semibold tabular-nums ${
                                isPositive
                                  ? 'text-emerald-400'
                                  : isNegative
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isPositive ? '+' : ''}
                              {metric.percentageChange}% ({metric.previousValue}
                              {metric.unit} &rarr; {metric.currentValue}
                              {metric.unit})
                            </span>
                          </div>
                          <div className="h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden flex items-center">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isPositive
                                  ? 'bg-emerald-500'
                                  : isNegative
                                  ? 'bg-rose-500'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${clampedWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DEDICATED INSIGHTS PANEL: Positive Improvements vs Negative Degradations */}
            {comparison && (
              <div className="border-t border-slate-800/80 pt-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs">
                  <span className="text-slate-200 font-medium">{comparison.executiveSummary}</span>
                  <span
                    className={`font-mono font-bold tabular-nums whitespace-nowrap ${
                      comparison.overallDeltaPoints > 0
                        ? 'text-emerald-400'
                        : comparison.overallDeltaPoints < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    Net Overall: {comparison.overallPercentageChange > 0 ? '+' : ''}
                    {comparison.overallPercentageChange}% ({comparison.overallDeltaPoints > 0 ? '+' : ''}
                    {comparison.overallDeltaPoints} pts)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Positive Improvements Column */}
                  <div className="bg-emerald-950/15 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-emerald-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Positive Improvements After Fine-Tuning
                      </span>
                      <span className="font-mono text-[11px] tabular-nums">
                        {comparison.improvements.length} gain{comparison.improvements.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {comparison.improvements.length === 0 ? (
                      <p className="text-[11px] text-slate-400">
                        No dimensional improvements detected between these iterations.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 font-mono text-[11px] text-emerald-200">
                        {comparison.improvements.map((m) => (
                          <li key={m.dimensionKey} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{m.insightStatement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Negative Degradations Column */}
                  <div className="bg-rose-950/15 border border-rose-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-rose-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                        Negative Regressions / Deprecations
                      </span>
                      <span className="font-mono text-[11px] tabular-nums">
                        {comparison.degradations.length} regression{comparison.degradations.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {comparison.degradations.length === 0 ? (
                      <p className="text-[11px] text-emerald-300/90 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        Zero negative regressions across all tracked engineering dimensions.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 font-mono text-[11px] text-rose-200">
                        {comparison.degradations.map((m) => (
                          <li key={m.dimensionKey} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span>{m.insightStatement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SECTION B: PER-TEST DETAILED SUMMARY & "WHY 8 OR 9 INSTEAD OF 10" GAP DIAGNOSTICS */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              Per-Test Detailed Audit: Prompt &amp; Response Summaries + Exact Gap Analysis
            </h4>
            <p className="text-xs text-slate-400">
              Concise digest of every generated prompt, agent reply, positives, negatives, and in very few words where the model lacked (e.g. why 8 or 9 instead of 10).
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setSelectedIterFilter('all')}
              className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
                selectedIterFilter === 'all'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Iterations
            </button>
            {modelIterations.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedIterFilter(m.iterationNumber)}
                className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
                  selectedIterFilter === m.iterationNumber
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iter #{m.iterationNumber}
              </button>
            ))}
          </div>
        </div>

        {auditRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Submit an evaluation turn in the Agent Test Bridge or run an iteration to inspect per-test audit diagnostics.
          </div>
        ) : (
          <div className="space-y-3">
            {auditRecords.map((audit) => {
              const isExpanded = Boolean(expandedAuditIds[audit.id]);
              const scoreColor =
                audit.scoreOutOf10 >= 9
                  ? 'text-emerald-400'
                  : audit.scoreOutOf10 >= 7.5
                  ? 'text-amber-300'
                  : 'text-rose-400';

              return (
                <article
                  key={audit.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs"
                >
                  {/* Top Metadata & 10-Point Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center flex-wrap gap-2 text-slate-200">
                      <span className="font-mono font-bold text-indigo-300">
                        Test #{audit.testNumber}
                      </span>
                      <span className="text-slate-500">&middot;</span>
                      <span className="font-mono text-slate-300">
                        Iteration #{audit.iterationNumber}
                      </span>
                      <span className="text-slate-500">&middot;</span>
                      <span className="font-semibold text-slate-100">{audit.scenarioTitle}</span>
                      <span className="text-slate-500">&middot;</span>
                      <span className="font-mono text-slate-400">{audit.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className={`text-sm font-bold ${scoreColor}`}>
                        {audit.scoreOutOf10.toFixed(1)} / 10
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({audit.overallScore}/100)
                      </span>
                      {(audit.fullGeneratedPrompt || audit.fullAgentResponse) && (
                        <button
                          type="button"
                          onClick={() => toggleExpandAudit(audit.id)}
                          className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>{isExpanded ? 'Hide Full Text' : 'Full Prompt & Reply'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prompt Summary & Agent Response Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-1">
                      <span className="text-[11px] font-semibold text-indigo-300 block">
                        Prompt Sent to Agent (Summary):
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {audit.generatedPromptSummary}
                      </p>
                      {isExpanded && audit.fullGeneratedPrompt && (
                        <pre className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {audit.fullGeneratedPrompt}
                        </pre>
                      )}
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-1">
                      <span className="text-[11px] font-semibold text-cyan-300 block">
                        Agent Response (Summary):
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {audit.agentResponseSummary}
                      </p>
                      {isExpanded && audit.fullAgentResponse && (
                        <pre className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {audit.fullAgentResponse}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Positives & Negatives Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-400 block">
                        Positives (What Worked):
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {audit.positives.map((pos, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{pos}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-rose-400 block">
                        Negatives (Where Model Lacked):
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {audit.negatives.map((neg, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span>{neg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Concise "Why 8 or 9 instead of 10" Micro-Verdict */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-mono text-amber-200/95">
                    <strong className="text-amber-400 mr-1.5">Gap Verdict:</strong>
                    {audit.whyNotTenVerdict}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
