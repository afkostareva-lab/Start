// Рисует картинки для TikTok из plan.json: карусели и обложки роликов, 1080×1920.
// Запуск: node tiktok/src/render.mjs   (нужен playwright с Chromium)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(SRC, '..', 'img');
const plan = JSON.parse(fs.readFileSync(path.join(SRC, 'plan.json'), 'utf8'));

// Шрифты вшиваются в страницу, чтобы рендер не зависел от сети.
const fontsCss = fs.readFileSync(path.join(SRC, 'fonts.css'), 'utf8').replace(
  /url\('fonts\/([^']+)'\)/g,
  (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(SRC, 'fonts', f)).toString('base64')})`
);

const nb = s => String(s)
  .replace(/(^|[\s«(])(в|на|за|к|с|и|не|по|из|у|о|а|до|от|без|их|чем|что|как)\s/gi, '$1$2\u00A0')
  .replace(/(^|[\s«(])(в|на|за|к|с|и|не|по|из|у|о|а|до|от|без)\s/gi, '$1$2\u00A0')
  .replace(/(\d)\s(?=\S)/g, '$1\u00A0').replace(/\s([·—])\s/g, '\u00A0$1 ');
const esc = s => nb(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// «т[О]рты» → ударная буква выделяется цветом
const stress = s => esc(s).replace(/\[(.)\]/g, '<b>$1</b>');
const plain = s => s.replace(/\[(.)\]/g, '$1');

const sparkle = (x, y, size, color, rot = 0) =>
  `<svg class="sp" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;transform:rotate(${rot}deg)" viewBox="-1 -1 2 2"><path fill="${color}" d="M0-1C.09-.32.32-.09 1 0 .32.09.09.32 0 1-.09.32-.32.09-1 0-.32-.09-.09-.32 0-1Z"/></svg>`;
const arrow = color =>
  `<svg viewBox="0 0 120 50" width="120" height="50"><path d="M4 28C34 14 70 14 104 26M86 8l20 18-24 14" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bookmark = color =>
  `<svg viewBox="0 0 24 30" width="40" height="50"><path d="M3 2h18v26l-9-7-9 7Z" fill="${color}"/></svg>`;
const check = color =>
  `<svg viewBox="0 0 40 40" width="56" height="56"><circle cx="20" cy="20" r="20" fill="${color}"/><path d="M11 21l6 6 12-13" fill="none" stroke="#fffdf8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bow = color =>
  `<svg viewBox="-130 -70 260 190" width="340" height="248"><g fill="${color}"><path d="M0 0C-50-62-120-56-120-4c0 50 70 52 120 4Z"/><path d="M0 0C50-62 120-56 120-4c0 50-70 52-120 4Z"/><path d="M-10 8-52 104l30-14 14 26L4 14Z"/><path d="M10 8 52 104 22 90 8 116-4 14Z"/><circle r="22"/></g></svg>`;

