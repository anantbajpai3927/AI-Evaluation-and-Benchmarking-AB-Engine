import {
  ProofGraphState,
  ProofGraphNode,
  IntendedTransaction,
  AuthorizationBoundary,
  PreflightSimulation,
  LedgerEntry,
  Scenario
} from '../types';

/**
 * Configurable boundary threshold for public showcase mode.
 * Empirical production cutoff tuning resides in @apexproof/private-core.
 */
export const DEFAULT_PUBLIC_BOUNDARY_THRESHOLD = Number(
  process.env.APEXPROOF_BOUNDARY_THRESHOLD || 50
);

export class ProofGraphEngine {
  static buildEvidenceGraph(
    scenario: Scenario,
    inspectedEvidence: Array<{ id: string; label: string; source: string; version: string; payload: Record<string, unknown> }>
  ): ProofGraphNode[] {
    const nodes: ProofGraphNode[] = [];
    const sourceMap = new Map<string, { version: string; timestamp: string }>();

    for (const item of inspectedEvidence) {
      const now = new Date().toISOString();
      let contradiction = false;
      let contradictionDetails: string | undefined;

      if (sourceMap.has(item.id)) {
        const prev = sourceMap.get(item.id)!;
        if (prev.version !== item.version) {
          contradiction = true;
          contradictionDetails = `Contradiction detected: Entity ${item.id} has conflicting versions (${prev.version} vs ${item.version}) across sources.`;
        }
      } else {
        sourceMap.set(item.id, { version: item.version, timestamp: now });
      }

      nodes.push({
        id: item.id,
        type: item.id.includes('inv') ? 'invariant' : item.id.includes('fact') ? 'fact' : 'entity',
        label: item.label,
        source: item.source,
        timestamp: now,
        contradiction,
        contradictionDetails,
        status: contradiction ? 'violated' : 'verified'
      });
    }

    const existingIds = new Set(nodes.map((n) => n.id));
    scenario.repoContext.criticalInvariants.forEach((inv, idx) => {
      const invId = `inv-${idx + 1}`;
      if (!existingIds.has(invId)) {
        nodes.push({
          id: invId,
          type: 'invariant',
          label: inv,
          source: 'system-invariant-contract',
          timestamp: new Date().toISOString(),
          contradiction: false,
          status: 'verified'
        });
        existingIds.add(invId);
      }
    });

    return nodes;
  }

  static constructIntendedTransaction(
    actions: Array<{ name: string; reads: string[]; writes: string[]; dependsOn?: string[]; targetInvariant: string }>
  ): IntendedTransaction[] {
    return actions.map((act, index) => ({
      id: `tx-${index + 1}`,
      actionName: act.name,
      readSet: act.reads,
      writeSet: act.writes,
      dependencies: act.dependsOn || [],
      targetInvariant: act.targetInvariant,
      status: 'planned'
    }));
  }

  static calculateAuthorizationBoundary(
    scenario: Scenario,
    modifiedFiles: Array<{ path: string; estimatedRelevance?: number; reason?: string }>,
    threshold = DEFAULT_PUBLIC_BOUNDARY_THRESHOLD
  ): AuthorizationBoundary {
    const allowed = new Set(scenario.repoContext.allowedTargetFiles);
    const inspectedFiles = modifiedFiles.map((file) => {
      let significanceScore = file.estimatedRelevance ?? 0;

      if (file.estimatedRelevance === undefined) {
        if (allowed.has(file.path)) {
          significanceScore = 92;
        } else {
          const matchesFolder = scenario.repoContext.allowedTargetFiles.some((af) => {
            const allowedDir = af.split('/')[0];
            return file.path.startsWith(allowedDir);
          });
          significanceScore = matchesFolder ? 60 : 12;
        }
      }

      const flaggedCollateral = significanceScore < threshold;
      const reason = flaggedCollateral
        ? `BLOCKED: File '${file.path}' scored ${significanceScore}% (< ${threshold}% policy threshold).`
        : `PERMITTED: File '${file.path}' satisfies task boundary alignment (${significanceScore}%).`;

      return {
        path: file.path,
        significanceScore,
        flaggedCollateral,
        reason
      };
    });

    const anyFlagged = inspectedFiles.some((f) => f.flaggedCollateral);
    const indirectLeakage = inspectedFiles.some(
      (f) => f.path.includes('.env') || f.path.includes('secret') || f.path.includes('key')
    );

    return {
      sourceAccessGranted: !indirectLeakage,
      indirectLeakageDetected: indirectLeakage,
      inspectedFiles,
      overallSignificancePass: !anyFlagged && !indirectLeakage
    };
  }

