import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeModelIdentifier,
  summarizeLongExchange,
  buildTestAuditRecord,
  compareModelIterations,
  createSeedIterationSnapshots,
} from './iteration-analyzer';
import { EvaluationEngine } from './scoring';
import { ModelIterationSnapshot } from '../types';

test('normalizeModelIdentifier safely normalizes model names without storing API keys', () => {
  assert.equal(normalizeModelIdentifier('  Devin   Pro v2.4  '), 'Devin Pro v2.4');
  assert.equal(normalizeModelIdentifier(''), 'Evaluated Coding Agent');
});

test('summarizeLongExchange truncates cleanly at word boundary', () => {
  const longText = 'word '.repeat(80);
  const summary = summarizeLongExchange(longText, 120);
  assert.ok(summary.length <= 125);
  assert.ok(summary.endsWith('...'));
});

test('buildTestAuditRecord creates concise positives, negatives, and 8/9 vs 10 diagnostic verdict', () => {
  const scorecard = EvaluationEngine.calculateScorecard({
    functionalPassCount: 9,
    functionalTotalCount: 10,
    concurrencyPassCount: 8,
    concurrencyTotalCount: 10,
    securityPassCount: 9,
    securityTotalCount: 10,
    collateralModificationsCount: 0,
    repeatedErrorRoundsCount: 0,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 95,
    latencyOverheadMs: 14,
  });

  const record = buildTestAuditRecord({
    testNumber: 2,
    iterationNumber: 1,
    modelName: 'MyFineTunedModel-v1',
    scenarioId: 'scenario-1',
    scenarioTitle: 'Raft Partition Recovery',
    generatedPrompt: 'Fix stale reads during leader handoff under 512MB RAM.',
    agentResponse: 'Patched lease_manager.ts with quorum barrier check.',
    scorecard,
    errorsDetected: ['Missed split-brain clock skew guard'],
    invariantsViolated: [],
    collateralViolations: 0,
  });

  assert.equal(record.modelName, 'MyFineTunedModel-v1');
  assert.ok(record.positives.length >= 1);
  assert.ok(record.negatives.length >= 1);
  assert.ok(record.whyNotTenVerdict.includes('instead of 10'));
});

test('compareModelIterations detects both positive improvements and negative regressions accurately', () => {
  const baseScorecard = EvaluationEngine.calculateScorecard({
    functionalPassCount: 8,
    functionalTotalCount: 10,
    concurrencyPassCount: 6,
    concurrencyTotalCount: 10,
    securityPassCount: 9, // High security in baseline
    securityTotalCount: 10,
    collateralModificationsCount: 1,
    repeatedErrorRoundsCount: 0,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 80,
    latencyOverheadMs: 25,
  });

  const nextScorecard = EvaluationEngine.calculateScorecard({
    functionalPassCount: 9, // Improved
    functionalTotalCount: 10,
    concurrencyPassCount: 9, // Improved
    concurrencyTotalCount: 10,
    securityPassCount: 7, // Regressed!
    securityTotalCount: 10,
    collateralModificationsCount: 0, // Improved
    repeatedErrorRoundsCount: 0,
    resurrectedBugsCount: 0,
    refactorPreservationRate: 92,
    latencyOverheadMs: 15,
  });

  const baseline: ModelIterationSnapshot = {
    id: 'iter-1',
    modelName: 'CustomModel-Alpha',
    iterationNumber: 1,
    label: 'Iteration #1',
    timestamp: '10:00:00',
    scenarioId: 'sc-1',
    scenarioTitle: 'Scenario 1',
    scorecard: baseScorecard,
    testAudits: [],
  };

  const target: ModelIterationSnapshot = {
    id: 'iter-2',
    modelName: 'CustomModel-Alpha',
    iterationNumber: 2,
    label: 'Iteration #2',
    timestamp: '11:00:00',
    scenarioId: 'sc-1',
    scenarioTitle: 'Scenario 1',
    scorecard: nextScorecard,
    testAudits: [],
  };

  const diff = compareModelIterations(baseline, target);

  assert.ok(diff.improvements.some((m) => m.dimensionKey === 'functionalCorrectness' && m.insightStatement.includes('Improved in Functional Correctness by +')));
  assert.ok(diff.improvements.some((m) => m.dimensionKey === 'hiddenConcurrencyFailureRate' && m.insightStatement.includes('Improved in Hidden Concurrency Failure Rate by +')));
  assert.ok(diff.degradations.some((m) => m.dimensionKey === 'security' && m.insightStatement.includes('Degraded in Security Architecture by -')));
  assert.ok(diff.overallPercentageChange > 0);
});

test('createSeedIterationSnapshots returns chronological baseline and fine-tuned iterations with zero API keys', () => {
  const seeds = createSeedIterationSnapshots('Devin Pro v2.4', 'scenario-1', 'Distributed Consensus');
  assert.equal(seeds.length, 2);
  assert.equal(seeds[0].iterationNumber, 1);
  assert.equal(seeds[1].iterationNumber, 2);
  assert.equal(JSON.stringify(seeds).includes('sk-'), false);
});
