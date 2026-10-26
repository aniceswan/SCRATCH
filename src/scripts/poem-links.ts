import { clotheslineSound as sound } from '../lib/clothesline-sound';

let navigating = false;
const poemLink = (target: EventTarget | null) => target instanceof Element
  ? target.closest<HTMLAnchorElement>('a[data-poem-card], a[data-poem-nav], a[data-series-poem], a[data-fragment-card]') : null;

// Start loading at the gesture so the recording is ready by the subsequent click.
document.addEventListener('pointerdown', event => {
  if (poemLink(event.target)) void sound.unlock();
}, {passive: true});
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && poemLink(event.target)) void sound.unlock();
});

document.addEventListener('click', event => {
  const link = poemLink(event.target);
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  void sound.unlock().then(() => sound.play(1, true));
  // Let the clip release be heard while the browser begins the poem transition.
  // An unavailable recording cannot hold up navigation.
  window.setTimeout(() => location.assign(link.href), 180);
});

window.addEventListener('pageshow', () => { navigating = false; });
