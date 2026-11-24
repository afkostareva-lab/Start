"""Сверяет страницу слов модуля с Word List учебника по частям модуля.

Запуск:
  python3 check_wordlist.py module4-words.html wordlist.json

wordlist.json — слова из Word List учебника по частям, плюс какие разделы страницы
считаются этой частью (первое поле строки RAW, сравнение по началу строки):
{
  "4a": {"sections": ["4a"], "words": ["advertisement", "cartoon strip", "..."]},
  "use": {"sections": ["English in Use"], "words": ["..."]}
}
Слово считается найденным, если оно встречается как начало слова внутри английской
части записи в нужном разделе («blood sample» найдёт «blood samples», «cope (with)» ищется как «cope»).
"""
import json, re, sys
from pathlib import Path

page, wl = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
s = page.read_text(encoding="utf-8")
raw = re.search(r"const RAW=`(.*?)`", s, re.S).group(1).strip().split("\n")
cur = [(l.split("|")[0], l.split("|")[1]) for l in raw]

def key(w):
    w = w.lower().replace("(e)", "")
    w = re.sub(r"\s*\(.*?\)", "", w)          # cope (with) -> cope
    return w.strip()

total_missing = 0
for part, spec in wl.items():
    secs = tuple(spec["sections"])
    missing = []
    for w in spec["words"]:
        k = key(w)
        hits = [(sec, e) for sec, e in cur if re.search(r"(^|[\s/(])" + re.escape(k), e.lower())]
        if any(sec.startswith(secs) for sec, _ in hits):
            continue
        missing.append(f"{w}" + (f"   [есть в другом разделе: {hits[0][0]} → {hits[0][1]}]" if hits else ""))
    total_missing += len(missing)
    print(f"== {part}: в Word List {len(spec['words'])}, не хватает {len(missing)}")
    for m in missing:
        print("   -", m)

dups = {}
for sec, e in cur:
    dups[(sec, e.lower())] = dups.get((sec, e.lower()), 0) + 1
d = [k for k, v in dups.items() if v > 1]
print(f"\nВсего записей: {len(cur)}; повторы внутри раздела: {d or 'нет'}")
sys.exit(1 if total_missing else 0)