const CSS = `
${fontsCss}
:root{--ink:#4a2a38;--cream:#fffdf8;--pinkS:#E27396}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Golos Text',sans-serif;color:var(--ink);background:var(--bg);position:relative;-webkit-font-smoothing:antialiased}
.t-pink{--bg:#F8DDE9;--acc:#E27396;--acc-ink:#fffdf8;--two:#2f8f99;--soft:#B3DEE2;--soft2:#F3C6DA}
.t-blue{--bg:#CFEBEE;--acc:#2f8f99;--acc-ink:#fffdf8;--two:#E27396;--soft:#EFCFE3;--soft2:#ABDBE0}
.t-lime{--bg:#E6EFCB;--acc:#7f9447;--acc-ink:#fffdf8;--two:#E27396;--soft:#EFCFE3;--soft2:#D5E2AC}
.t-lilac{--bg:#EADBF0;--acc:#a46bb0;--acc-ink:#fffdf8;--two:#2f8f99;--soft:#B3DEE2;--soft2:#DBC2E6}
.t-plum{--bg:#4a2a38;--acc:#EB9AB2;--acc-ink:#4a2a38;--two:#B3DEE2;--soft:#5d3949;--soft2:#6b4556;--ink:#fffdf8}
b{font-weight:inherit}
.blob{position:absolute;border-radius:50%}
.b1{width:780px;height:780px;right:-280px;top:-240px;background:var(--soft)}
.b2{width:640px;height:640px;left:-250px;top:1330px;background:var(--soft2)}
.b3{width:250px;height:250px;right:70px;top:1560px;border:12px solid var(--acc);opacity:.45}
.sp{position:absolute}
.pill{display:inline-block;font-weight:700;font-size:30px;letter-spacing:.07em;text-transform:uppercase;padding:15px 30px;border-radius:999px;background:var(--bg);color:var(--ink);white-space:nowrap}
.pill.solid{background:var(--acc);color:var(--acc-ink)}
.pill.time{background:var(--two);color:#fffdf8}
h1{font-family:'Yeseva One',Georgia,serif;font-weight:400;text-wrap:balance}

/* Карточка шага */
.card{position:absolute;left:60px;top:210px;width:960px;height:1270px;background:var(--cream);color:#4a2a38;border-radius:64px;padding:76px 90px 70px 80px;display:flex;flex-direction:column;box-shadow:0 30px 70px rgba(74,42,56,.13)}
.row{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.num{font-family:'Yeseva One',Georgia,serif;font-size:210px;line-height:.86;color:var(--acc);margin-top:60px}
.card h1{font-size:100px;line-height:1.05;margin-top:30px}
.card p{font-size:50px;line-height:1.38;font-weight:500;margin-top:42px}
.note{font-family:'Caveat',cursive;font-weight:700;font-size:70px;line-height:1.05;color:var(--two);transform:rotate(-3deg);transform-origin:left center;margin-top:46px}
.dots{margin-top:auto;display:flex;gap:14px;align-items:center}
.dots i{width:22px;height:22px;border-radius:50%;background:var(--bg)}
.dots i.on{width:66px;border-radius:11px;background:var(--acc)}

/* Обложка карусели и ролика */
.cover{position:absolute;left:90px;top:260px;width:840px}
.cover h1{font-size:150px;line-height:1.0;margin-top:52px}
.cover .sub{font-size:54px;line-height:1.25;font-weight:600;margin-top:40px}
.hint{position:absolute;left:560px;top:1385px;display:flex;align-items:center;gap:18px;font-family:'Caveat',cursive;font-weight:700;font-size:76px;color:var(--acc);transform:rotate(-4deg)}
.papers{position:absolute;left:70px;top:1040px;width:560px;height:420px}
.sheet{position:absolute;width:270px;height:340px;border-radius:26px;background:var(--cream);box-shadow:0 16px 36px rgba(74,42,56,.14);padding:34px 30px}
.sheet u{display:block;height:14px;border-radius:7px;background:var(--bg);margin-bottom:22px}
.sheet u.h{height:24px;width:62%;background:var(--acc);border-radius:12px;margin-bottom:30px}
.sheet u.s{width:70%}
.s1{left:0;top:40px;transform:rotate(-9deg)}
.s2{left:150px;top:0;transform:rotate(4deg);background:var(--soft)}
.s2 u{background:var(--cream)}.s2 u.h{background:var(--two)}
.s3{left:290px;top:56px;transform:rotate(-2deg)}

/* Итоговая картинка */
.fin h1{font-size:104px;line-height:1.04;margin-top:44px}
.list{margin-top:50px;display:flex;flex-direction:column;gap:26px}
.list div{display:flex;gap:26px;align-items:center;font-size:44px;font-weight:600;line-height:1.2}
.list svg{flex:none}
.cta{margin-top:auto;display:flex;align-items:center;gap:26px;background:var(--acc);color:var(--acc-ink);border-radius:40px;padding:34px 44px;font-size:46px;font-weight:700;line-height:1.15}
.cta svg{flex:none}
.cta span{text-wrap:balance}
.ask{font-family:'Caveat',cursive;font-weight:700;font-size:68px;line-height:1.05;color:var(--two);transform:rotate(-2deg);transform-origin:left center;margin-top:38px}

/* Проверь себя */
.answer{display:flex;gap:28px;align-items:center;background:var(--acc);color:#fffdf8;border-radius:44px;padding:30px 40px;margin:-16px -30px 44px -20px}
.answer svg{flex:none}
.answer small{display:block;font-size:28px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;opacity:.85}
.answer .aw{font-family:'Yeseva One',Georgia,serif;font-size:84px;line-height:1.05}
.answer .aw b{color:#FBD3E2}
.answer .tip{font-family:'Caveat',cursive;font-weight:700;font-size:46px;line-height:1.05;margin-top:6px}
.answer .tip b{color:#FBD3E2}
.q{font-size:46px;font-weight:600;margin-top:40px;color:#8a6a78}
.word{font-family:'Yeseva One',Georgia,serif;font-size:170px;line-height:1.02;margin-top:6px}
.opts{margin-top:40px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.opt{background:var(--bg);border-radius:40px;padding:20px 46px;font-size:78px;font-weight:700;line-height:1.1}
.opt b{color:var(--two)}
.or{font-family:'Caveat',cursive;font-weight:700;font-size:56px;color:#8a6a78;margin-left:46px}
.next{margin-top:auto;display:flex;align-items:center;gap:18px;font-family:'Caveat',cursive;font-weight:700;font-size:62px;color:var(--acc)}
.quiz.first{justify-content:flex-start;padding-top:110px}
.quiz .big{font-size:118px;line-height:1.04;margin-top:10px}

/* Обложка ролика */
.cv .cover{top:300px}
.cv .cover h1{font-size:118px;line-height:1.04;margin-top:48px}
.art{position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none}
.art>*{position:absolute}
.say{font-family:'Caveat',cursive;font-weight:700;font-size:78px;line-height:1;color:var(--acc);transform:rotate(-6deg)}
.phone{left:580px;top:1020px;width:320px;height:470px;border-radius:56px;background:#fffdf8;border:9px solid #4a2a38;transform:rotate(7deg);box-shadow:16px 18px 0 rgba(74,42,56,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:30px;color:#4a2a38}
.ring{width:200px;height:200px;border-radius:50%;background:conic-gradient(var(--two) 0 68%,var(--bg) 0);display:grid;place-items:center}
.ring span{width:146px;height:146px;border-radius:50%;background:#fffdf8;display:grid;place-items:center;font-weight:700;font-size:44px}
.btn{width:150px;height:44px;border-radius:22px;background:var(--acc)}
.bar{width:100%;height:42px;border-radius:21px;background:var(--bg)}
.bar.a{background:var(--two);width:78%;align-self:flex-start}.bar.c{width:88%;align-self:flex-start;background:var(--soft2)}
.lbl{align-self:flex-start;font-weight:700;font-size:30px;letter-spacing:.08em}
.pairs{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%}
.pairs i{height:74px;border-radius:20px;background:var(--bg)}
.pairs i.on{background:var(--two)}
.marks{display:flex;gap:10px}
.marks i{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:700;font-size:28px;color:#fffdf8;background:var(--acc)}
.marks i.m4{background:var(--two)}.marks i.m3{background:#c9a3b3}
.avg{font-family:'Yeseva One',Georgia,serif;font-size:104px;line-height:1}
.need{font-weight:700;font-size:26px;text-align:center;line-height:1.2}
.mirror{left:120px;top:1030px;width:300px;height:420px;border-radius:50%;background:#fffdf8;border:14px solid var(--acc);overflow:hidden}
.mirror i{position:absolute;width:26px;height:240px;border-radius:13px;background:var(--bg);transform:rotate(32deg);left:120px;top:40px}
.mirror i+i{left:176px;top:110px;height:150px}
.bubble{left:100px;top:1080px;width:500px;height:250px;border-radius:70px;background:#fffdf8;display:grid;place-items:center;font-family:'Yeseva One',Georgia,serif;font-size:130px;color:var(--acc);box-shadow:0 18px 40px rgba(74,42,56,.12)}
.bubble::after{content:"";position:absolute;left:90px;bottom:-56px;border:34px solid transparent;border-top-color:#fffdf8;border-left-color:#fffdf8}
.bubble2{left:600px;top:1240px;width:260px;height:170px;border-radius:56px;background:var(--two);color:#fffdf8;display:grid;place-items:center;font-family:'Yeseva One',Georgia,serif;font-size:96px;transform:rotate(7deg)}
.nb{left:110px;top:1080px;width:400px;height:330px;border-radius:28px;background:#fffdf8;transform:rotate(-6deg);padding:44px 40px;box-shadow:0 20px 44px rgba(0,0,0,.22)}
.nb u{display:block;height:16px;border-radius:8px;background:#EFCFE3;margin-bottom:28px}
.nb u.h{width:58%;height:26px;border-radius:13px;background:#E27396;margin-bottom:36px}.nb u.s{width:66%}
.plabel{font-size:28px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#8a6a78;margin-top:44px}
.pr{margin-top:16px;background:var(--bg);border-radius:44px 44px 44px 10px;padding:38px 44px;font-size:46px;line-height:1.36;font-weight:500}
.card h1.sm{font-size:88px;margin-top:44px}
.list.c{gap:16px;margin-top:40px}
.list.c div{font-size:40px;gap:22px}
.list.c svg{width:46px;height:46px}
.vf{display:flex;flex-direction:column;gap:14px;align-items:center;font-weight:700;font-size:44px}
.vf b{font-family:'Yeseva One',Georgia,serif;font-size:76px;line-height:1}
.vf span{background:var(--bg);border-radius:22px;padding:6px 30px}
.fr{display:flex;align-items:center;gap:18px;font-family:'Yeseva One',Georgia,serif;font-size:70px;line-height:1.1}
.fr i{display:flex;flex-direction:column;align-items:center;font-style:normal}
.fr i b:first-child{border-bottom:7px solid #4a2a38;padding:0 12px}
.wc{width:100%;text-align:center;border-radius:24px;padding:26px 0;background:var(--bg);font-weight:700;font-size:42px}
.wc.b{background:var(--two);color:#fffdf8}
.cup{left:600px;top:1170px;width:220px;height:220px;border-radius:50%;background:var(--acc)}
.cup::before{content:"";position:absolute;inset:26px;border-radius:50%;background:#7a4a35}
.cup::after{content:"";position:absolute;right:-64px;top:62px;width:90px;height:96px;border-radius:50%;border:22px solid var(--acc);z-index:-1}
`;

