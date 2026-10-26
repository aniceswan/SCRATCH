import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.BASE_URL??'http://127.0.0.1:4326';
const slug='jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir';
const fakeApi=`
window.YT={Player:class {
 constructor(frame,options){this.options=options;this.time=0;window.__youtube={calls:[],state:(data,time=0)=>{this.time=time;options.events.onStateChange({target:this,data});},error:data=>options.events.onError({target:this,data}),ready:()=>options.events.onReady({target:this}),blocked:()=>options.events.onAutoplayBlocked()};queueMicrotask(window.__youtube.ready);}
 loadVideoById(options){this.time=options.startSeconds;window.__youtube.calls.push(options.endSeconds===undefined?['load',options.startSeconds]:['load',options.startSeconds,options.endSeconds]);}
 playVideo(){window.__youtube.calls.push(['play']);}
 pauseVideo(){window.__youtube.calls.push(['pause']);}
 getCurrentTime(){return this.time;}
}};window.onYouTubeIframeAPIReady();`;
const tracks=JSON.parse(await readFile(new URL('./poem-soundtracks.json',import.meta.url),'utf8'));
const cardigan=tracks.find(track=>track.poems.includes('halaman-nol')).youtube.videoId;
const cases=[
 ...[1440,390,320].flatMap(width=>[
  {width,path:`/fragments/${slug}/`,id:'3H2SpXpIwhY',body:'.fragment-body',nav:'.fragment-reading-nav'},
  {width,path:'/puisi/halaman-nol/',id:cardigan,body:'.poem__body',nav:'.poem-nav'},
 ]),
 {width:390,path:'/v2/puisi/halaman-nol/',id:cardigan,body:'.reader-body',nav:'.reader-navigation'},
 {width:1440,path:'/classic/puisi/halaman-nol/',id:cardigan,body:'.poem__body',nav:'.poem-nav'},
 {width:390,path:'/v3/series/refraction/puisi/halaman-nol/',id:cardigan,body:'.poem__body',nav:'.poem-nav'},
];
try{
 for(const sample of cases){
  const viewport={width:sample.width,height:sample.width===320?568:900};
  const start=0;
  const page=await browser.newPage({viewport,reducedMotion:'reduce'}),requests=[],errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'application/javascript',body:fakeApi}));
  await page.route('https://www.youtube.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>YouTube test double</title>'}));
  await page.goto(base+sample.path);await page.evaluate(()=>document.fonts.ready);
  const button=page.locator('[data-soundtrack-play]');await page.waitForFunction(()=>!document.querySelector('[data-soundtrack-play]').disabled);
  const clockStart=new Date('2026-10-26T00:00:00Z');
  await page.clock.install({time:clockStart});await page.clock.pauseAt(new Date(clockStart.valueOf()+1000));
  const calls=()=>page.evaluate(()=>window.__youtube.calls);
  const loads=async()=>(await calls()).filter(c=>c[0]==='load').length;
  const state=(code,time=start)=>page.evaluate(({code,time})=>window.__youtube.state(code,time),{code,time});
  assert.equal(await page.locator('[data-youtube-frame]').count(),1);assert.equal(await page.locator('[data-spotify-mount],[data-soundtrack]').count(),0);
  if(sample.body==='.fragment-body')assert.equal(await page.locator('.fragment-body p').count(),5);
  const url=new URL(await page.locator('[data-youtube-frame]').getAttribute('src'));
  assert.equal(url.pathname,`/embed/${sample.id}`);assert.equal(url.searchParams.get('start'),String(start));assert.equal(url.searchParams.get('end'),null);assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(url.searchParams.get('enablejsapi'),'1');
  assert.equal(await page.locator('[data-youtube-frame]').getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');
  const layout=await page.evaluate(({body,nav})=>{const r=s=>document.querySelector(s).getBoundingClientRect();return {above:r('[data-soundtrack-play]').bottom<r(body).top,below:r('[data-youtube-frame]').top>r(body).bottom,beforeNav:r('[data-youtube-soundtrack]').bottom<r(nav).top,width:r('[data-youtube-frame]').width,height:r('[data-youtube-frame]').height,display:getComputedStyle(document.querySelector('[data-youtube-frame]')).display};},{body:sample.body,nav:sample.nav});
  assert.ok(layout.above&&layout.below&&layout.beforeNav&&layout.width>=200&&layout.height>=200&&layout.display!=='none','top control and visible bottom video retain the reading layout');
  assert.deepEqual(await calls(),[]);assert.equal(await button.getAttribute('aria-pressed'),'false');
  await button.click();assert.deepEqual(await calls(),[['load',0]]);await state(2);await state(1);
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  await page.clock.fastForward(120000);assert.equal(await loads(),1,'there is no 30-second cutoff');
  await state(1,150);assert.equal(await loads(),1,'native seeking is unrestricted');
  await state(0,338);assert.equal(await button.getAttribute('aria-pressed'),'false','natural completion restores Play');
  await page.clock.fastForward(350000);assert.equal(await loads(),1,'completion never loops automatically');
  await button.click();assert.equal(await loads(),2,'another Play starts a fresh playback');assert.deepEqual((await calls()).at(-1),['load',0]);
  await state(1);await button.click();await state(1);assert.equal((await calls()).at(-1)[0],'pause');await state(2);
  assert.equal(await button.getAttribute('aria-pressed'),'false');
  await state(1,40);await state(2,40);assert.equal(await button.getAttribute('aria-pressed'),'false','native Pause stays synchronized');
  await page.evaluate(()=>window.__youtube.blocked());assert.match(await page.locator('[data-soundtrack-status]').textContent(),/Tekan Play langsung/);
  await page.evaluate(()=>window.__youtube.error(150));assert.ok(await button.isDisabled());assert.match(await page.locator('[data-soundtrack-status]').textContent(),/tidak mengizinkan/);
  await page.evaluate(()=>window.__youtube.ready());assert.ok(await button.isDisabled(),'late Ready cannot hide a refused embed');
  assert.equal(await page.locator('.youtube-soundtrack__external').getAttribute('href'),`https://www.youtube.com/watch?v=${sample.id}&t=${start}s`);
  assert.ok(!requests.some(url=>url.startsWith('https://open.spotify.com/')),'YouTube does not silently load Spotify');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  await page.close();console.log(`PASS YouTube ${sample.path} ${viewport.width}: visible player, full playback, natural stop, replay from zero, Pause and failure state`);
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await plain.route('https://www.youtube.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html>'}));
 await plain.goto(base+`/v3/fragments/${slug}/`);assert.equal(await plain.locator('[data-youtube-frame]').count(),1);assert.ok(await plain.getByRole('link',{name:'Buka di YouTube'}).isVisible());assert.equal(await plain.locator('.fragment-body p').count(),5);
 for(const prefix of ['', '/v3', '/classic', '/v2']) {
  await plain.goto(base+prefix+'/puisi/halaman-nol/');
  assert.equal(await plain.locator('[data-youtube-frame]').count(),1);
  assert.ok(await plain.getByRole('link',{name:'Buka di YouTube'}).isVisible());
  assert.equal(await plain.locator('iframe[src*="spotify"]').count(),0);
 }
 console.log('PASS all editions retain no-JavaScript frame, manuscript and external link');
}finally{await browser.close();}
