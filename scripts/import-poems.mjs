import {readFile, writeFile, readdir, mkdtemp, cp, unlink} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

export function parseManuscript(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const headings = [...text.matchAll(/^(\d{2}) \/ (.+)$/gm)];
  if (!headings.length) throw new Error('Tidak ada nomor puisi dalam naskah');
  const poems = headings.map((match, index) => {
    const order = Number(match[1]);
    if (order !== index + 1) throw new Error('Nomor puisi harus berurutan tanpa duplikasi');
    const next = headings[index + 1]?.index ?? text.length;
    const raw = text.slice(match.index + match[0].length, next);
    const body = raw.split(/^(?:[IVX]+\. [^\n]+\n[─-]+|SELESAI\s*$|CATATAN REDAKSI)/m)[0].trim();
    if (!body) throw new Error(`Puisi ${order} kosong`);
    const title = match[2].trim();
    const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {order, title, slug, body};
  });
  if (new Set(poems.map(p => p.slug)).size !== poems.length) throw new Error('Judul puisi menghasilkan slug duplikat');
  return poems;
}

async function main() {
  const sourcePath = process.argv[2] ?? 'content-source/arsip-cahaya-yang-salah-arah.txt';
  const poems = parseManuscript(await readFile(sourcePath, 'utf8'));
  if (poems.length !== 24) throw new Error(`Expected 24 poems, found ${poems.length}`);
  const art = JSON.parse(await readFile('scripts/poetry-art.json', 'utf8'));
  for (const poem of poems) {
    if (!art.some(a => a.slug === poem.slug)) throw new Error(`Ilustrasi belum tersedia: ${poem.slug}`);
    await readFile(`src/assets/puisi/${poem.slug}.webp`);
  }
  const backup = await mkdtemp(path.join(os.tmpdir(), 'scratch-previous-collection-'));
  await cp('src/content/puisi', path.join(backup, 'content'), {recursive: true});
  await cp('src/assets/puisi', path.join(backup, 'images'), {recursive: true});
  for (const name of await readdir('src/content/puisi')) {
    if (name.endsWith('.md')) await unlink(path.join('src/content/puisi', name));
  }
  const keep = new Set(poems.map(p => `${p.slug}.webp`));
  for (const name of await readdir('src/assets/puisi')) {
    if (/\.(jpg|png|webp|jpeg)$/i.test(name) && !keep.has(name)) await unlink(path.join('src/assets/puisi', name));
  }
  const english = new Set([3, 9, 13, 19, 23]);
  for (const poem of poems) {
    const image = art.find(a => a.slug === poem.slug);
    const excerpt = poem.body.split('\n').filter(Boolean).slice(0, 2).join(' ');
    const fields = {title: poem.title, date: '2026-10-25', order: poem.order, lang: english.has(poem.order) ? 'en' : 'id', image: `../../assets/puisi/${poem.slug}.webp`, imageAlt: image.alt, excerpt, draft: false};
    const frontmatter = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
    await writeFile(`src/content/puisi/${poem.slug}.md`, `---\n${frontmatter}\n---\n\n${poem.body}\n`);
  }
  console.log(`Imported ${poems.length} poems. Previous collection backed up to ${backup}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(error => {console.error(error); process.exitCode = 1;});
}
