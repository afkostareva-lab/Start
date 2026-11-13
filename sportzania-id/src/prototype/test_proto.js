// Проверка прототипа на экране телефона: сценарии, ошибки консоли, ширина страницы, скриншоты экранов.
const { chromium } = require('playwright');
(async () => {
  const url = 'file://' + process.argv[2], out = process.argv[3];
  const browser = await chromium.launch();
  const log = [], errs = [];
  const mk = async (state, dpr = 3) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text()) && !/ERR_/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    if (state) await page.addInitScript((s) => localStorage.setItem('szid2', JSON.stringify(s)), state);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    return { ctx, page };
  };
  // 1. Сквозной сценарий с нуля
  {
    const { ctx, page } = await mk(null, 1);
    const txt = () => page.evaluate(() => document.getElementById('view').innerText.replace(/\s+/g, ' ').slice(0, 90));
    log.push('guest: ' + await txt());
    log.push('overflow: ' + JSON.stringify(await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))));
    await page.click('[data-a=tab][data-v=city]'); log.push('city as guest: ' + await txt());
    await page.click('[data-a=tab][data-v=passport]');
    log.push('key disabled before picks: ' + await page.isDisabled('[data-a=key]'));
    for (const t of ['Python', 'Робототехника', 'Баскетбол']) await page.click(`[data-a=like][data-v="${t}"]`);
    await page.click('[data-a=key]'); log.push('after key: ' + await txt());
    await page.click('[data-a=filter][data-v=Python]'); log.push('filter: ' + await page.innerText('.status'));
    await page.click('[data-a=open][data-v=kirill]'); log.push('kirill as citizen: ' + (await page.innerText('.sheet')).replace(/\s+/g, ' ').slice(0, 150));
    await page.click('.sheet [data-a=tab]'); await page.click('[data-a=goal] >> nth=0'); log.push('level: ' + await page.innerText('.lvl'));
    await page.click('[data-a=tab][data-v=city]'); await page.click('[data-a=open][data-v=kirill]');
    log.push('handle visible before request: ' + /@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('[data-a=request]'); log.push('after ONE click: ' + (await page.innerText('.sheet .status')) + ' | handle visible: ' + /@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('[data-a=confirm]'); log.push('after confirm, handle visible: ' + /@kirill_code/.test(await page.innerText('.sheet')));
    await page.click('.sheet .btn.ghost'); await page.click('[data-a=accept]'); log.push('incoming banner left: ' + await page.locator('[data-a=accept]').count());
    await page.click('[data-a=tab][data-v=evening]');
    await page.evaluate(() => { const r = document.getElementById('mood'); r.value = 10; r.dispatchEvent(new Event('input')); });
    log.push('mood 10: ' + await page.innerText('#moodtxt'));
    await page.click('[data-a=checkin]'); log.push('checkin: ' + (await page.innerText('.quote')).replace(/\s+/g, ' '));
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(300);
    log.push('after reload still saved: ' + (await page.locator('.quote').count() > 0));
    await page.click('[data-a=role][data-v=counselor]'); await page.click('[data-a=mark] >> nth=0'); await page.click('[data-a=mark2] >> nth=2'); await page.click('[data-a=mark3] >> nth=0');
    log.push('counselor marks: ' + await page.innerText('.bar .tag.green >> nth=0'));
    await page.click('[data-a=role][data-v=parent]'); await page.click('[data-a=tog][data-v=consent]');
    await page.click('[data-a=role][data-v=kid]'); await page.click('[data-a=tab][data-v=city]'); await page.click('[data-a=open][data-v=masha]');
    log.push('masha when parent consent off: ' + (await page.innerText('.sheet .note')).replace(/\s+/g, ' '));
    await ctx.close();
  }
  // 2. Скриншоты экранов для презентации
  const base = { role: 'kid', tab: 'passport', status: 'resident', likes: ['Python', 'Робототехника', 'Баскетбол'], goal: 'Собрать робота', friends: { artem: 1, masha: 1 }, sent: {}, incoming: {}, filter: null, coins: 420, streak: 7, done: false, mood: 85, hide: {}, link: false, share: true, marks: 0 };
  const shots = [
    ['passport', { ...base }], ['city', { ...base, tab: 'city', filter: 'Python' }], ['project', { ...base, tab: 'projects' }],
    ['evening', { ...base, tab: 'evening' }], ['counselor', { ...base, role: 'counselor' }], ['parent', { ...base, role: 'parent' }],
    ['guest', { ...base, status: 'guest', likes: ['Python', 'Робототехника'], goal: null, friends: { artem: 1 } }],
  ];
  for (const [name, st] of shots) { const { ctx, page } = await mk(st); await page.screenshot({ path: `${out}/${name}.png` }); await ctx.close(); }
  { const { ctx, page } = await mk({ ...base, tab: 'city', friends: { artem: 1 } }); await page.click('[data-a=open][data-v=kirill]'); await page.waitForTimeout(300); await page.screenshot({ path: `${out}/friendlock.png` }); await ctx.close(); }
  // 3. Компьютер: рамка телефона и пояснение слева
  { const ctx = await browser.newContext({ viewport: { width: 1280, height: 920 } }); const page = await ctx.newPage(); await page.addInitScript((s) => localStorage.setItem('szid2', JSON.stringify(s)), { ...base, tab: 'city', filter: 'Python' }); await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(400); await page.screenshot({ path: `${out}/desktop.png` }); await ctx.close(); }
  await browser.close();
  console.log(log.join('\n')); console.log('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
})();
