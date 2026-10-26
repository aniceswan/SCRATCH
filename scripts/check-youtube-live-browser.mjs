import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const manifest=JSON.parse(await readFile(new URL('./poem-soundtracks.json',import.meta.url),'utf8'));
const origin=new URL(process.env.PUBLIC_ORIGIN??manifest[0].youtube.verifiedOrigin).origin;
assert.ok(origin.startsWith('https://'),'verify with the actual HTTPS deployment origin');
const dist=resolve(new URL('../dist/',import.meta.url).pathname);
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.avif':'image/avif'};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const samples=manifest.map(track=>({path:`/puisi/${track.poems[0]}/`,id:track.youtube.videoId,title:track.title}));
samples.push({path:'/fragments/jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir/',id:'3H2SpXpIwhY',title:'Untuk Perempuan Yang Sedang Di Pelukan'});
const results=[];let cursor=0;
async function routeBuild(page){
 // Serve the local build only inside this test browser. Nothing is deployed or changed remotely.
 // YouTube's behavior can differ for a loopback HTTP referrer and the real HTTPS site.
 await page.route(origin+'/**',async route=>{
  let path=decodeURIComponent(new URL(route.request().url()).pathname);if(path.endsWith('/'))path+='index.html';
  const file=resolve(dist,'.'+path);
  if(!file.startsWith(dist+sep))return route.fulfill({status:403,body:'Forbidden'});
  try{await route.fulfill({status:200,contentType:types[extname(file)]??'application/octet-stream',body:await readFile(file)});}catch{return route.fulfill({status:404,body:'Not found'});}
 });
}
try{
 await Promise.all(Array.from({length:3},async()=>{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await routeBuild(page);
  const spotify=[];page.on('request',r=>{if(new URL(r.url()).hostname.endsWith('spotify.com'))spotify.push(r.url());});
  while(cursor<samples.length){const sample=samples[cursor++];
   try{
    await page.goto(origin+sample.path,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.querySelector('[data-soundtrack-play]')?.disabled||document.querySelector('[data-soundtrack-status]')?.textContent.includes('tidak mengizinkan'),null,{timeout:25000});
    const button=page.locator('[data-soundtrack-play]');assert.equal(await button.isDisabled(),false,await page.locator('[data-soundtrack-status]').textContent());
    assert.equal(await page.locator('[data-youtube-frame]').count(),1);assert.equal(await page.locator('[data-youtube-soundtrack]').getAttribute('data-video-id'),sample.id);
    await button.click();await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='true',null,{timeout:25000});
    const frame=page.frames().find(f=>f.url().startsWith('https://www.youtube.com/embed/'));
    const media=await frame.locator('video').evaluate(video=>({time:video.currentTime,duration:video.duration,paused:video.paused}));
    assert.ok(media.duration>60&&!media.paused,'real full-length video is playing');
    await button.click();await page.waitForFunction(()=>document.querySelector('[data-soundtrack-play]')?.getAttribute('aria-pressed')==='false',null,{timeout:10000});
    assert.deepEqual(spotify,[],'no Spotify is downloaded');
    results.push({title:sample.title,videoId:sample.id,...media,pass:true});console.log('PASS real playback + Pause: '+sample.title+' '+sample.id);
   }catch(error){results.push({title:sample.title,videoId:sample.id,pass:false,error:error.message});console.log('FAIL '+sample.title+' '+error.message.slice(0,300));}
  }
  await page.close();
 }));
 const about=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await routeBuild(about);await about.goto(origin+'/about/');
 assert.equal(await about.getByRole('link',{name:'takkaloppaeh@gmail.com'}).getAttribute('href'),'mailto:takkaloppaeh@gmail.com');
 assert.ok(await about.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await about.screenshot({path:'/tmp/scratch-about-email-390.png'});
 await about.setViewportSize({width:1440,height:900});await about.screenshot({path:'/tmp/scratch-about-email-1440.png'});
 assert.equal(results.filter(r=>!r.pass).length,0,JSON.stringify(results.filter(r=>!r.pass)));
 console.log(`PASS all ${results.length} unique soundtracks through the real integrated player on ${origin}; About email and mobile layout`);
}finally{await browser.close();}
