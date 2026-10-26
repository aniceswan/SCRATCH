import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL ?? 'http://127.0.0.1:4326';
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});}
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>{if(error.message!=='Transition was aborted because of invalid state. ViewTransition opt-in disabled')errors.push(error.message);});
  for(const prefix of ['', '/v3', '/classic']){
   const paper=prefix!=='/classic';
   await page.goto(`${base}${prefix}/?intro=1`);await settle(page);
   assert.equal(await page.locator('html').evaluate(node=>node.classList.contains('classic-paper')),paper);
   assert.equal(await page.locator('html').evaluate(node=>getComputedStyle(node).backgroundColor),paper?'rgb(244, 243, 236)':'rgb(232, 226, 213)');
   assert.match(await page.locator('.intro__title').evaluate(node=>getComputedStyle(node).fontFamily),paper?/Newsreader/:/Fredoka/);
   assert.equal(await page.locator('.intro__fragment img').count(),paper?4:0);
   assert.equal(await page.locator('.intro__scratch,.intro__star').count(),paper?0:2);
   assert.equal(await page.locator('meta[name="robots"]').count(),prefix?1:0,'only alternative editions are excluded from indexing');
   if(paper){
    await page.locator('.intro__fragment img').evaluateAll(nodes=>Promise.all(nodes.map(image=>image.decode())));
    const title=await page.locator('.intro__title').boundingBox(),note=await page.locator('.intro__note').boundingBox();
    assert.ok(Math.abs(title.x+title.width/2-note.x-note.width/2)<1,'the approved tagline alignment is preserved');
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth));
   await page.locator('[data-enter]').click();await page.waitForFunction(()=>document.documentElement.classList.contains('has-entered'));
   await page.waitForSelector('.stage.is-ready');
   assert.equal(await page.locator('.series-entry').getAttribute('href'),`${prefix}/series/`);
   assert.equal(await page.locator('[data-poem-card][aria-current="true"]').getAttribute('href'),`${prefix}/puisi/halaman-nol/`);
   assert.equal(await page.locator('.brand__name').count(),paper?1:0);
   await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('[aria-current="true"]')?.getAttribute('data-index')==='1');
   await page.locator('[data-poem-card][aria-current="true"]').click();await page.waitForURL(`**${prefix}/puisi/grafit/`);await settle(page);
   assert.equal(await page.locator('.topbar__link').getAttribute('href'),`${prefix}/`);
   assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),`${prefix}/puisi/halaman-nol/`);
   assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),`${prefix}/puisi/kambium/`);
   await page.goto(`${base}${prefix}/series/`);await settle(page);
   assert.equal(await page.locator('h1').textContent(),paper?'series':'series*');
   assert.equal(await page.locator('.catalog__heading').count(),paper?0:1);
   assert.equal(await page.locator('[data-series-card]').count(),2);
   await page.locator(`[data-series-card][href="${prefix}/series/recursion/"]`).click();await page.waitForURL(`**${prefix}/series/recursion/`);await settle(page);
   assert.equal(await page.locator('[data-series-poem]').count(),6);
   assert.equal(await page.locator('[data-series-poem]').first().getAttribute('href'),`${prefix}/series/recursion/puisi/ruang-bising/`);
   assert.equal(await page.locator('.catalog__back').getAttribute('href'),`${prefix}/series/`);
   console.log(`PASS published edition ${prefix||'/'} at ${viewport.width}: theme, opening, search indexing, carousel and scoped reader/series links`);
  }
  await page.goto(base+'/v2/');assert.equal(await page.locator('.classic-link').getAttribute('href'),'/classic/');
  assert.deepEqual(errors,[]);await page.close();
 }
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 for(const prefix of ['', '/classic']){
  await nojs.goto(`${base}${prefix}/`);assert.equal(await nojs.locator('.nojs-list a').count(),46);assert.equal(await nojs.locator('.nojs-list a').first().getAttribute('href'),`${prefix}/puisi/halaman-nol/`);
  await nojs.goto(`${base}${prefix}/series/recursion/puisi/pi/`);assert.equal(await nojs.locator('[data-poem-nav="next"]').getAttribute('href'),`${prefix}/series/recursion/puisi/rotasi/`);assert.equal(await nojs.locator('[data-soundtrack] iframe').count(),1);
 }
 console.log('PASS main and original editions keep no-JavaScript reading and Spotify embeds');
}finally{await browser.close();}
