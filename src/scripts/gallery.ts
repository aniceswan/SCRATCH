import { cardWindow, stepSpring, wrapIndex, wheelTravel, followPosition, cardPose, clotheslineGeometry } from '../lib/gallery.js';
import { clotheslineSound as sound } from '../lib/clothesline-sound';

interface GalleryPoem { number: string; title: string; excerpt: string; url: string; alt: string; src: string; srcset: string; }
const catalog: GalleryPoem[] = JSON.parse(document.querySelector('[data-poems]')?.textContent ?? '[]');
window.addEventListener('pointerdown', () => { void sound.unlock(); }, {passive: true});
window.addEventListener('keydown', () => { void sound.unlock(); });

const stage = document.querySelector<HTMLElement>('[data-stage]');
const shell = document.querySelector<HTMLElement>('[data-site-shell]');
const intro = document.querySelector<HTMLElement>('[data-intro]');
const main = document.querySelector<HTMLElement>('#arsip');
const enterLink = document.querySelector<HTMLAnchorElement>('[data-enter]');
const replayButton = document.querySelector<HTMLButtonElement>('[data-replay-intro]');

const hangs = Array.from(document.querySelectorAll<HTMLElement>('[data-hang]'));
const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-poem-card]'));
const featureTitle = document.querySelector<HTMLElement>('[data-feature-title]');
const featureNumber = document.querySelector<HTMLElement>('[data-feature-number]');
const featureExcerpt = document.querySelector<HTMLElement>('[data-feature-excerpt]');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = motionPreference.matches;
const root = document.documentElement;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

let pos = 0;
let target = 0;
let scrollVelocity = 0;
let current = -1;
let raf = 0;
let running = false;
let snapTimer = 0;
let dragging = false;
let pointerStartX = 0;
let pointerStartTarget = 0;
let pointerMoved = 0;
let suppressClick = false;
let leaving = false;
let pageScrolls = false;
let lastTime = 0;
let travelDirection = 1;
const springs = hangs.map(() => ({angle: 0, velocity: 0}));
const swings = hangs.map(hang => hang.querySelector<HTMLElement>('[data-swing]')!);
const images = cards.map(card => card.querySelector<HTMLImageElement>('img')!);
const clothesline = document.querySelector<SVGSVGElement>('[data-clothesline]');
const rope = document.querySelector<SVGPathElement>('[data-rope]');
const post = document.querySelector<SVGGElement>('[data-rope-post]');
const postFace = document.querySelector<SVGImageElement>('[data-post-face]');
const postShadow = document.querySelector<SVGEllipseElement>('[data-post-shadow]');
const ropeBinding = document.querySelector<SVGPathElement>('[data-rope-binding]');
let dimensions = {width: 0, height: 0, cardWidth: 0, cardHeight: 0};

