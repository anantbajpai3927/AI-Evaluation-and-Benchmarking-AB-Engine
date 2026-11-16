'use client';

import React, { useState } from 'react';
import { TestedAgentConfig } from '@/lib/types';
import {
  Bot,
  KeyRound,
  Globe,
  Sliders,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
  Zap,
  Save,
  X,
  Play
} from 'lucide-react';

interface TestedAgentConfigCardProps {
  config: TestedAgentConfig;
  onChange: (updated: TestedAgentConfig) => void;
  isModal?: boolean;
  onClose?: () => void;
  trackedIterationCount?: number;
  onRunNextIteration?: (updatedConfig: TestedAgentConfig) => void;
}

export const TestedAgentConfigCard: React.FC<TestedAgentConfigCardProps> = ({
  config,
  onChange,
  isModal = false,
  onClose,
  trackedIterationCount = 0,
  onRunNextIteration,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [tempConfig, setTempConfig] = useState<TestedAgentConfig>(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onChange(tempConfig);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (isModal && onClose) onClose();
    }, 800);
  };

  const handleSaveAndRunIteration = () => {
    onChange(tempConfig);
    if (onRunNextIteration) {
      onRunNextIteration(tempConfig);
    }
    if (isModal && onClose) onClose();
  };

  const content = (
    <div className="flex flex-col gap-3.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Tested AI Agent Gateway & Identity
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                Active in Evals
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure the exact agent name, API endpoint, and authentication token being benchmarked.
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Agent Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            Tested Agent Name:
          </label>
          <input
            type="text"
            value={tempConfig.name}
            onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
            placeholder="e.g. Devin Pro v2.4, Cursor SWE Agent, My Custom Agent..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[10px] text-slate-500">
            Iterations &amp; fine-tuning deltas are identified strictly by this Model Name (API keys are never saved).
          </span>
        </div>

        {/* Framework Archetype */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Agent Framework Archetype:
          </label>
          <select
            value={tempConfig.frameworkArchetype}
            onChange={(e) =>
              setTempConfig({
                ...tempConfig,
                frameworkArchetype: e.target.value as TestedAgentConfig['frameworkArchetype']
              })
            }
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="autonomous_react">Autonomous ReAct Loop (Multi-Turn Exploration)</option>
            <option value="plan_and_solve">Plan-and-Solve (High-Level Architecture First)</option>
            <option value="direct_diff">Direct Diff Synthesizer (Single/Multi-File Editor)</option>
            <option value="custom_webhook">Custom Webhook / REST Pipeline</option>
          </select>
          <span className="text-[10px] text-slate-500">
            Determines baseline comparison curves in the empirical benchmark matrix.
          </span>
        </div>

        {/* API Endpoint / Webhook URL */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Agent Endpoint / Proxy URL (Optional):
          </label>
          <input
            type="text"
            value={tempConfig.endpointUrl || ''}
            onChange={(e) => setTempConfig({ ...tempConfig, endpointUrl: e.target.value })}
            placeholder="e.g. http://localhost:8000/solve or https://agent.myorg.internal"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[10px] text-slate-500">
            For automated webhook dispatch or manual copy-paste bridge.
          </span>
        </div>

        {/* API Key / Token */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Agent API Key / Secret Token:
            </span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showKey ? 'Hide' : 'Reveal'}</span>
            </button>
          </label>
          <input
            type={showKey ? 'text' : 'password'}
            value={tempConfig.apiKey || ''}
            onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
            placeholder="e.g. sk-agent-secret-token..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[10px] text-slate-500">
            Kept strictly in transient session memory — never persisted or logged. Iterations track by Model Name only.
          </span>
        </div>
      </div>

      {/* Meticulously Integrated Custom Complex Prompt Feature */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
                Custom Injected Complex Scenario / Prompt
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  Separate Results Column
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Inject bespoke enterprise edge cases or proprietary prompts. Evaluated alongside repo invariants without degrading critical ProofGraph checks.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-300 self-start sm:self-auto">
            <input
              type="checkbox"
              checked={tempConfig.enableCustomPromptInEvals ?? Boolean(tempConfig.customEvaluationPrompt)}
              onChange={(e) => setTempConfig({ ...tempConfig, enableCustomPromptInEvals: e.target.checked })}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-cyan-300">Enable In Evals</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-1 space-y-1">
            <label className="text-[10px] font-medium text-slate-300 block">
              Custom Scenario Title:
            </label>
            <input
              type="text"
              value={tempConfig.customPromptTitle || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, customPromptTitle: e.target.value })}
              placeholder="e.g. Strict Idempotency Replay Storm"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-slate-300 block">
                Custom Complex Prompt / Requirements:
              </label>
              {tempConfig.customEvaluationPrompt && (
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...tempConfig, customEvaluationPrompt: '', customPromptTitle: '', enableCustomPromptInEvals: false })}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={tempConfig.customEvaluationPrompt || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, customEvaluationPrompt: e.target.value, enableCustomPromptInEvals: true })}
              placeholder="Define custom complex edge case, high-stress invariant, or specific requirements to test in your AI agent..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setTempConfig({
              ...tempConfig,
              customPromptTitle: '500-Thread Concurrent Replay Storm',
              customEvaluationPrompt: 'Simulate 500 parallel webhook retry calls with identical idempotency-key and payload. Verify zero duplicate ledger debits and exactly one database transaction commit.',
              enableCustomPromptInEvals: true
            })}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            Concurrency Idempotency
          </button>
          <button
            type="button"
            onClick={() => setTempConfig({
              ...tempConfig,
              customPromptTitle: 'Zero-Allocation Memory Ring Buffer',
              customEvaluationPrompt: 'Implement high-throughput message streaming strictly capped under 256MB heap. Do not allocate per-request buffers in the hot loop path.',
              enableCustomPromptInEvals: true
            })}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
          >
            Zero-Allocation Buffer
          </button>
          <button
            type="button"
            onClick={() => setTempConfig({
              ...tempConfig,
              customPromptTitle: 'Constant-Time Cryptographic HMAC Guard',
              customEvaluationPrompt: 'Audit token signature verification to use crypto.timingSafeEqual. Reject any loose string comparison that leaks execution timing under microsecond side-channel probes.',
              enableCustomPromptInEvals: true
            })}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
          >
            Constant-Time Auth
          </button>
        </div>
      </div>

      {/* Save Action & Next Full Iteration Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800">
        <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 font-mono">
          <span>
            Model Identity: <strong className="text-indigo-300">{tempConfig.name || 'Anonymous Agent'}</strong>
          </span>
          <span className="text-slate-600">&middot;</span>
          <span className="text-emerald-300 tabular-nums">
            {trackedIterationCount} iteration{trackedIterationCount === 1 ? '' : 's'} tracked
          </span>
          {tempConfig.enableCustomPromptInEvals && tempConfig.customPromptTitle && (
            <span className="text-cyan-300 font-sans text-[10px]">
              &middot; Injected: {tempConfig.customPromptTitle}
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onRunNextIteration && (
            <button
              type="button"
              onClick={handleSaveAndRunIteration}
              className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Run next full fine-tuning evaluation iteration tracked under this Model Name"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run Next Full Iteration (#{trackedIterationCount + 1})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Config Saved &amp; Synced</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl shadow-black/60 max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 shadow-inner">
      {content}
    </div>
  );
};
