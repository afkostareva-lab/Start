# Собирает прототип в один HTML-файл: картинки вшиваются внутрь, чтобы он открывался без интернета.
import base64, sys, re
src = open('template.html', encoding='utf-8').read()
def data(m):
    b = open(f'img/{m.group(1)}.jpg', 'rb').read()
    return 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
out = re.sub(r'\{\{(\w+)\}\}', data, src)
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print(sys.argv[1], round(len(out) / 1024), 'KB')
