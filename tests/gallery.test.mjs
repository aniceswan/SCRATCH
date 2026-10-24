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

test('identical wheel travel advances farther and handles line and page units consistently', () => {
  assert.equal(typeof gallery.wheelTravel, 'function');
  assert.ok(gallery.wheelTravel(500, 0, 800) >= 3.5);
  assert.equal(gallery.wheelTravel(3, 1, 800), gallery.wheelTravel(48, 0, 800));
  assert.equal(gallery.wheelTravel(1, 2, 800), gallery.wheelTravel(800, 0, 800));
  assert.equal(gallery.wheelTravel(-500, 0, 800), -gallery.wheelTravel(500, 0, 800));
  assert.ok(gallery.wheelTravel(999999, 0, 800) <= 8);
});

test('scroll accelerates gently, settles at its target, and stays consistent across refresh rates', () => {
  assert.equal(typeof gallery.followPosition, 'function');
  const first = gallery.followPosition({position: 0, velocity: 0}, 4, 1 / 60);
  assert.ok(first.position > 0 && first.position < 0.12, 'no abrupt initial jump');
  const next = gallery.followPosition(first, 4, 1 / 60);
  assert.ok(next.position - first.position > first.position, 'speed builds continuously');
  const run = hz => {
    let state = {position: 0, velocity: 0};
    for (let i = 0; i < hz * 2; i++) {
      state = gallery.followPosition(state, 4, 1 / hz);
      assert.ok(state.position <= 4, 'no overshoot at the final card');
    }
    return state;
  };
  assert.ok(Math.abs(run(60).position - 4) < 0.001);
  assert.ok(Math.abs(run(60).position - run(120).position) < 0.0001);
});

test('one anchored clothesline passes directly through every clip pivot in depth', () => {
  assert.equal(typeof gallery.clotheslineGeometry, 'function');
  const size = {width: 800, height: 700, cardWidth: 360, cardHeight: 470};
  const rope = gallery.clotheslineGeometry(size);
  assert.ok(rope.points.length > 30);
  assert.equal(rope.points[0].x, rope.anchor.x);
  assert.equal(rope.points[0].y, rope.anchor.y);
  assert.ok(rope.anchor.x > 0 && rope.anchor.x < 50, 'visible mounting point in the foreground');
  const tail = rope.points.at(-1);
  assert.ok(rope.anchor.x < tail.x && rope.anchor.y > tail.y, 'recedes up and right');
  for (let distance = 0; distance <= 4; distance += .5) {
    const pivot = gallery.projectPoint(gallery.clotheslinePoint(distance, size), size);
    assert.ok(rope.points.some(p => Math.hypot(p.x - pivot.x, p.y - pivot.y) < .01), 'clip must sit on the rope at '+distance);
  }
});

test('mobile rope reaches the viewport edge without moving any clip pivots', () => {
  const size = {width: 390, height: 450, cardWidth: 242, cardHeight: 319};
  const rope = gallery.clotheslineGeometry(size, false);
  assert.equal(rope.points[0].x, 0, 'rope extends all the way to the left edge');
  const landscape = gallery.clotheslineGeometry(size, false, 160);
  assert.equal(landscape.points[0].x, -160, 'landscape rope reaches beyond the stage to the viewport edge');
  const short = {width: 481, height: 286, cardWidth: 160, cardHeight: 220};
  assert.ok(gallery.clotheslineGeometry(short, false, 362).anchor.y <= short.height - 24, 'foreground rope stays above the copyright on short landscape screens');
  const desktop = gallery.clotheslineGeometry(size, true);
  assert.ok(desktop.points[0].x > 0, 'desktop retains a mounting point for the post');
  for (let distance = 0; distance <= 4; distance += .5) {
    const pivot = gallery.projectPoint(gallery.clotheslinePoint(distance, size), size);
    assert.ok(rope.points.some(p => Math.hypot(p.x - pivot.x, p.y - pivot.y) < .01));
  }
});
