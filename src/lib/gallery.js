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

/** Two longitudinal cords run above their respective rows of clothespins. */
export function clotheslinePoint(distance, side, size) {
  const pose = cardPose(distance, size);
  const radians = pose.rotateY * Math.PI / 180;
  const pinX = side * size.cardWidth * 0.25;
  return {
    x: pose.x + size.cardWidth / 2 + pinX * Math.cos(radians),
    y: pose.y - Math.min(70, Math.max(30, size.height * 0.12)),
    z: pose.z - pinX * Math.sin(radians),
  };
}

/** Exact CSS rotations at the point where a thread meets a swinging clip. */
export function clothespinPoint(distance, side, angle, size) {
  const pose = cardPose(distance, size);
  const swing = angle * Math.PI / 180;
  const turn = pose.rotateY * Math.PI / 180;
  const pinX = side * size.cardWidth * 0.25;
  const localX = Math.cos(swing) * pinX - Math.sin(swing) * 24;
  const localY = Math.sin(swing) * pinX + Math.cos(swing) * 24 - 38;
  return {
    x: pose.x + size.cardWidth / 2 + localX * Math.cos(turn),
    y: pose.y + localY,
    z: pose.z - localX * Math.sin(turn),
  };
}
