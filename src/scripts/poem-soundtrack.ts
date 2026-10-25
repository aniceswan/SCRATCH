interface PlaybackData { isPaused: boolean; isBuffering: boolean; position: number; duration: number; }
interface EmbedController {
  togglePlay(): void;
  pause(): void;
  addListener(event: 'ready', listener: () => void): void;
  addListener(event: 'playback_update', listener: (event: {data: PlaybackData}) => void): void;
}
interface SpotifyIframeApi {
  createController(element: HTMLElement, options: {uri: string; width: string; height: number}, callback: (controller: EmbedController) => void): void;
}
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void; }
}

const player = document.querySelector<HTMLElement>('[data-soundtrack]');
const mount = player?.querySelector<HTMLElement>('[data-spotify-mount]');
const button = document.querySelector<HTMLButtonElement>('[data-soundtrack-play]');
const status = document.querySelector<HTMLElement>('[data-soundtrack-status]');

if (player && mount && button && status) {
  const title = player.dataset.trackTitle ?? 'lagu pengiring';
  let controller: EmbedController | undefined;
  let pending = 0;
  let ready = false;

  const reportFallback = (message: string) => {
    status.textContent = message;
    status.classList.remove('sr-only');
  };
  const loadingTimeout = window.setTimeout(() => {
    if (!ready) reportFallback('Pemutar belum siap. Gunakan tautan Spotify di bawah puisi.');
  }, 15000);

  button.addEventListener('click', () => {
    if (!controller || !ready) return;
    window.clearTimeout(pending);
    controller.togglePlay();
    // Keep the icon honest: only Spotify playback events change its play/pause state.
    pending = window.setTimeout(() => {
      reportFallback('Jika lagu belum terdengar, tekan Play pada pemutar Spotify di bawah puisi.');
    }, 5000);
  });

  window.onSpotifyIframeApiReady = api => {
    api.createController(mount, {
      uri: `spotify:track:${player.dataset.trackId}`,
      width: '100%', height: 152,
    }, embed => {
      controller = embed;
      const frame = player.querySelector('iframe');
      if (frame) {
        frame.title = `Spotify: ${title}`;
        frame.style.border = '0';
        frame.style.borderRadius = '12px';
        frame.style.display = 'block';
      }
      embed.addListener('ready', () => {
        ready = true;
        button.disabled = false;
        window.clearTimeout(loadingTimeout);
        status.textContent = '';
        status.classList.add('sr-only');
      });
      embed.addListener('playback_update', event => {
        const {isPaused, isBuffering, position, duration} = event.data;
        // Spotify previews can finish without ever reporting isPaused: true.
        const ended = duration > 0 && position >= duration;
        // Spotify can ignore a second toggle while the first command buffers.
        // Keep the control pending until the player reports a settled state.
        button.disabled = isBuffering && !ended;
        if (isBuffering && !ended) return;
        const playing = !isPaused && !ended;
        button.setAttribute('aria-pressed', String(playing));
        button.setAttribute('aria-label', `${playing ? 'Jeda' : 'Putar'} ${title}`);
        window.clearTimeout(pending);
        status.textContent = '';
        status.classList.add('sr-only');
      });
    });
  };

  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  script.addEventListener('error', () => {
    window.clearTimeout(loadingTimeout);
    reportFallback('Spotify tidak dapat dimuat. Gunakan tautan di bawah puisi.');
  });
  document.body.append(script);
}

export {};
