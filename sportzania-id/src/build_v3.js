// SPORTZANIA ID // THE RESIDENT PASSPORT — версия 3: 10 слайдов по пунктам кейса SportZania.
// Макеты экранов — скриншоты кликабельного прототипа (папка prototype).
// Зависимости: npm install pptxgenjs sharp react react-dom react-icons
// Запуск: node build_v3.js <выходной.pptx> poster.jpg <путь к scripts/apply_theme.js из навыка pptx> <папка со скриншотами экранов>
const pptxgen = require("pptxgenjs");
const { buildAssets2 } = require("./assets2.js");

const OUT = process.argv[2] || "SportZania_ID_v2.pptx";
const POSTER = process.argv[3];
const { applyTheme } = require(process.argv[4]);
const SHOTS_DIR = process.argv[5];
const sharp = require("sharp");

const THEME = {
  name: "SportZania ID Passport",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0A0F1D", lt1: "F4F1EA", dk2: "334155", lt2: "FCFBF9",
    accent1: "1D4ED8", accent2: "10B981", accent3: "EF4444",
    accent4: "FFFFFF", accent5: "DBEAFE", accent6: "94A3B8",
    hlink: "1D4ED8", folHlink: "64748B",
  },
};
const HEX = THEME.colors;
const MONO = "Courier New"; // машиночитаемая строка паспорта

const ICONS = [
  ["FaLock", "ink"], ["FaLock", "white"], ["FaUser", "cobalt"], ["FaUser", "white"], ["FaCheck", "white"],
  ["FaRobot", "cobalt"], ["FaVideo", "cobalt"], ["FaCampground", "white"], ["FaGraduationCap", "white"],
  ["FaXmark", "white"], ["FaArrowRight", "white"], ["FaArrowDown", "white"],
];

