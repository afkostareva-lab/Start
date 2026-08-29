#!/usr/bin/env python3
"""Собирает автономную версию карты для публичного хостинга.

Кладёт её и в docs/index.html, и в index.html в корне — чтобы GitHub Pages
работал при любом выборе папки в настройках (root или /docs).

Артефакт на claude.ai рендерится внутри готовой обёртки, поэтому сам файл
karta-rutiny.html не содержит <!doctype>, <html>, <head> и <body>.
Для GitHub Pages нужен полный документ — этот скрипт его и делает.
Запускать после любой правки karta-rutiny.html.
"""
import re
from pathlib import Path

SRC = Path(__file__).parent / "karta-rutiny.html"
OUTS = [Path(__file__).parent / "docs" / "index.html",
        Path(__file__).parent / "index.html"]

TITLE = "Карта рутины — Люмен"
DESC = ("Диагностика рабочей недели за десять минут: какие из твоих задач "
        "можно отдать ИИ уже сегодня, а какие пока рано. Без регистрации.")
URL = "https://afkostareva-lab.github.io/Start/"

body = SRC.read_text(encoding="utf-8")
# <title> и <link rel=stylesheet> переносим из тела в <head>
title_tag = re.search(r"<title>.*?</title>", body, flags=re.S).group(0)
links = re.findall(r'<link rel="[^"]*"[^>]*>', body)
body = body.replace(title_tag, "")
for l in links:
    body = body.replace(l, "")
body = body.lstrip("\n")

head = "\n".join([
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    f'<title>{TITLE}</title>',
    f'<meta name="description" content="{DESC}">',
    '<meta name="color-scheme" content="light dark">',
    f'<meta property="og:title" content="Карта рутины">',
    f'<meta property="og:description" content="{DESC}">',
    f'<meta property="og:type" content="website">',
    f'<meta property="og:url" content="{URL}">',
    f'<meta property="og:image" content="{URL}og.png">',
    '<meta name="twitter:card" content="summary_large_image">',
    *links,
    '<link rel="icon" href="data:image/svg+xml,'
    '%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E'
    '%3Ctext y=%2226%22 font-size=%2226%22%3E%F0%9F%97%BA%EF%B8%8F%3C/text%3E%3C/svg%3E">',
])

PAGE = f"<!doctype html>\n<html lang=\"ru\">\n<head>\n{head}\n</head>\n<body>\n{body}\n</body>\n</html>\n"
for out in OUTS:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(PAGE, encoding="utf-8")
    print(f"{out.relative_to(Path(__file__).parent)}: {out.stat().st_size} bytes")

# Ассеты (слайды, QR) лежат в корне; зеркалим их в docs/, чтобы GitHub Pages
# отдавал их независимо от того, какая папка выбрана источником — root или /docs.
import shutil
for folder in ("karusel", "qr"):
    src = Path(__file__).parent / folder
    if not src.is_dir():
        continue
    dst = Path(__file__).parent / "docs" / folder
    dst.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in src.iterdir():
        if f.is_file():
            shutil.copy2(f, dst / f.name); n += 1
    print(f"docs/{folder}: {n} файлов")
