/** Wrap an archive index in either direction. */
export function wrapIndex(index, count) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

/** A symmetric reusable pool keeps both sides of the carousel buffered. */
export function cardWindow(position, count, limit = 9) {
  const length = Math.min(Math.max(0, count), Math.max(0, limit));
  if (!length) return [];
  const first = Math.floor(position) - Math.floor((length - 1) / 2);
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

/** Symmetric horizontal slides, scaling around each card's center. */
export function cardPose(distance, size) {
  const depth = Math.abs(distance);
  return {
    x: (size.width - size.cardWidth) / 2 + distance * size.cardWidth * .2,
    y: (size.height - size.cardHeight) / 2,
    scale: 1 / (1 + depth * .32),
    opacity: Math.max(0, 1 - depth * .08 - depth * depth * .13),
    zIndex: 1000 - Math.round(depth * 100),
  };
}
