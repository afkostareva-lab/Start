// Собирает страницу контент-плана из plan.json.
// Запуск: node tiktok/src/build-page.mjs  →  tiktok/kontent-plan.html
// Если задана переменная ARTIFACT_OUT, туда же пишется вариант без обёртки <html>.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SRC, '..');
const plan = JSON.parse(fs.readFileSync(path.join(SRC, 'plan.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const dayOf = iso => +iso.slice(8, 10);
const monOf = iso => MONTHS[+iso.slice(5, 7) - 1];
const toolById = Object.fromEntries(plan.tools.map(t => [t.id, t]));
const posts = plan.weeks.flatMap(w => w.posts);
const slideCount = id => fs.readdirSync(path.join(ROOT, 'img', id)).filter(f => f.endsWith('.png')).length;
const pad = n => String(n).padStart(2, '0');
const plural = (n, f) => f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
const need = t => (t.when.startsWith('к ') ? 'нужен ' : '') + t.when;

const thumb = (group, i, full, alt, cls = '') =>
  `<button type="button" class="th ${cls}" data-g="${esc(group)}" data-i="${i}" data-full="${esc(full)}" aria-label="${esc(alt)}: открыть в полном размере">` +
  `<img src="${esc(full.replace('img/', 'img/thumbs/').replace('.png', '.jpg'))}" alt="${esc(alt)}" width="324" height="576" loading="lazy"></button>`;

function postHtml(p) {
  const r = plan.rubrics[p.rubric];
  const tags = p.tags.map(t => '#' + t).join(' ');
  let media = '', strip = '';
  if (p.cover) media = thumb(p.id, 0, `img/oblozhki/${p.cover}.png`, `Обложка «${p.title}»`, 'cover');
  if (p.carousel) {
    const n = slideCount(p.carousel);
    strip = `<div class="strip" role="group" aria-label="Картинки карусели">${Array.from({ length: n }, (_, i) =>
      thumb(p.id, i, `img/${p.carousel}/${pad(i + 1)}.png`, `Картинка ${i + 1} из ${n}`)).join('')}</div>`;
  }
  const tool = p.tool ? `<a class="toollink" href="#tool-${p.tool}">Файл: ${esc(toolById[p.tool].name)}</a>` : '';
  return `<article class="post" id="${p.id}">
  <div class="date"><span class="dow">${esc(p.dow)}</span><span class="dd">${dayOf(p.date)}</span><span class="mm">${monOf(p.date)}</span></div>
  <div class="body">
    <div class="meta"><span class="chip r-${p.rubric}">${esc(r.name)}</span><span class="fmt">${esc(p.format)}</span>${tool}</div>
    <div class="cols"><div class="txt">
      <h4>${esc(p.title)}</h4>
      ${p.note ? `<p class="pnote">${esc(p.note)}</p>` : ''}
      <ul class="shots">${p.shots.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      ${p.format.startsWith('карусель') && !p.carousel ? '<p class="pnote">Картинки для этой карусели пока не нарисованы.</p>' : ''}
    </div>${media}</div>
    ${strip}
    <div class="cap"><div class="capt"><span class="lbl">Описание</span><span id="cap-${p.id}">${esc(p.caption)} <span class="tags">${esc(tags)}</span></span></div>
      <button type="button" class="btn copy" data-copy="cap-${p.id}">Скопировать</button></div>
    <label class="done"><input type="checkbox" id="done-${p.id}"> Выложено</label>
  </div>
</article>`;
}

function weekHtml(w) {
  const t = toolById[w.tool];
  const prep = w.prep ? `<div class="prep"><div class="date"><span class="dow">${esc(w.prep.dow)}</span><span class="dd">${dayOf(w.prep.date)}</span><span class="mm">${monOf(w.prep.date)}</span></div>
    <div><h4>${esc(w.prep.title)}</h4><ul class="shots">${w.prep.todo.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div></div>` : '';
  return `<section class="week" id="week-${w.n}">
  <header class="wh"><p class="eyebrow">Неделя ${w.n} · ${esc(w.dates)}</p><h3>${esc(w.theme)}</h3>
    <p class="wtool">Файл недели: <a href="#tool-${t.id}">${esc(t.name)}</a>, ${esc(need(t))}</p></header>
  ${prep}${w.posts.map(postHtml).join('\n')}
</section>`;
}

const rubricRows = Object.entries(plan.rubrics).map(([id, r]) =>
  `<tr><td class="num">${esc(r.day)}</td><td><span class="chip r-${id}">${esc(r.name)}</span></td><td>${esc(r.format)}</td><td>${esc(r.goal)}</td><td>${esc(r.proof)}</td></tr>`).join('');

const toolHtml = t => {
  const vids = posts.filter(p => p.tool === t.id).map(p => `<li><a href="#${p.id}">${esc(p.dow)} ${dayOf(p.date)} ${monOf(p.date)}</a> · ${esc(p.title)}</li>`).join('');
  return `<article class="tool" id="tool-${t.id}">
  <h3>${esc(t.name)}</h3>
  <p class="tmeta">Файл <code>${esc(t.file)}</code> · ${esc(need(t))}</p>
  <p>${esc(t.does)} ${esc(t.viewer)}</p>
  <p class="lbl">Ролики с этим инструментом</p><ul class="vids">${vids}</ul>
  <p class="lbl">ТЗ для генерации</p>
  <div class="prompt" id="prompt-${t.id}">${t.noStyle ? '' : esc(plan.toolStyle) + '<br><br>'}${esc(t.prompt)}</div>
  <button type="button" class="btn copy" data-copy="prompt-${t.id}">Скопировать ТЗ</button>
</article>`;
};

const queueRows = plan.queue.map(q =>
  `<tr><td class="num">${esc(q.when)}</td><td><strong>${esc(q.name)}</strong></td><td>${esc(q.does)}</td><td>${esc(q.video)}</td></tr>`).join('');

const nImg = posts.filter(p => p.cover).length + posts.filter(p => p.carousel).reduce((a, p) => a + slideCount(p.carousel), 0);
const nCar = posts.filter(p => p.carousel).length;

const STYLE = `
/* Лента по неделям в одну колонку: у публикации слева дата, справа обложка, под текстом лента картинок */
:root{
  --bg:#F7EFF3; --card:#fffdf8; --ink:#4a2a38; --muted:#80606c; --line:#EBD3DF; --accent:#C94F7A; --link:#1f6f78;
  --zhiza:#5f7334; --zhiza-bg:#E6EFCB; --sohrani:#B8436D; --sohrani-bg:#F8DDE9; --sobirayus:#87509a; --sobirayus-bg:#EADBF0;
  --sama:#1f6f78; --sama-bg:#CFEBEE; --uchis:#fffdf8; --uchis-bg:#4a2a38; --shade:rgba(74,42,56,.55);
  --display:'Yeseva One',Georgia,'Times New Roman',serif;
  --body:'Golos Text',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#231920; --card:#30222b; --ink:#f7e9f0; --muted:#c4a6b4; --line:#4a3542; --accent:#EB9AB2; --link:#9bd6dc;
    --zhiza:#cfe0a3; --zhiza-bg:#3a4423; --sohrani:#f6bdd0; --sohrani-bg:#5a2a3d; --sobirayus:#e0c0ea; --sobirayus-bg:#4a2f52;
    --sama:#b4e3e8; --sama-bg:#1f4449; --uchis:#4a2a38; --uchis-bg:#EFCFE3; --shade:rgba(0,0,0,.7); color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#231920; --card:#30222b; --ink:#f7e9f0; --muted:#c4a6b4; --line:#4a3542; --accent:#EB9AB2; --link:#9bd6dc;
  --zhiza:#cfe0a3; --zhiza-bg:#3a4423; --sohrani:#f6bdd0; --sohrani-bg:#5a2a3d; --sobirayus:#e0c0ea; --sobirayus-bg:#4a2f52;
  --sama:#b4e3e8; --sama-bg:#1f4449; --uchis:#4a2a38; --uchis-bg:#EFCFE3; --shade:rgba(0,0,0,.7); color-scheme:dark;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 var(--body)}
.wrap{max-width:880px;margin:0 auto;padding-block:28px 72px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:44px}
h1,h2,h3{font-family:var(--display);font-weight:400;margin:0;text-wrap:balance;line-height:1.12}
h1{font-size:clamp(38px,8vw,60px);color:var(--accent)}
h2{font-size:clamp(26px,5vw,34px)}
h3{font-size:clamp(22px,4.4vw,27px)}
h4{font:700 19px/1.3 var(--body);margin:0;text-wrap:balance}
p{margin:0}
a{color:var(--link);text-underline-offset:3px}
a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:6px}
code{font:600 .92em ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--bg);padding:1px 6px;border-radius:6px}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.lbl{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.hero{display:flex;flex-direction:column;gap:14px}
.lead{font-size:18px;max-width:62ch}
.facts{display:flex;flex-wrap:wrap;gap:6px 22px;font-weight:600;font-variant-numeric:tabular-nums}
.facts b{color:var(--accent);font-weight:700}
.nav{display:flex;flex-wrap:wrap;gap:8px}
.nav a{font-weight:600;font-size:14px;text-decoration:none;color:var(--ink);background:var(--card);border:1.5px solid var(--line);border-radius:999px;padding:7px 14px}
.sec{display:flex;flex-direction:column;gap:18px}
.sec>p{max-width:68ch}
.scroll{overflow-x:auto;border:1.5px solid var(--line);border-radius:16px;background:var(--card)}
table{border-collapse:collapse;width:100%;min-width:640px;font-size:15px}
th,td{text-align:left;padding:11px 14px;vertical-align:top;border-bottom:1.5px solid var(--line)}
tr:last-child td{border-bottom:0}
th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
td.num{white-space:nowrap;font-weight:700;font-variant-numeric:tabular-nums}
.chip{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 11px;border-radius:999px;white-space:nowrap}
.r-zhiza,.r-tema{background:var(--zhiza-bg);color:var(--zhiza)}
.r-sohrani,.r-zaberu{background:var(--sohrani-bg);color:var(--sohrani)}
.r-sobirayus{background:var(--sobirayus-bg);color:var(--sobirayus)}
.r-sama,.r-imba{background:var(--sama-bg);color:var(--sama)}
.r-uchis,.r-mama{background:var(--uchis-bg);color:var(--uchis)}
.week{display:flex;flex-direction:column;gap:14px}
.wh{display:flex;flex-direction:column;gap:6px;padding-top:6px}
.wtool{color:var(--muted)}
.post,.prep{display:grid;grid-template-columns:58px minmax(0,1fr);gap:16px;background:var(--card);border:1.5px solid var(--line);border-radius:20px;padding:18px}
.prep{background:transparent;border-style:dashed}
.date{display:flex;flex-direction:column;align-items:center;line-height:1.05;padding-top:2px}
.date .dow{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.date .dd{font-family:var(--display);font-size:34px;color:var(--accent);font-variant-numeric:tabular-nums}
.date .mm{font-size:13px;color:var(--muted)}
.body{display:flex;flex-direction:column;gap:12px;min-width:0}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;font-size:14px}
.fmt{color:var(--muted);font-weight:600}
.toollink{font-weight:600}
.pnote{font-size:14px;color:var(--muted);font-weight:600}
.cols{display:flex;gap:16px;align-items:flex-start}
.txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.shots{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:3px}
.th{flex:none;padding:0;border:0;background:none;cursor:zoom-in;border-radius:10px;line-height:0}
.th img{display:block;width:78px;height:auto;aspect-ratio:9/16;border-radius:10px;border:1.5px solid var(--line)}
.th.cover img{width:92px}
.strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;max-width:100%}
.cap{display:flex;gap:12px;align-items:flex-start;background:var(--bg);border-radius:14px;padding:12px 14px}
.capt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:15px}
.tags{color:var(--link);font-weight:600}
.btn{flex:none;font:600 14px/1 var(--body);padding:10px 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
.btn:hover{border-color:var(--accent)}
.done{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--muted);cursor:pointer;align-self:flex-start}
.done input{width:18px;height:18px;accent-color:var(--accent)}
.post.is-done{opacity:.62}
.tools{display:grid;gap:16px}
.tool{background:var(--card);border:1.5px solid var(--line);border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.tmeta{color:var(--muted);font-weight:600;font-size:14px}
.vids{margin:0;padding-left:20px}
.prompt{background:var(--bg);border-radius:14px;padding:14px 16px;font-size:15px;align-self:stretch}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.box{background:var(--card);border:1.5px solid var(--line);border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px}
.box ul,.box ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px}
.big{font-family:var(--display);font-size:30px;color:var(--accent);font-variant-numeric:tabular-nums;line-height:1.1}
.note{color:var(--muted);font-size:14px}
#lb{position:fixed;inset:0;z-index:20;background:var(--shade);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  padding:calc(14px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
#lb img{max-width:100%;max-height:calc(100% - 110px);width:auto;height:auto;border-radius:14px;background:var(--card)}
#lb .bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
#lb-cap{color:#fffdf8;font-weight:600;font-size:14px;text-align:center}
@media (max-width:560px){
  .post,.prep{grid-template-columns:minmax(0,1fr);padding:16px}
  .date{flex-direction:row;align-items:baseline;gap:8px}
  .date .dd{font-size:26px}
  .cap{flex-direction:column}
  .th.cover img{width:76px}
}
@media (prefers-reduced-motion:no-preference){.btn,.nav a{transition:border-color .15s}}
`;

const SCRIPT = `
(function(){
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  // Скопировать описание или ТЗ
  document.querySelectorAll('.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById(b.dataset.copy), text=el.innerText.trim(), old=b.textContent;
      function ok(){b.textContent='Скопировано';setTimeout(function(){b.textContent=old},1600)}
      function pick(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Выделено, скопируйте';setTimeout(function(){b.textContent=old},2400)}
      try{navigator.clipboard.writeText(text).then(ok,pick)}catch(e){pick()}
    });
  });
  // Отметка «Выложено» хранится только в этом браузере
  document.querySelectorAll('.done input').forEach(function(c){
    var post=c.closest('.post');
    if(store(c.id)==='1'){c.checked=true;post.classList.add('is-done')}
    c.addEventListener('change',function(){store(c.id,c.checked?'1':'0');post.classList.toggle('is-done',c.checked)});
  });
  // Просмотр картинки в полном размере
  var lb=document.getElementById('lb'),img=document.getElementById('lb-img'),cap=document.getElementById('lb-cap'),group=[],idx=0,last=null;
  function show(){var t=group[idx];img.src=t.dataset.full;img.alt=t.querySelector('img').alt;
    cap.textContent=(group.length>1?(idx+1)+' из '+group.length+' · ':'')+t.dataset.full+' · чтобы сохранить, удерживайте картинку';
    document.getElementById('lb-prev').hidden=document.getElementById('lb-next').hidden=group.length<2}
  function close(){lb.hidden=true;img.removeAttribute('src');if(last)last.focus()}
  document.querySelectorAll('.th').forEach(function(t){
    t.addEventListener('click',function(){last=t;group=[].slice.call(document.querySelectorAll('.th[data-g="'+t.dataset.g+'"]'));idx=+t.dataset.i;show();lb.hidden=false;document.getElementById('lb-x').focus()});
  });
  document.getElementById('lb-x').addEventListener('click',close);
  document.getElementById('lb-prev').addEventListener('click',function(){idx=(idx+group.length-1)%group.length;show()});
  document.getElementById('lb-next').addEventListener('click',function(){idx=(idx+1)%group.length;show()});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')document.getElementById('lb-prev').click();if(e.key==='ArrowRight')document.getElementById('lb-next').click()});
})();
`;

const BODY = `
<div class="wrap">
  <header class="hero">
    <p class="eyebrow">Контент-план TikTok · ${esc(plan.period)}</p>
    <h1>${esc(plan.name)}</h1>
    <p class="lead">Учёба, эстетика и жизнь школьницы в одном блоге. Каждая неделя строится вокруг одной школьной боли и одного файла, который её снимает. Форматы взяты у роликов, которые уже набирали миллионы на маленьких аккаунтах.</p>
    <p class="facts"><span><b>${posts.length}</b> публикаций</span><span><b>${plan.tools.length}</b> файла</span><span><b>${nImg}</b> ${plural(nImg, ['готовая картинка', 'готовые картинки', 'готовых картинок'])}</span></p>
    <nav class="nav" aria-label="Разделы">${plan.weeks.map(w => `<a href="#week-${w.n}">Неделя ${w.n}</a>`).join('')}<a href="#html">Что генерировать в HTML</a><a href="#cifry">Цифры</a><a href="#kartinki">Картинки</a></nav>
  </header>

  <section class="sec" id="ritm">
    <h2>Ритм недели</h2>
    <p>У каждой рубрики свой день, своя цель в цифрах и ролик конкурента, на котором она основана. Проценты в целях взяты из этих же роликов. По воскресеньям рубрики чередуются.</p>
    <div class="scroll"><table>
      <thead><tr><th>День</th><th>Рубрика</th><th>Формат</th><th>Цель по ролику</th><th>На чём основано</th></tr></thead>
      <tbody>${rubricRows}</tbody></table></div>
  </section>

  <section class="sec" id="plan">
    <h2>План по дням</h2>
    <p>Название ролика пишется текстом на первом кадре. Описание и хэштеги копируются кнопкой. Картинка открывается в полном размере по нажатию.</p>
    ${plan.weeks.map(weekHtml).join('\n')}
  </section>

  <section class="sec" id="html">
    <h2>Что генерировать в HTML</h2>
    <p>Один файл в неделю, каждый под конкретную школьную боль: его хочется забрать, и он хорошо смотрится в записи экрана. ТЗ ниже можно вставлять в нейросеть целиком: в нём уже описаны цвета и общие требования.</p>
    <div class="tools">${plan.tools.map(toolHtml).join('\n')}</div>
    <h3>Очередь после 6 декабря</h3>
    <div class="scroll"><table>
      <thead><tr><th>Когда</th><th>Инструмент</th><th>Что делает</th><th>Название ролика</th></tr></thead>
      <tbody>${queueRows}</tbody></table></div>
  </section>

  <section class="sec" id="cifry">
    <h2>Цифры</h2>
    <div class="two">
      <div class="box"><p class="lbl">Точка отсчёта, 10 ноября</p><p class="big">240–310</p><p>просмотров набирает обычный ролик.</p></div>
      <div class="box"><p class="lbl">Ориентиры на 6 декабря</p>
        <ul><li>${posts.length} публикаций без пропусков</li><li>обычный ролик набирает 500 просмотров и больше</li><li>ролики с файлом сохраняют 5 % зрителей</li><li>хотя бы один ролик набрал 3 000</li><li>100 подписчиков</li></ul>
        <p class="note">Вирусность нельзя назначить на дату. Можно делать больше попыток в форматах, которые уже залетали у других, и это план и делает.</p></div>
    </div>
    <div class="box"><p class="lbl">Разбор по воскресеньям, 10 минут</p>
      <ol><li>Выписать по каждому ролику недели просмотры, сохранения, комментарии и новых подписчиков.</li>
      <li>Рубрика два раза подряд не дотянула до своей цели: меняем первую фразу и подачу, тему оставляем.</li>
      <li>Ролик набрал втрое больше обычного: в ближайший вторник выходит его «часть 2». У конкурента вторая часть собрала вчетверо больше первой.</li></ol></div>
  </section>

  <section class="sec" id="kartinki">
    <h2>Картинки</h2>
    <div class="two">
      <div class="box"><p class="lbl">Карусель</p><p>Готова первая, с запросами для нейросети. Загружать по порядку номеров, начиная с 01. Размер 1080 на 1920. Остальные три рисуются по тому же шаблону, когда утверждены тексты.</p></div>
      <div class="box"><p class="lbl">Обложки роликов с файлом</p><p>Вставить картинку первым кадром на треть секунды и при публикации выбрать этот кадр обложкой. Так серию «Имба для школы» видно в сетке профиля.</p></div>
    </div>
    <p>Все файлы лежат в папке <code>tiktok/img</code>. Тексты на картинках берутся из <code>tiktok/src/plan.json</code>: после правки запустите <code>node tiktok/src/render.mjs</code>, и картинки перерисуются.</p>
  </section>
</div>

<div id="lb" hidden role="dialog" aria-modal="true" aria-label="Картинка в полном размере">
  <img id="lb-img" alt="">
  <div id="lb-cap"></div>
  <div class="bar"><button type="button" class="btn" id="lb-prev">Назад</button><button type="button" class="btn" id="lb-next">Дальше</button><button type="button" class="btn" id="lb-x">Закрыть</button></div>
</div>
`;

const TITLE = `Контент-план «${plan.name}»`;
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Yeseva+One&display=swap">`;

// Вариант для репозитория: обычная самостоятельная страница
fs.writeFileSync(path.join(ROOT, 'kontent-plan.html'),
  `<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>${esc(TITLE)}</title>\n${FONTS}\n<style>${STYLE}</style>\n</head>\n<body>${BODY}<script>${SCRIPT}</script>\n</body>\n</html>\n`);

// Вариант без обёртки, если нужен
if (process.env.ARTIFACT_OUT) {
  fs.writeFileSync(process.env.ARTIFACT_OUT,
    `<title>${esc(TITLE)}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${FONTS}\n<style>${STYLE}</style>\n${BODY}<script>${SCRIPT}</script>\n`);
}
console.log('страница собрана:', posts.length, 'публикаций,', nImg, 'картинок');
