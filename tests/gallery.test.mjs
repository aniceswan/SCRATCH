import test from 'node:test';
import assert from 'node:assert/strict';
const gallery = await import('../src/lib/gallery.js');

test('large archives keep a bounded reusable window and wrap backward', () => {
  assert.equal(typeof gallery.cardWindow, 'function', 'bounded card window is implemented');
  const result = gallery.cardWindow(0, 10000);
  assert.equal(result.length, 9);
  assert.deepEqual(result.map(p => p.index), [9998, 9999, 0, 1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(result.map(p => p.slot)).size, 9);
  assert.deepEqual(gallery.cardWindow(-1, 24).map(p => p.index), [21, 22, 23, 0, 1, 2, 3, 4, 5]);
});

test('neighboring moves preserve slots and keep fractional card distances', () => {
  assert.equal(typeof gallery.cardWindow, 'function');
  const a = gallery.cardWindow(0.8, 24);
  const b = gallery.cardWindow(1.1, 24);
  for (const card of a.filter(p => b.some(q => q.absolute === p.absolute))) {
    assert.equal(b.find(p => p.absolute === card.absolute).slot, card.slot);
  }
  assert.equal(a.find(p => p.index === 1).distance, 0.19999999999999996);
});

test('small and empty collections have no duplicate cards', () => {
  assert.equal(typeof gallery.cardWindow, 'function');
  assert.deepEqual(gallery.cardWindow(0, 0), []);
  assert.deepEqual(gallery.cardWindow(0, 1).map(p => p.index), [0]);
  assert.deepEqual(gallery.cardWindow(4, 3).map(p => p.index), [0, 1, 2]);
});

test('a disturbed hanging card swings and settles without a permanent animation', () => {
  assert.equal(typeof gallery.stepSpring, 'function');
  let state = gallery.stepSpring({angle: 0, velocity: 0}, 1 / 60, 12);
  assert.ok(state.angle > 0);
  let crossed = false;
  for (let i = 0; i < 600; i++) {
    state = gallery.stepSpring(state, 1 / 60);
    crossed ||= state.angle < 0;
  }
  assert.ok(crossed, 'card swings back past its resting point');
  assert.ok(Math.abs(state.angle) < 0.01);
  assert.ok(Math.abs(state.velocity) < 0.01);
});
