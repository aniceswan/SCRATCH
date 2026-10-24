import slideA from '../assets/audio/clothesline-slide-a.mp3?url';
import slideB from '../assets/audio/clothesline-slide-b.mp3?url';

/** Real hanger slides, loaded once after a gesture. Audio never blocks navigation. */
export class ClotheslineSound {
  private context?: AudioContext;
  private buffers: AudioBuffer[] = [];
  private loading?: Promise<void>;
  private lastPlayed = -Infinity;
  private take = 0;

  async unlock() {
    if (document.hidden) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
      if (!this.buffers.length) {
        this.loading ??= this.loadRecordings();
        await this.loading;
      }
    } catch { /* Unsupported audio must never block the archive. */ }
  }

  private async loadRecordings() {
    try {
      const context = this.context!;
      this.buffers = await Promise.all([slideA, slideB].map(async url => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Sound unavailable');
        return context.decodeAudioData(await response.arrayBuffer());
      }));
    } catch { this.loading = undefined; }
  }

  play(direction: number, opening = false) {
    const context = this.context;
    if (!context || !this.buffers.length || context.state !== 'running' || document.hidden) return;
    if (!opening && performance.now() - this.lastPlayed < 110) return;
    this.lastPlayed = performance.now();
    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = this.buffers[opening ? 1 : this.take++ % this.buffers.length];
      source.playbackRate.value = opening ? 0.88 : direction >= 0 ? 1 : 0.96;
      gain.gain.value = opening ? 0.65 : 0.55;
      source.connect(gain).connect(context.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start(0, opening ? 0.06 : 0);
    } catch { /* Audio may be unavailable while changing browser tabs. */ }
  }
}

export const clotheslineSound = new ClotheslineSound();
