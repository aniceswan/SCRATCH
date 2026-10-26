import {openNavigation} from './browser-navigation.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import assert from 'node:assert/strict';
import sharp from 'sharp';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const errors=[];
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.addInitScript(()=>{
  localStorage.setItem('scratch:sound', 'off');
  const Native=window.AudioContext;
  window.__createdContexts=[]; window.__soundDurations=[]; window.__soundStarts=0; window.__rafCallbacks=0;
  window.AudioContext=class extends Native { constructor(...args) {super(...args);window.__createdContexts.push(this);} };
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){window.__soundStarts++;sessionStorage.setItem('__testSoundStarts',String(Number(sessionStorage.getItem('__testSoundStarts')||0)+1));window.__soundDurations.push(this.buffer?.duration ?? 0);return start.apply(this,args);};
  const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>raf(t=>{window.__rafCallbacks++;callback(t);});
});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
const index=()=>page.locator('[data-poem-card][aria-current="true"]').getAttribute('data-index');
const waitIndex=async i=>{await page.waitForFunction(i=>document.querySelector('[data-poem-card][aria-current="true"]')?.getAttribute('data-index')===String(i),i);};
await page.goto(base+'/#arsip');
await page.waitForSelector('.stage.is-ready');
assert.equal(await page.title(),'SCRATCH | Poetry');
assert.equal(await page.locator('[data-slide]').count(),9);
assert.ok((await page.locator('.brand__ink').boundingBox()).width<=42,'shorter ink logo');
async function checkCarousel(page) {
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));
 });
 const bounds=await page.evaluate(()=>{
  const selected=document.querySelector('[data-poem-card][aria-current="true"]');
  const active=selected.getBoundingClientRect();
  const current=Number(selected.dataset.index);
  const count=JSON.parse(document.querySelector('[data-poems]').textContent).length;
  const left=document.querySelector(`[data-poem-card][data-index="${(current-1+count)%count}"]`).getBoundingClientRect();
  const right=document.querySelector(`[data-poem-card][data-index="${(current+1)%count}"]`).getBoundingClientRect();
  const stage=document.querySelector('[data-stage]').getBoundingClientRect();
  const feature=document.querySelector('[data-feature]').getBoundingClientRect();
  const controls=document.querySelector('.carousel-controls').getBoundingClientRect();
  return {active,left,right,stage,feature,controls,width:innerWidth,height:innerHeight,
   rope:document.querySelectorAll('[data-rope], [data-rope-post], .poem-card__clip').length};
 });
 assert.equal(bounds.rope,0,'carousel has no clothesline decoration');
 assert.ok(bounds.active.width>bounds.left.width&&bounds.active.width>bounds.right.width,'center card is larger than both neighbors');
 assert.ok(Math.abs(bounds.left.width-bounds.right.width)<2,'neighbor sizes are symmetric');
 const center=bounds.active.x+bounds.active.width/2;
 assert.ok(bounds.left.x+bounds.left.width/2<center&&bounds.right.x+bounds.right.width/2>center);
 assert.ok(Math.abs(center-(bounds.stage.x+bounds.stage.width/2))<2,'active card sits at the horizontal center of its carousel');
 const sideBySide=bounds.feature.right<=bounds.stage.left+1;
 if(bounds.width>900) assert.ok(sideBySide,'desktop retains the heading on the left and carousel on the right');
 if(sideBySide) assert.ok(bounds.feature.x<bounds.stage.x,'heading stays to the left');
 assert.ok(bounds.left.x+bounds.left.width>bounds.active.x+bounds.active.width*.3,'left card overlaps closely');
 assert.ok(bounds.right.x<bounds.active.x+bounds.active.width*.7,'right card overlaps closely');
 assert.ok(bounds.left.x+bounds.left.width>bounds.active.x+bounds.active.width*.6,'left neighbor is tightly layered behind the center');
 assert.ok(bounds.right.x<bounds.active.x+bounds.active.width*.4,'right neighbor is tightly layered behind the center');
 const edges=await page.evaluate(()=>{
  const stage=document.querySelector('[data-stage]').getBoundingClientRect();
  return [...document.querySelectorAll('[data-slide]')].filter(el=>Number(getComputedStyle(el).opacity)>.01).map(el=>{
   const box=el.getBoundingClientRect();
   return box.left>=stage.left+8 && box.right<=stage.right-8;
  });
 });
 assert.ok(edges.every(Boolean),'all visible cards clear the carousel boundaries');
 assert.ok(bounds.active.y>=bounds.stage.y-1,'card stays below the poem heading');
 assert.ok(bounds.active.y+bounds.active.height<bounds.controls.y,'controls do not cover the artwork');
 assert.ok(bounds.controls.y+bounds.controls.height<=bounds.height,'controls remain inside the viewport');
 return bounds;
}
await checkCarousel(page);
assert.match(await page.locator('.copyright').innerText(),/© 2026 scratch/);
assert.equal(await page.locator('footer').count(),0);
assert.match(await page.locator('[data-replay-intro]').innerText(),/BACK/);

