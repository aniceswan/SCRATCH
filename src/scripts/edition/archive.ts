const tools = document.querySelector<HTMLElement>('[data-edition-tools]');
const search = document.querySelector<HTMLInputElement>('[data-edition-search]');
const cards = [...document.querySelectorAll<HTMLAnchorElement>('[data-edition-card]')];
const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const count = document.querySelector<HTMLElement>('[data-edition-count]');
const empty = document.querySelector<HTMLElement>('[data-edition-empty]');
const reset = document.querySelector<HTMLButtonElement>('[data-edition-reset]');
const random = document.querySelector<HTMLAnchorElement>('[data-random-poem]');
const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id').trim();

if (tools && search && count && empty) {
  let active = 'all';
  const params = new URLSearchParams(location.search);
  const requested = params.get('series');
  if (filters.some(filter => filter.dataset.filter === requested)) active = requested!;
  search.value = params.get('q') ?? '';
  const apply = () => {
    const query = normalize(search.value);
    let matches = 0;
    for (const card of cards) {
      const visible = (active === 'all' || card.dataset.series === active) && normalize(card.dataset.search ?? '').includes(query);
      card.hidden = !visible;
      if (visible) matches++;
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === active));
    count.textContent = `${String(matches).padStart(2, '0')} ${matches === 1 ? 'POEM' : 'POEMS'}`;
    empty.hidden = matches !== 0;
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    if (active !== 'all') url.searchParams.set('series', active); else url.searchParams.delete('series');
    history.replaceState(null, '', url);
  };
  search.addEventListener('input', apply);
  filters.forEach(filter => filter.addEventListener('click', () => {active = filter.dataset.filter ?? 'all'; apply();}));
  reset?.addEventListener('click', () => {active = 'all'; search.value = ''; apply(); search.focus();});
  random?.addEventListener('click', () => {
    const visible = cards.filter(card => !card.hidden);
    if (visible.length) random.href = visible[Math.floor(Math.random() * visible.length)].href;
  });
  tools.hidden = false;
  apply();
}