function measureStage() {
  if (!stage || !hangs.length) return;
  dimensions = {width: stage.clientWidth, height: stage.clientHeight,
    cardWidth: hangs[0].offsetWidth, cardHeight: hangs[0].offsetHeight};
  clothesline?.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
  const showPost = window.matchMedia('(min-width: 901px)').matches;
  const geometry = clotheslineGeometry(dimensions, showPost, stage.getBoundingClientRect().left);
  rope?.setAttribute('d', geometry.points.map((point, i) => `${i ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' '));
  const mounting = `translate(${geometry.anchor.x.toFixed(2)} ${geometry.anchor.y.toFixed(2)})`;
  const bottom = Math.max(40, dimensions.height - geometry.anchor.y - 10);
  post?.setAttribute('transform', mounting);
  ropeBinding?.setAttribute('transform', mounting);
  const postWidth = Math.max(26, Math.min(48, (bottom + 34) * .087));
  postFace?.setAttribute('height', String(bottom + 34));
  postFace?.setAttribute('width', String(postWidth));
  postFace?.setAttribute('x', String(-postWidth / 2));
  if (showPost) postFace?.setAttribute('href', postFace.dataset.postSrc ?? '');
  else postFace?.removeAttribute('href');
  const half = postWidth / 2;
  ropeBinding?.setAttribute('d', `M${-half - 1} -4Q0 -8 ${half + 1} -4 M${-half - 1} 1Q0 -3 ${half + 1} 1 M${-half - 1} 6Q0 2 ${half + 1} 6 M${half} 1q7 6 2 15`);
  postShadow?.setAttribute('cy', String(bottom + 2));
}

motionPreference.addEventListener('change', () => {
  reduceMotion = motionPreference.matches;
  springs.forEach(spring => { spring.angle = 0; spring.velocity = 0; });
  start();
});

function setWords(element: HTMLElement, text: string) {
  element.replaceChildren();
  const words = text.split(/\s+/).filter(Boolean);

  words.forEach((word, index) => {
    const outer = document.createElement('span');
    outer.className = 'word';
    outer.style.setProperty('--i', String(index));
    const inner = document.createElement('span');
    inner.textContent = word;
    outer.append(inner);
    element.append(outer);
    if (index < words.length - 1) element.append(document.createTextNode(' '));
  });
}

function updateFeature(index: number) {
  if (index === current) return;
  const previous = current;
  current = index;
  const poem = catalog[index];
  if (!poem) return;
  if (previous !== -1) sound.play(travelDirection);
  if (featureNumber) {
    featureNumber.textContent = `${poem.number} / ${String(catalog.length).padStart(2, '0')}`;
    featureNumber.setAttribute('aria-label', `Puisi ${Number(poem.number)} dari ${catalog.length}`);
  }
  if (featureTitle) {
    setWords(featureTitle, poem.title);
    featureTitle.setAttribute('aria-label', poem.title);
  }
  if (featureExcerpt) {
    featureExcerpt.textContent = poem.excerpt;
    if (!reduceMotion) featureExcerpt.animate(
      [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}],
      {duration: 520, easing: 'cubic-bezier(.22,.75,.25,1)'},
    );
  }
}

function render(dt = 0, movement = 0) {
  if (!stage || !catalog.length || !hangs.length) return false;
  if (!dimensions.width) measureStage();
  const active = wrapIndex(Math.round(pos), catalog.length);
  let swinging = false;

  for (const entry of cardWindow(pos, catalog.length)) {
    const {slot, index, distance} = entry;
    const hang = hangs[slot];
    const card = cards[slot];
    const poem = catalog[index];
    if (hang.dataset.poemIndex !== String(index)) {
      hang.dataset.poemIndex = String(index);
      card.dataset.index = String(index);
      card.href = poem.url;
      card.setAttribute('aria-label', `Baca puisi ${poem.title}`);
      images[slot].alt = poem.alt;
      images[slot].srcset = poem.srcset;
      images[slot].src = poem.src;
    }
    const selected = index === active;
    hang.classList.toggle('is-active', selected);
    card.classList.toggle('is-active', selected);
    card.tabIndex = selected ? 0 : -1;
    if (selected) card.setAttribute('aria-current', 'true');
    else card.removeAttribute('aria-current');

    const behind = distance >= 0;
    const depth = Math.abs(distance);
    const {x, y, z, rotateY} = cardPose(distance, dimensions);
    const opacity = behind ? clamp((3.6 - distance) * 2, 0, 1) : clamp(1 + distance * 1.2, 0, 1);
    hang.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg)`;
    hang.style.opacity = String(opacity);
    hang.style.zIndex = String(distance < 0 ? 1300 + Math.round(depth * 10) : 1200 - Math.round(distance * 10));
    hang.style.pointerEvents = depth < 0.45 ? '' : 'none';
    hang.style.visibility = opacity > 0.001 && stage.classList.contains('is-ready') ? 'visible' : 'hidden';

    if (!reduceMotion && dt) {
      springs[slot] = stepSpring(springs[slot], dt, clamp(-movement * 70, -8, 8) / (1 + depth * 0.45));
    } else if (reduceMotion) springs[slot] = {angle: 0, velocity: 0};
    const angle = springs[slot].angle;
    swings[slot].style.transform = `rotateZ(${angle.toFixed(3)}deg)`;
    swinging ||= springs[slot].angle !== 0 || springs[slot].velocity !== 0;


  }
  updateFeature(active);
  return swinging;
}

function tick(now: number) {
  const dt = Math.min(Math.max((now - lastTime) / 1000, 1 / 120), 1 / 30);
  lastTime = now;
  const previous = pos;
  const motion = reduceMotion ? {position: target, velocity: 0} : followPosition({position: pos, velocity: scrollVelocity}, target, dt);
  pos = motion.position;
  scrollVelocity = motion.velocity;
  const swinging = render(dt, pos - previous);
  if (pos === target && scrollVelocity === 0 && !swinging) {
    running = false;
    return;
  }
  raf = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  lastTime = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}

function snap(delay = 260) {
  window.clearTimeout(snapTimer);
  snapTimer = window.setTimeout(() => {
    target = Math.round(target);
    start();
  }, delay);
}

function markReady() {
  stage?.classList.add('is-ready');
  start();
}

function replayFeature() {
  if (!featureTitle || current < 0) return;
  setWords(featureTitle, catalog[current]?.title ?? '');
  featureTitle.setAttribute('aria-label', catalog[current]?.title ?? '');
}

function completeEntry(focus = true) {
  if (!intro) return;
  intro.classList.add('is-hidden');
  intro.setAttribute('aria-hidden', 'true');
  root.classList.add('has-entered');
  root.classList.remove('intro-skip');
  shell?.removeAttribute('inert');
  try {
    sessionStorage.setItem('scratch:entered', '1');
  } catch {
    /* no-op */
  }
  markReady();
  if (focus) main?.focus({ preventScroll: true });
}

function enter(event?: Event) {
  event?.preventDefault();
  if (leaving) return;
  leaving = true;

  root.classList.add('is-entering');
  intro?.classList.add('is-leaving');
  shell?.removeAttribute('inert');
  window.setTimeout(markReady, reduceMotion ? 0 : 260);
  window.setTimeout(replayFeature, reduceMotion ? 0 : 380);

  window.setTimeout(
    () => {
      completeEntry();
      try {
        history.replaceState(null, '', `${location.pathname}#arsip`);
      } catch {
        /* no-op */
      }
      leaving = false;
    },
    reduceMotion ? 30 : 1350,
  );
}

function showIntro() {
  if (!intro) return;
  try {
    sessionStorage.removeItem('scratch:entered');
  } catch {
    /* no-op */
  }
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch {
    /* no-op */
  }
  leaving = false;
  root.classList.remove('has-entered', 'intro-skip', 'is-entering');
  intro.classList.remove('is-hidden', 'is-leaving');
  intro.removeAttribute('aria-hidden');
  shell?.setAttribute('inert', '');
  window.scrollTo(0, 0);
  window.setTimeout(() => enterLink?.focus({ preventScroll: true }), 50);
}

// --- Intro -------------------------------------------------------------
if (root.classList.contains('intro-skip')) {
  completeEntry(false);
} else {
  shell?.setAttribute('inert', '');
}

enterLink?.addEventListener('click', enter);
replayButton?.addEventListener('click', showIntro);

// --- Arsip 3D ----------------------------------------------------------
if (stage && cards.length > 0) {
  const updateScrollState = () => {
    pageScrolls = document.documentElement.scrollHeight > window.innerHeight + 4;
    measureStage();
  };

  updateScrollState();
  render();

  window.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || catalog.length < 2) return;
      if (intro && !root.classList.contains('has-entered')) return;
      const targetEl = event.target as HTMLElement | null;
      if (targetEl?.closest('input, textarea, select')) return;

      const isDesktop = window.matchMedia('(min-width: 901px)').matches;
      // Di mobile kalau halaman memang bisa digulir vertikal, jangan intersep jika di luar stage
      if (!isDesktop && pageScrolls && !stage.contains(targetEl)) return;

      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      void sound.unlock();

      const dir = Math.sign(delta);
      travelDirection = dir || travelDirection;

      // Deteksi discrete mouse wheel (line mode, page mode, atau pixel delta integer khas mouse notch)
      const isDiscreteWheel = event.deltaMode !== 0 || (Math.abs(delta) >= 40 && Number.isInteger(delta));

      if (isDiscreteWheel) {
        window.clearTimeout(snapTimer);
        const travel = wheelTravel(delta, event.deltaMode, dimensions.height);
        // Untuk 1 notch biasa, melangkah 1 kartu; untuk putaran cepat, ikuti travel terdekat
        const steps = Math.abs(travel) >= 1.5 ? Math.round(travel) : dir;
        target = Math.round(target) + steps;
        start();
      } else {
        // Trackpad dengan pergerakan kontinu
        target += wheelTravel(delta, event.deltaMode, dimensions.height);
        start();
        snap(150);
      }
    },
    { passive: false },
  );

  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (catalog.length < 2) return;
    void sound.unlock();
    window.clearTimeout(snapTimer);
    dragging = true;
    pointerStartX = event.clientX;
    pointerStartTarget = target;
    pointerMoved = 0;
    stage.classList.add('is-grabbing');
  });

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const dx = event.clientX - pointerStartX;
    pointerMoved = Math.max(pointerMoved, Math.abs(dx));
    if (pointerMoved < 4) return;

    const cardWidth = hangs[0]?.offsetWidth || 360;
    const nextTarget = pointerStartTarget - dx / (cardWidth * 0.62);
    travelDirection = Math.sign(nextTarget - target) || travelDirection;
    target = nextTarget;
    start();
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-grabbing');
    window.clearTimeout(snapTimer);

    if (pointerMoved > 7) {
      suppressClick = true;
      target = Math.round(target);
      start();
      window.setTimeout(() => {
        suppressClick = false;
      }, 80);
    }
  };

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  stage.addEventListener(
    'click',
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  const handleArrowKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const el = event.target;
    if (el instanceof HTMLElement && el.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (intro && !root.classList.contains('has-entered')) return;

    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (direction === 0 || catalog.length < 2) return;
    if (el instanceof HTMLElement && el.closest('button')) return;
    event.preventDefault();
    void sound.unlock();
    travelDirection = direction;
    target = Math.round(target) + direction;
    start();
  };

  window.addEventListener('keydown', handleArrowKey);

  const resizeObserver = new ResizeObserver(() => {
    updateScrollState();
    render();
    start();
  });
  resizeObserver.observe(stage);

  window.addEventListener('resize', () => {
    updateScrollState();
    render();
  });
}
