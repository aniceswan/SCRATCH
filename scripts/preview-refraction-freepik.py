"""Serve a private comparison board; never replaces website assets or downloads licensed source files."""
import argparse
import concurrent.futures
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import urllib.request

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port', type=int, default=4327)
parser.add_argument('--output', type=Path, default=Path('/tmp/scratch-refraction-freepik'))
parser.add_argument('--no-serve', action='store_true')
args = parser.parse_args()
base = args.output.resolve()
(base / 'previews').mkdir(parents=True, exist_ok=True)
(base / 'current').mkdir(exist_ok=True)
data = json.loads((root / 'docs/artwork/refraction-freepik-candidates.json').read_text())
series = (root / 'src/content/series/refraction.md').read_text()
expected = {line[4:] for line in series.splitlines() if line.startswith('  - ')} - {'halaman-nol'}
assert {item['slug'] for item in data['candidates'] if item['slug'] != 'cover-refraction'} == expected

for item in data['candidates']:
    slug = item['slug']
    if slug == 'cover-refraction':
        source = root / 'src/assets/series/refraction.webp'
        item.update(poemTitle='refraction', number=0)
    else:
        source = root / 'src/assets/puisi' / (slug + '.webp')
        lines = (root / 'src/content/puisi' / (slug + '.md')).read_text().splitlines()
        item['poemTitle'] = json.loads(next(line[7:] for line in lines if line.startswith('title: ')))
        item['number'] = int(next(line[7:] for line in lines if line.startswith('order: ')))
    shutil.copyfile(source, base / 'current' / (slug + '.webp'))
    item['currentImage'] = 'current/' + slug + '.webp'


def preview(item):
    if not item.get('previewUrl'):
        return
    filename = 'previews/' + item['resourceId'] + '.jpg'
    target = base / filename
    try:
        if not target.exists():
            with urllib.request.urlopen(item['previewUrl'], timeout=20) as response:
                if not response.headers.get('content-type', '').startswith('image/'):
                    return
                target.write_bytes(response.read())
        item['previewImage'] = filename
    except Exception as error:
        print(f"Preview unavailable for {item['slug']}: {error}")


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(preview, data['candidates']))
shutil.copyfile(root / 'src/assets/puisi/halaman-nol.webp', base / 'current/halaman-nol.webp')
shutil.copyfile(root / 'docs/artwork/refraction-freepik-preview.html', base / 'index.html')
(base / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
preview_count = sum(bool(item.get('previewImage')) for item in data['candidates'])
print(f"Local board: 39 poem candidates, 1 optional cover; {preview_count} public previews. Halaman Nol and website assets unchanged.", flush=True)
if not args.no_serve:
    print(f"Open http://localhost:{args.port}/", flush=True)
    handler = partial(SimpleHTTPRequestHandler, directory=str(base))
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