assert.equal(await index(),'0');
assert.equal((await page.locator('[data-feature-number]').innerText()).trim(),'01 / 46');
assert.equal(await page.evaluate(()=>window.__createdContexts.length),0,'no audio on initial load');
await page.locator('[data-gallery-next]').click(); await waitIndex(1);
await page.waitForTimeout(1000);
await page.locator('[data-gallery-prev]').click(); await waitIndex(0);
await page.waitForTimeout(1000);
const rightNeighbor=page.locator('[data-poem-card][data-index="1"]');
const rightBounds=await rightNeighbor.boundingBox();
await page.mouse.click(rightBounds.x+rightBounds.width*.98,rightBounds.y+rightBounds.height*.5); await waitIndex(1);
assert.equal(new URL(page.url()).pathname,'/','clicking the right neighbor selects it without opening a poem');
await page.waitForTimeout(1000);
const leftNeighbor=page.locator('[data-poem-card][data-index="0"]');
const leftBounds=await leftNeighbor.boundingBox();
await page.mouse.click(leftBounds.x+leftBounds.width*.02,leftBounds.y+leftBounds.height*.5); await waitIndex(0);
assert.equal(new URL(page.url()).pathname,'/','clicking the left neighbor selects it without opening a poem');

await page.keyboard.press('ArrowLeft'); await waitIndex(45);
assert.equal(await page.locator('[data-poem-card][aria-current="true"]').getAttribute('href'),'/puisi/normal/');
await page.waitForFunction(()=>{const i=document.querySelector('[aria-current="true"] img');return i?.complete&&i.naturalWidth>0;});
assert.match(await page.locator('[data-poem-card][aria-current="true"] img').evaluate(i=>i.currentSrc),/normal/);
await page.keyboard.press('ArrowRight');await waitIndex(0);
await page.keyboard.press('ArrowRight');await waitIndex(1);
assert.match(await page.locator('[data-feature-title]').getAttribute('aria-label'),/GRAFIT/);
assert.ok(await page.evaluate(()=>window.__soundStarts)>0,'real Web Audio sources start after a gesture');
assert.ok(await page.evaluate(()=>window.__soundDurations.every(duration=>duration>.25&&duration<.5)),'uses the real recorded hanger excerpts');
for(let i=0;i<26;i++) await page.keyboard.press('ArrowRight');
await waitIndex(27);
assert.equal(await page.locator('[data-slide]').count(),9);
assert.equal(await page.locator('[data-sound-toggle]').count(),0,'sound is always on, with no toggle');
const sounds=await page.evaluate(()=>window.__soundStarts);
await page.locator('[data-stage]').focus();
await page.keyboard.press('ArrowRight');await waitIndex(28);
await page.waitForFunction(sounds=>window.__soundStarts>sounds,sounds);
await page.reload();await page.waitForSelector('.stage.is-ready');
assert.equal(await page.locator('[data-sound-toggle]').count(),0);
assert.equal(await page.evaluate(()=>window.__createdContexts.length),0,'reload stays silent until a gesture');
await page.locator('[data-stage]').focus();
await page.keyboard.press('ArrowRight');await waitIndex(1);await page.waitForTimeout(700);
const box=await page.locator('[data-poem-card][aria-current="true"]').boundingBox();
await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
await page.mouse.move(box.x+box.width/2+220,box.y+box.height/2,{steps:12});await page.mouse.up();
await waitIndex(0);
assert.equal(new URL(page.url()).pathname,'/','drag does not open a poem');
const stage=await page.locator('[data-stage]').boundingBox();
await page.mouse.move(stage.x+stage.width/2,stage.y+stage.height/2);await page.mouse.wheel(0,500);
await waitIndex(4);
assert.equal((await page.locator('[data-feature-number]').innerText()).trim(),'05 / 46');
await page.waitForTimeout(4500);
const frames=await page.evaluate(()=>window.__rafCallbacks);await page.waitForTimeout(250);
assert.equal(await page.evaluate(()=>window.__rafCallbacks),frames,'animation stops when settled');
await page.screenshot({path:'/tmp/scratch-desktop.png',fullPage:true});
const beforeOpening=await page.evaluate(()=>Number(sessionStorage.getItem('__testSoundStarts')||0));
await page.locator('[data-poem-card][aria-current="true"]').click();
await page.waitForURL('**/puisi/postulat/');
assert.equal(await page.locator('.poem__body').getAttribute('lang'),'id');
assert.match(await page.locator('.poem__body').innerText(),/Mula-mula kita menerima sesuatu/);
assert.ok(await page.evaluate(()=>Number(sessionStorage.getItem('__testSoundStarts')||0))>beforeOpening,'opening a poem plays a sound before navigation');
assert.equal(await page.locator('[data-poem-nav]').count(),2,'previous and next poem links are provided');
assert.match(await page.locator('[data-poem-nav="previous"]').innerText(),/CO-OP/i);
assert.match(await page.locator('[data-poem-nav="next"]').innerText(),/ANOTASI/i);
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/co-op/');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/anotasi/');
assert.match(await page.locator('.topbar__actions > .topbar__link').last().innerText(),/ARCHIVE/);
await page.locator('[data-poem-nav="next"]').click();
await page.waitForURL('**/puisi/anotasi/');
assert.match(await page.locator('h1').innerText(),/ANOTASI/i);

