/* Проверка страниц модуля в браузере с экрана телефона.
   Запуск из корня репозитория:
     node .claude/skills/spotlight-module/scripts/verify_pages.js module4.html module4-words.html module4-writings.html [папка_для_скриншотов]
   Что проверяет (всё это ловило реальные ошибки на модуле 3):
   - нет ошибок JS (одна ошибка вроде повторного const ломает ВСЕ упражнения);
   - нет горизонтальной прокрутки на iPhone SE и iPhone 13, в светлой и тёмной теме;
   - все упражнения решаются верно, и Progress Check даёт ровно 100;
   - в вопросах нет задвоенных номеров («1. 1 became…»);
   - в текстах не осталось [[…]], у каждого выделенного слова есть строка в таблице;
   - меню: любой раздел открывается одним нажатием и подсвечивается;
   - без сети: никаких внешних запросов, шрифты на месте;
   - в образцах письма показано число слов. */
const { chromium, devices } = require("playwright");
const path = require("path");
const [modPage, wordsPage, writePage, outDir = "."] = process.argv.slice(2);
const url = f => "file://" + path.resolve(f);
let problems = 0;
const bad = m => { problems++; console.log("  ✗ " + m); };
const ok = m => console.log("  ✓ " + m);

(async () => {
  const b = await chromium.launch();

  // 1. Ошибки, ширина, обе темы, два размера экрана
  for (const dev of ["iPhone SE", "iPhone 13"]) for (const scheme of ["light", "dark"]) {
    const c = await b.newContext({ ...devices[dev], colorScheme: scheme, deviceScaleFactor: 1 });
    for (const f of [modPage, wordsPage, writePage].filter(Boolean)) {
      const p = await c.newPage(); const errs = [];
      p.on("pageerror", e => errs.push(e.message));
      await p.goto(url(f)); await p.waitForTimeout(800);
      const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      const tag = `${f} · ${dev} · ${scheme}`;
      errs.length ? bad(`${tag}: ошибки JS: ${errs.join("; ")}`) : ok(`${tag}: без ошибок`);
      if (sw > iw) bad(`${tag}: горизонтальная прокрутка ${sw}px > ${iw}px`);
      await p.screenshot({ path: path.join(outDir, `check-${path.basename(f, ".html")}-${dev.replace(/ /g, "")}-${scheme}.png`) });
    }
    await c.close();
  }

  const c = await b.newContext({ ...devices["iPhone 13"], deviceScaleFactor: 1 });

  // 2. Страница модуля
  if (modPage) {
    console.log(`\n${modPage}`);
    const p = await c.newPage();
    await p.goto(url(modPage));
    await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const out = { numbered: [], leftover: [], tables: [] };
      document.querySelectorAll(".ex").forEach(box => {
        const it = EX[box.dataset.ex];
        box.querySelectorAll(".q").forEach((q, i) => {
          const x = it[i];
          if (x.t === "order") {
            const pool = [...q.querySelectorAll(".opts .w")];
            x.words.forEach(w => pool.find(b => b.textContent === w && !b.classList.contains("used")).click());
          } else q.querySelectorAll(".opt")[x.a].click();
        });
      });
      document.querySelectorAll(".q-text").forEach(t => { if (/^(\d+)\.\s+\1\b/.test(t.textContent)) out.numbered.push(t.textContent) });
      document.querySelectorAll(".orig").forEach(o => {
        if (o.innerHTML.includes("[[")) out.leftover.push(o.id);
        const k = o.id.replace("txt-", ""), tb = document.getElementById("tbl-" + k);
        out.tables.push([o.id, new Set([...o.querySelectorAll(".bw")].map(b => b.dataset.w)).size, tb ? tb.rows.length : -1]);
      });
      const scores = [...document.querySelectorAll(".ex .score")].map(s => s.textContent.replace(/\s/g, ""));
      out.notFull = scores.filter(s => { const [a, n] = s.split("/"); return a !== n });
      out.total = document.querySelector("#total")?.textContent;
      return out;
    });
    r.notFull.length ? bad(`не все упражнения засчитаны при верных ответах: ${r.notFull}`) : ok("все упражнения решаются верно");
    r.total === undefined ? bad("нет #total (Progress Check)") : r.total === "100" ? ok("Progress Check = 100") : bad(`Progress Check = ${r.total}, а должно быть 100`);
    r.numbered.length ? bad(`задвоенные номера: ${r.numbered.join(" | ")}`) : ok("номера вопросов не задвоены");
    r.leftover.length ? bad(`не обработаны [[…]] в: ${r.leftover}`) : ok("все выделенные слова кликабельны");
    r.tables.forEach(([id, n, rows]) => n === rows ? ok(`${id}: ${n} слов, таблица ${rows}`) : bad(`${id}: слов ${n}, строк в таблице ${rows}`));

    const ids = await p.$$eval(".toc a", as => as.map(a => a.getAttribute("href")));
    for (const h of [...ids].reverse().concat(ids)) {
      await p.click(`.toc a[href="${h}"]`); await p.waitForTimeout(250);
      const st = await p.evaluate(h => {
        const t = document.querySelector(h), nav = document.querySelector("nav.toc").getBoundingClientRect().bottom;
        const top = t.getBoundingClientRect().top;
        return { visible: h === "#top" ? scrollY < 5 : top >= nav - 2 && top < innerHeight / 2, on: document.querySelector(".toc a.on")?.getAttribute("href") };
      }, h);
      if (!st.visible || st.on !== h) bad(`меню: переход на ${h} не сработал с первого нажатия (видно=${st.visible}, активно=${st.on})`);
    }
    ok(`меню: проверено ${ids.length * 2} переходов вразброс`);
  }

  // 3. Страница слов
  if (wordsPage) {
    console.log(`\n${wordsPage}`);
    const p = await c.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.goto(url(wordsPage)); await p.waitForTimeout(600);
    for (const m of ["cards", "quiz", "spell", "list"]) await p.click(`[data-m=${m}]`);
    const info = await p.evaluate(() => {
      const c = {}; W.forEach(w => { const k = w.s + "|" + w.en.toLowerCase(); c[k] = (c[k] || 0) + 1 });
      return { n: W.length, secs: [...new Set(W.map(w => w.s))], dups: Object.keys(c).filter(k => c[k] > 1) };
    });
    errs.length ? bad(`режимы: ${errs}`) : ok("все 4 режима переключаются без ошибок");
    ok(`слов: ${info.n}; разделы: ${info.secs.join(" · ")}`);
    if (info.dups.length) bad(`повторы внутри раздела: ${info.dups}`);
  }

  // 4. Письменные образцы
  if (writePage) {
    console.log(`\n${writePage}`);
    const p = await c.newPage(); await p.goto(url(writePage)); await p.waitForTimeout(600);
    const counts = await p.$$eval("summary", s => s.map(x => x.textContent.trim().replace(/\s+/g, " ")));
    counts.forEach(t => ok(t));
  }
  await c.close();

  // 5. Без интернета
  console.log("\nБез сети");
  const off = await b.newContext({ ...devices["iPhone 13"], offline: true });
  const ext = []; await off.route(/^https?:/, r => { ext.push(r.request().url()); r.abort() });
  for (const f of [modPage, wordsPage, writePage].filter(Boolean)) {
    const p = await off.newPage(); await p.goto(url(f)); await p.waitForTimeout(800);
    const fonts = await p.evaluate(async () => { await document.fonts.ready;
      return ['900 40px "Inter Tight"', 'italic 500 40px "Bodoni Moda"', '40px "Pinyon Script"'].filter(x => !document.fonts.check(x)) });
    fonts.length ? bad(`${f}: без сети нет шрифтов ${fonts} — запусти inline_fonts.py`) : ok(`${f}: шрифты встроены`);
  }
  ext.length ? bad(`внешние запросы: ${[...new Set(ext)].join(", ")}`) : ok("внешних запросов нет");

  await b.close();
  console.log(problems ? `\nПРОБЛЕМ: ${problems}` : "\nВсё в порядке");
  process.exit(problems ? 1 : 0);
})();
