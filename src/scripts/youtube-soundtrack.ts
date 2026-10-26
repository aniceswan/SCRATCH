interface YouTubePlayer {
  loadVideoById(options: {videoId: string; startSeconds: number}): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
}
interface YouTubeEvent {target: YouTubePlayer; data: number;}
interface YouTubeOptions {
  events: {
    onReady(event: {target: YouTubePlayer}): void;
    onStateChange(event: YouTubeEvent): void;
    onError(event: YouTubeEvent): void;
    onAutoplayBlocked(): void;
  };
}
declare global {
  interface Window {
    YT?: {Player: new (element: HTMLIFrameElement, options: YouTubeOptions) => YouTubePlayer};
    onYouTubeIframeAPIReady?: () => void;
  }
}

const section = document.querySelector<HTMLElement>('[data-youtube-soundtrack]');
const frame = section?.querySelector<HTMLIFrameElement>('[data-youtube-frame]');
const button = document.querySelector<HTMLButtonElement>('[data-soundtrack-play]');
const status = document.querySelector<HTMLElement>('[data-soundtrack-status]');

if (section && frame && button && status) {
  const videoId = section.dataset.videoId!;
  const title = section.dataset.trackTitle ?? 'lagu pengiring';
  const start = Math.max(0, Number(section.dataset.startSeconds) || 0);
  let controller: YouTubePlayer | undefined;
  let ready = false;
  let failed = false;
  let wantsPlayback = false;
  let prepared = false;
  let restarting = false;
  let pendingAction: 'play' | 'pause' | null = null;
  let pendingTimer = 0;

  const showPlayback = (playing: boolean) => {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', `${playing ? 'Jeda' : 'Putar'} ${title}`);
  };
  const report = (message: string) => {
    status.textContent = message;
    status.classList.toggle('sr-only', !message);
  };
  const clearTimers = () => {
    window.clearTimeout(pendingTimer);
  };
  const waitForPlayback = () => {
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      report('Jika lagu belum terdengar, tekan Play langsung pada video YouTube di bawah.');
    }, 8000);
  };
  const loadVideo = () => {
    if (!controller || failed || restarting || !wantsPlayback) return;
    restarting = true;
    prepared = true;
    pendingAction = 'play';
    waitForPlayback();
    controller.loadVideoById({videoId, startSeconds: start});
  };
  const pause = () => {
    wantsPlayback = false;
    restarting = false;
    pendingAction = 'pause';
    clearTimers();
    controller?.pauseVideo();
  };
  const loadingTimer = window.setTimeout(() => {
    if (!ready && !failed) report('Pemutar YouTube belum siap. Gunakan tautan YouTube di bawah.');
  }, 15000);

  button.addEventListener('click', () => {
    if (!ready || failed || !controller) return;
    if (wantsPlayback) {pause(); return;}
    wantsPlayback = true;
    pendingAction = 'play';
    const time = controller.getCurrentTime();
    if (!prepared || time < start) loadVideo();
    else {waitForPlayback(); controller.playVideo();}
  });

  const initialize = () => {
    if (!window.YT?.Player || controller) return;
    controller = new window.YT.Player(frame, {
      events: {
        onReady(event) {
          controller = event.target;
          ready = true;
          window.clearTimeout(loadingTimer);
          button.disabled = failed;
          if (!failed) report('');
        },
        onStateChange(event) {
          if (failed) return;
          if (event.data === 1) {
            if (pendingAction === 'pause' || document.hidden) {event.target.pauseVideo(); return;}
            wantsPlayback = true;
            prepared = true;
            restarting = false;
            pendingAction = null;
            clearTimers();
            showPlayback(true);
            report('');
          } else if (event.data === 2) {
            // Starting a video can briefly report Paused before Playing.
            // A top-button Pause clears this pending start immediately.
            if (restarting && wantsPlayback && pendingAction === 'play') return;
            wantsPlayback = false;
            restarting = false;
            pendingAction = null;
            clearTimers();
            showPlayback(false);
            report('');
          } else if (event.data === 0) {
            wantsPlayback = false;
            restarting = false;
            prepared = false;
            pendingAction = null;
            clearTimers();
            showPlayback(false);
            report('');
          }
        },
        onError(event) {
          failed = true;
          wantsPlayback = false;
          clearTimers();
          window.clearTimeout(loadingTimer);
          button.disabled = true;
          showPlayback(false);
          report(event.data === 101 || event.data === 150
            ? 'Video ini tidak mengizinkan pemutaran di website. Gunakan tautan YouTube di bawah.'
            : 'Video belum dapat diputar. Gunakan tautan YouTube di bawah.');
        },
        onAutoplayBlocked() {
          wantsPlayback = false;
          restarting = false;
          pendingAction = null;
          clearTimers();
          showPlayback(false);
          report('Tekan Play langsung pada video YouTube di bawah untuk memulai lagu.');
        },
      },
    });
  };
  if (window.YT?.Player) initialize();
  else {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {previous?.(); initialize();};
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.addEventListener('error', () => {
      window.clearTimeout(loadingTimer);
      report('YouTube tidak dapat dimuat. Gunakan tautan YouTube di bawah.');
    });
    document.body.append(script);
  }
  document.addEventListener('visibilitychange', () => {if (document.hidden) pause();});
  window.addEventListener('pagehide', pause);
}

export {};
