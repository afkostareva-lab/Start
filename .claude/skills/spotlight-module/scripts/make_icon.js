/* Иконка 512×512 для экрана «Домой»: бордовый фон, большая цифра модуля Bodoni, жирное название.
   Шрифты берёт из страницы, в которую они уже встроены (после inline_fonts.py).
   Запуск: node make_icon.js <страница_со_шрифтами.html> <номер> <название> <выход.png>
   Пример: node make_icon.js module4.html 4 "in the news." m4-icon.png */
const { chromium } = require("playwright");
const fs = require("fs");
const [src, num, title, out] = process.argv.slice(2);
const fonts = (fs.readFileSync(src, "utf8").match(/<style>\/\* Шрифты встроены[\s\S]*?<\/style>/) || [""])[0];
if (!fonts) { console.error("В странице нет встроенных шрифтов — сначала запусти inline_fonts.py"); process.exit(1); }
const html = `<!doctype html><meta charset=utf-8>${fonts}<style>
html,body{margin:0}body{width:512px;height:512px;background:#4D0E12;position:relative;overflow:hidden;font-family:"Inter Tight"}
.n{position:absolute;right:30px;top:-70px;font:400 560px/1 "Bodoni Moda";color:#F5EFC6}
.t{position:absolute;left:40px;right:30px;bottom:46px;color:#F5EFC6;font-weight:900;font-size:84px;letter-spacing:-.05em;line-height:.85}
.s{position:absolute;left:44px;top:44px;color:#A5BCD6;font-weight:600;font-size:22px;letter-spacing:.14em;text-transform:uppercase}
</style><div class=n>${num}</div><div class=s>Spotlight 8</div><div class=t>${title}</div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: out }); await b.close(); console.log("icon:", out);
})();
