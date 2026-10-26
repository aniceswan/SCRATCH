import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL??'http://127.0.0.1:4326';
const fakeApi=`
const listeners={};
window.__soundtrack={calls:[],emit(data){listeners.playback_update?.({data});}};
window.onSpotifyIframeApiReady({createController(mount,options,created){
 const frame=document.createElement('iframe');frame.src='about:blank';frame.width='100%';frame.height='152';mount.replaceChildren(frame);
 created({resume(){window.__soundtrack.calls.push('resume');},pause(){window.__soundtrack.calls.push('pause');},restart(){window.__soundtrack.calls.push('restart');},addListener(event,listener){listeners[event]=listener;}});
 listeners.ready();
}});`;
try{
 for(const path of ['/puisi/halaman-nol/','/v3/series/refraction/puisi/halaman-nol/']){
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.route('https://open.spotify.com/embed/iframe-api/v1',route=>route.fulfill({contentType:'application/javascript',body:fakeApi}));
  await page.goto(base+path);
  const button=page.locator('[data-soundtrack-play]');await button.waitFor();await page.waitForFunction(()=>!document.querySelector('[data-soundtrack-play]').disabled);
  const calls=()=>page.evaluate(()=>window.__soundtrack.calls);
  const emit=(overrides={})=>page.evaluate(data=>window.__soundtrack.emit({isPaused:false,isBuffering:false,position:1000,duration:30000,...data}),overrides);
  const restarts=async()=> (await calls()).filter(call=>call==='restart').length;
  await emit({isPaused:true,position:0});await emit({position:30000});
  assert.deepEqual(await calls(),[],'idle and end events cannot autoplay');
  await button.click();assert.deepEqual(await calls(),['resume']);
  await emit({isPaused:true,position:0});await emit({duration:0,position:0});
  assert.equal(await restarts(),0,'unknown duration cannot trigger repeat');
  await emit();assert.equal(await button.getAttribute('aria-pressed'),'true');
  await emit({position:29999});assert.equal(await restarts(),0,'repeat starts only at the end');
  await emit({position:30000});await emit({position:30000,isPaused:true});await emit({position:30000,isBuffering:true});
  assert.equal(await restarts(),1,'duplicate end events restart once');
  assert.ok(await button.isEnabled(),'Pause remains available during a restart');
  await emit({position:0,isPaused:true});await emit({position:0,isBuffering:true});await emit({position:1});
  await emit({position:30000});assert.equal(await restarts(),2,'each completed cycle can repeat');
  await button.click();assert.equal((await calls()).at(-1),'pause');
  await emit({position:30000});await emit({position:1});
  assert.equal(await restarts(),2,'Pause wins over a late end or playing update');
  await emit({isPaused:true,position:1});assert.equal(await button.getAttribute('aria-pressed'),'false');
  await emit({position:30000});assert.equal(await restarts(),2,'the paused song does not restart');
  await button.click();await emit();await emit({isPaused:true,position:15000});await emit({position:30000});
  assert.equal(await restarts(),2,'pausing from the official player also stops repeat');
  await emit();await emit({position:30000});assert.equal(await restarts(),3,'playback from the official player enables repeat');
  await button.click();await emit({isPaused:true,position:0});
  await button.click();await emit({isBuffering:true,position:0});await button.click();
  assert.equal((await calls()).at(-1),'pause','Pause during initial buffering sends an explicit pause');
  await emit({isPaused:true,position:0});await emit({position:30000});assert.equal(await restarts(),3);
  await page.clock.install();await button.click();await emit();await emit({position:30000});
  assert.equal(await restarts(),4);await page.clock.fastForward(5100);
  assert.equal(await button.getAttribute('aria-pressed'),'false');
  assert.ok(await page.locator('[data-soundtrack-status]').isVisible(),'blocked restarts show a fallback');
  await emit({position:30000});assert.equal(await restarts(),4,'a failed restart cannot create a retry storm');
  await page.close();console.log(`PASS repeat contract ${path}: duplicate ends, multiple loops, pause races, embedded controls, buffering, timeout`);
 }
}finally{await browser.close();}
