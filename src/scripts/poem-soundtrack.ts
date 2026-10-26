interface PlaybackData { isPaused: boolean; isBuffering: boolean; position: number; duration: number; }
interface EmbedController {
  resume(): void;
  restart(): void;
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
  let wantsPlayback = false;
  let restarting = false;
  let pendingAction: 'play' | 'pause' | null = null;

  const showPlayback = (playing: boolean) => {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', `${playing ? 'Jeda' : 'Putar'} ${title}`);
  };

  const reportFallback = (message: string) => {
    status.textContent = message;
    status.classList.remove('sr-only');
  };
  const waitForPlayback = () => {
    window.clearTimeout(pending);
    pending = window.setTimeout(() => {
      if (pendingAction === 'play') {
        wantsPlayback = false;
        restarting = false;
        pendingAction = null;
        showPlayback(false);
      }
      reportFallback('Jika lagu belum terdengar, tekan Play pada pemutar Spotify di bagian bawah.');
    }, 5000);
  };
  const loadingTimeout = window.setTimeout(() => {
    if (!ready) reportFallback('Pemutar belum siap. Gunakan tautan Spotify di bagian bawah.');
  }, 15000);

  button.addEventListener('click', () => {
    if (!controller || !ready) return;
    wantsPlayback = !wantsPlayback;
    restarting = false;
    pendingAction = wantsPlayback ? 'play' : 'pause';
    waitForPlayback();
    if (wantsPlayback) controller.resume();
    else controller.pause();
    // Keep the icon honest: only Spotify playback events change its play/pause state.
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
        if (ended && wantsPlayback) {
          // Several end updates can arrive before the restart is acknowledged.
          if (!restarting) {
            restarting = true;
            pendingAction = 'play';
            waitForPlayback();
            embed.restart();
          }
          return;
        }
        // A user's Pause takes precedence over late playing/end updates, while
        // an idle update during a requested start must not cancel its repeat.
        if (!ended && ((pendingAction === 'pause' && !isPaused) || (pendingAction === 'play' && isPaused))) return;
        if (isBuffering && !ended) return;
        wantsPlayback = !isPaused && !ended;
        restarting = false;
        pendingAction = null;
        showPlayback(wantsPlayback);
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
    reportFallback('Spotify tidak dapat dimuat. Gunakan tautan di bagian bawah.');
  });
  document.body.append(script);
}

export {};
