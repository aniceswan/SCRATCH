const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import assert from 'node:assert/strict';
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
assert.equal(await page.locator('[data-hang]').count(),9);
assert.ok((await page.locator('.brand__ink').boundingBox()).width<=42,'shorter ink logo');
const depth=await page.locator('[data-rope]').evaluate(rope=>{
 const length=rope.getTotalLength(), near=rope.getPointAtLength(0), far=rope.getPointAtLength(length);
 return {near:{x:near.x,y:near.y},far:{x:far.x,y:far.y}};
});
assert.ok(depth.near.x<depth.far.x&&depth.near.y>depth.far.y,'rope recedes diagonally toward the right background');
const continuity=await page.evaluate(()=>{
 const svg=document.querySelector('[data-clothesline]');
  const track=document.querySelector('[data-track]');
 const rope=document.querySelector('[data-rope]'),anchor=document.querySelector('[data-rope-post]');
 const first=rope.getPointAtLength(0),mount=anchor.transform.baseVal.consolidate().matrix;
 return {foreground:Number(getComputedStyle(svg).zIndex)>Number(getComputedStyle(track).zIndex),
  mounted:Math.hypot(first.x-mount.e,first.y-mount.f)<.1,
  copyright:document.querySelector('.copyright')?.textContent,
  footerCount:document.querySelectorAll('footer').length,
  back:document.querySelector('[data-replay-intro]')?.textContent};
});
assert.ok(continuity.foreground,'cords draw over the card plane');
assert.ok(continuity.mounted,'clothesline is tied to its wooden post');
assert.ok((await page.locator('[data-post-face]').boundingBox()).height>100,'wooden post reaches toward the ground');
assert.equal(await page.locator('[data-hang] .poem-card__clip').count(),9,'one clip connects each print directly to the rope');
assert.match(continuity.copyright,/© 2026 scratch/);
assert.equal(continuity.footerCount,0);
assert.match(continuity.back,/BACK/);
const titleCrossing=await page.evaluate(()=>{
 const title=document.querySelector('[data-feature-title]').getBoundingClientRect();
 const svg=document.querySelector('[data-clothesline]').getBoundingClientRect();
 return [...document.querySelectorAll('.clothesline__rope')].some(path=>{
  const length=path.getTotalLength();
  return Array.from({length:300},(_,i)=>path.getPointAtLength(length*i/299)).some(p=>{
   const x=p.x+svg.x,y=p.y+svg.y;
   return x>title.left&&x<title.right&&y>title.top&&y<title.bottom;
  });
 });
});
assert.equal(titleCrossing,false,'continuous foreground cords leave the poem title readable');



assert.equal(await index(),'0');
assert.equal((await page.locator('[data-feature-number]').innerText()).trim(),'01 / 24');
assert.equal(await page.evaluate(()=>window.__createdContexts.length),0,'no audio on initial load');
await page.keyboard.press('ArrowLeft'); await waitIndex(23);
assert.equal(await page.locator('[data-poem-card][aria-current="true"]').getAttribute('href'),'/puisi/katalog-benda-yang-tak-jadi/');
await page.waitForFunction(()=>{const i=document.querySelector('[aria-current="true"] img');return i?.complete&&i.naturalWidth>0;});
assert.match(await page.locator('[data-poem-card][aria-current="true"] img').evaluate(i=>i.currentSrc),/katalog-benda/);
await page.keyboard.press('ArrowRight');await waitIndex(0);
await page.keyboard.press('ArrowRight');await waitIndex(1);
assert.match(await page.locator('[data-feature-title]').getAttribute('aria-label'),/KAMBIUM/);
assert.ok(await page.evaluate(()=>window.__soundStarts)>0,'real Web Audio sources start after a gesture');
assert.ok(await page.evaluate(()=>window.__soundDurations.every(duration=>duration>.25&&duration<.5)),'uses the real recorded hanger excerpts');
assert.ok(await page.locator('[data-swing]').evaluateAll(nodes=>nodes.some(n=>Math.abs(Number(n.style.transform.match(/[-\d.]+/)?.[0]))>.001)),'cards swing during movement');
for(let i=0;i<26;i++) await page.keyboard.press('ArrowRight');
await waitIndex(3);
assert.equal(await page.locator('[data-hang]').count(),9);
assert.equal(await page.locator('[data-sound-toggle]').count(),0,'sound is always on, with no toggle');
const sounds=await page.evaluate(()=>window.__soundStarts);
await page.locator('[data-stage]').focus();
await page.keyboard.press('ArrowRight');await waitIndex(4);
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
assert.equal((await page.locator('[data-feature-number]').innerText()).trim(),'05 / 24');
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
assert.match(await page.locator('[data-poem-nav="previous"]').innerText(),/KONTUR/i);
assert.match(await page.locator('[data-poem-nav="next"]').innerText(),/SELA/i);
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/kontur/');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/sela/');
assert.match(await page.locator('.topbar__link').innerText(),/ARCHIVE/);
await page.locator('[data-poem-nav="next"]').click();
await page.waitForURL('**/puisi/sela/');
assert.match(await page.locator('h1').innerText(),/SELA/i);

