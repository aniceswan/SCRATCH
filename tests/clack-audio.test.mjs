import test from 'node:test';
import assert from 'node:assert/strict';
const audio = await import('../src/lib/clack-audio.js');

test('wooden slide sound has two short knocks separated by near-silence', () => {
  assert.equal(typeof audio.makeClackSamples, 'function');
  const rate = 48000;
  const samples = audio.makeClackSamples(rate, 1);
  assert.ok(samples.length <= rate * 0.11);
  const peak = (from, to) => Math.max(...samples.slice(from * rate, to * rate).map(Math.abs));
  assert.ok(peak(0, .009) > .3, 'first sharp tap');
  assert.ok(peak(.035, .045) > .15, 'second softer tap');
  assert.ok(peak(.025, .034) < .03, 'clicks are distinct, without a long paper hiss');
  assert.ok(peak(.08, .1) < .003, 'no sustained tail');
  assert.ok(samples.every(Number.isFinite));
  assert.ok(peak(0, .1) <= 1, 'no clipped samples');
});