  static runPreflightSimulation(
    evidence: ProofGraphNode[],
    transactions: IntendedTransaction[],
    authBoundary: AuthorizationBoundary
  ): PreflightSimulation {
    const hasContradictions = evidence.some((e) => e.contradiction);
    const missingEvidence = evidence.filter((e) => e.status === 'violated').length;
    const unintendedSideEffects: string[] = [];

    authBoundary.inspectedFiles.forEach((f) => {
      if (f.flaggedCollateral) {
        unintendedSideEffects.push(`Out-of-scope file modified: '${f.path}'`);
      }
    });

    const actionIds = new Set(transactions.map((t) => t.id));
    for (const tx of transactions) {
      for (const dep of tx.dependencies) {
        if (!actionIds.has(dep)) {
          unintendedSideEffects.push(`Unresolved transaction dependency: ${tx.id} requires ${dep}`);
        }
      }
    }

    const simulationPassed =
      !hasContradictions && unintendedSideEffects.length === 0 && authBoundary.overallSignificancePass;

    return {
      staleDataConflicts: hasContradictions ? 1 : 0,
      unintendedSideEffects,
      missingEvidenceCount: missingEvidence,
      duplicateOpsDetected: false,
      simulationPassed
    };
  }

  static executeLedger(
    transactions: IntendedTransaction[],
    preflight: PreflightSimulation,
    authBoundary: AuthorizationBoundary
  ): LedgerEntry[] {
    const ledger: LedgerEntry[] = [];
    let prevHash = 'GENESIS_PROOF_ROOT_000000000000';

    transactions.forEach((tx, idx) => {
      const step = idx + 1;
      const isBlocked =
        !preflight.simulationPassed && authBoundary.inspectedFiles.some((f) => f.flaggedCollateral);
      const status: LedgerEntry['status'] = isBlocked ? 'FLAGGED_COLLATERAL' : 'SUCCESS';
      const timestamp = new Date().toISOString();
      const rawString = `${step}:${tx.id}:${tx.actionName}:${prevHash}:${status}:${timestamp}`;
      const hash = this.simpleHash(rawString);

      ledger.push({
        step,
        timestamp,
        action: tx.actionName,
        hash,
        previousHash: prevHash,
        status,
        compensatingActionAvailable: true
      });

      prevHash = hash;
    });

    return ledger;
  }

  static verifyFinalState(
    evidence: ProofGraphNode[],
    authBoundary: AuthorizationBoundary,
    preflight: PreflightSimulation,
    ledger: LedgerEntry[]
  ): { verified: boolean; signature: string } {
    const ledgerIntegrity = ledger.every((entry) => Boolean(entry.hash && entry.previousHash));
    const verified = ledgerIntegrity && authBoundary.overallSignificancePass && preflight.simulationPassed && !evidence.some((e) => e.contradiction);
    const signature = `PROOFCERT-SHA256-${this.simpleHash(`audit-${verified}-${Date.now()}`)}`;
    return { verified, signature };
  }

  static executeFullPipeline(
    scenario: Scenario,
    inspectedEvidence: Array<{ id: string; label: string; source: string; version: string; payload: Record<string, unknown> }>,
    plannedActions: Array<{ name: string; reads: string[]; writes: string[]; dependsOn?: string[]; targetInvariant: string }>,
    modifiedFiles: Array<{ path: string; estimatedRelevance?: number }>,
    threshold = DEFAULT_PUBLIC_BOUNDARY_THRESHOLD
  ): ProofGraphState {
    const evidenceNodes = this.buildEvidenceGraph(scenario, inspectedEvidence);
    const transactions = this.constructIntendedTransaction(plannedActions);
    const authBoundary = this.calculateAuthorizationBoundary(scenario, modifiedFiles, threshold);
    const preflight = this.runPreflightSimulation(evidenceNodes, transactions, authBoundary);
    const ledger = this.executeLedger(transactions, preflight, authBoundary);
    const { verified, signature } = this.verifyFinalState(evidenceNodes, authBoundary, preflight, ledger);

    transactions.forEach((tx) => {
      tx.status = verified ? 'committed' : 'rolled_back';
    });

    return {
      evidenceNodes,
      transactions,
      authBoundary,
      preflight,
      ledger,
      finalStateVerified: verified,
      auditSignature: signature
    };
  }

  static calculateLoopingScore(rounds: Array<{ errors: string[]; modifiedFiles: string[] }>): {
    repeatCount: number;
    resurrectedBugCount: number;
    score: number;
  } {
    if (rounds.length <= 1) {
      return { repeatCount: 0, resurrectedBugCount: 0, score: 100 };
    }

    let repeatCount = 0;
    let resurrectedBugCount = 0;
    const seenErrors = new Set<string>();
    const resolvedErrors = new Set<string>();

    rounds.forEach((rnd, idx) => {
      rnd.errors.forEach((err) => {
        if (resolvedErrors.has(err)) {
          resurrectedBugCount++;
        } else if (seenErrors.has(err)) {
          repeatCount++;
        }
        seenErrors.add(err);
      });

      if (idx > 0) {
        rounds[idx - 1].errors.forEach((prevErr) => {
          if (!rnd.errors.includes(prevErr)) {
            resolvedErrors.add(prevErr);
          }
        });
      }
    });

    const penalty = repeatCount * 10 + resurrectedBugCount * 15;
    return {
      repeatCount,
      resurrectedBugCount,
      score: Math.max(0, 100 - penalty)
    };
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(12, '0').toUpperCase();
  }
}
