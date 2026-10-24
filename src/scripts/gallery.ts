import { cardWindow, stepSpring, wrapIndex, wheelTravel, followPosition, cardPose, projectPoint, clotheslinePoint, clothespinPoint } from '../lib/gallery.js';
import { ClotheslineSound } from '../lib/clothesline-sound';

interface GalleryPoem { title: string; excerpt: string; url: string; alt: string; src: string; srcset: string; }
const catalog: GalleryPoem[] = JSON.parse(document.querySelector('[data-poems]')?.textContent ?? '[]');
const sound = new ClotheslineSound();
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
const ropes = [document.querySelector<SVGPathElement>('[data-rope-left]')!, document.querySelector<SVGPathElement>('[data-rope-right]')!];
const tethers = hangs.map((_, slot) => ({
  group: document.querySelector<SVGGElement>(`[data-tether-slot="${slot}"]`)!,
  left: document.querySelector<SVGPathElement>(`[data-tether-slot="${slot}"] [data-tether-left]`)!,
  right: document.querySelector<SVGPathElement>(`[data-tether-slot="${slot}"] [data-tether-right]`)!,
}));
let dimensions = {width: 0, height: 0, cardWidth: 0, cardHeight: 0};

function measureStage() {
  if (!stage || !hangs.length) return;
  dimensions = {width: stage.clientWidth, height: stage.clientHeight,
    cardWidth: hangs[0].offsetWidth, cardHeight: hangs[0].offsetHeight};
  clothesline?.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
  for (const [rail, side] of [[0, -1], [1, 1]]) {
    const points = Array.from({length: 73}, (_, i) => projectPoint(clotheslinePoint(-4 + i * 0.25, side, dimensions), dimensions));
    ropes[rail]?.setAttribute('d', points.map((point, i) => `${i ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' '));
  }
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
    const opacity = behind ? clamp((4.2 - distance) * 0.8, 0, 1) * clamp(1 - distance * 0.075, 0, 1) : clamp(1 + distance * 1.2, 0, 1);
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

    // Match the rope and moving clips to the same 3D camera as the cards.
    for (const [side, thread] of [[-1, tethers[slot].left], [1, tethers[slot].right]] as const) {
      const anchor = projectPoint(clotheslinePoint(distance, side, dimensions), dimensions);
      const pin = projectPoint(clothespinPoint(distance, side, angle, dimensions), dimensions);
      thread.setAttribute('d', `M ${anchor.x.toFixed(2)} ${anchor.y.toFixed(2)} Q ${((anchor.x + pin.x) / 2 + Math.sin(angle * Math.PI / 180) * 6).toFixed(2)} ${((anchor.y + pin.y) / 2).toFixed(2)} ${pin.x.toFixed(2)} ${pin.y.toFixed(2)}`);
    }
    tethers[slot].group.style.opacity = String(opacity * 0.75);
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

  stage.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || catalog.length < 2) return;
      // Kalau halaman memang bisa digulir, jangan rebut wheel dari scroll.
      if (pageScrolls) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      void sound.unlock();
      travelDirection = Math.sign(delta) || travelDirection;
      target += wheelTravel(delta, event.deltaMode, dimensions.height);
      start();
      snap(400);
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
