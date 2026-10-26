import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage']});
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4326';
const widths = [{width:1440,height:1000}, {width:1440,height:600}, {width:768,height:1024}, {width:390,height:844}, {width:320,height:568}];
const visibleCards = page => page.locator('[data-edition-card]:visible');
async function settle(page) {
 await page.evaluate(async () => {
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await Promise.all([...document.images].filter(img => img.getClientRects().length && (img.loading !== 'lazy' || img.getBoundingClientRect().top < innerHeight)).map(img => img.decode().catch(() => {})));
 });
}
async function fits(page, context) {
 assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${context}: no horizontal overflow`);
 assert.equal(await page.locator('main h1').count(), 1, `${context}: one primary heading`);
}
async function checkOpening(page, viewport, javaScriptEnabled = true) {
 await page.goto(base+'/v2/');
 // Animation callbacks do not run when browser JavaScript is disabled.
 if (javaScriptEnabled) await settle(page);
 await fits(page, 'opening '+viewport.width);
 assert.equal(await page.locator('h1').textContent(), 'scratch*');
 assert.equal(await page.locator('main img').count(),0,'the opening contains no artwork gallery');
 assert.equal(await page.locator('main a').count(),1,'one clear action enters the archive');
 assert.equal(await page.locator('.edition-header').count(),0,'the opening has no duplicate navigation');
 assert.equal(await page.locator('.opening__note').innerText(),'a collection of thoughts, regrets,\nand whatever remains.');
 for (const selector of ['.opening__ink','.opening__wordmark','.opening__note','.opening__enter','.edition-footer p','.classic-link']) {
  const box=await page.locator(selector).boundingBox();
  assert.ok(box.y>=8 && box.y+box.height<=viewport.height-8,`${selector} fits vertically at ${viewport.width}×${viewport.height}`);
  assert.ok(box.x>=8 && box.x+box.width<=viewport.width-8,`${selector} fits horizontally at ${viewport.width}×${viewport.height}`);
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight && document.body.scrollHeight<=innerHeight && document.querySelector('main').scrollHeight<=document.querySelector('main').clientHeight),'content fits naturally within one screen');
 await page.mouse.wheel(0,1000);
 await page.keyboard.press('PageDown');
 await page.evaluate(()=>scrollTo({top:1000,behavior:'instant'}));
 assert.equal(await page.evaluate(()=>scrollY),0,'wheel, keyboard and programmatic scrolling cannot move the opening');
}
try {
 for (const viewport of widths) {
  const page = await browser.newPage({viewport, reducedMotion:'reduce', isMobile:viewport.width<600, hasTouch:viewport.width<600});
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await checkOpening(page,viewport);
  if ([1440,390,320].includes(viewport.width) && viewport.height !== 600) {
   await page.screenshot({path:`/tmp/scratch-edition-home-${viewport.width}.png`});
   await page.screenshot({path:`/tmp/scratch-edition-home-full-${viewport.width}.png`,fullPage:true});
  }
  await page.keyboard.press('Tab');
  assert.ok(await page.locator('.opening__enter').evaluate(node=>node===document.activeElement),'the opening action is the first keyboard stop');
  await page.keyboard.press('Enter'); await page.waitForURL('**/v2/archive/');
  await settle(page); await fits(page, 'archive '+viewport.width);
  assert.equal(await visibleCards(page).count(),46);
  const gridColumns=await page.locator('.edition-poem-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  assert.equal(gridColumns, viewport.width>900?3:viewport.width>600?2:1);
  await page.locator('[data-filter="recursion"]').click();
  assert.equal(await visibleCards(page).count(),6); assert.match(page.url(), /series=recursion/);
  const search=page.getByRole('searchbox',{name:'Cari puisi'});
  await search.fill('PI'); assert.equal(await visibleCards(page).count(),1); assert.equal(await visibleCards(page).locator('h2').textContent(),'PI');
  await search.fill('no matching page 123'); assert.equal(await visibleCards(page).count(),0); assert.ok(await page.locator('[data-edition-empty]').isVisible());
  await page.locator('[data-edition-reset]').click(); assert.equal(await visibleCards(page).count(),46); assert.ok(await search.evaluate(node => node === document.activeElement));
  await page.goto(base+'/v2/archive/?series=refraction&q=AMBANG'); await settle(page);
  assert.equal(await visibleCards(page).count(),1); assert.equal(await visibleCards(page).locator('h2').textContent(),'AMBANG');
  await page.locator('[data-random-poem]').click(); await page.waitForURL('**/v2/puisi/ambang/');
  await page.goto(base+'/v2/series/'); await settle(page); await fits(page,'series '+viewport.width);
  assert.equal(await page.locator('[data-edition-series]').count(),2);
  assert.equal(await page.locator('[data-edition-series] img').evaluateAll(nodes => nodes.every(img => img.complete && img.naturalWidth>0)),true,'both series covers load');
  await page.locator('main a[href="/v2/series/recursion/"]').click(); await page.waitForURL('**/v2/series/recursion/'); await settle(page);
  assert.equal(await visibleCards(page).count(),6); await fits(page,'recursion '+viewport.width);
  await page.locator('[data-edition-card][href$="/pi/"]').click(); await page.waitForURL('**/v2/series/recursion/puisi/pi/'); await settle(page);
  assert.match(await page.locator('.reader-art figcaption').textContent(),/04 \/ 06/);
  assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/v2/series/recursion/puisi/hukum-newton/');
  assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/v2/series/recursion/puisi/rotasi/');
  assert.equal(await page.locator('.reader-meta a').getAttribute('href'),'/v2/series/recursion/');
  const body=await page.locator('.reader-body').textContent();
  await page.goto(base+'/series/recursion/puisi/pi/');
  assert.equal(body.trim(),(await page.locator('.poem__body').textContent()).trim(),'the original poem text is preserved');
  await page.goto(base+'/v2/puisi/halaman-nol/'); await settle(page); await fits(page,'reader '+viewport.width);
  const top = await page.locator('.reader-art img').boundingBox();
  if (viewport.width>900) {
   const title=await page.locator('.reader-article h1').boundingBox();
   assert.ok(Math.abs(title.y-top.y)<1,'desktop illustration aligns with the initial title');
   await page.evaluate(() => scrollTo({top:800,behavior:'instant'}));
   const after=await page.locator('.reader-art img').boundingBox();
   assert.ok(Math.abs(after.y-top.y)<1,'desktop illustration remains fixed while reading');
   assert.ok(after.y+after.height <= viewport.height-20,'illustration fits short desktop windows');
  } else {
   await page.evaluate(() => scrollTo({top:500,behavior:'instant'}));
   const after=await page.locator('.reader-art img').boundingBox(); assert.ok(Math.abs(top.y-after.y-500)<1,'mobile illustration scrolls naturally');
  }
  await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
  const control=page.locator('[data-soundtrack-play]');
  await page.waitForFunction(() => document.querySelector('[data-soundtrack-play]')?.disabled===false,null,{timeout:25000});
  assert.equal(await control.getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('[data-youtube-frame]').count(),1,'the visible YouTube player remains below the poem');
  if ([1440,390].includes(viewport.width) && viewport.height!==600) {
   await control.click();
   await page.waitForFunction(() => document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
   await control.click();
   await page.waitForFunction(() => document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
   await page.screenshot({path:`/tmp/scratch-edition-reader-${viewport.width}.png`});
  }
  await page.evaluate(() => scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await fits(page,'reader bottom '+viewport.width);
  assert.equal(await page.locator('html').evaluate(node => getComputedStyle(node).backgroundColor),'rgb(244, 243, 236)');
  assert.deepEqual(errors,[]);
  console.log(`PASS editorial ${viewport.width}×${viewport.height}: design, search, filters, covers, series, exact poem, illustration, soundtrack, no overflow`);
  await page.close();
 }
 for (const viewport of [{width:2560,height:1440},{width:1280,height:720},{width:320,height:480},{width:320,height:360},{width:844,height:390},{width:568,height:320}]) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  await checkOpening(page,viewport);
  console.log(`PASS single-screen opening: ${viewport.width}×${viewport.height}`);
  await page.close();
 }
 const motion=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
 await motion.goto(base+'/v2/');
 await motion.locator('.opening__content').evaluate(async node=>{await Promise.all(node.getAnimations().map(animation=>animation.finished));});
 assert.equal(await motion.locator('.opening__enter').isVisible(),true,'normal-motion opening remains visible after arrival');
 assert.equal(await motion.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true);
 await motion.close();
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await checkOpening(nojs,{width:390,height:844},false);
 await nojs.locator('.opening__enter').click(); await nojs.waitForURL('**/v2/archive/');
 assert.equal(await visibleCards(nojs).count(),46,'the single-screen opening also enters the archive without JavaScript');
 await nojs.goto(base+'/v2/archive/'); assert.equal(await visibleCards(nojs).count(),46); assert.equal(await nojs.locator('[data-edition-tools]').isVisible(),false);
 await nojs.goto(base+'/v2/puisi/pi/'); assert.equal(await nojs.locator('[data-youtube-frame]').count(),1); assert.ok(await nojs.locator('[data-poem-nav="next"]').isVisible());
 const old=await browser.newPage({viewport:{width:1440,height:900}});
 await old.goto(base+'/classic/?intro=1');
 assert.ok(await old.locator('.intro').isVisible());
 assert.match(await old.locator('.intro__title').evaluate(node => getComputedStyle(node).fontFamily),/Fredoka/);
 assert.equal(await old.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.some(node => node.href.includes('Edition.'))),false);
 console.log('PASS original edition remains unchanged; new archive and reader work without JavaScript');
} finally {await browser.close();}
