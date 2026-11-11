// Сводит школьный план, план вне школы и пробы недели в один календарь: два поста в день.
// Запуск: node tiktok/src/merge-plans.mjs  →  tiktok/src/plan-all.json
// Исходные планы не меняются. Страница: node tiktok/src/build-page.mjs plan-all.json plan-obshiy.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const load = f => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
const school = load('plan.json'), life = load('plan-life.json'), proba = load('plan-proba.json');

const rubrics = {};
for (const [id, r] of Object.entries(school.rubrics)) rubrics['sh-' + id] = { ...r, chip: id, group: 'школа' };
for (const [id, r] of Object.entries(life.rubrics)) rubrics['lf-' + id] = { ...r, chip: id, group: 'вне школы' };
rubrics.proba = { ...proba.rubric, chip: 'proba', group: 'проба' };

// Школьный пост выходит днём, пост вне школы вечером. В понедельник и среду школьного поста нет:
// днём идёт пост вне школы, вечером проба недели.
const SLOT = ['днём', 'вечером'];
const weeks = school.weeks.map(w => {
  const lw = life.weeks.find(x => x.n === w.n);
  const posts = [
    ...w.posts.map(p => ({ ...p, id: 'sh-' + p.id, rubric: 'sh-' + p.rubric, slot: 0 })),
    ...lw.posts.map(p => ({ ...p, id: 'lf-' + p.id, rubric: 'lf-' + p.rubric, slot: ['пн', 'ср'].includes(p.dow) ? 0 : 1 })),
    ...proba.posts.filter(p => p.week === w.n).map(({ week, ...p }) => ({ ...p, id: 'pr-' + p.id, rubric: 'proba', slot: 1 })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.slot - b.slot).map(p => ({ ...p, slot: SLOT[p.slot] }));
  return { n: w.n, dates: w.dates, theme: w.theme, tool: w.tool, note: 'Вне школы: ' + lw.theme[0].toLowerCase() + lw.theme.slice(1), prep: w.prep, posts };
});

const total = weeks.reduce((a, w) => a + w.posts.length, 0);
const out = {
  name: 'Два поста в день',
  period: school.period,
  lead: 'Школьный план и план вне школы в одном календаре. В день выходят два поста с разбегом: первый днём после школы, второй вечером. В свободных слотах понедельника и среды стоят пробы: темы, которые выстрелили у конкурентов на прошлой неделе.',
  ritm: 'Четырнадцать рубрик: шесть школьных, семь вне школы и проба недели. Между двумя постами дня не меньше четырёх часов, например 15:00 и 19:30.',
  rubrics, weeks,
  toolStyle: school.toolStyle, tools: school.tools, queue: school.queue,
  ideasText: life.ideasText,
  ideas: life.ideas.map(q => ({ ...q, rubric: 'lf-' + q.rubric })),
  targets: [
    total + ' публикаций без пропусков',
    'обычный ролик набирает 500 просмотров и больше',
    'ролики с файлом сохраняют 5 % зрителей',
    'жизу и мемы пересылают 1,5 % зрителей',
    'хотя бы один ролик набрал 3 000',
    '100 подписчиков',
  ],
  review: [
    'Выписать по каждому ролику недели просмотры, сохранения, репосты, комментарии и новых подписчиков.',
    'Ролик набрал втрое больше обычного: в ближайшие два дня выходит его «часть 2» вместо самого слабого формата недели.',
    'Посмотреть, что выстрелило у конкурентов за семь дней, и поставить эти темы в пробы следующей недели.',
    '22 ноября, после двух недель: оставить восемь рубрик с лучшими цифрами, остальные заменить идеями из запаса и удачными пробами.',
  ],
};
fs.writeFileSync(path.join(SRC, 'plan-all.json'), JSON.stringify(out, null, 2) + '\n');
console.log('сведено:', total, 'публикаций,', Object.keys(rubrics).length, 'рубрик');
