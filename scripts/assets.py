"""Fetch public assets once at development time, never during export."""
from pathlib import Path
import json
import urllib.request

root = Path(__file__).resolve().parents[1]
public = root / 'public'
def fetch(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={'User-Agent': 'DisclosureStudio/0.1'})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
    if not data:
        raise RuntimeError(f'Empty asset: {url}')
    path.write_bytes(data)
    print(f'{path.relative_to(root)}: {len(data)} bytes')

fonts = 'https://raw.githubusercontent.com/google/fonts/main/ofl/hankengrotesk/'
for remote, local in [('HankenGrotesk%5Bwght%5D.ttf', 'HankenGrotesk.ttf'), ('HankenGrotesk-Italic%5Bwght%5D.ttf', 'HankenGrotesk-Italic.ttf'), ('OFL.txt', 'OFL.txt')]:
    fetch(fonts + remote, public / 'fonts' / local)
icons = ['openai', 'claude', 'gemini', 'deepseek', 'grok', 'meta', 'qwen', 'mistral', 'moonshot', 'zai', 'nousresearch', 'cohere', 'nvidia', 'perplexity', 'microsoft', 'amazon', 'minimax', 'bytedance', 'ai21', 'baidu', 'stepfun']
for icon in icons:
    try:
        fetch(f'https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/{icon}.svg', public / 'logos' / f'{icon}.svg')
    except Exception as error:
        print(f'Logo unavailable ({icon}): {error}; initials fallback remains available')
fetch('https://raw.githubusercontent.com/lobehub/lobe-icons/master/LICENSE', public / 'logos' / 'LICENSE.txt')
fetch('https://openrouter.ai/api/v1/models', root / 'scripts' / 'catalog-raw.json')
data = json.loads((root / 'scripts' / 'catalog-raw.json').read_text('utf-8'))
models = sorted({m['id']: {'id': m['id'], 'name': m.get('name', m['id'])} for m in data['data']}.values(), key=lambda m: m['id'])
(root / 'src' / 'catalog.json').write_text(json.dumps(models, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Bundled {len(models)} unique models')