const FIT = `(() => { document.querySelectorAll('.fit').forEach(el => {
  const max = +el.dataset.h; let fs = parseFloat(getComputedStyle(el).fontSize); const min = +el.dataset.min || fs * .55;
  while ((el.scrollHeight > max || el.scrollWidth > el.clientWidth + 1) && fs > min) { fs -= 2; el.style.fontSize = fs + 'px'; } });
  const over = [...document.querySelectorAll('.card')].filter(c => c.scrollHeight > c.clientHeight + 2 || c.scrollWidth > c.clientWidth + 2).length;
  const cov = document.querySelector('.cover'); const low = cov ? cov.getBoundingClientRect().bottom : 0;
  const pp = document.querySelector('.papers'); if (pp && low > 990) { const d = Math.min(low - 990, 90); pp.style.top = (1040 + d) + 'px'; const h = document.querySelector('.hint'); if (h) h.style.top = (1385 + d) + 'px'; }
  return { over, low }; })()`;

const page = (theme, cls, body) =>
  `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${CSS}</style></head><body class="t-${theme} ${cls}">${body}</body></html>`;
const blobs = `<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>`;
const dots = (n, cur) => `<div class="dots">${Array.from({ length: n }, (_, i) => `<i${i === cur ? ' class="on"' : ''}></i>`).join('')}</div>`;

