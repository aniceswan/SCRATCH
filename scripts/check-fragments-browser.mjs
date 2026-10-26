import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL??'http://127.0.0.1:4326';
const slug='jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir';
const title='Jikalau Aku Adalah Rembulan, Akankah Kau Menemaniku Sampai Akhir';
const source=(await readFile(new URL('../content-source/fragments/rembulan.txt',import.meta.url),'utf8')).trim().split(/\n\n+/);
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});}
async function headerFits(page){
 const boxes=await page.locator('.topbar .brand,.topbar__actions').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 assert.ok(boxes[0].right<=boxes[1].left+1,'brand and navigation do not overlap');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
 for(const box of boxes)assert.ok(box.left>=0&&box.right<=await page.evaluate(()=>innerWidth),'header remains within the viewport');
}
try{
 for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:320,height:568},{width:320,height:480},{width:844,height:390}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce',isMobile:viewport.width<600,hasTouch:viewport.width<600});
  const errors=[];page.on('pageerror',error=>{if(error.message!=='Transition was aborted because of invalid state. ViewTransition opt-in disabled')errors.push(error.message);});
  await page.goto(base+'/#arsip');await page.waitForSelector('.stage.is-ready');await settle(page);await headerFits(page);
  assert.ok(await page.getByRole('link',{name:'Buka poems'}).isVisible());
  assert.ok(await page.getByRole('link',{name:'Buka fragments'}).isVisible());
  assert.doesNotMatch(await page.locator('.topbar').innerText(),/series/i);
  await page.getByRole('link',{name:'Buka fragments'}).click();await page.waitForURL('**/fragments/');await settle(page);
  assert.equal(await page.title(),'Fragments | SCRATCH');assert.equal(await page.locator('h1').textContent(),'fragments');
  assert.equal(await page.locator('[data-series-card]').count(),0,'fragments has no intermediate series grouping');
  assert.equal(await page.locator('[data-fragment-card]').count(),1,'only the supplied fragment is listed');
  assert.equal(await page.locator('.fragment-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),2,'two cards per row on desktop and mobile');
  const card=page.locator('[data-fragment-card]');assert.equal(await card.locator('h2').textContent(),title);
  const image=card.locator('img');await image.evaluate(node=>node.decode());
  const box=await page.locator('.fragment-card__image').boundingBox();assert.ok(Math.abs(box.width/box.height-4/3)<.01,'cover is landscape 4:3');
  await headerFits(page);
  await page.waitForTimeout(350);
  await page.screenshot({path:`/tmp/scratch-fragments-index-${viewport.width}x${viewport.height}.png`});
  await card.click();await page.waitForURL(`**/fragments/${slug}/`);await settle(page);
  assert.equal(await page.locator('main h1').textContent(),title);
  assert.deepEqual((await page.locator('.fragment-body p').allTextContents()).map(text=>text.trim()),source,'every supplied paragraph is intact');
  assert.equal(await page.locator('.poem__visual').count(),0,'the illustration is the background rather than a separate column');
  const background=page.locator('.fragment-scene');
  assert.equal(await background.evaluate(node=>getComputedStyle(node).position),'fixed');
  const opacity=await background.locator('img').evaluate(node=>Number(getComputedStyle(node).opacity));assert.ok(opacity>=.06&&opacity<=.15,'the image is deliberately faint');
  await background.locator('img').evaluate(node=>node.decode());
  await headerFits(page);
  await page.waitForTimeout(350);
  await page.screenshot({path:`/tmp/scratch-fragments-reader-${viewport.width}x${viewport.height}.png`});
  const before=await background.boundingBox();
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  const after=await background.boundingBox();assert.ok(Math.abs(after.y-before.y)<1&&Math.abs(after.height-viewport.height)<1,'background remains viewport-sized during reading');
  assert.ok(await page.evaluate(()=>scrollY>0),'the full fragment can be read by scrolling');
  assert.equal(await page.locator('html').evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(244, 243, 236)','fast scroll retains the paper canvas');
  await page.locator('.fragment-reading-nav a').first().click();await page.waitForURL('**/fragments/');await settle(page);
  await page.getByRole('link',{name:'Buka poems'}).click();await page.waitForURL('**/series/');await settle(page);
  assert.equal(await page.title(),'Poems | SCRATCH');assert.equal(await page.locator('h1').textContent(),'poems');assert.equal(await page.locator('[data-series-card]').count(),2,'existing poem collections remain intact');
  assert.deepEqual(errors,[]);await page.close();console.log(`PASS fragments ${viewport.width}×${viewport.height}: navigation, 2-column 4:3 cards, exact prose, faint fixed background, return links`);
 }
 const alternate=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await alternate.goto(base+'/v3/fragments/');assert.equal(await alternate.locator('[data-fragment-card]').getAttribute('href'),`/v3/fragments/${slug}/`);
 await alternate.locator('[data-fragment-card]').click();await alternate.waitForURL(`**/v3/fragments/${slug}/`);
 assert.equal(await alternate.getByRole('link',{name:'Kembali ke fragments'}).getAttribute('href'),'/v3/fragments/');
 await alternate.goto(base+'/classic/#arsip');assert.ok(await alternate.getByRole('link',{name:'Buka series puisi'}).isVisible());assert.equal(await alternate.locator('.fragments-entry').count(),0,'the preserved classic design is unchanged');
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(base+'/fragments/');await nojs.locator('[data-fragment-card]').click();await nojs.waitForURL(`**/fragments/${slug}/`);
 assert.deepEqual((await nojs.locator('.fragment-body p').allTextContents()).map(text=>text.trim()),source);
 assert.ok(await nojs.getByRole('link',{name:'Kembali ke fragments'}).isVisible());
 console.log('PASS v3 scope, classic preservation and complete no-JavaScript reading');
}finally{await browser.close();}
