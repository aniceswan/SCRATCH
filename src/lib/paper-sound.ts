/** A tiny synthesized paper brush: no downloads and no audio before a gesture. */
export class PaperSound {
  private context?: AudioContext;
  private noise?: AudioBuffer;
  private lastPlayed = -Infinity;
  enabled = true;

  constructor(private button: HTMLButtonElement | null) {
    try { this.enabled = localStorage.getItem('scratch:sound') !== 'off'; } catch { /* private browsing */ }
    this.updateButton();
    button?.addEventListener('click', () => {
      this.enabled = !this.enabled;
      try { localStorage.setItem('scratch:sound', this.enabled ? 'on' : 'off'); } catch { /* no-op */ }
      this.updateButton();
      if (this.enabled) void this.unlock();
      else void this.context?.suspend().catch(() => {});
    });
  }

  private updateButton() {
    this.button?.setAttribute('aria-pressed', String(this.enabled));
    this.button?.setAttribute('aria-label', this.enabled ? 'Matikan suara perpindahan kartu' : 'Aktifkan suara perpindahan kartu');
    const label = this.button?.querySelector('[data-sound-label]');
    if (label) label.textContent = this.enabled ? 'SUARA ON' : 'SUARA OFF';
  }

  async unlock() {
    if (!this.enabled || document.hidden) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
      if (!this.noise) {
        const frames = Math.floor(this.context.sampleRate * 0.14);
        this.noise = this.context.createBuffer(1, frames, this.context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      }
    } catch { /* Audio is optional; navigation remains available. */ }
  }

  play(direction: number) {
    const context = this.context;
    if (!this.enabled || !context || !this.noise || context.state !== 'running' || document.hidden) return;
    if (performance.now() - this.lastPlayed < 90) return;
    this.lastPlayed = performance.now();
    try {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const envelope = context.createGain();
      source.buffer = this.noise;
      source.playbackRate.value = direction >= 0 ? 1.04 : 0.94;
      filter.type = 'bandpass';
      filter.frequency.value = 1450;
      filter.Q.value = 0.65;
      const now = context.currentTime;
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(0.065, now + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      source.connect(filter).connect(envelope).connect(context.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
      source.start(now);
      source.stop(now + 0.14);
    } catch { /* Browsers may suspend audio in the background. */ }
  }
}