function carouselCover(c) {
  return page(c.theme, '', `${blobs}
    <div class="cover"><span class="pill solid">сохрани</span>
      <h1 class="fit" data-h="520">${esc(c.cover.title)}</h1><div class="sub">${esc(c.cover.sub)}</div></div>
    <div class="papers"><div class="sheet s1"><u class="h"></u><u></u><u></u><u class="s"></u><u></u><u class="s"></u></div>
      <div class="sheet s2"><u class="h"></u><u></u><u class="s"></u><u></u><u></u></div>
      <div class="sheet s3"><u class="h"></u><u></u><u></u><u class="s"></u><u></u><u class="s"></u></div></div>
    <div class="hint">${esc(c.cover.hint)} ${arrow('var(--acc)')}</div>
    ${sparkle(880, 200, 130, 'var(--two)', 8)}${sparkle(700, 1090, 70, 'var(--acc)', -10)}${sparkle(950, 940, 56, 'var(--two)')}`);
}

function stepSlide(c, i) {
  const s = c.steps[i], n = c.steps.length;
  return page(c.theme, '', `${blobs}
    <div class="card"><div class="row"><span class="pill">${esc(c.unit)} ${i + 1} из ${n}</span>${s.time ? `<span class="pill time">${esc(s.time)}</span>` : ''}</div>
      <div class="num">${i + 1}</div><h1 class="fit" data-h="330">${esc(s.title)}</h1><p class="fit" data-h="360">${esc(s.text)}</p>
      ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}${dots(n, i)}</div>
    ${sparkle(905, 140, 130, 'var(--two)', 8)}${sparkle(40, 1420, 84, 'var(--acc)', -12)}`);
}