await page.goto(base+'/puisi/indeks-bias/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'16 / 46');
await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,240);});
await page.waitForTimeout(150);
const scrolledHeader=await page.locator('.topbar').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,background:getComputedStyle(el).backgroundColor,blur:getComputedStyle(el).backdropFilter}));
assert.ok(scrolledHeader.bottom<0,'poem header scrolls away with the page');
assert.equal(scrolledHeader.background,'rgba(0, 0, 0, 0)');
assert.equal(scrolledHeader.blur,'none');
await page.screenshot({path:'/tmp/scratch-poem-scrolled-desktop.png'});
await page.goto(base+'/puisi/halaman-nol/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'01 / 46');
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/normal/');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/grafit/');
await page.goto(base+'/puisi/katalog-benda-yang-tak-jadi/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'40 / 46');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/ruang-bising/');
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/last-coordinates/');


console.log('PASS desktop: bounded pool, wrapping, images, keyboard, drag, wheel, centered slides, stopped RAF, recorded hanger slides, poem link');
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
await phone.goto(base+'/#arsip');await phone.waitForSelector('.stage.is-ready');await phone.waitForTimeout(300);
await checkCarousel(phone);
const layout=await phone.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));
assert.ok(layout.scrollHeight<=layout.height+1,JSON.stringify(layout));assert.ok(layout.scrollWidth<=layout.width+1,JSON.stringify(layout));
await phone.screenshot({path:'/tmp/scratch-mobile.png',fullPage:true});
const mobileBox=await phone.locator('[data-poem-card][aria-current="true"]').boundingBox();
const touchX=mobileBox.x+mobileBox.width*.8,touchY=mobileBox.y+mobileBox.height*.5;
const cdp=await mobile.newCDPSession(phone);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touchX,y:touchY}]});
for(let i=1;i<=10;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchX-i*16,y:touchY}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await phone.waitForFunction(()=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')==='1');
assert.equal(new URL(phone.url()).pathname,'/');
await openNavigation(phone);
await phone.locator('[data-replay-intro]').click();
await phone.locator('[data-enter]').click();
await phone.waitForFunction(()=>document.documentElement.classList.contains('has-entered'),null,{timeout:5000});
console.log('PASS mobile: 390×844 without overflow, real touch swipe, intro replay');
await phone.goto(base+'/puisi/indeks-bias/');
await phone.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
await phone.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,240);});
await phone.waitForTimeout(150);
assert.ok((await phone.locator('.topbar').boundingBox()).y+(await phone.locator('.topbar').boundingBox()).height<0,'mobile poem header scrolls away');
await phone.screenshot({path:'/tmp/scratch-poem-scrolled-mobile.png'});
await phone.locator('.poem-nav').scrollIntoViewIfNeeded();
assert.equal(await phone.locator('[data-poem-nav]').count(),2);
const readingLayout=await phone.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
assert.ok(readingLayout.scrollWidth<=readingLayout.width,'reading links stay within mobile viewport');
await phone.screenshot({path:'/tmp/scratch-poem-links-mobile.png'});
// If a mobile compositor drops the gradient during a fast fling, the page
// canvas must still be the approved paper color rather than the browser's white default.
const withoutGradient=await phone.addStyleTag({content:'html, body, body::before { background-image: none !important; }'});
const fallbackPixel=await sharp(await phone.screenshot()).extract({left:3,top:830,width:1,height:1}).removeAlpha().raw().toBuffer();
await withoutGradient.evaluate(style=>style.remove());
const expectedPaper=[244,243,236];
const matchesPaper=pixel=>expectedPaper.every((value,index)=>Math.abs(pixel[index]-value)<=4);
const matchesPaperGradient=pixel=>pixel[0]>=180&&pixel[0]<251&&pixel[1]>=200&&pixel[1]<251&&pixel[2]>=220&&pixel[2]<251;
assert.ok(matchesPaper(fallbackPixel),`mobile canvas keeps its paper undercoat when the gradient is unavailable: ${[...fallbackPixel]}`);
await phone.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
for(let swipe=0;swipe<3;swipe++) {
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:740}]});
 for(let step=1;step<=8;step++) {
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:740-step*75}]});
  await phone.waitForTimeout(8);
 }
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await phone.waitForTimeout(100);
 const pixel=await sharp(await phone.screenshot()).extract({left:3,top:830,width:1,height:1}).removeAlpha().raw().toBuffer();
 assert.ok(matchesPaperGradient(pixel),`paper gradient remains visible after fast mobile scroll ${swipe}: ${[...pixel]}`);
}
assert.ok(await phone.evaluate(()=>scrollY>0),'fast touch gestures actually scroll the poem');
await phone.screenshot({path:'/tmp/scratch-poem-fast-scroll-mobile.png'});
console.log('PASS mobile background: approved paper canvas and repeated fast touch scrolling');

