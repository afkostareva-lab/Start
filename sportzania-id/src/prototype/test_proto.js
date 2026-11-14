// Проверка пилота на экране телефона: сквозной сценарий, ошибки, ширина страницы, скриншоты экранов.
// Запуск: node test_proto.js <путь к пилоту.html> <папка для скриншотов>
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
  const ok = (name, cond) => log.push((cond ? 'PASS ' : 'FAIL ') + name);
  const one = (s) => s.replace(/\s+/g, ' ').trim();
  const NO_SAMO = (t) => !/(^|[^а-яё])само([^а-яё]|$)/i.test(t);
  const FORBIDDEN_DEBUG = (t) => { const m = t.match(/.{0,40}(брасл|турнир|шаг(ов|и) с|пульс|Робот-сорт|Фильм отряда|монет).{0,30}/i); if (m) log.push('MATCH: ' + m[0].replace(/\s+/g, ' ')); return m; };
  const FORBIDDEN = /брасл|турнир|шаг(ов|и) с|пульс|Робот-сорт|Фильм отряда|монет/i;

  // ---------- 1. Сквозной сценарий с нуля ----------
  {
    const { ctx, page } = await mk(null, 1);
    const view = async (n = 200) => one(await page.innerText('#view')).slice(0, n);
    const seen = [];
    const grab = async () => seen.push(await page.innerText('#view'));
    ok('старт: экран гостя', /Привет! Это твой цифровой паспорт/.test(await view()));
    ok('старт: реальная смена «Легенда о драконьем сердце 2»', /Легенда о драконьем сердце 2/i.test(await view()));
    ok('нет горизонтальной прокрутки', await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
    await page.click('[data-a=tab][data-v=city]'); ok('город закрыт для гостя', /Сначала стань жителем/.test(await view()));
    await page.click('[data-a=tab][data-v=passport]'); await page.click('[data-a=scan]');
    ok('имя и отряд внёс родитель при бронировании', /внёс родитель/.test(await view(400)));
    ok('кнопка ключа выключена до трёх интересов', await page.isDisabled('[data-a=key]'));
    for (const t of ['Python', 'Робототехника', 'Баскетбол']) await page.click(`[data-a=like][data-v="${t}"]`);
    await page.click('[data-a=key]'); ok('экран «Ключ получен»', await page.locator('.over').count() === 1);
    await page.click('[data-a=enter]'); ok('после ключа открыт город', /Общие вайбы/i.test(await view(300)));
    await page.click('[data-a=filter][data-v=__me]'); ok('фильтр «Как у меня» считает совпадения', /Совпадений в городе: [1-9]/.test(await page.innerText('.status')));
    await grab();
    await page.click('[data-a=open][data-v=kirill]');
    const card = await page.innerText('.sheet');
    ok('карточка жителя: что любит на смене (из расписания)', /загадки сюжета/.test(card));
    ok('житель не может дружить без цели', /добавь цель на смену/.test(card));
    await page.click('.sheet [data-a=tab]'); await page.click('[data-a=goal] >> nth=0'); ok('уровень «Резидент 2027»', /РЕЗИДЕНТ 2027/.test(await page.innerText('.lvl')));
    await page.click('[data-a=tab][data-v=city]'); await page.click('[data-a=open][data-v=kirill]');
    ok('контакт закрыт до запроса', !/@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('[data-a=request]'); ok('после запроса контакт всё ещё закрыт', !/@kirill_code/.test(await page.innerText('.sheet')) && /Запрос отправлен/.test(await page.innerText('.sheet')));
    await page.click('[data-a=confirm]'); ok('после взаимного подтверждения контакт открыт', /@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('.sheet .btn.ghost'); await page.click('[data-a=accept]'); ok('входящий запрос принят', await page.locator('[data-a=accept]').count() === 0);
    await page.click('[data-a=tab][data-v=passport]'); await grab();
    ok('бейдж «Друг отряда» при трёх друзьях', await page.locator('.badge:not(.off):has-text("Друг отряда")').count() === 1);
    ok('бейдж «Сертификат английского» есть', await page.locator('.badge:not(.off):has-text("Сертификат английского")').count() === 1);
    ok('валюта называется «Занники»', /ЗАННИКИ/.test(await page.innerText('.plate')));
    await page.click('[data-a=tab][data-v=projects]'); await grab();
    const pr = await page.innerText('#view');
    ok('проекты: сюжет смены и английский, без робота', /Ледяной завет предков/.test(pr) && /Английский с носителями языка/.test(pr) && /Сертификат об обучении/.test(pr));
    await page.click('[data-a=tab][data-v=evening]');
    const ev = await page.innerText('#view');
    ok('барометр — на рефлексии в 21:00', /21:00/.test(ev) && /рефлекси/i.test(ev));
    await page.evaluate(() => { const r = document.getElementById('mood'); r.value = 10; r.dispatchEvent(new Event('input')); });
    ok('ребёнку не показывают слово «сигнал»', !/сигнал/i.test(await page.innerText('#view')));
    await page.click('[data-a=win] >> nth=1'); await page.click('[data-a=checkin]');
    ok('рефлексия: +10 занников и стрик 8', /стрик 8 дней/.test(await page.innerText('.quote')) && /430/.test(await page.innerText('.pill')));
    ok('копилка отряда — в занниках', /3 490 из 4 000 занников/.test((await page.innerText('#view')).replace(/[\u00a0\u202f]/g, ' ')));
    await page.click('[data-a=lb][data-v=squads]'); ok('лидерборд отрядов', /Отряд 2 · твой/.test(await page.innerText('#view')));
    await grab();
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(300); ok('состояние сохраняется после перезагрузки', await page.locator('.quote').count() > 0);
    await page.click('[data-a=role][data-v=counselor]'); await page.click('[data-a=team]'); await grab();
    await page.click('[data-a=mark] >> nth=0'); await page.click('[data-a=mark2][data-v="Лидерство"]'); await page.click('[data-a=mark3] >> nth=0');
    await page.click('[data-a=confirmFilm]');
    await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=passport]');
    const pv = await page.innerText('#view'); seen.push(pv);
    ok('отметка вожатого попала в паспорт ребёнка', /ВОЖАТЫЙ/.test(pv) && /ЛИДЕРСТВО 93/.test(pv));
    ok('подтверждённый сюжет дал бейдж «Командный игрок»', await page.locator('.badge:not(.off):has-text("Командный игрок")').count() === 1);
    ok('у каждой записи в ленте есть автор', await page.locator('.feed > div').count() >= 5 && (await page.locator('.feed > div > .tag:first-child').allInnerTexts()).every((t) => /^(Я|РОДИТЕЛЬ|ВОЖАТЫЙ|ПЕДАГОГ)$/.test(t.trim())));
    ok('слова «само» в паспорте нет', NO_SAMO(pv));
    await page.click('[data-a=tab][data-v=projects]'); ok('сюжет смены подтверждён вожатым', /Держал команду вместе/.test(await page.innerText('#view')));
    await page.click('[data-a=qr] >> nth=0'); await page.click('.sheet [data-a=pub]');
    const pub = await page.innerText('.sheet');
    ok('публичная страница без контактов', /Имени, отряда, контактов/.test(pub) && !/@/.test(pub.replace('sportzania.id/fedya_tech', '')));
    await page.keyboard.press('Escape');
    await page.click('[data-a=role][data-v=parent]'); await page.click('[data-a=reveal][data-v=room]'); seen.push(await page.innerText('#view'));
    ok('родитель открывает закрытые данные', /комната на 4 человека/.test(await page.innerText('#view')));
    ok('родитель видит, что геопозицию паспорт не собирает', /не собирает/.test(await page.innerText('#view')));
    await page.click('[data-a=tog][data-v=consent]'); await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=city]');
    ok('без согласия родителя ники закрыты даже у друзей', /ник закрыт родителем/.test(await page.innerText('#view')) && !/@kirill_code/.test(await page.innerText('#view')));
    await page.click('[data-a=role][data-v=parent]'); await page.click('[data-a=tog][data-v=consent]'); await page.click('[data-a=course]');
    ok('родитель видит паспорт успехов за смену', /Паспорт успехов за смену/.test(await page.innerText('#view')) && await page.locator('.win').count() === 4);
    await page.click('[data-a=role][data-v=teacher]'); seen.push(await page.innerText('#view'));
    ok('педагог видит сертификат смены', /12 ак\. ч\./.test(await page.innerText('#view')));
    for (let i = 0; i < 3; i++) await page.click('[data-a=lesson]');
    ok('педагог не видит контакты', !/@kirill_code|@masha_z/.test(await page.innerText('#view')) && /Что закрыто/i.test(await page.innerText('#view')));
    await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=passport]');
    const pv2 = await page.innerText('#view'); seen.push(pv2);
    ok('уроки педагога подняли английский до 84 и дали бейдж', /АНГЛИЙСКИЙ 84/.test(pv2) && /Курс пройден/.test(pv2) && await page.locator('.badge:not(.off):has-text("General English")').count() === 1);
    ok('итоги смены: все четыре достижения сохранены', /Ничего не потерялось/.test(pv2) && await page.locator('.win').count() === 4 && await page.locator('.win.wait').count() === 0
      && /Прошёл сюжет смены/.test(pv2) && /Получил сертификат по английскому/.test(pv2) && /Научился работать в команде/.test(pv2) && /Нашёл друзей/.test(pv2));
    seen.forEach(FORBIDDEN_DEBUG); ok('нигде нет браслета, турнира, робота и «монет»', seen.every((t) => !FORBIDDEN.test(t)));
    ok('нигде нет слова «само»', seen.every(NO_SAMO));
    await page.click('[data-a=help]'); ok('чек-лист: все восемь шагов пройдены', await page.locator('.sheet .todo li.ok').count() === 8);
    await page.click('.sheet [data-a=reset]'); ok('сброс возвращает к началу', /Привет! Это твой цифровой паспорт/.test(await view()));
    await ctx.close();
  }
  // ---------- 2. Итоги смены до подтверждения вожатого ----------
  {
    const { ctx, page } = await mk({ v: 3, role: 'kid', tab: 'passport', step: 1, status: 'resident', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: 'Найти друзей', friends: { artem: 1 }, sent: {}, incoming: {}, season: 'after', tour: {} }, 1);
    ok('итоги: сюжет ждёт подтверждения вожатого', await page.locator('.win.wait').count() === 1);
    await page.click('.win.wait [data-a=confirmFilm]');
    ok('итоги: подтверждение из демо-кнопки', await page.locator('.win.wait').count() === 0 && /Ледяной завет предков/.test(await page.innerText('#view')));
    ok('итоги: «1 друг» склоняется верно', /1 друг /.test(await page.innerText('#view')));
    await ctx.close();
  }
  // ---------- 3. Скриншоты для презентации ----------
  const base = { v: 3, role: 'kid', tab: 'passport', step: 1, status: 'resident', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: 'Заговорить на английском', friends: { artem: 1, masha: 1 }, sent: {}, incoming: {}, filter: null, coins: 420, streak: 7, freeze: 1, done: false, mood: 85, win: null, hide: {}, link: false, share: true, consent: true, marks: [], film: false, team: false, season: 'camp', courseOn: false, course: 0, lbTab: 'me', reveal: null, tour: {} };
  const shots = [
    ['passport', { ...base }], ['city', { ...base, tab: 'city', filter: 'Python' }], ['project', { ...base, tab: 'projects' }], ['evening', { ...base, tab: 'evening' }],
    ['counselor', { ...base, role: 'counselor' }], ['parent', { ...base, role: 'parent', reveal: 'room' }], ['teacher', { ...base, role: 'teacher', season: 'after', courseOn: true, course: 1 }],
    ['guest', { ...base, status: 'guest', likes: ['Python', 'Робототехника'], goal: null, friends: { artem: 1 } }], ['start', { ...base, status: 'guest', step: 0, likes: [], goal: null, friends: { artem: 1 } }],
    ['after', { ...base, season: 'after', courseOn: true, course: 2 }],
    ['itog', { ...base, season: 'after', film: true, friends: { artem: 1, masha: 1, kirill: 1 } }], ['parent-after', { ...base, role: 'parent', season: 'after', film: true }],
  ];
  for (const [name, st] of shots) { const { ctx, page } = await mk(st); await page.screenshot({ path: `${out}/${name}.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'city', friends: { artem: 1 } }); await page.click('[data-a=open][data-v=kirill]'); await page.waitForTimeout(300); await page.screenshot({ path: `${out}/friendlock.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, status: 'guest', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: null }); await page.click('[data-a=key]'); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/key.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'passport' }); await page.evaluate(() => { document.getElementById('view').scrollTop = 560; }); await page.waitForTimeout(200); await page.screenshot({ path: `${out}/passport2.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'city', filter: 'Python' }, 1, { width: 1280, height: 920 }); await page.screenshot({ path: `${out}/desktop.png` }); await ctx.close(); }
  await browser.close();
  console.log(log.join('\n')); console.log('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
})();