function promptSlide(c, i) {
  const s = c.items[i], n = c.items.length;
  return page(c.theme, '', `${blobs}
    <div class="card"><div class="row"><span class="pill">${esc(c.unit)} ${i + 1} из ${n}</span></div>
      <h1 class="sm fit" data-h="200">${esc(s.title)}</h1>
      <div class="plabel">напиши нейросети</div><div class="pr fit" data-h="520">${esc(s.prompt)}</div>
      <div class="note">${esc(s.why)}</div>${dots(n, i)}</div>
    ${sparkle(905, 140, 130, 'var(--two)', 8)}${sparkle(40, 1420, 84, 'var(--acc)', -12)}`);
}

function finalSlide(c) {
  const f = c.final;
  return page(c.theme, '', `${blobs}
    <div class="card fin"><div class="row"><span class="pill">коротко</span></div>
      <h1 class="fit" data-h="230">${esc(f.title)}</h1>
      <div class="list${f.list.length > 5 ? ' c' : ''}">${f.list.map(t => `<div>${check('var(--acc)')}<span>${esc(t)}</span></div>`).join('')}</div>
      <div class="cta">${bookmark('var(--acc-ink)')}<span>${esc(f.cta)}</span></div><div class="ask">${esc(f.ask)}</div></div>
    ${sparkle(905, 140, 130, 'var(--two)', 8)}${sparkle(40, 1420, 84, 'var(--acc)', -12)}`);
}

function quizSlide(c, i) {
  const n = c.words.length, w = c.words[i], prev = i > 0 ? c.words[i - 1] : null;
  const ans = p => `<div class="answer">${check('#fffdf8').replace('stroke="#fffdf8"', 'stroke="var(--acc)"')}<div><small>правильно</small>
    <div class="aw">${stress(p[p.right])}</div><div class="tip">${stress(p.tip)}</div></div></div>`;
  return page(c.theme, '', `${blobs}
    <div class="card quiz${prev ? '' : ' first'}">${prev ? ans(prev) : ''}
      <div class="row"><span class="pill">слово ${i + 1} из ${n}</span></div>
      <div class="q">Куда падает ударение?</div><div class="word">${esc(w.word)}</div>
      <div class="opts"><div class="opt">${stress(w.a)}</div><div class="or">или</div><div class="opt">${stress(w.b)}</div></div>
      <div class="next">листай, там ответ ${arrow('var(--acc)')}</div></div>
    ${sparkle(905, 140, 130, 'var(--two)', 8)}${sparkle(40, 1420, 84, 'var(--acc)', -12)}`);
}

