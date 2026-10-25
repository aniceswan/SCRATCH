import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const slug='arsip-cahaya-yang-salah-arah';
const seriesPath=`/series/${slug}/`;
const readerPath=`${seriesPath}puisi/`;
const errors=[];
async function screenshot(page, options) {
 await page.evaluate(async()=>{
  await document.fonts.ready;
  for(let pass=0;pass<2;pass++) {
   await new Promise(resolve=>requestAnimationFrame(resolve));
   await Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{})));
  }
 });
 await page.screenshot(options);
}
try {
 const desktop=await browser.newContext({viewport:{width:1440,height:1000}});
 await desktop.addInitScript(()=>{
  const start=AudioBufferSourceNode.prototype.start;
  window.__sounds=0;
  AudioBufferSourceNode.prototype.start=function(...args){window.__sounds++;sessionStorage.setItem('__seriesSoundStarts',String(Number(sessionStorage.getItem('__seriesSoundStarts')||0)+1));return start.apply(this,args);};
 });
 const page=await desktop.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#arsip');
 const entry=page.getByRole('link',{name:'Buka series puisi'});
 assert.equal(await entry.count(),1,'archive has a treasure-inspired SERIES link');
 assert.equal(await entry.getAttribute('href'),'/series/');
 assert.ok(await page.locator('[data-replay-intro]').isVisible(),'BACK remains available');
 const entryBox=await entry.boundingBox();
 assert.ok(entryBox.height>=44,'series entry has a comfortable touch target');
 await screenshot(page,{path:'/tmp/scratch-series-entry-desktop.png'});
 await entry.click();
 await page.waitForURL('**/series/');
 assert.equal(await page.locator('[data-series-card]').count(),1,'only the first series is published');
 assert.match(await page.locator('[data-series-title]').innerText(),/arsip cahaya yang salah arah/i);
 assert.match(await page.locator('[data-series-count]').innerText(),/^40 puisi$/i);
 assert.equal(await page.locator('[data-series-card] p').count(),1,'catalog card has only the count as supporting copy');
 const cover=page.locator('[data-series-card] img');
 await cover.evaluate(img=>img.decode());
 assert.match(await cover.getAttribute('alt'),/arang/i);
 await screenshot(page,{path:'/tmp/scratch-series-catalog-desktop.png',fullPage:true});
 await page.locator('[data-series-card]').click();
 await page.waitForURL(`**${seriesPath}`);
 const cards=page.locator('[data-series-poem]');
 assert.equal(await cards.count(),40);
 assert.equal((await cards.first().locator('[data-poem-number]').innerText()).trim(),'01');
 assert.match(await cards.first().innerText(),/halaman nol/i);
 assert.match(await cards.first().locator('[data-poem-excerpt]').innerText(),/^Di penghujung kisah, kutemukan jalan yang kehilangan arah\.$/);
 assert.equal(await cards.first().getAttribute('href'),readerPath+'halaman-nol/');
 assert.equal(await cards.last().getAttribute('href'),readerPath+'katalog-benda-yang-tak-jadi/');
 const boxes=await Promise.all([0,1,2,3].map(i=>cards.nth(i).boundingBox()));
 assert.ok(Math.abs(boxes[0].y-boxes[1].y)<2&&Math.abs(boxes[1].y-boxes[2].y)<2&&boxes[3].y>boxes[0].y,'desktop grid has three cards per row');
 assert.equal(await page.locator('[data-stage]').count(),0,'series uses normal document scrolling');
 await screenshot(page,{path:'/tmp/scratch-series-grid-desktop.png'});
 const soundsBefore=await page.evaluate(()=>Number(sessionStorage.getItem('__seriesSoundStarts')||0));
 await cards.first().click();
 await page.waitForURL(`**${readerPath}halaman-nol/`);
 assert.ok(await page.evaluate(()=>Number(sessionStorage.getItem('__seriesSoundStarts')||0))>soundsBefore,'opening a poem from the grid plays the existing sound');
 assert.equal((await page.locator('.poem__number').innerText()).trim(),'01 / 40');
 assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),readerPath+'katalog-benda-yang-tak-jadi/');
 assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),readerPath+'grafit/');
 assert.equal(await page.getByRole('link',{name:'Kembali ke series Arsip Cahaya yang Salah Arah'}).getAttribute('href'),seriesPath);
 await page.locator('[data-poem-nav="previous"]').click();
 await page.waitForURL(`**${readerPath}katalog-benda-yang-tak-jadi/`);
 assert.equal((await page.locator('.poem__number').innerText()).trim(),'40 / 40');
 assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),readerPath+'halaman-nol/');
 await page.goto(base+'/puisi/halaman-nol/');
 assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/grafit/','direct poem URL retains archive navigation');
 console.log('PASS series: minimal catalog, all forty excerpts, desktop grid, contextual reader and archive URLs');

 const tablet=await browser.newPage({viewport:{width:820,height:1180}});
 await tablet.goto(base+seriesPath);
 const tabletBoxes=await Promise.all([0,1,2].map(i=>tablet.locator('[data-series-poem]').nth(i).boundingBox()));
 assert.ok(Math.abs(tabletBoxes[0].y-tabletBoxes[1].y)<2&&tabletBoxes[2].y>tabletBoxes[0].y,'tablet grid has two cards per row');
 for(const viewport of [{width:390,height:844},{width:320,height:640},{width:844,height:390}]) {
  const phone=await browser.newPage({viewport,isMobile:true,hasTouch:true});
  await phone.goto(base+'/#arsip');
  assert.ok(await phone.getByRole('link',{name:'Buka series puisi'}).isVisible());
  assert.ok(await phone.locator('[data-replay-intro]').isVisible());
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'archive header does not cause horizontal overflow');
  if(viewport.width===390) await screenshot(phone,{path:'/tmp/scratch-series-entry-mobile.png'});
  await phone.goto(base+'/series/');
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(viewport.width===390) await screenshot(phone,{path:'/tmp/scratch-series-catalog-mobile.png',fullPage:true});
  await phone.locator('[data-series-card]').click();
  await phone.waitForURL(`**${seriesPath}`);
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'grid has no horizontal overflow');
  if(viewport.width<=600) {
   const first=await phone.locator('[data-series-poem]').nth(0).boundingBox();
   const second=await phone.locator('[data-series-poem]').nth(1).boundingBox();
   assert.ok(second.y>first.y+first.height,'phone grid uses a single readable column');
  }
  await phone.locator('[data-series-poem]').last().scrollIntoViewIfNeeded();
  assert.ok(await phone.evaluate(()=>scrollY>0),'all forty poems are reachable through vertical scroll');
  if(viewport.width===390) {
   await phone.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await screenshot(phone,{path:'/tmp/scratch-series-grid-mobile.png'});
  }
  await phone.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(base+'/series/');
 await nojs.locator('[data-series-card]').click();
 await nojs.waitForURL(`**${seriesPath}`);
 assert.equal(await nojs.locator('[data-series-poem]').count(),40);
 await nojs.locator('[data-series-poem]').first().click();
 await nojs.waitForURL(`**${readerPath}halaman-nol/`);
 await nojs.locator('[data-poem-nav="next"]').click();
 await nojs.waitForURL(`**${readerPath}grafit/`);
 assert.equal((await nojs.locator('.poem__number').innerText()).trim(),'02 / 40');
 assert.deepEqual(errors,[]);
 console.log('PASS series: tablet, mobile, small phone, landscape, vertical scroll, deep links and no-JavaScript reading');
} finally { await browser.close(); }
