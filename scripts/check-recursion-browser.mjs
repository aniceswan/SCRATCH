import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL??'http://127.0.0.1:4326';
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await page.goto(base+'/puisi/halaman-nol/');
 await page.locator('.poem__image img').evaluate(image=>image.decode());
 const initial=await page.locator('.poem__image').boundingBox();
 const title=await page.locator('.poem__title').boundingBox();
 assert.ok(Math.abs(initial.y-title.y)<1,'desktop image top aligns with the initial title top');
 for(const position of [240,800,99999,0]){
  await page.evaluate(top=>scrollTo({top,behavior:'instant'}),position);
  const current=await page.locator('.poem__image').boundingBox();
  assert.ok(Math.abs(current.x-initial.x)<.5&&Math.abs(current.y-initial.y)<.5,`desktop image stays fixed at scroll ${position}: ${JSON.stringify({initial,current})}`);
 }
 for(const viewport of [{width:1440,height:600},{width:1000,height:800}]) {
  await page.setViewportSize(viewport);
  await page.evaluate(async()=>{await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));scrollTo({top:0,behavior:'instant'});});
  const image=await page.locator('.poem__image').boundingBox();const heading=await page.locator('.poem__title').boundingBox();
  assert.ok(Math.abs(image.y-heading.y)<1,`image/title alignment at ${viewport.width}×${viewport.height}: ${JSON.stringify({image,heading,scroll:await page.evaluate(()=>scrollY)})}`);
  assert.ok(image.y+image.height<=viewport.height-24,`aligned image remains inside ${JSON.stringify({viewport,image})}`);
  await page.evaluate(()=>scrollTo({top:99999,behavior:'instant'}));
  const scrolled=await page.locator('.poem__image').boundingBox();assert.ok(Math.abs(scrolled.y-image.y)<.5);
 }
 await page.setViewportSize({width:1440,height:900});
 console.log('PASS desktop image aligns with the initial title and remains fixed across desktop viewport sizes');
 if(process.argv.includes('--image-only')) process.exit(0);
 await page.goto(base+'/series/');
 assert.equal(await page.locator('[data-series-card]').count(),2);
 const recursion=page.locator('[data-series-card][href="/series/recursion/"]');
 assert.match(await recursion.innerText(),/recursion\s+6 puisi/i);
 await recursion.locator('img').evaluate(image=>image.decode());
 await page.screenshot({path:'/tmp/scratch-recursion-catalog.png'});
 await recursion.click();await page.waitForURL('**/series/recursion/');
 assert.equal(await page.title(),'recursion | SCRATCH');
 const cards=page.locator('[data-series-poem]');
 assert.equal(await cards.count(),6);
 const slugs=['ruang-bising','sebuah-nama','hukum-newton','pi','rotasi','normal'];
 assert.deepEqual(await cards.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href'))),slugs.map(slug=>`/series/recursion/puisi/${slug}/`));
 await cards.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 await page.screenshot({path:'/tmp/scratch-recursion-grid.png',fullPage:true});
 await cards.first().click();await page.waitForURL('**/series/recursion/puisi/ruang-bising/');
 assert.equal((await page.locator('.poem__number').innerText()).trim(),'01 / 06');
 assert.equal(await page.locator('[data-poem-nav="previous"]').getAttribute('href'),'/series/recursion/puisi/normal/');
 assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/series/recursion/puisi/sebuah-nama/');
 await page.locator('[data-poem-nav="previous"]').click();await page.waitForURL('**/series/recursion/puisi/normal/');
 assert.equal((await page.locator('.poem__number').innerText()).trim(),'06 / 06');
 assert.equal(await page.locator('[data-poem-nav="next"]').getAttribute('href'),'/series/recursion/puisi/ruang-bising/');
 await page.goto(base+'/#arsip');await page.waitForSelector('.stage.is-ready');
 assert.equal((await page.locator('[data-feature-number]').innerText()).trim(),'01 / 46');
 const catalog=await page.locator('[data-poems]').evaluate(el=>JSON.parse(el.textContent));
 assert.equal(catalog.length,46);assert.equal(catalog[40].url,'/puisi/ruang-bising/');assert.equal(catalog[45].url,'/puisi/normal/');
 const selected=[['halaman-nol','4R2kfaDFhslZEMJqAFNpdd'],['kontur','2AwUbBYWlFX2VjP4wTiUI2'],['ambang','2JcLhDcdmV8ZZ7aTvyIp6s'],['the-weather-i-withheld','3zOYmiNOuyDL0ClxJcEJ0T'],['the-longest-time','4R2kfaDFhslZEMJqAFNpdd'],['katalog-benda-yang-tak-jadi','0x7PmByJWVXdeipevd6KZS'],['sebuah-nama','1fDFHXcykq4iw8Gg7s5hG9'],['pi','5Htq8DDDN0Xce9MwqzAzui']];
 for(const [slug,id] of selected){
  await page.goto(base+`/puisi/${slug}/`,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-soundtrack]').getAttribute('data-track-id'),id,slug);
  assert.equal(await page.locator('[data-soundtrack-play]').count(),1,slug);
 }
 for(const viewport of [{width:390,height:844},{width:320,height:640}]){
  const phone=await browser.newPage({viewport,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await phone.goto(base+'/series/recursion/');assert.equal(await phone.locator('[data-series-poem]').count(),6);
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await phone.screenshot({path:`/tmp/scratch-recursion-mobile-${viewport.width}.png`});
  await phone.goto(base+'/series/recursion/puisi/sebuah-nama/');
  const before=await phone.locator('.poem__image').boundingBox();
  await phone.evaluate(()=>scrollTo({top:300,behavior:'instant'}));
  const after=await phone.locator('.poem__image').boundingBox();
  assert.ok(before.y-after.y>250,'mobile image scrolls naturally rather than fixed');
  assert.equal(await phone.locator('[data-soundtrack]').getAttribute('data-track-id'),'1fDFHXcykq4iw8Gg7s5hG9');
  await phone.close();
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await plain.goto(base+'/series/recursion/');await plain.locator('[data-series-poem]').nth(3).click();
 await plain.waitForURL('**/series/recursion/puisi/pi/');
 assert.equal((await plain.locator('.poem__number').innerText()).trim(),'04 / 06');
 assert.equal(await plain.locator('[data-soundtrack] iframe').count(),1);
 console.log('PASS recursion: two series, six artworks, 46 archive poems, ordered wrap, eight soundtrack assignments, mobile scroll and no-JS');
}finally{await browser.close();}
