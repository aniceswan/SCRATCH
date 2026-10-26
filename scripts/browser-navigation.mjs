export async function openNavigation(page) {
 const toggle=page.locator('[data-menu-toggle]');
 if(await toggle.isVisible() && await toggle.getAttribute('aria-expanded')!=='true') await toggle.click();
}
