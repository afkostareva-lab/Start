"""Уменьшенные копии картинок для страницы плана. Запуск: python3 tiktok/src/thumbs.py"""
import glob, os
from PIL import Image

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img')
n = 0
for f in sorted(glob.glob(os.path.join(root, '**', '*.png'), recursive=True)):
    rel = os.path.relpath(f, root)
    if rel.startswith('thumbs'):
        continue
    out = os.path.join(root, 'thumbs', rel[:-4] + '.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.open(f).convert('RGB').resize((324, 576), Image.LANCZOS).save(out, 'JPEG', quality=82, optimize=True)
    n += 1
print('уменьшенных копий:', n)
