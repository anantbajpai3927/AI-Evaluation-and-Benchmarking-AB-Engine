import test from 'node:test';
import assert from 'node:assert/strict';
import { ProofGraphEngine, DEFAULT_PUBLIC_BOUNDARY_THRESHOLD } from './proofgraph';
import { EvaluationEngine } from './scoring';
import { FLAGSHIP_SCENARIOS } from '../data/scenarios';

test('ProofGraph enforces configurable significance boundary policy', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const boundary = ProofGraphEngine.calculateAuthorizationBoundary(scenario, [
    { path: 'styles/unrelated.css', estimatedRelevance: 15 },
    { path: scenario.repoContext.allowedTargetFiles[0], estimatedRelevance: 90 },
  ], DEFAULT_PUBLIC_BOUNDARY_THRESHOLD);

  assert.equal(boundary.inspectedFiles[0].flaggedCollateral, true);
  assert.equal(boundary.inspectedFiles[1].flaggedCollateral, false);
  assert.equal(boundary.overallSignificancePass, false);
});

test('ProofGraph detects evidence graph contradictions across sources', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const graph = ProofGraphEngine.buildEvidenceGraph(scenario, [
    { id: 'fact-1', label: 'Node A State', source: 'Replica 1', version: 'v1', payload: {} },
    { id: 'fact-1', label: 'Node A State', source: 'Replica 2', version: 'v2', payload: {} },
  ]);

  const conflict = graph.find((n) => n.contradiction);
  assert.ok(conflict, 'Should flag version mismatch across sources');
});

test('Looping score penalizes repeated errors and resurrected bugs', () => {
  const cleanScore = EvaluationEngine.calculateScorecard({
    functionalPassCount: 10, functionalTotalCount: 10,
    concurrencyPassCount: 10, concurrencyTotalCount: 10,
    securityPassCount: 10, securityTotalCount: 10,
    collateralModificationsCount: 0,
    repeatedErrorRoundsCount: 0,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 100,
    latencyOverheadMs: 10,
  });
  const regressedScore = EvaluationEngine.calculateScorecard({
    functionalPassCount: 10, functionalTotalCount: 10,
    concurrencyPassCount: 10, concurrencyTotalCount: 10,
    securityPassCount: 10, securityTotalCount: 10,
    collateralModificationsCount: 0,
    repeatedErrorRoundsCount: 2,
    resurrectedBugsCount: 1,
    refactorPreservationRate: 100,
    latencyOverheadMs: 10,
  });

  assert.equal(cleanScore.loopingScore.score, 100);
  assert.ok(regressedScore.loopingScore.score < cleanScore.loopingScore.score);
});

test('Full pipeline generates hash-chained ledger and signed audit ID', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const state = ProofGraphEngine.executeFullPipeline(
    scenario,
    [],
    [{ name: 'VerifyLease', reads: scenario.repoContext.allowedTargetFiles, writes: [scenario.repoContext.allowedTargetFiles[0]], targetInvariant: scenario.repoContext.criticalInvariants[0] }],
    [{ path: scenario.repoContext.allowedTargetFiles[0], estimatedRelevance: 95 }]
  );

  assert.equal(state.finalStateVerified, true);
  assert.ok(state.auditSignature.startsWith('PROOFCERT-SHA256-'));
  assert.ok(state.ledger.length >= 1);
});
