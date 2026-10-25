import test from 'node:test';
import assert from 'node:assert/strict';
const gallery = await import('../src/lib/gallery.js');

test('large archives keep a bounded reusable window and wrap backward', () => {
  assert.equal(typeof gallery.cardWindow, 'function', 'bounded card window is implemented');
  const result = gallery.cardWindow(0, 10000);
  assert.equal(result.length, 9);
  assert.deepEqual(result.map(p => p.index), [9996, 9997, 9998, 9999, 0, 1, 2, 3, 4]);
  assert.equal(new Set(result.map(p => p.slot)).size, 9);
  assert.deepEqual(gallery.cardWindow(-1, 24).map(p => p.index), [19, 20, 21, 22, 23, 0, 1, 2, 3]);
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

test('active slide is centered and larger than symmetric left and right neighbors', () => {
  for (const size of [
    {width: 1440, height: 500, cardWidth: 340, cardHeight: 420},
    {width: 390, height: 380, cardWidth: 240, cardHeight: 295},
    {width: 480, height: 250, cardWidth: 150, cardHeight: 182},
  ]) {
    const active = gallery.cardPose(0, size);
    const left = gallery.cardPose(-1, size), right = gallery.cardPose(1, size);
    assert.equal(active.x + size.cardWidth / 2, size.width / 2);
    assert.equal(active.y + size.cardHeight / 2, size.height / 2);
    assert.equal(active.scale, 1);
    assert.ok(left.scale < active.scale && left.scale > .6);
    assert.equal(left.scale, right.scale);
    assert.ok(left.x < active.x && right.x > active.x);
    assert.ok(Math.abs((active.x-left.x)-(right.x-active.x))<.0001);
    const leftRightEdge = left.x + size.cardWidth / 2 + size.cardWidth * left.scale / 2;
    const rightLeftEdge = right.x + size.cardWidth / 2 - size.cardWidth * right.scale / 2;
    assert.ok(leftRightEdge > active.x + size.cardWidth * .6, 'left card tucks closely behind the active card');
    assert.ok(rightLeftEdge < active.x + size.cardWidth * .4, 'right card tucks closely behind the active card');
    assert.equal(left.y, right.y);
    assert.ok(left.opacity > 0 && right.opacity > 0);
    assert.ok(active.zIndex > left.zIndex && active.zIndex > right.zIndex);
  }
});

test('carousel motion crosses the center continuously and fades remote recycled slots', () => {
  const size={width:900,height:500,cardWidth:320,cardHeight:395};
  const before=gallery.cardPose(-.001,size), after=gallery.cardPose(.001,size);
  assert.ok(Math.abs(before.x-after.x)<1);
  assert.equal(before.scale,after.scale);
  assert.equal(before.opacity,after.opacity);
  assert.equal(gallery.cardPose(-4,size).opacity,0);
  assert.equal(gallery.cardPose(4,size).opacity,0);
  for(const position of [0,.3,1,-1,-.8,10000.1]) {
    const window=gallery.cardWindow(position,10000);
    assert.ok(window.some(card=>card.distance<=-2));
    assert.ok(window.some(card=>card.distance>=2));
  }
});
