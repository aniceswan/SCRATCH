import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL ?? 'http://127.0.0.1:4326';
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640}]) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce',isMobile:viewport.width<600,hasTouch:viewport.width<600});
  await page.addInitScript(() => {
    window.__spotifyUpdates=[];
    let callback;
    Object.defineProperty(window,'onSpotifyIframeApiReady',{
      configurable:true,
      get:()=>callback,
      set:ready=>{callback=api=>ready({createController(element,options,created){
        api.createController(element,options,controller=>{
          controller.addListener('playback_update',event=>window.__spotifyUpdates.push(event.data));
          created(controller);
        });
      }});},
    });
  });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/puisi/halaman-nol/');
  assert.equal(await page.locator('details.soundtrack').count(),0,'there is no expandable player');
  const control=page.locator('[data-soundtrack-play]');
  const frame=page.locator('[data-soundtrack] iframe');
  await frame.waitFor({timeout:20000});
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.disabled===false,null,{timeout:20000});
  assert.equal(await frame.count(),1,'one player is loaded on entry, without an expand gesture');
  assert.equal(await frame.getAttribute('src'),'https://open.spotify.com/embed/track/4R2kfaDFhslZEMJqAFNpdd?utm_source=iframe-api');
  assert.match(await frame.getAttribute('allow'),/encrypted-media/);
  assert.equal(await frame.getAttribute('title'),'Spotify: cardigan oleh Taylor Swift');
  const placement=await page.evaluate(()=>{
   const body=document.querySelector('.poem__body').getBoundingClientRect();
   const button=document.querySelector('[data-soundtrack-play]').getBoundingClientRect();
   const player=document.querySelector('[data-soundtrack]').getBoundingClientRect();
   const nav=document.querySelector('.poem-nav').getBoundingClientRect();
   const iframe=document.querySelector('[data-soundtrack] iframe');
   return {buttonAbove:button.bottom<body.top,playerBelow:player.top>body.bottom,playerBeforeNav:player.bottom<nav.top,display:getComputedStyle(iframe).display,visibility:getComputedStyle(iframe).visibility};
  });
  assert.ok(placement.buttonAbove&&placement.playerBelow&&placement.playerBeforeNav,'control precedes the poem; visible player follows it before previous/next links');
  assert.notEqual(placement.display,'none');assert.equal(placement.visibility,'visible');
  assert.equal(await control.getAttribute('aria-pressed'),'false','nothing autoplays');
  await control.click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
  assert.equal(await control.getAttribute('aria-label'),'Jeda cardigan oleh Taylor Swift','Spotify confirms playback before the control changes to Pause');
  await page.screenshot({path:`/tmp/scratch-spotify-top-${viewport.width}.png`});
  await control.click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
  assert.equal(await control.getAttribute('aria-label'),'Putar cardigan oleh Taylor Swift');
  await control.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:10000});
  // Observe a real completion followed by confirmed playback near the beginning.
  await page.waitForFunction(()=>{
    const updates=window.__spotifyUpdates;
    const end=updates.findIndex(update=>update.duration>0&&update.position>=update.duration);
    return end>=0&&updates.slice(end+1).some(update=>!update.isPaused&&!update.isBuffering&&update.position<update.duration/2);
  },null,{timeout:45000});
  assert.equal(await control.getAttribute('aria-label'),'Jeda cardigan oleh Taylor Swift','the song repeats naturally and Pause remains available');
  assert.equal(await control.isEnabled(),true,'the repeating track can be paused');
  assert.equal(await control.locator('.soundtrack-play__start').isVisible(),false);
  assert.equal(await control.locator('.soundtrack-play__pause').isVisible(),true);
  await control.click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
  await page.waitForTimeout(600);
  assert.equal(await control.getAttribute('aria-label'),'Putar cardigan oleh Taylor Swift','Pause stops automatic repeat');
  await control.click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:10000});
  await page.locator('[data-soundtrack]').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'player stays within the viewport');
  await page.screenshot({path:`/tmp/scratch-spotify-bottom-${viewport.width}.png`});
  await control.click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
  assert.equal(await page.locator('.soundtrack__external').getAttribute('href'),'https://open.spotify.com/track/4R2kfaDFhslZEMJqAFNpdd');
  await page.goto(base+'/series/refraction/puisi/halaman-nol/');
  await page.locator('[data-soundtrack] iframe').waitFor({timeout:20000});
  assert.equal(await page.locator('[data-soundtrack-play]').count(),1,'series reader shares the same top control and bottom player');
  await page.goto(base+'/puisi/grafit/');
  await page.locator('[data-soundtrack] iframe').waitFor({timeout:20000});
  assert.equal(await page.locator('[data-soundtrack]').getAttribute('data-track-id'),'68HocO7fx9z0MgDU0ZPHro','new curation is available alongside preserved selections');
  assert.equal(await page.locator('[data-soundtrack-play]').count(),1);
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.disabled===false,null,{timeout:20000});
  await page.locator('[data-soundtrack-play]').click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
  assert.equal(await page.locator('[data-soundtrack-play]').getAttribute('aria-label'),'Jeda Every Summertime oleh NIKI');
  await page.locator('[data-soundtrack-play]').click();
  await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
  assert.deepEqual(errors,[]);
  console.log('PASS Spotify: real Play/Pause, natural repeat, stop repeat, keyboard, bottom player, series and viewport:',viewport.width);
  await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(base+'/puisi/halaman-nol/');
 assert.equal(await nojs.locator('[data-soundtrack] iframe').count(),1,'official player is present without JavaScript');
 assert.ok(await nojs.getByRole('link',{name:'Buka di Spotify'}).isVisible());
 console.log('PASS Spotify no-JavaScript official player and song link');
} finally {await browser.close();}
