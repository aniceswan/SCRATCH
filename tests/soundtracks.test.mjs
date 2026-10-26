import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

const normalize=value=>value.toLocaleLowerCase('en').replace(/[^a-z0-9]/g,'');
const preserved=new Set(['halaman-nol','kontur','ambang','the-weather-i-withheld','the-longest-time','katalog-benda-yang-tak-jadi','sebuah-nama','pi']);

async function poems(){
 const folder=new URL('../src/content/puisi/',import.meta.url);
 return Promise.all((await readdir(folder)).filter(name=>name.endsWith('.md')).map(async name=>{
  const text=await readFile(new URL(name,folder),'utf8');
  const title=JSON.parse(text.match(/^title: (.+)$/m)[1]);
  assert.doesNotMatch(text,/^spotify:/m,'Spotify is no longer configured for readers');
  const match=text.match(/^youtube:\n  videoId: (.+)\n  title: (.+)\n  artist: (.+)$/m);
  return {slug:name.slice(0,-3),title,track:match?{videoId:JSON.parse(match[1]),title:JSON.parse(match[2]),artist:JSON.parse(match[3])}:null};
 }));
}

test('all 46 poems retain their curated soundtrack through matching YouTube metadata',async()=>{
 const [entries,manifest]=await Promise.all([poems(),readFile(new URL('../scripts/poem-soundtracks.json',import.meta.url),'utf8').then(JSON.parse)]);
 assert.equal(entries.length,46);assert.equal(manifest.length,43);
 const assignments=new Map();
 for(const record of manifest){
  assert.match(record.trackId,/^[A-Za-z0-9]{22}$/);
  assert.equal(record.source,`https://open.spotify.com/track/${record.trackId}`);
  assert.match(record.youtube.videoId,/^[A-Za-z0-9_-]{11}$/);
  assert.equal(record.youtube.source,`https://www.youtube.com/watch?v=${record.youtube.videoId}`);
  for(const slug of record.poems){assert.ok(!assignments.has(slug),`${slug} has a unique assignment`);assignments.set(slug,record);}
 }
 assert.equal(assignments.size,46);
 for(const entry of entries){
  assert.ok(entry.track,entry.slug);
  const expected=assignments.get(entry.slug);assert.ok(expected,entry.slug);
  assert.deepEqual(entry.track,{videoId:expected.youtube.videoId,title:expected.title,artist:expected.artist},entry.slug);
 }
});

test('the curation fills 38 empty poems while retaining prior choices and skipping the unpublished title',async()=>{
 const entries=await poems();const byTitle=new Map(entries.map(entry=>[normalize(entry.title),entry]));
 byTitle.set('palimpsest',byTitle.get('palimsest'));
 const source=await readFile(new URL('../content-source/playlist-puisi.txt',import.meta.url),'utf8');
 const rows=[...source.matchAll(/^\d{2}\. (.+)\n    (.+)$/gm)];
 assert.equal(rows.length,47);
 let added=0,kept=0;const missing=[];
 for(const [,title,soundtrack]of rows){
  const entry=byTitle.get(normalize(title));
  if(!entry){missing.push(title);continue;}
  if(preserved.has(entry.slug)){kept++;continue;}
  const separator=soundtrack.lastIndexOf(' - ');
  const song=soundtrack.slice(0,separator),artist=soundtrack.slice(separator+3);
  const actual=normalize(entry.track.title);
  assert.ok(actual===normalize(song)||actual===normalize(song)+'bonustrack',entry.slug);
  for(const name of artist.split(' & '))assert.ok(normalize(entry.track.artist).includes(normalize(name)),entry.slug);
  added++;
 }
 assert.equal(added,38);assert.equal(kept,8);assert.deepEqual(missing,['Pintu yang Terkunci']);
});
