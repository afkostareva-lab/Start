#!/usr/bin/env python3
"""Еженедельный список звуков TikTok, которые начинают набирать.

Запуск:  python3 -I tiktok/src/zvuki.py --cache <пустая папка для скачанного>

1. Берёт аккаунты из tiktok/zvuki/akkaunty.txt и смотрит их ролики за последние 7 дней.
2. Для заметных свежих роликов узнаёт звук.
3. По каждому звуку проверяет: сколько роликов под ним сейчас и в прошлый замер
   (tiktok/zvuki/istoriya.json), когда звук появился, когда под ним вышел первый
   ролик от 100 тыс. просмотров и сколько таких вышло за последнюю неделю.
4. Авторов свежих хитов под растущими звуками добавляет в поиск и делает ещё один круг.

Результат: tiktok/zvuki/syroe-<дата>.json и обновлённый istoriya.json.
Новые авторы дописываются в tiktok/zvuki/akkaunty-novye.txt: их стоит просмотреть
и лучших перенести в akkaunty.txt.
"""
import argparse
import datetime as dt
import json
import os
import re
import statistics
import subprocess
import sys
import time

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZV = os.path.join(ROOT, 'zvuki')
UTC = dt.timezone.utc
CYR = re.compile('[а-яА-ЯёЁ]')
HIT = 100_000          # просмотров, с которых ролик считается хитом
FRESH_DAYS = 7         # «свежий» ролик
START_DAYS = 10        # звук «начинает», если первый хит не старше этого
LATE_DAYS = 18         # звук «поздно брать», если первый хит старше этого


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def when(item_id):
    """Дата публикации зашита в старшие биты номера ролика или звука."""
    return dt.datetime.fromtimestamp(int(item_id) >> 32, UTC)


class Net:
    def __init__(self, cache):
        self.cache = cache
        os.makedirs(cache, exist_ok=True)
        self.n = 0

    def get(self, url, name):
        """Скачивает страницу и возвращает текст. Удачные ответы кэшируются на время запуска."""
        path = os.path.join(self.cache, name)
        if os.path.exists(path) and os.path.getsize(path) > 2000:
            return open(path, encoding='utf-8', errors='replace').read()
        for attempt in range(3):
            r = subprocess.run(['curl', '-sS', '-m', '25', '-L', '-o', path, '-w', '%{http_code}',
                                '-A', UA, '-H', 'Accept-Language: ru-RU,ru;q=0.9', url],
                               capture_output=True, text=True)
            self.n += 1
            time.sleep(1.1)
            if r.stdout.strip() == '200' and os.path.exists(path) and os.path.getsize(path) > 2000:
                return open(path, encoding='utf-8', errors='replace').read()
            time.sleep(6 * (attempt + 1))
        return ''


def script_json(html, sid):
    m = re.search(r'<script[^>]*id="%s"[^>]*>(.*?)</script>' % sid, html, re.S)
    try:
        return json.loads(m.group(1)) if m else None
    except ValueError:
        return None


def embed_list(html):
    """Список роликов и сведения из встраиваемой страницы (аккаунт или звук)."""
    data = script_json(html, '__FRONTITY_CONNECT_STATE__') or {}
    for v in (data.get('source', {}).get('data', {}) or {}).values():
        if isinstance(v, dict) and 'videoList' in v:
            vids = []
            for it in v.get('videoList') or []:
                vids.append({'id': it['id'], 'author': it.get('authorUniqueId'), 'date': when(it['id']),
                             'plays': int(it.get('playCount') or 0), 'desc': it.get('desc') or ''})
            return vids, (v.get('embedInfo') or {})
    return [], {}


def account(net, user):
    vids, _ = embed_list(net.get(f'https://www.tiktok.com/embed/@{user}', f'acc_{user}.html'))
    return vids


