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
