/** A dry wooden double knock, synthesized as short resonant impacts. */
export function makeClackSamples(sampleRate, direction = 1) {
  const samples = new Float32Array(Math.ceil(sampleRate * 0.1));
  const pitch = direction >= 0 ? 1 : 0.94;
  let seed = 731;
  for (let i = 0; i < samples.length; i++) {
    const time = i / sampleRate;
    let value = 0;
    for (const [onset, strength] of [[0, 1], [0.036, 0.62]]) {
      const t = time - onset;
      if (t < 0) continue;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const transient = (seed / 2147483648 - 1) * Math.exp(-t / 0.0007) * 0.65;
      const wood = (
        Math.sin(2 * Math.PI * 930 * pitch * t) * 0.5 +
        Math.sin(2 * Math.PI * 1740 * pitch * t) * 0.28 +
        Math.sin(2 * Math.PI * 3100 * pitch * t) * 0.15
      ) * Math.exp(-t / 0.005);
      value += (wood + transient) * strength * Math.min(1, t / 0.00012);
    }
    samples[i] = value;
  }
  return samples;
}
