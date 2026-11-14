#!/usr/bin/env python3
"""Вопросы зрителей под русскоязычными YouTube Shorts, которые залетели за неделю.

Запуск:  python3 -I tiktok/src/youtube.py [--days 7] [--comments 40]

Работает через официальный YouTube Data API v3. Ключ берётся из переменной
YOUTUBE_API_KEY; в облачной сессии Claude ключ подставляет прокси, и переменная не нужна.
Расход квоты за запуск: около 100 единиц на каждый поисковый запрос плюс по 1 единице
на страницу данных, всего около 2 200 из бесплатных 10 000 в сутки.

1. По темам из TOPICS ищет Shorts за последние дни, отсортированные по просмотрам.
2. Оставляет русскоязычные ролики до 3 минут, считает просмотры и отношение
   просмотров к числу подписчиков канала: так видны прорывы маленьких каналов.
3. Под самыми заметными роликами читает популярные комментарии и выбирает вопросы
   и просьбы зрителей.

Результат: tiktok/youtube/syroe-<дата>.json.
"""
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'youtube')
API = 'https://www.googleapis.com/youtube/v3/'
UTC = dt.timezone.utc
CYR = re.compile('[а-яА-ЯёЁ]')

TOPICS = [
    'школа жиза', 'собираюсь в школу', 'грвм', 'школьный влог', 'контрольная', 'учитель',
    'лайфхаки для учебы', 'как выучить', 'подруги', 'ночевка', 'моя комната', 'румтур',
    'что подарить подруге', 'зима вайб', 'новый год 2027', 'рецепт быстро', 'своими руками',
    'тренд танец', 'мама и дочь', 'год назад и сейчас',
]
QUESTION = re.compile(
    r'\?|^(а |и )?(как|где|что за|сколько|почему|зачем|какой|какая|какое|какие|когда|кто|можно)\b'
    r'|\b(сделай|сделайте|покажи|покажите|расскажи|расскажите|научи|научите|сними|снимите|ждём|ждем)\b'
    r'|\b(часть 2|вторую часть|продолжение|название|артикул|ссылк)', re.I)


def call(method, **params):
    key = os.environ.get('YOUTUBE_API_KEY', '')
    if key:
        params['key'] = key
    url = API + method + '?' + urllib.parse.urlencode(params)
    for attempt in range(3):
        r = subprocess.run(['curl', '-sS', '-m', '30', url, '-H', 'Accept: application/json']
                           + ([] if key else ['-H', 'X-Goog-Api-Key: placeholder']),
                           capture_output=True, text=True)
        try:
            data = json.loads(r.stdout or '{}')
        except ValueError:
            data = {'error': {'message': r.stdout[:200] or r.stderr[:200]}}
        if 'error' not in data:
            return data
        msg = data['error'].get('message', '')
        if any(s in msg for s in ('quota', 'API key', 'disabled', 'forbidden', 'Forbidden')) or attempt == 2:
            raise SystemExit(f'YouTube API: {msg}')
        time.sleep(3 * (attempt + 1))


def seconds(iso):
    m = re.match(r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso or '')
    if not m:
        return None
    d, h, mi, s = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


def chunks(xs, n=50):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=7)
    ap.add_argument('--comments', type=int, default=40, help='под сколькими роликами читать комментарии')
    a = ap.parse_args()
    now = dt.datetime.now(UTC)
    after = (now - dt.timedelta(days=a.days)).strftime('%Y-%m-%dT%H:%M:%SZ')

    found = {}
    for q in TOPICS:
        res = call('search', part='snippet', type='video', videoDuration='short', order='viewCount',
                   publishedAfter=after, relevanceLanguage='ru', regionCode='RU', maxResults=50, q=q)
        for it in res.get('items', []):
            found.setdefault(it['id']['videoId'], set()).add(q)
        print(f'  «{q}»: {len(res.get("items", []))}', file=sys.stderr)

    videos = {}
    for part in chunks(list(found)):
        for v in call('videos', part='snippet,statistics,contentDetails', id=','.join(part)).get('items', []):
            sn, st = v['snippet'], v.get('statistics', {})
            sec = seconds(v['contentDetails'].get('duration'))
            lang = (sn.get('defaultAudioLanguage') or sn.get('defaultLanguage') or '')
            ru = lang.startswith('ru') or bool(CYR.search(sn.get('title', '') + ' ' + sn.get('description', '')[:300]))
            if not ru or sec is None or sec > 180:
                continue
            videos[v['id']] = {
                'id': v['id'], 'url': f'https://www.youtube.com/shorts/{v["id"]}', 'title': sn.get('title'),
                'channel': sn.get('channelTitle'), 'channel_id': sn.get('channelId'),
                'date': sn.get('publishedAt', '')[:10], 'seconds': sec, 'tags': (sn.get('tags') or [])[:12],
                'views': int(st.get('viewCount') or 0), 'likes': int(st.get('likeCount') or 0),
                'comments': int(st.get('commentCount') or 0), 'topics': sorted(found[v['id']]),
            }
    subs = {}
    for part in chunks(sorted({v['channel_id'] for v in videos.values()})):
        for c in call('channels', part='statistics', id=','.join(part)).get('items', []):
            st = c.get('statistics', {})
            subs[c['id']] = None if st.get('hiddenSubscriberCount') else int(st.get('subscriberCount') or 0)
    for v in videos.values():
        v['subscribers'] = subs.get(v['channel_id'])
        v['ratio'] = round(v['views'] / v['subscribers'], 1) if v['subscribers'] else None

    by_views = sorted(videos.values(), key=lambda v: -v['views'])
    breakouts = sorted([v for v in videos.values() if v['subscribers'] is not None and v['subscribers'] < 50_000
                        and v['views'] >= 50_000], key=lambda v: -(v['ratio'] or 0))
    pick, seen = [], set()
    for v in by_views[:a.comments // 2] + breakouts[:a.comments]:
        if v['id'] not in seen and v['comments'] and len(pick) < a.comments:
            seen.add(v['id'])
            pick.append(v)

    for v in pick:
        try:
            res = call('commentThreads', part='snippet', videoId=v['id'], order='relevance',
                       maxResults=100, textFormat='plainText')
        except SystemExit as e:
            if 'disabled' in str(e):
                continue
            raise
        qs = []
        for t in res.get('items', []):
            c = t['snippet']['topLevelComment']['snippet']
            text = (c.get('textDisplay') or '').strip()
            if 5 <= len(text) <= 300 and 'http' not in text and QUESTION.search(text):
                qs.append({'text': text, 'likes': int(c.get('likeCount') or 0), 'replies': int(t['snippet'].get('totalReplyCount') or 0)})
        v['questions'] = sorted(qs, key=lambda q: -(q['likes'] + 3 * q['replies']))[:15]

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f'syroe-{now:%Y-%m-%d}.json')
    json.dump({'date': f'{now:%Y-%m-%d}', 'since': after[:10], 'topics': TOPICS, 'found': len(found),
               'russian_shorts': len(videos), 'top': by_views[:40], 'breakouts': breakouts[:30],
               'with_questions': [v for v in pick if v.get('questions')]},
              open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'Готово: найдено {len(found)}, русскоязычных Shorts {len(videos)}, '
          f'прорывов маленьких каналов {len(breakouts)}, роликов с вопросами '
          f'{sum(1 for v in pick if v.get("questions"))}. Файл {out}', file=sys.stderr)


if __name__ == '__main__':
    main()
