import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import sharp from 'sharp';

const slug='jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir';

test('the first fragment preserves the complete supplied prose independently of poems',async()=>{
 const [markdown,source]=await Promise.all([
  readFile(new URL(`../src/content/fragments/${slug}.md`,import.meta.url),'utf8'),
  readFile(new URL('../content-source/fragments/rembulan.txt',import.meta.url),'utf8'),
 ]);
 const [,frontmatter,body]=markdown.split('---\n');
 assert.match(frontmatter,/^title: "Jikalau Aku Adalah Rembulan, Akankah Kau Menemaniku Sampai Akhir"$/m);
 assert.equal(body.trim(),source.trim());
 assert.equal(body.trim().split(/\n\n+/).length,5);
 assert.ok(body.trim().endsWith('saat lelahmu sudah hilang dan rembulan tak lagi dibutuhkan.'));
 const poems=await readdir(new URL('../src/content/puisi/',import.meta.url));
 assert.equal(poems.filter(name=>name.endsWith('.md')).length,46);
 assert.ok(!poems.includes(slug+'.md'),'fragments do not enter the poem carousel or its series');
});

test('fragment cover is a landscape 4:3 WebP asset',async()=>{
 const image=await sharp(new URL('../src/assets/fragments/rembulan.webp',import.meta.url).pathname).metadata();
 assert.deepEqual([image.width,image.height,image.format],[1440,1080,'webp']);
 assert.equal(image.width/image.height,4/3);
});
