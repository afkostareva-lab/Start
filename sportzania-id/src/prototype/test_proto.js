// Проверка пилота на экране телефона: сквозной сценарий, ошибки, ширина страницы, скриншоты экранов.
const { chromium } = require('playwright');
(async () => {
  const url = 'file://' + process.argv[2], out = process.argv[3];
  const browser = await chromium.launch();
  const log = [], errs = [];
  const mk = async (state, dpr = 3, vp = { width: 390, height: 844 }) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: vp.width < 500, hasTouch: vp.width < 500 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    if (state) await page.addInitScript((s) => localStorage.setItem('szid3', JSON.stringify(s)), state);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(450);
    return { ctx, page };
  };
  const one = (s) => s.replace(/\s+/g, ' ').trim();
  {
    const { ctx, page } = await mk(null, 1);
    const view = async (n = 80) => one(await page.innerText('#view')).slice(0, n);
    const ok = (name, cond) => log.push((cond ? 'PASS ' : 'FAIL ') + name);
    ok('старт: экран гостя', /Привет! Это твой цифровой паспорт/.test(await view(200)));
    ok('нет горизонтальной прокрутки', await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
    await page.click('[data-a=tab][data-v=city]'); ok('город закрыт для гостя', /Сначала стань жителем/.test(await view(120)));
    await page.click('[data-a=tab][data-v=passport]'); await page.click('[data-a=scan]');
    ok('кнопка ключа выключена до трёх интересов', await page.isDisabled('[data-a=key]'));
    for (const t of ['Python', 'Робототехника', 'Баскетбол']) await page.click(`[data-a=like][data-v="${t}"]`);
    await page.click('[data-a=key]'); ok('экран «Ключ получен»', await page.locator('.over').count() === 1);
    await page.click('[data-a=enter]'); ok('после ключа открыт город', /Общие вайбы/i.test(await view(300)));
    await page.click('[data-a=filter][data-v=__me]'); ok('фильтр «Как у меня» считает совпадения', /Совпадений в городе: [1-9]/.test(await page.innerText('.status')));
    await page.click('[data-a=open][data-v=kirill]'); ok('житель не может дружить без цели', /добавь цель на смену/.test(await page.innerText('.sheet')));
    await page.click('.sheet [data-a=tab]'); await page.click('[data-a=goal] >> nth=0'); ok('уровень «Резидент 2027»', /РЕЗИДЕНТ 2027/.test(await page.innerText('.lvl')));
    await page.click('[data-a=tab][data-v=city]'); await page.click('[data-a=open][data-v=kirill]');
    ok('контакт закрыт до запроса', !/@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('[data-a=request]'); ok('после запроса контакт всё ещё закрыт', !/@kirill_code/.test(await page.innerText('.sheet')) && /Запрос отправлен/.test(await page.innerText('.sheet')));
    await page.click('[data-a=confirm]'); ok('после взаимного подтверждения контакт открыт', /@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('.sheet .btn.ghost'); await page.click('[data-a=accept]'); ok('входящий запрос принят', await page.locator('[data-a=accept]').count() === 0);
    await page.click('[data-a=tab][data-v=passport]'); ok('бейдж «Друг отряда» получен при трёх друзьях', await page.locator('.badge:not(.off):has-text("Друг отряда")').count() === 1);
    await page.click('[data-a=tab][data-v=evening]');
    await page.evaluate(() => { const r = document.getElementById('mood'); r.value = 10; r.dispatchEvent(new Event('input')); });
    ok('ребёнку не показывают слово «сигнал»', !/сигнал/i.test(await page.innerText('#view')));
    await page.click('[data-a=win] >> nth=1'); await page.click('[data-a=checkin]'); ok('чек-ин: +10 монет и стрик 8', /стрик 8 дней/.test(await page.innerText('.quote')) && /430 Z/.test(await page.innerText('.pill')));
    await page.click('[data-a=lb][data-v=squads]'); ok('лидерборд отрядов', /Отряд 2 · твой/.test(await page.innerText('#view')));
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(300); ok('состояние сохраняется после перезагрузки', await page.locator('.quote').count() > 0);
    await page.click('[data-a=role][data-v=counselor]'); await page.click('[data-a=team]');
    await page.click('[data-a=mark] >> nth=0'); await page.click('[data-a=mark2][data-v="Лидерство"]'); await page.click('[data-a=mark3] >> nth=0');
    await page.click('[data-a=confirmFilm]');
    await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=passport]');
    const pv = await page.innerText('#view');
    ok('отметка вожатого попала в паспорт ребёнка', /ВОЖАТЫЙ/.test(pv) && /ЛИДЕРСТВО 93/.test(pv));
    ok('подтверждённый проект дал бейдж «Командный игрок»', await page.locator('.badge:not(.off):has-text("Командный игрок")').count() === 1);
    await page.click('[data-a=tab][data-v=projects]'); ok('«Фильм отряда» подтверждён', /Смонтировал фильм/.test(await page.innerText('#view')));
    await page.click('[data-a=qr]'); await page.click('.sheet [data-a=pub]'); ok('публичная страница без контактов', /Имени, отряда, контактов/.test(await page.innerText('.sheet')) && !/@/.test((await page.innerText('.sheet')).replace('sportzania.id/fedya_tech', '')));
    await page.keyboard.press('Escape');
    await page.click('[data-a=role][data-v=parent]'); await page.click('[data-a=reveal][data-v=geo]'); ok('родитель открывает закрытые данные', /На территории лагеря/.test(await page.innerText('#view')));
    await page.click('[data-a=tog][data-v=consent]'); await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=city]');
    ok('без согласия родителя ники закрыты даже у друзей', /ник закрыт родителем/.test(await page.innerText('#view')) && !/@kirill_code/.test(await page.innerText('#view')));
    await page.click('[data-a=role][data-v=parent]'); await page.click('[data-a=tog][data-v=consent]'); await page.click('[data-a=course]');
    await page.click('[data-a=role][data-v=teacher]'); for (let i = 0; i < 3; i++) await page.click('[data-a=lesson]');
    await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=passport]');
    const pv2 = await page.innerText('#view');
    ok('уроки преподавателя обновили радар и дали бейдж', /АНГЛИЙСКИЙ 82/.test(pv2) && /Курс пройден/.test(pv2) && await page.locator('.badge:not(.off):has-text("Полиглот B1")').count() === 1);
    ok('преподаватель не видит контакты', await (async () => { await page.click('[data-a=role][data-v=teacher]'); const t = await page.innerText('#view'); return !/@kirill_code|@masha_z/.test(t) && /Что закрыто/i.test(t); })());
    await page.click('[data-a=help]'); ok('чек-лист: все восемь шагов пройдены', await page.locator('.sheet .todo li.ok').count() === 8);
    await page.click('.sheet [data-a=reset]'); ok('сброс возвращает к началу', /Привет! Это твой цифровой паспорт/.test(await view(200)));
    await ctx.close();
  }
  const base = { v: 3, role: 'kid', tab: 'passport', step: 1, status: 'resident', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: 'Собрать робота', friends: { artem: 1, masha: 1 }, sent: {}, incoming: {}, filter: null, coins: 420, streak: 7, freeze: 1, done: false, mood: 85, win: null, hide: {}, link: false, share: true, consent: true, marks: [], film: false, team: false, season: 'camp', courseOn: false, course: 0, lbTab: 'me', reveal: null, tour: {} };
  const shots = [
    ['passport', { ...base }], ['city', { ...base, tab: 'city', filter: 'Python' }], ['project', { ...base, tab: 'projects' }], ['evening', { ...base, tab: 'evening' }],
    ['counselor', { ...base, role: 'counselor' }], ['parent', { ...base, role: 'parent', reveal: 'geo' }], ['teacher', { ...base, role: 'teacher', season: 'after', courseOn: true, course: 1 }],
    ['guest', { ...base, status: 'guest', likes: ['Python', 'Робототехника'], goal: null, friends: { artem: 1 } }], ['start', { ...base, status: 'guest', step: 0, likes: [], goal: null, friends: { artem: 1 } }],
    ['after', { ...base, season: 'after', courseOn: true, course: 2 }],
  ];
  for (const [name, st] of shots) { const { ctx, page } = await mk(st); await page.screenshot({ path: `${out}/${name}.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'city', friends: { artem: 1 } }); await page.click('[data-a=open][data-v=kirill]'); await page.waitForTimeout(300); await page.screenshot({ path: `${out}/friendlock.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, status: 'guest', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: null }); await page.click('[data-a=key]'); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/key.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'passport' }); await page.evaluate(() => { document.getElementById('view').scrollTop = 560; }); await page.waitForTimeout(200); await page.screenshot({ path: `${out}/passport2.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'city', filter: 'Python' }, 1, { width: 1280, height: 920 }); await page.screenshot({ path: `${out}/desktop.png` }); await ctx.close(); }
  await browser.close();
  console.log(log.join('\n')); console.log('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
})();