function quizFinal(c) {
  const p = c.words[c.words.length - 1], f = c.final;
  return page(c.theme, '', `${blobs}
    <div class="card quiz"><div class="answer">${check('#fffdf8').replace('stroke="#fffdf8"', 'stroke="var(--acc)"')}<div><small>правильно</small>
      <div class="aw">${stress(p[p.right])}</div><div class="tip">${stress(p.tip)}</div></div></div>
      <div class="row"><span class="pill">результат</span></div>
      <h1 class="big">${esc(f.title)}</h1><div class="ask">${esc(f.ask)}</div>
      <div class="cta">${bookmark('var(--acc-ink)')}<span>${esc(f.cta)}</span></div></div>
    ${sparkle(905, 140, 130, 'var(--two)', 8)}${sparkle(40, 1420, 84, 'var(--acc)', -12)}`);
}

const TOOL_ART = {
  glagoly: `<div class="phone"><div class="vf"><b>go</b><span>went</span><span>gone</span></div><div class="btn"></div></div>`,
  drobi: `<div class="phone"><div class="fr"><i><b>1</b><b>2</b></i>+<i><b>1</b><b>3</b></i></div><div class="btn"></div></div>`,
  slova: `<div class="phone"><div class="wc">apple</div><div class="wc b">яблоко</div><div class="btn"></div></div>`,
  ocenki: `<div class="phone"><div class="marks"><i>5</i><i class="m4">4</i><i>5</i><i class="m3">3</i></div><div class="avg">4,25</div><div class="need">ещё 4 пятёрки</div></div>`,
};

function videoCover(post) {
  const r = plan.rubrics[post.rubric];
  let art = '';
  if (post.rubric === 'imba') art = `${TOOL_ART[post.tool]}<div class="say" style="left:96px;top:1150px">сделала<br>в нейросети</div>${sparkle(380, 1330, 90, 'var(--two)', 10)}`;
  if (post.rubric === 'uchis') art = `<div class="nb"><u class="h"></u><u></u><u></u><u class="s"></u><u></u></div><div class="cup"></div>${sparkle(880, 1060, 96, 'var(--two)', 8)}${sparkle(520, 1420, 60, 'var(--acc)')}`;
  if (post.rubric === 'sobirayus') art = `<div class="mirror"><i></i><i></i></div><div style="left:520px;top:1130px">${bow('#E27396')}</div>${sparkle(450, 1040, 80, 'var(--two)', 10)}${sparkle(860, 1420, 64, 'var(--acc)')}`;
  if (post.rubric === 'zhiza') art = `<div class="bubble">жиза</div><div class="bubble2">!!!</div>${sparkle(700, 1060, 90, 'var(--two)', 8)}`;
  return page(r.theme, 'cv', `<div class="blob b1"></div><div class="blob b2"></div>
    <div class="cover"><span class="pill solid">${esc(r.name)}</span><h1 class="fit" data-h="560" data-min="72">${esc(post.title)}</h1></div>
    <div class="art">${art}</div>${sparkle(900, 210, 120, 'var(--two)', 8)}`);
}

// Собираем список картинок
const jobs = [];
for (const [id, c] of Object.entries(plan.carousels)) {
  const slides = [carouselCover(c)];
  if (c.kind === 'steps') { c.steps.forEach((_, i) => slides.push(stepSlide(c, i))); slides.push(finalSlide(c)); }
  else if (c.kind === 'prompts') { c.items.forEach((_, i) => slides.push(promptSlide(c, i))); slides.push(finalSlide(c)); }
  else { c.words.forEach((_, i) => slides.push(quizSlide(c, i))); slides.push(quizFinal(c)); }
  slides.forEach((html, i) => jobs.push({ file: path.join(id, String(i + 1).padStart(2, '0') + '.png'), html }));
}
for (const w of plan.weeks) for (const p of w.posts) if (p.cover) jobs.push({ file: path.join('oblozhki', p.cover + '.png'), html: videoCover(p) });

const only = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const pg = await ctx.newPage();
for (const j of jobs) {
  if (only && !j.file.includes(only)) continue;
  await pg.setContent(j.html, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  const r = await pg.evaluate(FIT);
  const out = path.join(OUT, j.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await pg.screenshot({ path: out, type: 'png' });
  console.log(j.file, r.over ? 'ПЕРЕПОЛНЕНИЕ' : 'ok', r.low ? `низ текста ${Math.round(r.low)}` : '');
}
await browser.close();
