/** Wrap an archive index in either direction. */
export function wrapIndex(index, count) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

/** A fixed pool with two cards of backward buffer and six ahead. */
export function cardWindow(position, count, limit = 9) {
  const length = Math.min(Math.max(0, count), Math.max(0, limit));
  if (!length) return [];
  const first = Math.floor(position) - Math.min(2, Math.floor((length - 1) / 2));
  return Array.from({length}, (_, offset) => {
    const absolute = first + offset;
    return {
      absolute,
      index: wrapIndex(absolute, count),
      slot: wrapIndex(absolute, length),
      distance: absolute - position,
    };
  });
}

/** Damped angular spring. Impulses are degrees per second, dt is seconds. */
export function stepSpring(state, dt, impulse = 0) {
  const elapsed = Math.min(Math.max(dt, 0), 1 / 30);
  let velocity = Math.max(-90, Math.min(90, state.velocity + impulse));
  velocity += (-32 * state.angle - 6.8 * velocity) * elapsed;
  const angle = Math.max(-12, Math.min(12, state.angle + velocity * elapsed));
  if (Math.abs(angle) < 0.002 && Math.abs(velocity) < 0.008) return {angle: 0, velocity: 0};
  return {angle, velocity};
}

/** Normalize browser wheel units; one identical gesture travels 2.25× farther. */
export function wheelTravel(delta, deltaMode, pageHeight) {
  const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
  return Math.max(-8, Math.min(8, pixels * 0.0072));
}

/** Analytic critically damped motion: smooth velocity, independent of frame rate. */
export function followPosition(state, target, dt) {
  const elapsed = Math.min(Math.max(dt, 0), 0.05);
  const omega = 11;
  const offset = state.position - target;
  const decay = Math.exp(-omega * elapsed);
  const step = (state.velocity + omega * offset) * elapsed;
  const position = target + (offset + step) * decay;
  const velocity = (state.velocity - omega * step) * decay;
  if (Math.abs(position - target) < 0.0005 && Math.abs(velocity) < 0.003) {
    return {position: target, velocity: 0};
  }
  return {position, velocity};
}

/** Card locations follow a single diagonal into the right-hand vanishing point. */
export function cardPose(distance, size) {
  return {
    x: size.width * 0.44 - size.cardWidth / 2 + distance * size.cardWidth * 0.23,
    y: (size.height - size.cardHeight) / 2 + 22 - distance * 26,
    z: -distance * 185,
    rotateY: Math.max(-12, Math.min(14, distance * 3.4)),
  };
}

/** Same camera and origin as the CSS perspective on .stage. */
export function projectPoint(point, size) {
  const scale = 1600 / (1600 - point.z);
  return {
    x: size.width * 0.76 + (point.x - size.width * 0.76) * scale,
    y: size.height * 0.12 + (point.y - size.height * 0.12) * scale,
  };
}

/** Every print hangs directly from this single line at its central clip. */
export function clotheslinePoint(distance, size) {
  const pose = cardPose(distance, size);
  return {x: pose.x + size.cardWidth / 2, y: pose.y - 9, z: pose.z};
}

/** Begin at a visible eyelet, then recede through all of the card pivots. */
export function clotheslineGeometry(size) {
  const edge = Math.max(18, size.width * 0.04);
  const projected = Array.from({length: 169}, (_, i) =>
    projectPoint(clotheslinePoint(-7 + i * 0.125, size), size));
  const first = projected.findIndex(point => point.x >= edge);
  const before = projected[Math.max(0, first - 1)];
  const after = projected[Math.max(0, first)];
  const fraction = (edge - before.x) / (after.x - before.x || 1);
  const anchor = {x: edge, y: before.y + (after.y - before.y) * fraction};
  return {anchor, points: [anchor, ...projected.slice(Math.max(0, first))]};
}
