import { findSearchResults, type SearchEntry } from '../lib/search.js';

const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
const trigger = document.querySelector<HTMLButtonElement>('[data-search-open]');
const input = dialog?.querySelector<HTMLInputElement>('[data-search-input]');
const results = dialog?.querySelector<HTMLUListElement>('[data-search-results]');
const status = dialog?.querySelector<HTMLElement>('[data-search-status]');
const close = dialog?.querySelector<HTMLButtonElement>('[data-search-close]');

if (dialog && trigger && input && results && status && close) {
  const basePath = dialog.dataset.basePath ?? '';
  let entries: SearchEntry[] | null = null;
  let pending: Promise<void> | null = null;
  let failed = false;

  function render() {
    if (!input || !results || !status) return;
    results.replaceChildren();
    if (!entries) {
      status.textContent = failed ? 'Search could not load. Close and reopen to try again.' : 'Loading titles…';
      return;
    }
    if (!input.value.trim()) {
      status.textContent = 'Find a poem, fragment, or series.';
      return;
    }
    const matches = findSearchResults(entries, input.value);
    const visible = matches.slice(0, 20);
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'title' : 'titles'} found${matches.length > 20 ? ' · Showing the first 20' : ''}.` : 'No titles found. Try another word.';
    const list = document.createDocumentFragment();
    for (const entry of visible) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `${basePath}${entry.href}`;
      const title = document.createElement('span');
      title.className = 'search-results__title';
      title.textContent = entry.title;
      const kind = document.createElement('span');
      kind.className = 'search-results__kind';
      kind.textContent = entry.kind;
      link.append(title, kind);
      item.append(link);
      list.append(item);
    }
    results.append(list);
    results.scrollTop = 0;
  }

  function loadIndex() {
    if (entries || pending) return;
    failed = false;
    pending = fetch('/search-index.json').then(async response => {
      if (!response.ok) throw new Error('Search index unavailable');
      entries = await response.json();
    }).catch(() => {failed = true;}).finally(() => {
      pending = null;
      render();
    });
  }

  trigger.addEventListener('click', () => {
    dialog.showModal();
    input.focus({preventScroll: true});
    loadIndex();
    render();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    trigger.focus({preventScroll: true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  input.addEventListener('input', render);
  // Keep archive wheel and arrow controls behind the modal inactive.
  dialog.addEventListener('wheel', event => event.stopPropagation(), {passive: true});
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
      return;
    }
    const links = Array.from(results.querySelectorAll<HTMLAnchorElement>('a'));
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault();
      links[Math.min(current + 1, links.length - 1)].focus();
    } else if (event.key === 'ArrowUp' && current >= 0) {
      event.preventDefault();
      (current > 0 ? links[current - 1] : input).focus();
    } else if (event.key === 'Enter' && event.target === input && links.length && !event.isComposing) {
      event.preventDefault();
      links[0].click();
    }
  });
  window.addEventListener('pageshow', () => {if (dialog.open) dialog.close();});
  trigger.hidden = false;
}