(async () => {
  const A = await buildAssets2(HEX, POSTER);
  const IC = {};
  for (const [n, t] of ICONS) IC[n + ":" + t] = await A.icon(n, t);
  const poster = "image/jpeg;base64," + require("fs").readFileSync(POSTER).toString("base64");
  // Экраны прототипа: уменьшаем до разумного размера, чтобы файл оставался лёгким
  const SHOT = {};
  for (const n of ["passport", "city", "project", "evening", "counselor", "parent", "guest", "friendlock"]) {
    SHOT[n] = "image/jpeg;base64," + (await sharp(`${SHOTS_DIR}/${n}.png`).resize({ width: 780 }).jpeg({ quality: 90 }).toBuffer()).toString("base64");
  }

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 дюйма
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "SPORTZANIA ID // THE RESIDENT PASSPORT";
  pres.subject = "Sk Kids Challenge 2026 — концепция единого цифрового паспорта резидента";
  pres.author = "Костарев Фёдор";
  pres.company = "Sk Kids Challenge 2026";

  const C = pres.SchemeColor;
  const INK = C.text1, PAPER = C.background1, SLATE = C.text2, CARD = C.background2;
  const COBALT = C.accent1, GREEN = C.accent2, RED = C.accent3, WHITE = C.accent4, TINT = C.accent5, SILVER = C.accent6;

  const SW = 13.333, MX = 0.5, CW = SW - 2 * MX, XR = SW - MX;
  const NB = " ";
  // Русская типографика: тире, короткие предлоги и числа не отрываются от соседнего слова
  const shortWord = /(^|[\s«(])([А-Яа-яЁё]{1,2}) (?=\S)/g;
  const typo = (t) => typeof t !== "string" ? t : t
    .replace(/ — /g, NB + "— ")
    .replace(shortWord, "$1$2" + NB).replace(shortWord, "$1$2" + NB) // два прохода: «и к осени»
    .replace(/(\d) (?=[а-яё])/g, "$1" + NB);
  const mrz = (s, n) => (s + "<".repeat(n)).slice(0, n);

  // ---------- Макеты ----------
  const COVER_X = 7.55; // граница кобальтового поля на обложке
  pres.defineSlideMaster({
    title: "Обложка",
    background: { data: A.paper },
    objects: [
      { rect: { x: COVER_X, y: 0, w: SW - COVER_X, h: 7.5, fill: { color: COBALT } } },
      { line: { x: COVER_X, y: 0, w: 0, h: 7.5, line: { color: INK, width: 3 } } },
      { image: { x: 8.2, y: 0, w: 5.133, h: 5.4, data: A.globeCover, transparency: 40 } },
      { text: { text: "SK KIDS CHALLENGE 2026 // КЕЙС SPORTZANIA", options: { x: MX, y: 0.5, w: 5.5, h: 0.36, margin: 0, fontSize: 11, bold: true, color: WHITE, fill: { color: INK }, align: "center", valign: "middle", charSpacing: 1 } } },
      { text: { text: "SKOLKOVO // 2026", options: { x: 8.6, y: 0.5, w: 2.25, h: 0.36, margin: 0, fontSize: 10, bold: true, color: WHITE, align: "right", valign: "middle", charSpacing: 2 } } },
      { image: { x: 11.0, y: 0.5, w: 1.83, h: 0.36, data: A.barcodeWhite } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 1.12, w: 6.75, h: 0.95, margin: 0, fontSize: 54, bold: true, color: COBALT, align: "left", valign: "middle" }, text: "Название проекта" } },
      { placeholder: { options: { name: "subtitle", type: "body", x: MX, y: 2.08, w: 6.0, h: 0.42, margin: 0, fontSize: 22, bold: true, color: INK, charSpacing: 4, align: "left", valign: "middle" }, text: "Подзаголовок" } },
      { placeholder: { options: { name: "thesis", type: "body", x: MX, y: 2.9, w: 5.85, h: 1.0, margin: 0, fontSize: 28, bold: true, color: INK, align: "left", valign: "top" }, text: "Ключевой тезис" } },
      { placeholder: { options: { name: "lead", type: "body", x: MX, y: 3.95, w: 5.6, h: 0.62, margin: 0, fontSize: 16, color: SLATE, align: "left", valign: "top" }, text: "Суть проекта одной фразой" } },
      { text: { text: mrz("P<RUS<<SPORTZANIA<ID<<KOSTAREV<FEDOR<<SKOLKOVO<2026", 58), options: { x: MX, y: 6.86, w: 6.9, h: 0.26, margin: 0, fontFace: MONO, fontSize: 11, bold: true, color: SLATE, charSpacing: 1.5, valign: "middle" } } },
    ],
  });

  pres.defineSlideMaster({
    title: "Плакат",
    background: { data: A.paper },
    objects: [
      { text: { text: "SPORTZANIA ID //", options: { x: MX, y: 0.42, w: 2.05, h: 0.36, margin: 0, fontSize: 12, bold: true, color: WHITE, fill: { color: INK }, align: "center", valign: "middle", charSpacing: 1 } } },
      { placeholder: { options: { name: "section", type: "body", x: 2.75, y: 0.42, w: 6.6, h: 0.36, margin: 0, fontSize: 12, bold: true, color: COBALT, charSpacing: 1.5, align: "left", valign: "middle" }, text: "РАЗДЕЛ" } },
      { text: { text: "/ 10", options: { x: 10.24, y: 0.42, w: 0.5, h: 0.36, margin: 0, fontSize: 14, bold: true, color: SLATE, align: "left", valign: "middle" } } },
      { image: { x: 10.93, y: 0.37, w: 0.46, h: 0.46, data: A.globeCobalt } },
      { image: { x: 11.53, y: 0.42, w: 1.3, h: 0.36, data: A.barcode } },
      { line: { x: MX, y: 0.93, w: CW, h: 0, line: { color: INK, width: 3 } } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 1.08, w: CW, h: 0.74, margin: 0, fontSize: 34, bold: true, color: INK, align: "left", valign: "middle" }, text: "Заголовок слайда" } },
      { line: { x: MX, y: 6.8, w: CW, h: 0, line: { color: INK, width: 1.5 } } },
      { text: { text: mrz("P<RUS<<SPORTZANIA<ID<<THE<RESIDENT<PASSPORT<<KOSTAREV<FEDOR<<MIDDLE<11<14<<SK<KIDS<CHALLENGE<2026", 104), options: { x: MX, y: 6.88, w: CW, h: 0.26, margin: 0, fontFace: MONO, fontSize: 11, bold: true, color: SLATE, charSpacing: 1.5, valign: "middle" } } },
    ],
    slideNumber: { x: 9.5, y: 0.42, w: 0.68, h: 0.36, margin: 0, fontSize: 14, bold: true, color: INK, align: "right", valign: "middle" },
  });

  // ---------- Набор примитивов ----------
  const hard = (pt) => ({ type: "outer", color: HEX.dk1, blur: 0.01, offset: pt, angle: 45, opacity: 1 });
  const deg = (d) => ((d % 360) + 360) % 360;
  function kit(slide, prefix) {
    let n = 0;
    const nm = (label) => `${prefix} · ${label || "деталь"} ${++n}`;
    const shapeOpts = (o) => ({
      fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : undefined,
      line: o.line ? { color: o.line, width: o.lw || 1.5, dashType: o.dash || "solid" } : undefined,
      shadow: o.shadow ? hard(o.shadow) : undefined,
      rotate: o.rot ? deg(o.rot) : undefined,
      objectName: nm(o.name),
    });
    const K = {
      rect: (x, y, w, h, o = {}) => slide.addShape(pres.ShapeType.rect, { x, y, w, h, ...shapeOpts(o) }),
      oval: (x, y, d, o = {}) => slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, ...shapeOpts(o) }),
      star: (x, y, d, o = {}) => slide.addShape(pres.ShapeType.star4, { x, y, w: d, h: d, ...shapeOpts(o) }),
      hline: (x, y, w, o = {}) => slide.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color: o.color || INK, width: o.lw || 1.5, dashType: o.dash || "solid", beginArrowType: o.begin, endArrowType: o.end }, objectName: nm(o.name || "линия") }),
      vline: (x, y, h, o = {}) => slide.addShape(pres.ShapeType.line, { x, y, w: 0, h, line: { color: o.color || INK, width: o.lw || 1.5, dashType: o.dash || "solid", beginArrowType: o.begin, endArrowType: o.end }, objectName: nm(o.name || "линия") }),
      text: (t, x, y, w, h, o = {}) => slide.addText(o.raw ? t : typo(t), {
        x, y, w, h, isTextBox: true, margin: o.margin ?? 0,
        fontSize: o.size || 14, bold: !!o.bold, color: o.color || INK, fontFace: o.font,
        align: o.align || "left", valign: o.valign || "middle", charSpacing: o.cs,
        strike: o.strike ? "sngStrike" : undefined, rotate: o.rot ? deg(o.rot) : undefined,
        fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : undefined,
        line: o.line ? { color: o.line, width: o.lw || 1.25, dashType: o.dash || "solid" } : undefined,
        shadow: o.shadow ? hard(o.shadow) : undefined,
        objectName: nm(o.name || "текст"),
      }),
      img: (data, x, y, w, h, name, alt, tr) => slide.addImage({ data, x, y, w, h, transparency: tr, objectName: nm(name || "графика"), altText: alt || "Декор: " + (name || "графика") }),
      icon: (name, tone, x, y, s) => slide.addImage({ data: IC[name + ":" + tone], x, y, w: s, h: s, objectName: nm("иконка"), altText: "Иконка" }),
      iconIn: (name, tone, x, y, w, h, s) => K.icon(name, tone, x + (w - s) / 2, y + (h - s) / 2, s),
      chip: (t, x, y, w, h, o = {}) => K.text(t, x, y, w, h, { size: o.size || 10, bold: true, color: o.color || WHITE, fill: o.fill, tr: o.tr, line: o.line === undefined ? INK : o.line, lw: o.lw || 1.25, dash: o.dash, align: o.align || "center", cs: o.cs, shadow: o.shadow, strike: o.strike, name: o.name || "бейдж" }),
      // Экран из макета интерфейса: рамка, жёсткая тень, подпись-ярлык
      frame: (crop, x, y, w, tag, alt) => {
        const h = w * crop.ratio;
        K.rect(x, y, w, h, { fill: WHITE, line: INK, lw: 2, shadow: 6, name: "рамка экрана" });
        K.img(crop.data, x + 0.04, y + 0.04, w - 0.08, h - 0.08, "экран паспорта", alt);
        if (tag) K.chip(tag, x, y - 0.3, tag.length * 0.098 + 0.3, 0.3, { fill: INK, cs: 0.5, name: "ярлык экрана" });
        return h;
      },
      // Штамп в паспорте: двойная рамка под углом
      stamp: (t, cx, cy, w, h, color, rot, size) => {
        K.rect(cx - w / 2, cy - h / 2, w, h, { line: color, lw: 2.5, rot, name: "штамп" });
        K.text(t, cx - w / 2 + 0.06, cy - h / 2 + 0.06, w - 0.12, h - 0.12, { size: size || 12, bold: true, color, align: "center", cs: 1.5, line: color, lw: 0.75, rot, name: "штамп" });
      },
      // Экран приложения в корпусе телефона
      phone: (shot, x, y, w, alt) => {
        const h = w * (844 / 390), b = 0.06;
        slide.addShape(pres.ShapeType.roundRect, { x: x - b, y: y - b, w: w + 2 * b, h: h + 2 * b, rectRadius: 0.13, fill: { color: INK }, shadow: hard(6), objectName: nm("телефон") });
        K.img(SHOT[shot], x, y, w, h, "экран приложения", alt);
        return h;
      },
      // Строка статуса «значок + подпись»
      status: (x, y, w, tone, iconName, label, rest, o = {}) => {
        K.rect(x, y + 0.03, 0.22, 0.22, { fill: tone, line: INK, lw: 1, name: "маркер" });
        K.iconIn(iconName, "white", x, y + 0.03, 0.22, 0.22, 0.12);
        K.text([{ text: label + " ", options: { bold: true, color: tone } }, { text: typo(rest), options: { color: INK } }], x + 0.34, y, w - 0.34, o.h || 0.28, { size: o.size || 13, valign: "top", raw: true, name: "статус" });
      },
    };
    return K;
  }
  const head = (s, section, title) => { s.addText(section, { placeholder: "section" }); s.addText(typo(title), { placeholder: "title" }); };

  // ====================== 1. ОБЛОЖКА ======================
  pres.addSection({ title: "Проект" });
  {
    const s = pres.addSlide({ masterName: "Обложка", sectionTitle: "Проект" });
    const K = kit(s, "Обложка");
    s.addText("SPORTZANIA ID //", { placeholder: "title" });
    s.addText("THE RESIDENT PASSPORT", { placeholder: "subtitle" });
    s.addText(typo("Смена не заканчивается в день отъезда"), { placeholder: "thesis" });
    s.addText(typo("Цифровой паспорт ребёнка: один профиль для лагеря, онлайн-школы и проектов"), { placeholder: "lead" });
    const fy = 4.9, fh = 0.8, fw = 5.85, cx2 = 3.95;
    K.hline(MX, fy, fw, { lw: 2 }); K.hline(MX, fy + fh, fw, { lw: 1 }); K.hline(MX, fy + 2 * fh, fw, { lw: 2 });
    K.vline(cx2 - 0.18, fy + 0.12, 2 * fh - 0.24, { lw: 1 });
    const field = (x, w, row, label, value, sub) => {
      const y = fy + row * fh;
      K.text(label, x, y + 0.1, w, 0.2, { size: 10, bold: true, color: COBALT, cs: 1.5, name: "поле" });
      K.text(value, x, y + 0.31, w, 0.3, { size: 15, bold: true, name: "значение" });
      if (sub) K.text(sub, x, y + 0.58, w, 0.2, { size: 10.5, color: SLATE, name: "уточнение" });
    };
    field(MX, 3.2, 0, "АВТОР", "Костарев Фёдор, 11 лет");
    field(cx2, 2.4, 0, "КАТЕГОРИЯ", "Middle, 11–14 лет");
    field(MX, 3.2, 1, "КУРАТОР ПРОЕКТА", "Альбина Костарева");
    field(cx2, 2.4, 1, "ЗАКАЗЧИК КЕЙСА", "ООО «Спортзания»", "резидент Фонда «Сколково»");
    const ix = 6.6, iy = 2.72, iw = 6.2, ih = iw * (941 / 1672);
    K.rect(ix, iy, iw, ih, { fill: WHITE, line: INK, lw: 2, shadow: 8, name: "рамка макета" });
    s.addImage({ data: poster, x: ix + 0.05, y: iy + 0.05, w: iw - 0.1, h: ih - 0.1, objectName: "Макет интерфейса паспорта", altText: "Макет интерфейса SportZania ID: профиль резидента, радар отряда, барометр дня, радар компетенций и лидерборд" });
    K.chip("МАКЕТ ИНТЕРФЕЙСА ПАСПОРТА", ix + 0.2, iy - 0.16, 2.75, 0.32, { fill: INK, cs: 1, line: WHITE });
    K.stamp("КЛИКАБЕЛЬНЫЙ ПРОТОТИП ГОТОВ", 10.6, 6.72, 4.1, 0.5, WHITE, -3, 12.5);
    K.star(ix + iw - 0.3, iy - 0.3, 0.56, { fill: WHITE, line: INK, lw: 1.5, name: "искра" });
    s.addNotes("Здравствуйте! Меня зовут Фёдор Костарев, мне 11 лет. Я решал кейс компании SportZania — «Цифровой паспорт ребёнка». Мой проект называется SportZania ID. Главная мысль: смена не должна заканчиваться в день отъезда. Паспорт — это один профиль, который едет с ребёнком из лагеря в онлайн-школу и обратно. К презентации приложен кликабельный прототип приложения.");
  }

  // ====================== 2. ПРОБЛЕМА: было / стало ======================
  pres.addSection({ title: "Проблема" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Проблема" });
    const K = kit(s, "Проблема");
    head(s, "ПРОБЛЕМА", "Куда исчезает прогресс ребёнка после смены?");
    const by = 2.08, bh = 2.56, bw = 5.45, ax = XR - bw;
    const wins = ["Прошёл сюжет смены", "Сертификат по английскому", "Научился работать в команде", "Нашёл друзей"];
    const slot = (x0, k) => [x0 + 0.25 + (k % 2) * 2.6, by + 0.82 + Math.floor(k / 2) * 0.82];
    K.rect(MX, by, bw, bh, { fill: COBALT, line: INK, lw: 2, shadow: 6, name: "день отъезда" });
    K.chip("ДЕНЬ ОТЪЕЗДА", MX + 0.25, by + 0.24, 1.9, 0.34, { fill: INK, line: WHITE, size: 11, cs: 1 });
    K.text("всё получилось", MX + 2.3, by + 0.24, 2.9, 0.34, { size: 14, bold: true, color: WHITE });
    wins.forEach((t, k) => {
      const [x, y] = slot(MX, k);
      K.rect(x, y, 2.35, 0.6, { fill: WHITE, line: INK, lw: 1.5, shadow: 3, name: "достижение" });
      K.rect(x + 0.14, y + 0.16, 0.28, 0.28, { fill: GREEN, line: INK, lw: 1 });
      K.iconIn("FaCheck", "white", x + 0.14, y + 0.16, 0.28, 0.28, 0.15);
      K.text(t, x + 0.54, y, 1.78, 0.6, { size: 13, bold: true, name: "достижение" });
    });
    K.text("ЧЕРЕЗ\n2 МЕСЯЦА", MX + bw + 0.14, by + 0.62, ax - MX - bw - 0.2, 0.46, { size: 10.5, bold: true, align: "center", cs: 0.5, raw: true });
    K.hline(MX + bw + 0.2, by + bh / 2, ax - MX - bw - 0.36, { lw: 4, end: "triangle", name: "время" });
    K.rect(ax, by, bw, bh, { fill: CARD, tr: 35, line: INK, lw: 2, dash: "dash", name: "что осталось" });
    K.chip("БЕЗ ПАСПОРТА", ax + 0.25, by + 0.24, 1.9, 0.34, { color: INK, line: INK, size: 11, cs: 1 });
    K.text("остались грамота и фото", ax + 2.3, by + 0.24, 2.9, 0.34, { size: 14, bold: true, color: SLATE });
    wins.forEach((t, k) => {
      const [x, y] = slot(ax, k);
      K.text(t, x, y, 2.35, 0.6, { size: 13, bold: true, color: SILVER, strike: true, align: "center", line: SILVER, lw: 1.5, dash: "dash", name: "забытое достижение" });
    });
    const ry = 4.98, cw = 3.72, xs = [MX, MX + 4.3, MX + 8.6];
    K.hline(MX, ry, CW, { lw: 2 });
    [4.55, 8.85].forEach((x) => K.vline(x, ry + 0.18, 1.42, { color: SILVER, lw: 1 }));
    [
      ["РЕБЁНОК", "Проекты и друзья теряются в чатах", "Школьные портфолио казённые: сами подростки туда не заходят."],
      ["РОДИТЕЛИ", "Платили за развитие — получили грамоту", "Рост гибких навыков не оцифрован и к осени забывается."],
      ["ВОЖАТЫЙ И ПРЕПОДАВАТЕЛЬ", "Каждый раз знакомятся с нуля", "Лагерь и онлайн-школа не знают, что ребёнок уже умеет."],
    ].forEach(([who, loss, why], k) => {
      K.rect(xs[k], ry + 0.24, 0.16, 0.16, { fill: RED, name: "маркер потери" });
      K.text(who, xs[k] + 0.28, ry + 0.19, cw - 0.28, 0.26, { size: 11, bold: true, color: RED, cs: 1.5 });
      K.text(loss, xs[k], ry + 0.5, cw, 0.66, { size: 18, bold: true, valign: "top" });
      K.text(why, xs[k], ry + 1.18, cw, 0.5, { size: 13.5, color: SLATE, valign: "top" });
    });
    s.addNotes("В день отъезда всё отлично: прошёл с отрядом сюжет смены, получил сертификат по английскому, научился работать в команде, нашёл друзей. Но проходит пара месяцев — и остаются только грамота и фотографии, потому что всё это нигде не записано. В нашем пилоте эти же четыре достижения сохраняются — их видно на экране «Итоги смены». Теряют все. Ребёнок не может показать свои проекты, а друзья теряются в чатах. Родители платили за развитие, а получили грамоту. А вожатый в лагере и преподаватель в онлайн-школе каждый раз знакомятся с ребёнком с нуля.");
  }

  // ====================== 3. СРАВНЕНИЕ СУЩЕСТВУЮЩИХ РЕШЕНИЙ ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Проблема" });
    const K = kit(s, "Сравнение");
    head(s, "АНАЛИЗ СУЩЕСТВУЮЩИХ РЕШЕНИЙ", "Что уже есть — и почему дети это не ведут");
    const cx = [MX, 3.8, 6.811, 9.822], cw = [3.3, 3.011, 3.011, 3.011], hy = 2.12, hh = 0.5, y0 = hy + hh, rh = 0.88;
    K.rect(MX, hy, CW, hh, { fill: INK, line: INK, lw: 2, name: "шапка таблицы" });
    ["РЕШЕНИЕ", "ПОЛЕЗНОСТЬ ДЛЯ РЕБЁНКА", "ПОНЯТНОСТЬ ДЛЯ РОДИТЕЛЯ", "ЗАЩИТА ЛИЧНЫХ ДАННЫХ"].forEach((t, i) => K.text(t, cx[i] + 0.18, hy, cw[i] - 0.3, hh, { size: 10.5, bold: true, color: WHITE, cs: 1 }));
    const rows = [
      ["Электронный дневник", "школьные оценки, замечания, расписание", [1, "Для взрослых: оценки и замечания"], [3, "Всё понятно: оценки и пропуски"], [3, "Вход только для семьи и школы"]],
      ["Портфолио достижений", "грамоты и дипломы списком", [2, "Копится, но вносить скучно"], [2, "Список грамот без объяснений"], [3, "Видят только школа и семья"]],
      ["Игровой профиль", "уровни, стрики, друзья", [3, "Хочется заходить каждый день"], [1, "Неясно, чему ребёнок научился"], [1, "Открытые чаты с незнакомцами"]],
      ["SportZania ID", "паспорт резидента", [3, "Интересно, как в игре"], [3, "Наставник подтверждает навыки"], [3, "Нет переписки, контакты закрыты"]],
    ];
    rows.forEach(([name, sub, ...cells], r) => {
      const y = y0 + r * rh, ours = r === 3;
      K.rect(MX, y, CW, rh, { fill: ours ? COBALT : CARD, line: INK, lw: ours ? 2 : 1.5, shadow: ours ? 6 : 0, name: "строка сравнения" });
      K.text(name, cx[0] + 0.18, y + 0.12, cw[0] - 0.3, 0.34, { size: 15, bold: true, color: ours ? WHITE : INK });
      K.text(sub, cx[0] + 0.18, y + 0.46, cw[0] - 0.3, 0.28, { size: 11.5, color: ours ? WHITE : SLATE });
      cells.forEach(([score, t], i) => {
        const x = cx[i + 1] + 0.18, tone = ours ? WHITE : score === 3 ? GREEN : score === 2 ? INK : RED;
        if (!ours) K.vline(cx[i + 1], y + 0.12, rh - 0.24, { color: SILVER, lw: 1 });
        for (let q = 0; q < 3; q++) K.rect(x + q * 0.27, y + 0.15, 0.2, 0.2, { fill: q < score ? tone : undefined, line: ours ? WHITE : INK, lw: 1.25, name: "оценка" });
        K.text(["низкая", "средняя", "высокая"][score - 1], x + 0.9, y + 0.13, 1.4, 0.24, { size: 10.5, bold: true, color: ours ? WHITE : tone, cs: 0.5 });
        K.text(t, x, y + 0.41, cw[i + 1] - 0.3, 0.38, { size: 12, color: ours ? WHITE : INK, valign: "top" });
      });
    });
    const cy = y0 + 4 * rh + 0.2;
    K.rect(MX, cy + 0.09, 0.2, 0.2, { fill: COBALT, name: "вывод" });
    K.text("Берём лучшее из трёх: азарт игры, понятность дневника и закрытость школьной системы.", MX + 0.34, cy, CW - 0.4, 0.38, { size: 15, bold: true });
    s.addNotes("Я сравнил три привычных решения, где есть профиль ребёнка, по трём критериям: полезность для ребёнка, понятность для родителя и защита личных данных. Школьный электронный дневник понятен родителям и хорошо защищён, но для нас он скучный — это оценки и замечания. Портфолио достижений копит грамоты, но вносить их вручную никто не хочет. Игровой профиль с уровнями и стриками хочется открывать каждый день, но родителям непонятно, чему ребёнок научился, а в открытых чатах пишут незнакомцы. В SportZania ID мы берём лучшее из трёх: азарт игры, понятность дневника и закрытость школьной системы.");
  }

  // ====================== 4. ГОРОД: соцсеть без переписки ======================
  pres.addSection({ title: "Решение" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Город");
    head(s, "ИДЕЯ // МОТИВАЦИЯ ЗАПОЛНЯТЬ ПАСПОРТ", "Лагерь как город: соцсеть без переписки");
    [
      ["1 · ГОСТЬ", "Выбери три интереса — получи ключ", "минимум данных вместо скучной анкеты"],
      ["2 · ЖИТЕЛЬ", "Видишь город и общие интересы", "отряды и жители, контакты пока закрыты"],
      ["3 · РЕЗИДЕНТ", "Добавь цель — и можно дружить", "Friend-Lock открывает ники только взаимно"],
    ].forEach(([tag, t, sub], k) => {
      const y = 2.14 + k * 1.02;
      K.chip(tag, MX, y, 1.6, 0.3, { fill: k === 2 ? COBALT : INK, size: 10.5, cs: 1 });
      K.text(t, MX, y + 0.36, 4.5, 0.32, { size: 15.5, bold: true });
      K.text(sub, MX, y + 0.67, 4.5, 0.26, { size: 12.5, color: SLATE });
    });
    const by = 5.26, bh = 1.26, bw = 4.45;
    K.rect(MX, by, bw, bh, { fill: INK, line: INK, lw: 2, shadow: 0, name: "без переписки" });
    K.text("СОЦСЕТЬ БЕЗ ПЕРЕПИСКИ", MX + 0.2, by + 0.14, bw - 0.4, 0.24, { size: 10.5, bold: true, color: GREEN, cs: 1.5 });
    K.text("Нет личных сообщений, ленты и комментариев", MX + 0.2, by + 0.4, bw - 0.4, 0.5, { size: 14.5, bold: true, color: WHITE, valign: "top" });
    K.text("Знакомимся в паспорте — общаемся вживую.", MX + 0.2, by + 0.92, bw - 0.4, 0.26, { size: 12, color: WHITE });
    const pw = 1.92, py = 2.46, xs = [5.4, 8.02, 10.64];
    [["guest", "ГОСТЬ: ГОРОД ЗАКРЫТ", "Экран гостя: выбери три интереса, чтобы получить ключ от города"],
      ["city", "ЖИТЕЛЬ: ВИДИТ ГОРОД", "Экран «Город»: отряды, жители и фильтр «Общие вайбы»"],
      ["friendlock", "РЕЗИДЕНТ: FRIEND-LOCK", "Карточка жителя: контакты закрыты до взаимного подтверждения дружбы"]].forEach(([shot, tag, alt], k) => {
      K.chip(tag, xs[k] - 0.06, py - 0.4, pw + 0.12, 0.28, { fill: k === 2 ? COBALT : INK, size: 9.5, cs: 0.5 });
      const h = K.phone(shot, xs[k], py, pw, alt);
      if (k < 2) { const cx = (xs[k] + pw + xs[k + 1]) / 2, d = 0.42; K.oval(cx - d / 2, py + h / 2 - d / 2, d, { fill: INK, line: WHITE, lw: 1.5, name: "дальше" }); K.iconIn("FaArrowRight", "white", cx - d / 2, py + h / 2 - d / 2, d, d, 0.18); }
    });
    s.addNotes("Чтобы паспорт хотелось заполнять, мы представили лагерь как город. Это немного похоже на социальную сеть, но без переписки: здесь нет личных сообщений, ленты и комментариев. Сначала ты гость, и город закрыт. Выбери три интереса — получишь ключ и станешь жителем: увидишь свой отряд, другие отряды и общие интересы. Фильтры «Общие вайбы» подсвечивают тех, кто любит то же самое. Добавишь цель на смену — станешь резидентом и сможешь дружить. Friend-Lock открывает ники только тогда, когда оба подтвердили дружбу. Знакомимся в паспорте — общаемся вживую.");
  }

  // ====================== 5. ЧТО ХРАНИТСЯ И КТО ЭТО ВНОСИТ ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Содержание");
    head(s, "СОДЕРЖАНИЕ ПАСПОРТА // КТО ЕГО НАПОЛНЯЕТ", "Что в паспорте и кто это вносит");
    K.chip("ЭКРАН «МОЙ ПАСПОРТ»", MX - 0.06, 2.06, 2.07, 0.28, { fill: INK, size: 9.5, cs: 0.5 });
    K.phone("passport", MX, 2.46, 1.95, "Экран «Мой паспорт»: профиль, друзья, проекты, бейджи, занники, стрик и радар компетенций");
    const tx = 2.95, tw = 6.15, ty = 2.12, hh = 0.42, rh = 0.44;
    const WHO = { "РОДИТЕЛЬ": [INK, WHITE], "РЕБЁНОК": [COBALT, WHITE], "ВОЖАТЫЙ": [GREEN, WHITE], "ПЕДАГОГ": [GREEN, WHITE], "БРАСЛЕТ": [TINT, INK], "ПОДСЧЁТ": [TINT, INK] };
    const rows = [
      ["Имя, возраст, отряд", "при бронировании путёвки", "РОДИТЕЛЬ"],
      ["Интересы и цель", "тегами, без текста", "РЕБЁНОК"],
      ["Друзья", "взаимный запрос Friend-Lock", "РЕБЁНОК"],
      ["Паспорта проектов", "после финала или защиты", "ВОЖАТЫЙ"],
      ["Навыки и отзывы", "три касания за минуту", "ВОЖАТЫЙ"],
      ["Сертификат смены", "12 ак. ч. с носителями языка", "ПЕДАГОГ"],
      ["Уроки онлайн-школы", "после смены, за каждый урок", "ПЕДАГОГ"],
      ["Бейджи, занники, стрик", "считаются по записям выше", "ПОДСЧЁТ"],
    ];
    const th = hh + rows.length * rh;
    K.rect(tx, ty, tw, th, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "таблица содержания" });
    K.rect(tx, ty, tw, hh, { fill: INK, line: INK, lw: 2 });
    K.text("ЧТО ХРАНИТСЯ", tx + 0.18, ty, 2.4, hh, { size: 10.5, bold: true, color: WHITE, cs: 1 });
    K.text("КОГДА И КАК", tx + 2.55, ty, 2.3, hh, { size: 10.5, bold: true, color: WHITE, cs: 1 });
    K.text("КТО ВНОСИТ", tx + tw - 1.2, ty, 1.1, hh, { size: 10.5, bold: true, color: WHITE, cs: 1, align: "center" });
    rows.forEach(([name, how, who], r) => {
      const y = ty + hh + r * rh;
      if (r) K.hline(tx + 0.12, y, tw - 0.24, { color: SILVER, lw: 0.75 });
      K.text(name, tx + 0.18, y, 2.35, rh, { size: 13, bold: true });
      K.text(how, tx + 2.55, y, 2.3, rh, { size: 11.5, color: SLATE });
      K.chip(who, tx + tw - 1.18, y + 0.08, 1.06, rh - 0.16, { fill: WHO[who][0], color: WHO[who][1], size: 9, cs: 0.5 });
    });
    K.text("Взрослые вносят записи там, где уже работают: бронь, отчёт смены, онлайн-школа. У каждой записи в паспорте видно, кто её внёс.", tx, ty + th + 0.12, tw, 0.5, { size: 12.5, bold: true, valign: "top" });
    const rx = 9.42, rw = XR - rx;
    K.rect(rx, ty, rw, 1.58, { fill: COBALT, line: INK, lw: 2, shadow: 6, name: "главный показатель" });
    K.text("2 из 8", rx + 0.22, ty + 0.1, rw - 0.4, 0.78, { size: 44, bold: true, color: WHITE, raw: true });
    K.text("разделов вносит ребёнок — только выбором, без текста", rx + 0.24, ty + 0.9, rw - 0.44, 0.56, { size: 12.5, bold: true, color: WHITE, valign: "top" });
    const ny = ty + 1.8, nh = 6.6 - ny;
    K.rect(rx, ny, rw, nh, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "не в паспорте" });
    K.rect(rx, ny, rw, 0.4, { fill: INK, line: INK, lw: 2 });
    K.text("НЕ В ПАСПОРТЕ — ЛИШНЕЕ", rx + 0.18, ny, rw - 0.3, 0.4, { size: 10.5, bold: true, color: WHITE, cs: 1 });
    ["Школьные оценки: это не дневник", "Здоровье и комната: только родителю", "Геопозиция: паспорт её не собирает", "Личная переписка: её здесь нет"].forEach((t, k) => {
      const y = ny + 0.56 + k * 0.52;
      K.rect(rx + 0.18, y + 0.04, 0.24, 0.24, { fill: RED, line: INK, lw: 1, name: "лишнее" });
      K.iconIn("FaXmark", "white", rx + 0.18, y + 0.04, 0.24, 0.24, 0.13);
      K.text(t, rx + 0.54, y, rw - 0.66, 0.46, { size: 12.5, bold: true, valign: "top" });
    });
    s.addNotes("Что хранится в паспорте и кто это вносит? Само собой ничего не появляется: у каждой записи есть автор. Имя, возраст и отряд родитель указывает, когда бронирует путёвку. Сам ребёнок выбирает интересы и цель на смену и добавляет друзей — только выбором, без текста. Проекты после защиты вносит вожатый, а ребёнок прикладывает фото. Вожатый же за минуту отмечает навыки. Сертификат за двенадцать часов английского с носителями языка вносит педагог смены, а уроки после смены — педагог онлайн-школы. Бейджи и занники — это настоящая валюта SportZania — паспорт считает по этим записям. Всё это взрослые и так делают на платформе SportZania: там уже есть бронирование, отчёты вожатых и онлайн-школа. Паспорт собирает это в одно место, и у каждой записи видно, кто её внёс. Чего в паспорте нет: школьных оценок, здоровья, номера комнаты, геопозиции и личной переписки.");
  }

  // ====================== 6. ПАСПОРТ ПРОЕКТА ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Паспорт проекта");
    head(s, "ПАСПОРТ ПРОЕКТА // НЕ ТОЛЬКО ДЛЯ ТЕХНАРЕЙ", "Паспорт проекта: один формат для любого дела");
    const pw = 1.95, py = 2.46;
    K.chip("КАРТОЧКА ПРОЕКТА", MX - 0.06, py - 0.4, pw + 0.12, 0.28, { fill: INK, size: 9.5, cs: 0.5 });
    K.phone("project", MX, py, pw, "Экран «Паспорт проекта»: сюжет смены «Ледяной завет предков» — цель, команда, этапы и результат");
    K.chip("ЭКРАН ВОЖАТОГО", XR - pw - 0.06, py - 0.4, pw + 0.12, 0.28, { fill: COBALT, size: 9.5, cs: 0.5 });
    K.phone("counselor", XR - pw, py, pw, "Экран вожатого: подсказка паспорта, настроение отряда, подтверждение проекта и отметки за минуту");
    const gx = 2.98, gw = XR - pw - 0.5 - gx, fw = (gw - 0.3) / 3, fh = 0.78;
    [["Цель", "что хотели сделать"], ["Команда и роли", "кто и за что отвечал"], ["Этапы", "от идеи до показа"],
      ["Результат", "фото или видео от ребёнка"], ["Подтверждение", "наставник за минуту"], ["Навыки", "что выросло на радаре"]].forEach(([t, sub], k) => {
      const x = gx + (k % 3) * (fw + 0.15), y = 2.12 + Math.floor(k / 3) * (fh + 0.12);
      K.rect(x, y, fw, fh, { fill: CARD, line: INK, lw: 1.5, shadow: 3, name: "поле карточки" });
      K.text(String(k + 1), x + 0.12, y + 0.17, 0.42, 0.42, { size: 15, bold: true, color: WHITE, fill: k === 4 ? GREEN : COBALT, align: "center", raw: true, name: "номер поля" });
      K.text(t, x + 0.66, y + 0.09, fw - 0.74, 0.3, { size: 13, bold: true });
      K.text(sub, x + 0.66, y + 0.4, fw - 0.74, 0.34, { size: 11, color: SLATE, valign: "top" });
    });
    const ey = 2.12 + 2 * (fh + 0.12) + 0.14;
    K.text("ОДИН ФОРМАТ — РАЗНЫЕ ДЕЛА СМЕНЫ И ОНЛАЙН-ШКОЛЫ", gx, ey, gw, 0.26, { size: 10.5, bold: true, color: COBALT, cs: 1.5 });
    const cw = (gw - 0.3) / 3, cy = ey + 0.36, ch = 6.6 - cy;
    [
      ["СЮЖЕТ СМЕНЫ", COBALT, "Ледяной завет предков", "Отряд ищет драконов и раскрывает тайну завета", "драконы → хребет → завет", "+ Команда"],
      ["АНГЛИЙСКИЙ", GREEN, "12 часов с носителями языка", "Игры, видео, общение — и сертификат в конце", "игры → видео → сертификат", "+ Английский"],
      ["ОНЛАЙН-ШКОЛА", INK, "Исследование в онлайн-курсе", "После смены проект курса тоже идёт в паспорт", "тема → работа → защита", "+ навык курса"],
    ].forEach(([tag, c, t, body, steps, skill], k) => {
      const x = gx + k * (cw + 0.15);
      K.rect(x, cy, cw, ch, { fill: WHITE, line: INK, lw: 2, shadow: 4, name: "пример проекта" });
      K.chip(tag, x + 0.14, cy + 0.14, cw - 0.28, 0.28, { fill: c, size: 9.5, cs: 1 });
      K.text(t, x + 0.14, cy + 0.52, cw - 0.28, 0.46, { size: 13.5, bold: true, valign: "top" });
      K.text(body, x + 0.14, cy + 1.0, cw - 0.28, 0.52, { size: 11, color: SLATE, valign: "top" });
      K.text(steps, x + 0.14, cy + 1.54, cw - 0.28, 0.36, { size: 9.5, bold: true, color: COBALT, valign: "top" });
      K.chip(skill, x + 0.14, cy + ch - 0.4, 1.4, 0.26, { fill: GREEN, size: 9.5 });
    });
    s.addNotes("У каждого дела на смене или в онлайн-школе есть своя карточка — паспорт проекта. В ней шесть полей: цель, команда и роли, этапы, результат, подтверждение наставника и навыки, которые выросли. Формат один, а дела разные. Например, на зимней смене «Легенда о драконьем сердце 2» весь отряд проходит сюжет: ищет драконов, заслуживает их доверие и раскрывает тайну Ледяного завета. Это командный проект. Двенадцать часов английского с носителями языка заканчиваются сертификатом — это тоже карточка, с отметкой педагога. А после смены в паспорт попадают проекты онлайн-курса. Проект вносит вожатый или педагог, ребёнок прикладывает фото, а наставник подтверждает его за минуту — в три касания, без отчётов.");
  }

  // ====================== 7. КТО ЧТО ВИДИТ ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Приватность");
    head(s, "БЕЗОПАСНОСТЬ И ЭТИКА // 152-ФЗ", "Кто что видит — и что решает сам ребёнок");
    const mx = MX, c0 = 2.35, ws = [1.0, 0.95, 1.0, 1.2, 1.0], hy = 2.12, hh = 0.56, rh = 0.6;
    const xs = ws.reduce((a, w) => a.concat(a[a.length - 1] + w), [mx + c0]), mw = xs[5] - mx;
    const rows = [
      ["Аватар, интересы, отряд", [1, 1, 1, 1, 1]],
      ["Навыки и проекты", [1, 1, 1, 1, 1]],
      ["Ники соцсетей и телефон", [0, 1, 0, 0, 1]],
      ["Ответ барометра дня", [0, 0, 2, 0, 0]],
      ["Здоровье и номер комнаты", [0, 0, 0, 0, 1]],
    ];
    K.rect(mx, hy, mw, hh + rows.length * rh, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "матрица доступа" });
    K.rect(mx, hy, mw, hh, { fill: INK, line: INK, lw: 2 });
    K.text("ДАННЫЕ", mx + 0.18, hy, c0 - 0.3, hh, { size: 10.5, bold: true, color: WHITE, cs: 1 });
    ["Жители города", "Друзья", "Вожатый", "Преподаватель", "Родитель"].forEach((t, i) => K.text(t, xs[i] + 0.03, hy, ws[i] - 0.06, hh, { size: 9.5, bold: true, color: WHITE, align: "center" }));
    rows.forEach(([name, cells], r) => {
      const y = hy + hh + r * rh;
      if (r) K.hline(mx + 0.12, y, mw - 0.24, { color: SILVER, lw: 0.75 });
      K.text(name, mx + 0.18, y, c0 - 0.3, rh, { size: 12.5, bold: true });
      cells.forEach((v, i) => {
        const cxm = xs[i] + ws[i] / 2, d = 0.3;
        if (v === 2) { K.chip("без имён", cxm - 0.42, y + 0.17, 0.84, 0.26, { fill: TINT, color: COBALT, line: COBALT, size: 9 }); return; }
        K.rect(cxm - d / 2, y + (rh - d) / 2, d, d, { fill: v ? GREEN : RED, line: INK, lw: 1, name: v ? "видно" : "закрыто" });
        K.iconIn(v ? "FaCheck" : "FaLock", "white", cxm - d / 2, y + (rh - d) / 2, d, d, 0.15);
      });
    });
    const fy = hy + hh + rows.length * rh + 0.2;
    K.text("По публичной ссылке видны только навыки и проекты. Переписки в паспорте нет.", mx, fy, mw, 0.3, { size: 12.5, bold: true });
    K.text("Согласие родителя — при оформлении путёвки; обмен контактами — отдельной галочкой.", mx, fy + 0.32, mw, 0.3, { size: 12.5, color: SLATE });
    const tx = xs[5] + 0.32, pw = 1.74, px = XR - pw, tw = px - 0.3 - tx;
    const block = (y, tag, tone, items) => {
      K.chip(tag, tx, y, tw, 0.3, { fill: tone, size: 10, cs: 0.5 });
      items.forEach((t, k) => K.text(t, tx, y + 0.4 + k * 0.52, tw, 0.48, { size: 12.5, valign: "top", name: "пояснение" }));
    };
    block(2.12, "ТОЛЬКО РОДИТЕЛЮ: ПОЧЕМУ", RED, ["Здоровье — из-за диагноза могут дразнить", "Номер комнаты — вопрос безопасности", "Геопозицию паспорт не собирает вовсе"]);
    block(4.28, "РЕБЁНОК РЕШАЕТ САМ", GREEN, ["Скрыть интерес, проект или бейдж", "Убрать друга и закрыть ссылку", "Удалить паспорт — вместе с родителем"]);
    K.chip("ЭКРАН РОДИТЕЛЯ", px - 0.06, 2.06, pw + 0.12, 0.28, { fill: INK, size: 9.5, cs: 0.5 });
    K.phone("parent", px, 2.46, pw, "Экран родителя: данные, которые видит только он, согласия и кнопка «Удалить паспорт»");
    s.addNotes("Главный страх родителей и детей — что профиль увидят посторонние. Поэтому у каждого своя роль. Жители города видят аватар, интересы и проекты. Ники соцсетей и телефон видят только друзья — после взаимного подтверждения — и родитель. Вожатый и преподаватель видят навыки и проекты, но не контакты. Ответ барометра не видит никто: вожатому приходит только настроение отряда без имён. Здоровье и номер комнаты видит только родитель: из-за диагноза могут дразнить, а номер комнаты — вопрос безопасности. Геопозицию паспорт не собирает вовсе. Ребёнок сам решает, что показывать: может скрыть интерес или проект, убрать друга, закрыть ссылку, а вместе с родителем — удалить паспорт целиком.");
  }

  // ====================== 8. МОТИВАЦИЯ БЕЗ ГОНКИ ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Мотивация");
    head(s, "МОТИВАЦИЯ // БАРОМЕТР ДНЯ, СТРИКИ, ЛИДЕРБОРД", "Мотивация без гонки за баллами");
    const pw = 1.92, py = 2.46;
    K.chip("РЕФЛЕКСИЯ · 21:00", MX - 0.06, py - 0.4, pw + 0.12, 0.28, { fill: INK, size: 9.5, cs: 0.5 });
    const ph = K.phone("evening", MX, py, pw, "Экран «Вечер»: барометр дня на рефлексии в 21:00, стрик, копилка отряда и лидерборд");
    const jx = 2.86, ox = 3.28, y1 = 3.12, y2 = 5.44;
    K.hline(MX + pw + 0.1, py + ph / 2, jx - MX - pw - 0.1, { lw: 3, name: "развилка" });
    K.vline(jx, y1, y2 - y1, { lw: 3, name: "развилка" });
    K.hline(jx, y1, ox - jx - 0.06, { lw: 3, end: "triangle", name: "развилка" });
    K.hline(jx, y2, ox - jx - 0.06, { lw: 3, end: "triangle", name: "развилка" });
    const w2 = 3.05, pyy = 2.15, phh = 1.95;
    K.rect(ox, pyy, w2, phh, { fill: WHITE, line: INK, lw: 2, shadow: 6, name: "тепловая карта" });
    K.text("НАСТРОЕНИЕ", ox + 0.15, pyy + 0.08, 1.6, 0.24, { size: 10, bold: true, cs: 1 });
    K.text("ДНИ СМЕНЫ", ox + w2 - 1.25, pyy + 0.08, 1.1, 0.24, { size: 9.5, bold: true, color: SLATE, align: "right", cs: 0.5 });
    const gx = ox + 0.92, cw = 0.255, g = 0.04, ch = 0.23;
    for (let c = 0; c < 7; c++) K.text(String(c + 2), gx + c * (cw + g), pyy + 0.36, cw, 0.2, { size: 9.5, bold: true, color: SLATE, align: "center", raw: true });
    const tone = [[GREEN, 0], [GREEN, 55], [RED, 55], [RED, 0]];
    [[1, 0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0, 0], [1, 1, 2, 2, 3, 3, 2]].forEach((row, r) => {
      const y = pyy + 0.6 + r * 0.3;
      K.text("Отряд " + (r + 1), ox + 0.15, y, 0.78, ch, { size: 10, bold: true });
      row.forEach((v, c) => K.rect(gx + c * (cw + g), y, cw, ch, { fill: tone[v][0], tr: tone[v][1], line: INK, lw: 0.75, name: "день" }));
    });
    K.rect(gx + 4 * (cw + g) - 0.03, pyy + 0.6 + 2 * 0.3 - 0.03, 2 * cw + g + 0.06, ch + 0.06, { line: INK, lw: 2.25, name: "сигнал" });
    K.chip("СИГНАЛ ВОЖАТОМУ: ОТРЯД 3", gx - 0.77, pyy + 1.58, 7 * cw + 6 * g + 0.77, 0.26, { fill: INK, size: 9.5, cs: 0.5 });
    const qy = 4.36;
    K.frame(A.crop.leaders, ox, qy, w2, null, "Экран «Активность смены // Лидерборд»: места с первого по десятое и кубки");
    const cx = ox + w2 + 0.28, cwid = 2.72;
    K.text("ДЛЯ ЛАГЕРЯ", cx, pyy + 0.02, cwid, 0.24, { size: 11, bold: true, color: COBALT, cs: 1.5 });
    K.text("Анонимная тепловая карта отрядов", cx, pyy + 0.3, cwid, 0.66, { size: 17, bold: true, valign: "top" });
    K.text("Растёт «токсично» — вожатый мягко гасит конфликт до звонков родителей.", cx, pyy + 1.0, cwid, 0.9, { size: 13, color: SLATE, valign: "top" });
    K.text("ДЛЯ РЕБЁНКА", cx, qy + 0.02, cwid, 0.24, { size: 11, bold: true, color: COBALT, cs: 1.5 });
    K.text("Стрики, занники и лидерборд Топ-10", cx, qy + 0.3, cwid, 0.66, { size: 17, bold: true, valign: "top" });
    K.text("Рефлексия приносит занники — настоящую валюту SportZania. Паспорт подсказывает следующую цель.", cx, qy + 1.0, cwid, 1.1, { size: 13, color: SLATE, valign: "top" });
    const rx = cx + cwid + 0.3, rw = XR - rx, ry = 2.15, rhh = 6.52 - ry;
    K.rect(rx, ry, rw, rhh, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "без давления" });
    K.rect(rx, ry, rw, 0.42, { fill: INK, line: INK, lw: 2 });
    K.text("БЕЗ ДАВЛЕНИЯ НА РЕБЁНКА", rx + 0.18, ry, rw - 0.3, 0.42, { size: 10.5, bold: true, color: WHITE, cs: 1 });
    ["Ответ барометра анонимный: вожатый видит только отряд", "Стрик можно заморозить на день — он не сгорит", "Занники дают за проекты и помощь, а не за победу над соседом", "У отряда общая копилка: выигрывают вместе"].forEach((t, k) => {
      const y = ry + 0.58 + k * 0.93;
      K.rect(rx + 0.18, y + 0.03, 0.26, 0.26, { fill: GREEN, line: INK, lw: 1, name: "правило" });
      K.iconIn("FaCheck", "white", rx + 0.18, y + 0.03, 0.26, 0.26, 0.14);
      K.text(t, rx + 0.56, y, rw - 0.7, 0.85, { size: 12.5, bold: true, valign: "top" });
    });
    s.addNotes("Вторая часть мотивации — вечерний ритуал. В расписании смены уже есть рефлексия с 21:00 до 21:30 — мы просто переводим её в паспорт. Ребёнок двигает ползунок барометра: от «сегодня токсично» до «сегодня имба». У этого два результата. Лагерь получает анонимную тепловую карту настроения отрядов: если в отряде растёт «токсично», вожатый успевает помочь. А ребёнок получает занники — это настоящая валюта SportZania, — стрик и следующую цель от паспорта. Мы специально сделали так, чтобы это не превратилось в гонку за баллами. Ответ барометра анонимный. Стрик можно заморозить на день. Занники дают за проекты и помощь, а не за победу над соседом. И у отряда есть общая копилка — выигрывают вместе.");
  }

  // ====================== 9. ДВА СЦЕНАРИЯ ======================
  pres.addSection({ title: "Сценарии и запуск" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Сценарии и запуск" });
    const K = kit(s, "Сценарии");
    head(s, "СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ", "Два сценария: лагерь и онлайн-школа");
    const lw = 2.35, x0 = MX + lw + 0.2, sw = (XR - x0 - 3 * 0.14) / 4, lh = 2.02;
    const lane = (y, fill, num, title, steps) => {
      K.rect(MX, y, lw, lh, { fill, line: INK, lw: 2, shadow: 5, name: "сценарий " + num });
      K.text("СЦЕНАРИЙ " + num, MX + 0.2, y + 0.16, lw - 0.4, 0.24, { size: 10.5, bold: true, color: WHITE, cs: 1.5 });
      K.text(title, MX + 0.2, y + 0.46, lw - 0.36, 1.4, { size: 18, bold: true, color: WHITE, valign: "top" });
      steps.forEach(([when, t, body], k) => {
        const x = x0 + k * (sw + 0.14);
        K.rect(x, y, sw, lh, { fill: CARD, line: INK, lw: 2, shadow: 4, name: "шаг сценария" });
        K.chip(NB + NB + (k + 1) + " · " + when, x + 0.14, y + 0.14, sw - 0.28, 0.28, { fill: INK, size: 9.5, cs: 0.5, align: "left" });
        K.text(t, x + 0.14, y + 0.5, sw - 0.26, 0.52, { size: 14, bold: true, valign: "top" });
        K.text(body, x + 0.14, y + 1.04, sw - 0.26, 0.92, { size: 11.5, color: SLATE, valign: "top" });
      });
    };
    lane(2.14, COBALT, "1", "Ребёнок приезжает в лагерь", [
      ["ДО ЗАЕЗДА", "Родитель бронирует путёвку", "Имя, возраст и отряд — уже в паспорте. Родитель даёт согласие на данные."],
      ["ЗАЕЗД", "QR на бейдже — и ты житель", "Две минуты: аватар и три интереса открывают город и свой отряд."],
      ["ПЕРВЫЙ ДЕНЬ", "Вожатый уже знает тебя", "«Любит роботов, делал умный дом» — и сразу предлагает команду и тему."],
      ["ФИНАЛ СМЕНЫ", "Итоги: ничего не потерялось", "Сюжет, сертификат, навыки и друзья — в паспорте, с отметками наставников."],
    ]);
    lane(4.5, INK, "2", "Ребёнок начинает онлайн-курс после смены", [
      ["ПОСЛЕ СМЕНЫ", "Паспорт советует курс", "General English — продолжить английский со смены. Скидка резидента."],
      ["ПЕРВЫЙ УРОК", "Учат не с нуля", "Педагог видит сертификат и навыки — но не здоровье и не комнату."],
      ["УЧЁБА", "Педагог отмечает уроки", "Навыки на радаре растут. Проект курса — новый паспорт проекта."],
      ["НОВАЯ СМЕНА", "Паспорт едет обратно", "Вожатый видит рост за год — и круг начинается снова."],
    ]);
    const d = 0.4, ax = MX + lw / 2;
    K.oval(ax - d / 2, 4.33 - d / 2, d, { fill: GREEN, line: INK, lw: 1.5, name: "дальше" });
    K.iconIn("FaArrowDown", "white", ax - d / 2, 4.33 - d / 2, d, d, 0.18);
    s.addNotes("Покажу два сценария. Первый — ребёнок приезжает в лагерь. Ещё до заезда родитель бронирует путёвку и даёт согласие: имя, возраст и отряд уже в паспорте, а интересы и проекты сохранились с прошлой смены. На заезде — QR-код на бейдже и две минуты: аватар и три интереса, и ты житель города. В первый же день вожатый уже знает тебя: любит роботов, делал умный дом — и сразу предлагает команду и тему. В финале смены — итоги: сюжет смены, сертификат по английскому, навыки и друзья сохранены в паспорте с отметками вожатого и педагога. Ничего не потерялось. Второй сценарий — ребёнок начинает онлайн-курс после смены. Паспорт советует продолжить английский — курс General English в онлайн-школе SportZania. На первом уроке педагог видит сертификат, навыки и проекты и не начинает с нуля. Педагог отмечает уроки — и навыки на радаре растут. А к новой смене паспорт едет обратно в лагерь — и круг начинается снова.");
  }

  // ====================== 10. ПИЛОТ И ЭФФЕКТ ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Сценарии и запуск" });
    const K = kit(s, "Пилот");
    head(s, "ПИЛОТ // СМЕНА «ЛЕГЕНДА О ДРАКОНЬЕМ СЕРДЦЕ 2»", "Пилот: зимняя смена 2–9 января 2027 года");
    const g = 0.12, tw = (CW - 7 * g) / 8, ty = 2.14, th = 1.1;
    const phaseOf = (d) => (d <= 3 ? 0 : d <= 8 ? 1 : 2);
    const fills = [COBALT, CARD, GREEN], inks = [WHITE, INK, WHITE];
    ["СБ", "ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"].forEach((wd, k) => {
      const d = k + 2, p = phaseOf(d), x = MX + k * (tw + g);
      K.rect(x, ty, tw, th, { fill: fills[p], line: INK, lw: 2, shadow: 4, name: "день смены" });
      K.text(wd, x, ty + 0.08, tw, 0.22, { size: 10.5, bold: true, color: inks[p], align: "center", cs: 1.5 });
      K.text(String(d), x, ty + 0.27, tw, 0.58, { size: 36, bold: true, color: p === 1 ? COBALT : inks[p], align: "center", raw: true });
      K.text("ЯНВАРЯ", x, ty + 0.83, tw, 0.2, { size: 9.5, bold: true, color: inks[p], align: "center", cs: 1 });
    });
    const span = (a, b) => [MX + (a - 2) * (tw + g), (b - a + 1) * tw + (b - a) * g];
    [[2, 3, COBALT], [4, 8, INK], [9, 9, GREEN]].forEach(([a, b, c]) => { const [x, w] = span(a, b); K.rect(x, ty + th + 0.18, w, 0.1, { fill: c, name: "этап" }); });
    const cols = [[MX, 3.3], [4.25, 4.2], [8.8, XR - 8.8]], cy = 3.72;
    [4.03, 8.58].forEach((x) => K.vline(x, cy, 1.9, { color: SILVER, lw: 1 }));
    [
      ["ЭТАП 1 // 2–3 ЯНВАРЯ", COBALT, "Заезд: ключ от города", ["QR-код на бейдже — профиль", "Три интереса — ты житель", "Friend-Lock с первого дня"]],
      ["ЭТАП 2 // 4–8 ЯНВАРЯ", INK, "Смена: проекты и барометр", ["Рефлексия в 21:00 — в паспорт", "Отметки наставников", "Занники, стрики, копилка отряда"]],
      ["ЭТАП 3 // 9 ЯНВАРЯ", GREEN, "Финал: паспорт и курс", ["Проекты с отметкой наставника", "Паспорт успехов — родителям", "Курс со скидкой резидента"]],
    ].forEach(([label, c, title, steps], k) => {
      const [x, w] = cols[k];
      K.rect(x, cy + 0.03, 0.26, 0.26, { fill: c, line: INK, lw: 1.5, name: "этап" });
      K.text(label, x + 0.38, cy, w - 0.38, 0.32, { size: 11, bold: true, cs: 1.5 });
      K.text(title, x, cy + 0.38, w, 0.4, { size: 18, bold: true });
      steps.forEach((t, i) => {
        const sy = cy + 0.86 + i * 0.35;
        K.rect(x, sy + 0.04, 0.22, 0.22, { fill: GREEN, line: INK, lw: 1, name: "шаг" });
        K.iconIn("FaCheck", "white", x, sy + 0.04, 0.22, 0.22, 0.12);
        K.text(t, x + 0.34, sy, w - 0.34, 0.3, { size: 13.5, color: SLATE });
      });
    });
    const by = 5.78, bh = 0.76, bw = 5.75;
    K.rect(MX, by, bw, bh, { fill: COBALT, line: INK, lw: 2, shadow: 5, name: "эффект" });
    K.text("25–30%", MX + 0.2, by, 2.0, bh, { size: 30, bold: true, color: WHITE, raw: true });
    K.text("семей продолжают в онлайн-школе — гипотеза, которую проверит пилот", MX + 2.15, by + 0.08, bw - 2.3, bh - 0.16, { size: 12, bold: true, color: WHITE });
    const mx2 = MX + bw + 0.3, mw2 = XR - mx2;
    K.rect(mx2, by, mw2, bh, { fill: CARD, line: INK, lw: 2, shadow: 5, name: "что измеряем" });
    K.text("ИЗМЕРЯЕМ НА ПИЛОТЕ", mx2 + 0.2, by + 0.08, mw2 - 0.4, 0.24, { size: 10.5, bold: true, color: COBALT, cs: 1.5 });
    K.text("заполненные профили · чек-ины · переход в курсы", mx2 + 0.2, by + 0.34, mw2 - 0.4, 0.34, { size: 13.5, bold: true });
    s.addNotes("Мы предлагаем проверить идею на пилоте — на зимней смене со 2 по 9 января 2027 года в отеле AMAKS «Новая Истра». Второго и третьего января — заезд: QR-код на бейдже, три интереса, и ты житель города. С четвёртого по восьмое — жизнь смены «Легенда о драконьем сердце 2»: сюжет, английский с носителями языка, барометр на вечерней рефлексии, отметки наставников, занники и копилка отряда. Девятого января — финал: проекты с отметкой наставника, паспорт успехов для родителей и рекомендация курса. На пилоте мы измеряем заполненные профили, ежедневные чек-ины и переход в курсы онлайн-школы. Наша гипотеза — что 25–30 процентов семей продолжат учиться в онлайн-школе. Спасибо за внимание, я готов ответить на вопросы!");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