def detail(net, author, vid):
    """Звук, статистика и текст на экране одного ролика. Тяжёлую страницу сразу удаляем."""
    jpath = os.path.join(net.cache, f'v_{vid}.json')
    if os.path.exists(jpath):
        return json.load(open(jpath, encoding='utf-8'))
    name = f'v_{vid}.html'
    html = net.get(f'https://www.tiktok.com/@{author}/video/{vid}', name)
    data = script_json(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__') or {}
    it = (((data.get('__DEFAULT_SCOPE__', {}).get('webapp.video-detail') or {}).get('itemInfo') or {})
          .get('itemStruct') or {})
    try:
        os.remove(os.path.join(net.cache, name))
    except OSError:
        pass
    if not it or not it.get('music'):
        return None
    st, mu = it.get('stats') or {}, it.get('music') or {}
    plays = int(st.get('playCount') or 0) or 1
    text = ' / '.join(t.replace('\n', ' ') for s in it.get('stickersOnItem') or [] for t in s.get('stickerText') or [])
    ip = it.get('imagePost')
    out = {
        'id': vid, 'author': author, 'date': when(vid).strftime('%Y-%m-%d'), 'plays': plays,
        'shares_pct': round(int(st.get('shareCount') or 0) / plays * 100, 2),
        'saves_pct': round(int(st.get('collectCount') or 0) / plays * 100, 2),
        'followers': (it.get('authorStats') or {}).get('followerCount'),
        'format': f"карусель {len(ip.get('images') or [])} фото" if ip else f"видео {(it.get('video') or {}).get('duration')} с",
        'text': text.strip(), 'desc': (it.get('desc') or '')[:200],
        'music': {'id': mu.get('id'), 'title': mu.get('title'), 'author': mu.get('authorName'),
                  'original': bool(mu.get('original')), 'duration': mu.get('duration')},
    }
    json.dump(out, open(jpath, 'w', encoding='utf-8'), ensure_ascii=False)
    return out


def scan_accounts(net, users, now, known):
    """Свежие заметные ролики аккаунтов. Возвращает подробности роликов."""
    since = now - dt.timedelta(days=FRESH_DAYS)
    found = []
    for i, u in enumerate(users, 1):
        vids = account(net, u)
        if i % 10 == 0:
            log(f'  аккаунтов {i}/{len(users)}, запросов {net.n}')
        if not vids:
            continue
        old = [v['plays'] for v in vids if v['date'] < since]
        base = statistics.median(old or [v['plays'] for v in vids]) or 1
        fresh = [v for v in vids if v['date'] >= since]
        pick = [v for v in fresh if v['plays'] >= 30_000 or (v['plays'] >= 5_000 and v['plays'] / base >= 3)]
        for v in sorted(pick, key=lambda v: -v['plays'])[:3]:
            if v['id'] in known:
                continue
            d = detail(net, u, v['id'])
            if d:
                d['ratio'] = round(v['plays'] / base, 1)
                d['author_base'] = int(base)
                known[v['id']] = d
                found.append(d)
    return found


def scan_sound(net, music, now, history):
    mid = str(music['id'])
    vids, info = embed_list(net.get(f'https://www.tiktok.com/embed/music/{mid}', f'm_{mid}.html'))
    if not vids and not info:
        return None
    count = int(info.get('videoCount') or 0)
    since, since3 = now - dt.timedelta(days=FRESH_DAYS), now - dt.timedelta(days=3)
    hits = [v for v in vids if v['plays'] >= HIT]
    hits7 = [v for v in vids if (v['date'] >= since and v['plays'] >= HIT) or (v['date'] >= since3 and v['plays'] >= HIT // 2)]
    first = min((v['date'] for v in hits), default=None)
    created = when(mid) if music.get('original') else None
    hist = history.get(mid, {})
    prev = sorted((d, c) for d, c in hist.items() if d < now.strftime('%Y-%m-%d'))
    growth = None
    if prev and count:
        pdate, pcount = prev[-1]
        days = max((now.date() - dt.date.fromisoformat(pdate)).days, 1)
        growth = {'since': pdate, 'before': pcount, 'per_day': round((count - pcount) / days),
                  'pct_per_week': round(((count / pcount) ** (7 / days) - 1) * 100) if pcount else None}
    age_first = (now - first).days if first else None
    if not hits7:
        status = 'поздно'
    elif (age_first is not None and age_first <= START_DAYS) or (created and (now - created).days <= START_DAYS):
        status = 'начинает'
    elif age_first is not None and age_first <= LATE_DAYS:
        status = 'в разгаре'
    else:
        status = 'поздно'
    cyr = sum(1 for v in vids if CYR.search(v['desc']))
    return {
        'id': mid, 'title': music.get('title'), 'author': music.get('author'), 'original': music.get('original'),
        'duration': music.get('duration'), 'created': created.strftime('%Y-%m-%d') if created else None,
        'count': count, 'growth': growth, 'status': status,
        'first_hit': first.strftime('%Y-%m-%d') if first else None, 'hits7': len(hits7), 'hits_all': len(hits),
        'ru_top': cyr, 'top': [{**v, 'date': v['date'].strftime('%Y-%m-%d')} for v in vids],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', required=True, help='папка для скачанного, лучше новая и пустая')
    ap.add_argument('--date', help='дата замера, по умолчанию сегодня (ГГГГ-ММ-ДД)')
    ap.add_argument('--hop', type=int, default=50, help='сколько новых авторов проверить во втором круге')
    a = ap.parse_args()
    now = dt.datetime.now(UTC)
    if a.date:
        now = dt.datetime.fromisoformat(a.date).replace(tzinfo=UTC, hour=12)
    today = now.strftime('%Y-%m-%d')
    net = Net(a.cache)
    users = [l.split('#')[0].strip() for l in open(os.path.join(ZV, 'akkaunty.txt'), encoding='utf-8')]
    users = [u for u in users if u]
    hpath = os.path.join(ZV, 'istoriya.json')
    history = json.load(open(hpath, encoding='utf-8')) if os.path.exists(hpath) else {}

    known, sounds, via = {}, {}, {}

    def collect(videos):
        new = []
        for d in videos:
            m = d['music']
            if not m.get('id'):
                continue
            via.setdefault(m['id'], []).append(d)
            if m['id'] not in sounds:
                sounds[m['id']] = None
                new.append(m)
        for i, m in enumerate(new, 1):
            if i % 15 == 0:
                log(f'  звуков {i}/{len(new)}, запросов {net.n}')
            sounds[m['id']] = scan_sound(net, m, now, history)

    log(f'Круг 1: {len(users)} аккаунтов')
    collect(scan_accounts(net, users, now, known))

    seen = set(users)
    extra = []
    for s in sounds.values():
        if s and s['status'] != 'поздно':
            for v in s['top']:
                if v['author'] and v['author'] not in seen and v['date'] >= (now - dt.timedelta(days=FRESH_DAYS)).strftime('%Y-%m-%d') \
                        and (CYR.search(v['desc']) or not v['desc'].strip()):
                    seen.add(v['author'])
                    extra.append(v['author'])
    extra = extra[:a.hop]
    log(f'Круг 2: {len(extra)} новых авторов из свежих хитов')
    collect(scan_accounts(net, extra, now, known))

    # Примеры для растущих звуков: подробности свежих хитов из топа звука
    for s in sounds.values():
        if not s or s['status'] == 'поздно':
            continue
        ex = {d['id']: d for d in via.get(s['id'], [])}
        for v in sorted(s['top'], key=lambda v: -v['plays']):
            if len(ex) >= 4:
                break
            if v['id'] in ex or v['date'] < (now - dt.timedelta(days=FRESH_DAYS)).strftime('%Y-%m-%d'):
                continue
            d = known.get(v['id']) or detail(net, v['author'], v['id'])
            if d:
                ex[v['id']] = d
        s['examples'] = sorted(ex.values(), key=lambda d: -d['plays'])

    for mid, s in sounds.items():
        if s and s['count']:
            history.setdefault(mid, {})[today] = s['count']
    json.dump(history, open(hpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)

    order = {'начинает': 0, 'в разгаре': 1, 'поздно': 2}
    res = sorted([s for s in sounds.values() if s],
                 key=lambda s: (order[s['status']], -s['hits7'], -(s['growth'] or {}).get('per_day', 0)))
    out = os.path.join(ZV, f'syroe-{today}.json')
    json.dump({'date': today, 'accounts': len(users), 'extra_accounts': extra, 'requests': net.n, 'sounds': res},
              open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(ZV, 'akkaunty-novye.txt'), 'a', encoding='utf-8') as f:
        for u in extra:
            f.write(f'{u}  # найден {today}\n')
    log(f'Готово: звуков {len(res)}, начинают {sum(s["status"] == "начинает" for s in res)}, '
        f'в разгаре {sum(s["status"] == "в разгаре" for s in res)}, запросов {net.n}. Файл {out}')


if __name__ == '__main__':
    main()
