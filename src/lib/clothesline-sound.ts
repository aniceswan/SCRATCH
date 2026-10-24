import { makeClackSamples } from './clack-audio.js';

/** Always enabled; browser audio is unlocked by the first click, touch or key. */
export class ClotheslineSound {
  private context?: AudioContext;
  private buffers: AudioBuffer[] = [];
  private lastPlayed = -Infinity;

  async unlock() {
    if (document.hidden) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
      if (!this.buffers.length) {
        this.buffers = [1, -1].map(direction => {
          const samples = makeClackSamples(this.context!.sampleRate, direction);
          const buffer = this.context!.createBuffer(1, samples.length, this.context!.sampleRate);
          buffer.getChannelData(0).set(samples);
          return buffer;
        });
      }
    } catch { /* Unsupported audio must never block the archive. */ }
  }

  play(direction: number) {
    const context = this.context;
    if (!context || !this.buffers.length || context.state !== 'running' || document.hidden) return;
    if (performance.now() - this.lastPlayed < 65) return;
    this.lastPlayed = performance.now();
    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = this.buffers[direction >= 0 ? 0 : 1];
      gain.gain.value = 0.25;
      source.connect(gain).connect(context.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start();
    } catch { /* Audio may be unavailable while changing browser tabs. */ }
  }
}