console.log('PASS reading: opening sound, ARCHIVE, titled previous/next links, collection wrap, desktop/mobile scroll header');

const reduced=await browser.newContext({viewport:{width:844,height:390},reducedMotion:'reduce'});
const quiet=await reduced.newPage();quiet.on('pageerror',e=>errors.push(e.message));
await quiet.goto(base+'/#arsip');await quiet.waitForSelector('.stage.is-ready');await quiet.keyboard.press('ArrowRight');
await quiet.waitForFunction(()=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')==='1');
await checkCarousel(quiet);
await quiet.screenshot({path:'/tmp/scratch-landscape.png',fullPage:true});
console.log('PASS reduced motion and short landscape layout');
for(const viewport of [{width:320,height:568},{width:1440,height:600},{width:320,height:480}]) {
 const compact=await browser.newPage({viewport,reducedMotion:'reduce'});
 await compact.goto(base+'/#arsip');await compact.waitForSelector('.stage.is-ready');
 await checkCarousel(compact);
 for(let index=0;index<46;index++) {
  const heading=await compact.evaluate(()=>{
   const feature=document.querySelector('[data-feature]').getBoundingClientRect();
   return ['[data-feature-number]','[data-feature-title]','[data-feature-excerpt]'].map(selector=>{
    const box=document.querySelector(selector).getBoundingClientRect();
    return {selector,fits:box.top>=feature.top-.5&&box.bottom<=feature.bottom+.5&&box.left>=feature.left-.5&&box.right<=feature.right+.5};
   });
  });
  assert.ok(heading.every(item=>item.fits),`heading fits ${viewport.width}×${viewport.height}, poem ${index+1}: ${JSON.stringify(heading)}`);
  if(index<45) {
   await compact.keyboard.press('ArrowRight');
   await compact.waitForFunction(index=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')===String(index),index+1);
  }
 }
 await compact.screenshot({path:`/tmp/scratch-carousel-compact-${viewport.width}x${viewport.height}.png`});
 await compact.close();
}
console.log('PASS compact layouts: all forty-six headings fit small/short portrait and short desktop viewports');
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
const plain=await nojs.newPage();await plain.goto(base+'/');
assert.equal(await plain.locator('.nojs-list a').count(),46);assert.ok(await plain.locator('.nojs-list').isVisible());
assert.ok(!(await plain.locator('[data-sound-toggle]').isVisible()));
console.log('PASS no JavaScript: all 46 poems remain linked');
assert.deepEqual(errors,[],'no browser errors');
await browser.close();
