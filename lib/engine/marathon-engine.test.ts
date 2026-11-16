import test from 'node:test';
import assert from 'node:assert/strict';
import { MarathonEngine } from './marathon-engine';
import { FLAGSHIP_SCENARIOS } from '../data/scenarios';

test('MarathonEngine flags out-of-scope file modifications against roadmap', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const audit = MarathonEngine.evaluateRoadmapDirection({
    agentCodeOrDiff: 'Modified helper function synchronously.',
    roadmap: scenario.futureArchitecturalRoadmap,
    modifiedFiles: ['public/unrelated_widget.css'],
  });

  assert.equal(audit.marathonGrade, 'HIGH_ABSURDITY_FAILURE');
  assert.ok(audit.identifiedFutureBlockers.length > 0);
});

test('MarathonEngine rewards decoupled interface boundaries aligned with roadmap', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const audit = MarathonEngine.evaluateRoadmapDirection({
    agentCodeOrDiff: 'export interface ReadBarrierAdapter { verify(): Promise<void>; }',
    roadmap: scenario.futureArchitecturalRoadmap,
    modifiedFiles: [scenario.repoContext.allowedTargetFiles[0]],
  });

  assert.equal(audit.marathonGrade, 'EXEMPLARY_FORESIGHT');
});

test('MarathonEngine tracks Feature Cohesion across successive mutation turns', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const cohesion = MarathonEngine.evaluateFeatureCohesion([
    { turnIndex: 1, mutation: scenario.successiveFeatureMutations[0], agentResponse: 'ok', filesModified: [], invariantsViolated: [] },
    { turnIndex: 2, mutation: scenario.successiveFeatureMutations[0], agentResponse: 'broke', filesModified: [], invariantsViolated: ['Lease invariant violated'] },
  ]);

  assert.ok(cohesion.cumulativeFeatureCohesionIndex < 100);
  assert.equal(cohesion.regressionCascades.length, 1);
});

test('MarathonEngine formats structured challenge prompt cleanly', () => {
  const scenario = FLAGSHIP_SCENARIOS[0];
  const formatted = MarathonEngine.formatNaturalSymptomChallenge({
    scenarioTitle: scenario.title,
    profession: scenario.userPersonaProfile.profession,
    symptomBrief: scenario.naturalLanguageSymptomBrief,
    constraints: scenario.realWorldConstraints,
    roadmap: scenario.futureArchitecturalRoadmap,
    mutation: scenario.successiveFeatureMutations[0]
  });

  assert.ok(formatted.includes('[REFERENCE CHALLENGE BRIEF]:'));
  assert.ok(formatted.includes('CONSTRAINTS:'));
});
