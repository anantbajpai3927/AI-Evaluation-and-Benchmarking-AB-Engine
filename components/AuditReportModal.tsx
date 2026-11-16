'use client';

import React, { useState } from 'react';
import { ProofGraphState, EvaluationScorecard, Scenario } from '@/lib/types';
import { X, Download, Copy, Check, ShieldCheck, FileText } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  scorecard: EvaluationScorecard;
  pipelineState: ProofGraphState;
  selectedModel: string;
  testedAgentName?: string;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  scorecard,
  pipelineState,
  selectedModel,
  testedAgentName = 'Devin Pro v2.4'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const auditReportData = {
    protocol: 'ApexProof Marathon Evaluation Protocol v2.4',
    certificateId: pipelineState.auditSignature,
    evaluatedModel: selectedModel,
    evaluatedAgent: testedAgentName,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      category: scenario.category,
      repo: scenario.repoContext.name,
      loc: scenario.repoContext.loc
    },
    executionTelemetry: scorecard.executionTelemetry,
    messySWEResilienceScore: scorecard.messySWEResilienceScore,
    proofGraphIntegrity: {
      evidenceNodesCount: pipelineState.evidenceNodes.length,
      contradictionsDetected: pipelineState.evidenceNodes.filter(n => n.contradiction).length,
      overallSignificancePass: pipelineState.authBoundary.overallSignificancePass,
      inspectedFiles: pipelineState.authBoundary.inspectedFiles,
      finalStateVerified: pipelineState.finalStateVerified
    },
    scorecard: {
      overallScore: `${scorecard.overallScore}/100`,
      functionalPassRate: `${scorecard.functionalPassRate}%`,
      hiddenConcurrencyFailureRate: `${scorecard.hiddenConcurrencyFailureRate}%`,
      loopingScore: `${scorecard.loopingScore.score}/100 (${scorecard.loopingScore.repeatCount} repeated, ${scorecard.loopingScore.resurrectedBugCount} resurrected)`,
      collateralDamageViolations: scorecard.collateralDamageViolations,
      dimensions: {
        functionalCorrectness: `${scorecard.functionalCorrectness}% (25% weight)`,
        architecturalIntegrity: `${scorecard.architecturalIntegrity}% (15% weight)`,
        security: `${scorecard.security}% (15% weight)`,
        reliabilityAndResilience: `${scorecard.reliabilityAndResilience}% (15% weight)`,
        longHorizonCompletion: `${scorecard.longHorizonCompletion}% (10% weight)`,
        performanceAndEfficiency: `${scorecard.performanceAndEfficiency}% (10% weight)`,
        regressionAndCollateral: `${scorecard.regressionAndCollateral}% (10% weight)`
      }
    },
    hashChainedLedger: pipelineState.ledger,
    generatedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(auditReportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexproof-audit-${pipelineState.auditSignature}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Independent Audit Certificate & Proof Ledger
              </h3>
              <span className="text-[11px] font-mono text-indigo-300">
                ID: {pipelineState.auditSignature}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] block">Overall Score</span>
              <span className="text-base font-bold text-emerald-400">{scorecard.overallScore}/100</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Functional Pass</span>
              <span className="text-base font-bold text-slate-200">{scorecard.functionalPassRate}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Concurrency Fail</span>
              <span className="text-base font-bold text-rose-400">{scorecard.hiddenConcurrencyFailureRate}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Proof Status</span>
              <span className="text-base font-bold text-indigo-300">
                {pipelineState.finalStateVerified ? 'VERIFIED' : 'FAILED'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block mb-1">Raw Signed Audit Certificate (JSON):</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-[300px]">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Cryptographically hash-chained & tamper-evident
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
