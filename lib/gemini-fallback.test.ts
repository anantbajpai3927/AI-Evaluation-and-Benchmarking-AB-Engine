import test from 'node:test';
import assert from 'node:assert/strict';
import { FREE_TIER_SWE_MODELS } from './gemini-fallback';

test('FREE_TIER_SWE_MODELS defines proper sequential downgrade hierarchy', () => {
  assert.equal(FREE_TIER_SWE_MODELS[0], 'gemini-3.8-flash');
  assert.equal(FREE_TIER_SWE_MODELS[1], 'gemini-flash-latest');
  assert.equal(FREE_TIER_SWE_MODELS[2], 'gemini-3.1-flash-lite');
  assert.equal(FREE_TIER_SWE_MODELS.length, 3);
});

test('Free tier models do not contain non-Gemini placeholders', () => {
  FREE_TIER_SWE_MODELS.forEach((model) => {
    assert.ok(model.startsWith('gemini-'), `Model ${model} must be a valid Gemini model`);
  });
});

test('Reference Showcase Scenarios satisfy domain & vector contracts', async () => {
  const { FLAGSHIP_SCENARIOS } = await import('./data/scenarios');
  assert.ok(FLAGSHIP_SCENARIOS.length >= 1);

  FLAGSHIP_SCENARIOS.forEach((scenario) => {
    assert.ok(scenario.userPersonaProfile, `Scenario ${scenario.id} must define a userPersonaProfile`);
    assert.ok(scenario.userPersonaProfile.adversarialVectors.length >= 1, 'Must define at least 1 reference vector');
    scenario.userPersonaProfile.adversarialVectors.forEach((vec) => {
      assert.ok(vec.actionTitle.length > 5);
      assert.ok(vec.testPromptInjection.length > 10);
    });
  });
});
