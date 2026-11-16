'use client';

import React, { useState } from 'react';
import {
  Shield,
  Cpu,
  RefreshCw,
  FileText,
  Terminal,
  Layers,
  BarChart3,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TestedAgentConfig } from '@/lib/types';
import { TestedAgentConfigCard } from './TestedAgentConfigCard';

export type ActiveAppView = 'bridge' | 'proofgraph' | 'benchmarks' | 'safety';

interface HeaderProps {
  currentScenarioTitle: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onReset: () => void;
  onExportAudit: () => void;
  onDownloadCurrentDossier: () => void;
  agentConfig: TestedAgentConfig;
  onAgentConfigChange: (config: TestedAgentConfig) => void;
  auditSignature: string;
  activeView: ActiveAppView;
  onViewChange: (view: ActiveAppView) => void;
  trackedIterationCount?: number;
  onRunNextIteration?: (overrideConfig?: TestedAgentConfig) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenarioTitle,
  selectedModel,
  onModelChange,
  onReset,
  onExportAudit,
  onDownloadCurrentDossier,
  agentConfig,
  onAgentConfigChange,
  auditSignature,
  activeView,
  onViewChange,
  trackedIterationCount = 0,
  onRunNextIteration
}) => {
  const [showAgentModal, setShowAgentModal] = useState(false);

  const navItems = [
    { id: 'bridge' as const, label: 'Agent Bridge', icon: Terminal, hint: 'Section 1' },
    { id: 'proofgraph' as const, label: 'ProofGraph', icon: Layers, hint: 'Section 2' },
    { id: 'benchmarks' as const, label: 'Benchmark Analytics', icon: BarChart3, hint: 'Section 3' },
    { id: 'safety' as const, label: 'Safety Planner', icon: ShieldCheck, hint: 'AI Agent' }
  ];

  return (
    <>
      <header className="border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-5 py-2.5 shadow-lg shadow-black/30">
        <div className="flex flex-col gap-2 max-w-[1720px] mx-auto w-full">
          {/* Top Row: Brand, Navigation View Switcher, Tested Agent Badge, and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Logo & Active Scenario */}
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">ApexProof</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                    Marathon SWE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[220px] xl:max-w-[280px] hidden sm:block">
                  Active: <span className="text-slate-200 font-medium">{currentScenarioTitle}</span>
                </p>
              </div>
            </div>

            {/* Top Page View Switcher Buttons (Dedicated Page per Section) */}
            <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto scrollbar-none shrink-0 max-w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Global Actions: Tested Agent Selector, Model Selector, Export & Reset */}
            <div className="flex items-center flex-wrap gap-2 text-xs shrink-0">
              {/* Tested Agent Quick Configuration Button */}
              <button
                onClick={() => setShowAgentModal(true)}
                className="px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-mono rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Configure the name, endpoint, and token of the AI agent being benchmarked"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate max-w-[120px] font-medium">
                  {agentConfig.name || 'Set Agent'}
                </span>
                <SlidersHorizontal className="w-3 h-3 text-slate-400 ml-0.5 flex-shrink-0" />
              </button>

              {/* Model Selector with Auto-Cascade */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
                <Cpu className="w-3.5 h-3.5 text-slate-400 ml-2 flex-shrink-0" />
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="bg-transparent text-slate-200 py-1 pl-1.5 pr-2 font-mono text-[11px] focus:outline-none cursor-pointer max-w-[155px] truncate"
                >
                  <option value="auto-cascade" className="bg-slate-900">Auto-Cascade (Gemini 3.8 Flash → Flash Latest → 3.1 Lite)</option>
                  <option value="gemini-3.8-flash" className="bg-slate-900">Gemini 3.8 Flash (Primary Marathon SWE)</option>
                  <option value="gemini-flash-latest" className="bg-slate-900">Gemini Flash Latest (High Throughput)</option>
                  <option value="gemini-3.1-flash-lite" className="bg-slate-900">Gemini 3.1 Flash-Lite (Quota Saver)</option>
                  <option value="manual-interactive-agent" className="bg-slate-900">Interactive Bridge (Manual / Proxy)</option>
                </select>
              </div>

              {/* Download Human Readable Dossier for current section */}
              <button
                onClick={onDownloadCurrentDossier}
                className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Download clean, structured human-readable dossier (.md)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="hidden md:inline">Download Dossier</span>
              </button>

              {/* Reset Scenario Session */}
              <button
                onClick={onReset}
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                title="Reset scenario session"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tested Agent Configuration Modal — rendered outside backdrop-blur <header> so fixed inset-0 centers against full viewport */}
      {showAgentModal && (
        <TestedAgentConfigCard
          config={agentConfig}
          onChange={(newCfg) => {
            onAgentConfigChange(newCfg);
          }}
          isModal={true}
          onClose={() => setShowAgentModal(false)}
          trackedIterationCount={trackedIterationCount}
          onRunNextIteration={onRunNextIteration ? (cfg) => onRunNextIteration(cfg) : undefined}
        />
      )}
    </>
  );
};
