import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL ?? 'http://127.0.0.1:4326';
const sizes=[{width:1440,height:900},{width:1440,height:600},{width:768,height:1024},{width:390,height:844},{width:320,height:480}];
const active=page=>page.locator('[data-poem-card][aria-current="true"]');
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});}
async function checkTheme(page,selector){
 await settle(page);
 assert.equal(await page.locator('html').evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(244, 243, 236)');
 assert.match(await page.locator(selector).evaluate(node=>getComputedStyle(node).fontFamily),/Newsreader/);
 assert.equal(await page.locator(selector).evaluate(node=>getComputedStyle(node).fontWeight),'400');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
}
async function ready(page){await settle(page);await page.waitForSelector('.stage.is-ready');await active(page).locator('img').evaluate(image=>image.decode());}
try{
 for(const viewport of sizes){
  const page=await browser.newPage({viewport,reducedMotion:'reduce',isMobile:viewport.width<600,hasTouch:viewport.width<600});
  const errors=[], skippedTransitions=[];
  page.on('pageerror',error=>{
   // Chrome can reject a native cross-document transition when the test
   // immediately navigates again. Keep this browser cancellation separate
   // from script errors; all destination/content assertions must still pass.
   if(error.message==='Transition was aborted because of invalid state. ViewTransition opt-in disabled') skippedTransitions.push(error.message);
   else errors.push(error.message);
  });
  await page.goto(base+'/v3/?intro=1');await page.evaluate(()=>document.fonts.ready);
  await checkTheme(page,'.intro__title');
  assert.equal(await page.locator('.intro').isVisible(),true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'the original opening stays on one screen');
  assert.equal(await page.locator('.intro__scratch').count(),0,'the paper opening has no ink logo');
  assert.equal(await page.locator('.intro__star').count(),0,'the paper opening has no asterisk');
  assert.equal(await page.locator('.intro__edition,.intro__inventory,.intro__details').count(),0,'the opening has no collection labels or counts');
  assert.equal(await page.locator('.intro__fragment img').count(),4,'existing poem artwork decorates the opening');
  const titleBox=await page.locator('.intro__title').boundingBox(),noteBox=await page.locator('.intro__note').boundingBox();
  assert.ok(Math.abs(titleBox.x+titleBox.width/2-noteBox.x-noteBox.width/2)<1,'tagline is centered beneath the wordmark');
  for(const selector of ['.intro__title','.intro__note','.enter']){
   const box=await page.locator(selector).boundingBox();
   assert.ok(box.x>=0 && box.x+box.width<=viewport.width+1 && box.y>=0 && box.y+box.height<=viewport.height+1,`${selector} fits the opening ${viewport.width}×${viewport.height}`);
  }
  await page.screenshot({path:`/tmp/scratch-paper-intro-${viewport.width}x${viewport.height}.png`});
  await page.locator('[data-enter]').click();await page.waitForFunction(()=>document.documentElement.classList.contains('has-entered'));
  await ready(page);await checkTheme(page,'[data-feature-title]');
  assert.equal(await page.locator('[data-slide]').count(),9);
  assert.equal(await active(page).getAttribute('href'),'/v3/puisi/halaman-nol/');
  assert.equal(await page.locator('.series-entry').getAttribute('href'),'/v3/series/');
  assert.equal(await page.locator('.brand__name').textContent(),'scratch','the archive brand pairs the ink mark with its name');
  assert.deepEqual(await active(page).locator('.poem-card__frame').evaluate(node=>{const style=getComputedStyle(node);return {padding:style.padding,border:style.borderWidth,background:style.backgroundColor};}),{padding:'0px',border:'0px',background:'rgba(0, 0, 0, 0)'},'carousel artwork has no surrounding frame');
  const composition=await page.evaluate(()=>{const f=document.querySelector('[data-feature]').getBoundingClientRect();const a=document.querySelector('.archive').getBoundingClientRect();return {left:f.right<=a.left+1,above:f.bottom<=a.top+1};});
  assert.ok(viewport.width>900?composition.left:composition.above,'the original title/carousel composition is retained');
  await page.screenshot({path:`/tmp/scratch-paper-archive-${viewport.width}x${viewport.height}.png`});
  await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')==='1');
  assert.equal(await active(page).getAttribute('href'),'/v3/puisi/grafit/');
  await active(page).click();await page.waitForURL('**/v3/puisi/grafit/');await page.evaluate(()=>document.fonts.ready);
  await checkTheme(page,'.poem__title');
  assert.equal(await page.locator('.topbar__actions > .topbar__link').last().getAttribute('href'),'/v3/');
  assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/v3/puisi/halaman-nol/');
  assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/v3/puisi/kambium/');
  const before=await page.locator('.poem__image').boundingBox();
  await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));
  const after=await page.locator('.poem__image').boundingBox();
  if(viewport.width>900){
   const body=await page.locator('.poem__body').boundingBox();
   assert.ok(Math.abs(after.y-Math.min(before.y,body.y+body.height-after.height))<1,'desktop illustration stops at the final poem line');
  }
  else assert.ok(before.y-after.y>100,'mobile illustration remains in normal flow');
  await page.goto(base+'/v3/series/');await page.evaluate(()=>document.fonts.ready);await checkTheme(page,'.topbar .brand__name');
  assert.equal(await page.locator('h1').textContent(),'poems');
  assert.equal(await page.locator('.catalog__heading').count(),0,'series title appears beside the logo instead of above the covers');
  assert.equal(await page.locator('[data-series-card]').count(),2);
  await page.locator('[data-series-card][href$="/recursion/"]').click();await page.waitForURL('**/v3/series/recursion/');
  await settle(page);
  assert.equal(await page.locator('[data-series-poem]').count(),6);
  assert.equal(await page.locator('.catalog__back').getAttribute('href'),'/v3/series/');
  await page.locator('[data-series-poem][href$="/pi/"]').click();await page.waitForURL('**/v3/series/recursion/puisi/pi/');
  await checkTheme(page,'.poem__title');
  assert.equal(await page.locator('.topbar__actions > .topbar__link').last().getAttribute('href'),'/v3/series/recursion/');
  assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/v3/series/recursion/puisi/rotasi/');
  assert.match(await page.locator('.poem__number').textContent(),/04 \/ 06/);
  await page.locator('[data-soundtrack] iframe').waitFor({timeout:20000});
  assert.equal(await page.locator('[data-soundtrack] iframe').count(),1);
  assert.deepEqual(errors,[]);
  if(skippedTransitions.length) console.log(`NOTE Chrome skipped ${skippedTransitions.length} native transition(s) during automated navigation`);
  await page.close();console.log(`PASS classic paper ${viewport.width}×${viewport.height}: palette, fonts, original opening/carousel, reader and series navigation`);
 }
 for(const viewport of [{width:320,height:568},{width:1440,height:600},{width:320,height:480}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  await page.goto(base+'/v3/#arsip');await ready(page);
  for(let index=0;index<46;index++){
   const fits=await page.evaluate(()=>{
    const parent=document.querySelector('[data-feature]').getBoundingClientRect();
    return ['[data-feature-number]','[data-feature-title]','[data-feature-excerpt]'].every(selector=>{const box=document.querySelector(selector).getBoundingClientRect();return box.top>=parent.top-.5&&box.bottom<=parent.bottom+.5&&box.left>=parent.left-.5&&box.right<=parent.right+.5;});
   });
   assert.ok(fits,`serif heading ${index+1} fits ${viewport.width}×${viewport.height}`);
   if(index<45){await page.keyboard.press('ArrowRight');await page.waitForFunction(i=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')===String(i),index+1);}
  }
  await page.close();console.log(`PASS all 46 serif headings: ${viewport.width}×${viewport.height}`);
 }
 const session=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await session.goto(base+'/classic/#arsip');await session.waitForFunction(()=>document.documentElement.classList.contains('has-entered'));
 await session.goto(base+'/v3/');assert.ok(await session.locator('.intro').isVisible(),'original entry does not skip the experiment opening');
 await session.locator('[data-enter]').click();await session.waitForFunction(()=>document.documentElement.classList.contains('has-entered'));
 assert.deepEqual(await session.evaluate(()=>[sessionStorage.getItem('scratch:entered'),sessionStorage.getItem('scratch:paper:entered')]),['1','1']);
 await session.getByRole('button',{name:'Kembali ke pembuka'}).click();assert.equal(await session.locator('.intro').isVisible(),true);
 assert.deepEqual(await session.evaluate(()=>[sessionStorage.getItem('scratch:entered'),sessionStorage.getItem('scratch:paper:entered')]),['1',null]);
 await session.close();
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(base+'/v3/');assert.equal(await nojs.locator('.nojs-list a').count(),46);assert.equal(await nojs.locator('.nojs-list a').first().getAttribute('href'),'/v3/puisi/halaman-nol/');
 await nojs.goto(base+'/v3/puisi/pi/');assert.equal(await nojs.locator('[data-soundtrack] iframe').count(),1);assert.equal(await nojs.locator('[data-poem-nav="next"]').getAttribute('href'),'/v3/puisi/rotasi/');
 console.log('PASS independent intro sessions and no-JavaScript navigation');
} finally{await browser.close();}
