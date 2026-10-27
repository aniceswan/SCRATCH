const header = document.querySelector<HTMLElement>('.topbar--paper');
const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = header?.querySelector<HTMLElement>('[data-site-navigation]');

if (header && toggle && navigation) {
  const mobile = window.matchMedia('(max-width: 640px)');
  let open = false;
  const setOpen = (next: boolean, restoreFocus = false) => {
    open = mobile.matches && next;
    header.toggleAttribute('data-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    navigation.inert = mobile.matches && !open;
    if (restoreFocus) toggle.focus({preventScroll: true});
  };
  toggle.addEventListener('click', () => setOpen(!open));
  header.querySelector('[data-search-open]')?.addEventListener('click', () => setOpen(false));
  document.addEventListener('pointerdown', event => {
    if (open && event.target instanceof Node && !header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('focusin', event => {
    if (open && event.target instanceof Node && !header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {event.preventDefault(); setOpen(false, true);}
  });
  navigation.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a, button')) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);
}

export {};