await page.goto(base+'/puisi/indeks-bias/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'18 / 24');
await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,240);});
await page.waitForTimeout(150);
const scrolledHeader=await page.locator('.topbar').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,background:getComputedStyle(el).backgroundColor,blur:getComputedStyle(el).backdropFilter}));
assert.ok(scrolledHeader.bottom<0,'poem header scrolls away with the page');
assert.equal(scrolledHeader.background,'rgba(0, 0, 0, 0)');
assert.equal(scrolledHeader.blur,'none');
await page.screenshot({path:'/tmp/scratch-poem-scrolled-desktop.png'});
await page.goto(base+'/puisi/grafit/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'01 / 24');
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/katalog-benda-yang-tak-jadi/');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/kambium/');
await page.goto(base+'/puisi/katalog-benda-yang-tak-jadi/');
assert.equal((await page.locator('.poem__number').innerText()).trim(),'24 / 24');
assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/puisi/grafit/');
assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/puisi/last-coordinates/');


console.log('PASS desktop: bounded pool, wrapping, images, keyboard, drag, wheel, physical swing, stopped RAF, recorded hanger slides, poem link');
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
await phone.goto(base+'/#arsip');await phone.waitForSelector('.stage.is-ready');await phone.waitForTimeout(300);
assert.ok(!(await phone.locator('[data-rope-post]').isVisible()),'no wooden post on mobile');
assert.ok(!(await phone.locator('[data-rope-binding]').isVisible()),'no floating rope binding on mobile');
const mobileRopeEdge=await phone.locator('[data-rope]').evaluate(path=>{
 const point=path.getPointAtLength(0),svg=path.ownerSVGElement.getBoundingClientRect();
 return {x:point.x+svg.x,loadedPost:document.querySelector('[data-post-face]').hasAttribute('href')};
});
assert.ok(Math.abs(mobileRopeEdge.x)<1,'mobile rope reaches the exact viewport boundary');
assert.equal(mobileRopeEdge.loadedPost,false,'mobile does not load the desktop wood texture');

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
console.log('PASS reading: opening sound, ARCHIVE, titled previous/next links, collection wrap, desktop/mobile scroll header');

const reduced=await browser.newContext({viewport:{width:844,height:390},reducedMotion:'reduce'});
const quiet=await reduced.newPage();quiet.on('pageerror',e=>errors.push(e.message));
await quiet.goto(base+'/#arsip');await quiet.waitForSelector('.stage.is-ready');await quiet.keyboard.press('ArrowRight');
assert.ok(!(await quiet.locator('[data-rope-post]').isVisible()),'no post on mobile landscape');
const landscapeEdge=await quiet.locator('[data-rope]').evaluate(path=>path.getPointAtLength(0).x+path.ownerSVGElement.getBoundingClientRect().x);
assert.ok(Math.abs(landscapeEdge)<1,'landscape rope reaches the full viewport edge');
await quiet.waitForFunction(()=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')==='1');
assert.ok(await quiet.locator('[data-swing]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).transform==='none')));
await quiet.screenshot({path:'/tmp/scratch-landscape.png',fullPage:true});
console.log('PASS reduced motion and short landscape layout');
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
const plain=await nojs.newPage();await plain.goto(base+'/');
assert.equal(await plain.locator('.nojs-list a').count(),24);assert.ok(await plain.locator('.nojs-list').isVisible());
assert.ok(!(await plain.locator('[data-sound-toggle]').isVisible()));
console.log('PASS no JavaScript: all 24 poems remain linked');
assert.deepEqual(errors,[],'no browser errors');
await browser.close();
