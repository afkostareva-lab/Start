"""Встраивает шрифты Google Fonts в страницы (base64 woff2), чтобы они работали офлайн.
Берём только наборы символов latin и cyrillic."""
import base64, re, sys, urllib.request
from pathlib import Path

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
FILES = sys.argv[1:]

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

src = Path(FILES[0]).read_text(encoding="utf-8")
url = re.search(r'<link href="(https://fonts\.googleapis\.com/css2\?[^"]*)" rel="stylesheet">', src).group(1)
url = url.replace("&amp;", "&")
css = get(url).decode()

blocks = re.findall(r"/\* ([^*]+?) \*/\s*(@font-face \{[^}]*\})", css)
groups, total, cache = {}, 0, {}
for subset, block in blocks:
    if subset not in ("latin", "cyrillic"):
        continue
    mm = re.search(r"url\((https://[^)]+)\)", block)
    if not mm:
        print("no url in", subset); continue
    furl = mm.group(1)
    fam = re.search(r"font-family: '([^']+)'", block).group(1)
    sty = re.search(r"font-style: (\w+)", block).group(1)
    wts = [int(x) for x in re.search(r"font-weight: ([\d ]+);", block).group(1).split()]
    rng = re.search(r"unicode-range: ([^;]+);", block).group(1)
    g = groups.setdefault(furl, {"fam": fam, "sty": sty, "w": [], "rng": rng})
    g["w"] += wts
    if furl not in cache:
        data = get(furl)
        total += len(data)
        cache[furl] = "data:font/woff2;base64," + base64.b64encode(data).decode()
keep = []
for furl, g in groups.items():
    w = f"{min(g['w'])} {max(g['w'])}" if min(g['w']) != max(g['w']) else str(g['w'][0])
    keep.append(f"@font-face{{font-family:'{g['fam']}';font-style:{g['sty']};font-weight:{w};font-display:swap;src:url({cache[furl]}) format('woff2');unicode-range:{g['rng']}}}")
fontcss = "<style>/* Шрифты встроены для работы без интернета: Inter Tight, Bodoni Moda, Pinyon Script, Playfair Display (SIL OFL) */\n" + "\n".join(keep) + "\n</style>"
print(f"{len(keep)} @font-face, {len(cache)} файлов, {total/1024:.0f} КБ")

for f in FILES:
    s = Path(f).read_text(encoding="utf-8")
    s = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com"><link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\n', "", s)
    s = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">', lambda m: fontcss, s)
    assert "fonts.g" not in s, f
    Path(f).write_text(s, encoding="utf-8")
    print(f, f"{Path(f).stat().st_size/1024:.0f} КБ")
