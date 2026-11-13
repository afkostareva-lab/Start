// SPORTZANIA ID // THE RESIDENT PASSPORT — конкурсная презентация, 8 слайдов.
// Зависимости: npm install pptxgenjs sharp react react-dom react-icons
// Запуск: node build.js <выходной.pptx> poster.jpg <путь к scripts/apply_theme.js из навыка pptx>
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { buildAssets } = require("./assets.js");

const OUT = process.argv[2] || "SportZania_ID.pptx";
const POSTER = process.argv[3];
const { applyTheme } = require(process.argv[4]);

const THEME = {
  name: "SportZania ID Swiss Grid",
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

const ICONS = [
  ["FaLock", "ink"], ["FaLock", "white"], ["FaLockOpen", "white"], ["FaUser", "cobalt"], ["FaUser", "white"],
  ["FaKey", "white"], ["FaCheck", "white"], ["FaXmark", "white"], ["FaFire", "green"], ["FaFire", "white"],
  ["FaCloudBolt", "red"], ["FaRobot", "cobalt"], ["FaVideo", "cobalt"], ["FaFilePdf", "white"],
  ["FaImage", "cobalt"], ["FaFaceMeh", "white"], ["FaArrowRight", "white"], ["FaCampground", "cobalt"],
  ["FaGraduationCap", "cobalt"], ["FaArrowTrendUp", "white"], ["FaHeart", "white"], ["FaShareNodes", "white"],
];

(async () => {
  const A = await buildAssets(HEX);
  const IC = {};
  for (const [n, t] of ICONS) IC[n + ":" + t] = await A.icon(n, t);
  const poster = "image/jpeg;base64," + fs.readFileSync(POSTER).toString("base64");

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

  // ---------- Сетка ----------
  const SW = 13.333, MX = 0.5, CW = SW - 2 * MX, GAP = 0.3, COLW = (CW - 2 * GAP) / 3;
  const colX = (i) => MX + i * (COLW + GAP);
  const CARD_Y = 2.0, CARD_H = 4.5, BAR_H = 0.42;

  // ---------- Макеты ----------
  const footer = [
    { line: { x: MX, y: 6.82, w: CW, h: 0, line: { color: INK, width: 1.5 } } },
    { text: { text: "SPORTZANIA // SK KIDS CHALLENGE 2026", options: { x: MX, y: 6.9, w: 6, h: 0.26, margin: 0, fontSize: 10, bold: true, color: INK, charSpacing: 1.5, valign: "middle" } } },
    { text: { text: "КОСТАРЕВ ФЁДОР // КАТЕГОРИЯ MIDDLE 11–14", options: { x: SW - MX - 6, y: 6.9, w: 6, h: 0.26, margin: 0, fontSize: 10, bold: true, color: INK, charSpacing: 1.5, align: "right", valign: "middle" } } },
  ];
  const headRule = { line: { x: MX, y: 0.93, w: CW, h: 0, line: { color: INK, width: 3 } } };

  pres.defineSlideMaster({
    title: "Титул",
    background: { color: PAPER },
    objects: [
      { text: { text: "SK KIDS CHALLENGE 2026 // ТЕХНОПАРК «СКОЛКОВО»", options: { x: MX, y: 0.42, w: 5.5, h: 0.36, margin: 0, fontSize: 11, bold: true, color: WHITE, fill: { color: INK }, align: "center", valign: "middle", charSpacing: 1 } } },
      { image: { x: 10.25, y: 0.34, w: 0.5, h: 0.5, data: A.globeCobalt } },
      { text: { text: "SKOLKOVO // 2026", options: { x: 8.2, y: 0.42, w: 1.9, h: 0.36, margin: 0, fontSize: 10, bold: true, color: INK, align: "right", valign: "middle", charSpacing: 2 } } },
      { image: { x: 10.93, y: 0.42, w: 1.9, h: 0.36, data: A.barcode } },
      headRule,
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 1.3, w: 6.6, h: 0.95, margin: 0, fontSize: 50, bold: true, color: COBALT, align: "left", valign: "middle" }, text: "Название проекта" } },
      { placeholder: { options: { name: "subtitle", type: "body", x: MX, y: 2.28, w: 6.6, h: 0.5, margin: 0, fontSize: 24, bold: true, color: INK, charSpacing: 4, align: "left", valign: "middle" }, text: "Подзаголовок" } },
      { placeholder: { options: { name: "lead", type: "body", x: MX, y: 2.98, w: 6.2, h: 0.8, margin: 0, fontSize: 18, color: SLATE, align: "left", valign: "top" }, text: "Суть проекта одной фразой" } },
      ...footer,
    ],
  });

  pres.defineSlideMaster({
    title: "Три колонки",
    background: { color: PAPER },
    objects: [
      { text: { text: "SPORTZANIA ID //", options: { x: MX, y: 0.42, w: 2.05, h: 0.36, margin: 0, fontSize: 12, bold: true, color: WHITE, fill: { color: INK }, align: "center", valign: "middle", charSpacing: 1 } } },
      { placeholder: { options: { name: "section", type: "body", x: 2.75, y: 0.42, w: 6.6, h: 0.36, margin: 0, fontSize: 12, bold: true, color: COBALT, charSpacing: 1.5, align: "left", valign: "middle" }, text: "РАЗДЕЛ" } },
      { text: { text: "/ 8", options: { x: 10.24, y: 0.42, w: 0.5, h: 0.36, margin: 0, fontSize: 14, bold: true, color: SLATE, align: "left", valign: "middle" } } },
      { image: { x: 10.93, y: 0.37, w: 0.46, h: 0.46, data: A.globeCobalt } },
      { image: { x: 11.53, y: 0.42, w: 1.3, h: 0.36, data: A.barcode } },
      headRule,
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 1.08, w: CW, h: 0.72, margin: 0, fontSize: 32, bold: true, color: INK, align: "left", valign: "middle" }, text: "Заголовок слайда" } },
      ...footer,
    ],
    slideNumber: { x: 9.5, y: 0.42, w: 0.68, h: 0.36, margin: 0, fontSize: 14, bold: true, color: INK, align: "right", valign: "middle" },
  });

  // ---------- Набор примитивов ----------
  const hard = (pt) => ({ type: "outer", color: HEX.dk1, blur: 0.01, offset: pt, angle: 45, opacity: 1 });
  function kit(slide, prefix) {
    let n = 0;
    const nm = (label) => `${prefix} · ${label || "деталь"} ${++n}`;
    const shapeOpts = (o) => ({
      fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : undefined,
      line: o.line ? { color: o.line, width: o.lw || 1.5, dashType: o.dash || "solid" } : undefined,
      shadow: o.shadow ? hard(o.shadow) : undefined,
      objectName: nm(o.name),
    });
    const K = {
      rect: (x, y, w, h, o = {}) => slide.addShape(pres.ShapeType.rect, { x, y, w, h, ...shapeOpts(o) }),
      oval: (x, y, d, o = {}) => slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, ...shapeOpts(o) }),
      star: (x, y, d, o = {}) => slide.addShape(pres.ShapeType.star4, { x, y, w: d, h: d, ...shapeOpts(o) }),
      hline: (x, y, w, o = {}) => slide.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color: o.color || INK, width: o.lw || 1.5, dashType: o.dash || "solid", beginArrowType: o.begin, endArrowType: o.end }, objectName: nm(o.name || "линия") }),
      vline: (x, y, h, o = {}) => slide.addShape(pres.ShapeType.line, { x, y, w: 0, h, line: { color: o.color || INK, width: o.lw || 1.5 }, objectName: nm(o.name || "линия") }),
      text: (t, x, y, w, h, o = {}) => slide.addText(t, {
        x, y, w, h, isTextBox: true, margin: o.margin ?? 0,
        fontSize: o.size || 14, bold: !!o.bold, color: o.color || INK,
        align: o.align || "left", valign: o.valign || "middle", charSpacing: o.cs,
        fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : undefined,
        line: o.line ? { color: o.line, width: o.lw || 1.25, dashType: o.dash || "solid" } : undefined,
        paraSpaceAfter: o.after, objectName: nm(o.name || "текст"),
      }),
      img: (data, x, y, w, h, name) => slide.addImage({ data, x, y, w, h, objectName: nm(name || "графика"), altText: "Декор: " + (name || "графика") }),
      icon: (name, tone, x, y, s) => slide.addImage({ data: IC[name + ":" + tone], x, y, w: s, h: s, objectName: nm("иконка"), altText: "Иконка" }),
      // Иконка по центру заданной области
      iconIn: (name, tone, x, y, w, h, s) => K.icon(name, tone, x + (w - s) / 2, y + (h - s) / 2, s),
      panel: (x, y, w, h, o = {}) => K.rect(x, y, w, h, { fill: o.fill || WHITE, line: INK, lw: 1.5, shadow: o.shadow ?? 3, name: o.name || "панель" }),
      chip: (t, x, y, w, h, o = {}) => K.text(t, x, y, w, h, { size: o.size || 9.5, bold: true, color: o.color || WHITE, fill: o.fill, tr: o.tr, line: o.line === undefined ? INK : o.line, lw: o.lw || 1.25, dash: o.dash, align: o.align || "center", cs: o.cs, name: o.name || "бейдж" }),
      avatar: (x, y, w, h) => { K.rect(x, y, w, h, { fill: TINT, line: INK, lw: 1, name: "аватар" }); K.iconIn("FaUser", "cobalt", x, y, w, h, Math.min(w, h) * 0.56); },
      polaroid: (x, y, label, handle, o = {}) => {
        K.panel(x, y, 1.0, 1.28, { name: "карточка резидента" });
        K.avatar(x + 0.08, y + 0.08, 0.84, 0.7);
        K.text(label, x, y + 0.82, 1.0, 0.2, { size: 10, bold: true, align: "center" });
        K.text(handle, x, y + 1.03, 1.0, 0.19, { size: 9, bold: true, color: o.handleColor || SLATE, align: "center" });
        if (o.lock) { K.oval(x + 0.63, y + 0.5, 0.32, { fill: WHITE, line: INK, lw: 1.25, name: "замок" }); K.iconIn("FaLock", "ink", x + 0.63, y + 0.5, 0.32, 0.32, 0.15); }
      },
    };
    return K;
  }

  // Русская типографика: тире, короткие предлоги и числа не отрываются от соседнего слова
  const NB = "\u00A0";
  const typo = (t) => typeof t !== "string" ? t : t
    .replace(/ — /g, NB + "— ")
    .replace(/(^|[\s«(])([А-Яа-яЁё]{1,2}) (?=\S)/g, "$1$2" + NB)
    .replace(/(\d) (?=[а-яё])/g, "$1" + NB);

  // ---------- Карточка-колонка ----------
  function card(slide, K, i, o) {
    const x = colX(i), y = o.y ?? CARD_Y, h = o.h ?? CARD_H, zoneH = o.zoneH ?? 1.6;
    K.rect(x, y, COLW, h, { fill: CARD, line: INK, lw: 2, shadow: 6, name: `Карточка ${i + 1}` });
    K.rect(x, y, COLW, BAR_H, { fill: INK, line: INK, lw: 2, name: "плашка" });
    K.img(A.hatch, x + COLW - 0.66, y + 0.05, 0.58, BAR_H - 0.1, "штриховка");
    K.text(o.badge, x + 0.2, y, COLW - 0.92, BAR_H, { size: 10, bold: true, color: WHITE, cs: 0.5, name: "бейдж" });
    if (zoneH) {
      K.rect(x, y + BAR_H, COLW, zoneH, { fill: COBALT, line: INK, lw: 2, name: "экран" });
      o.draw({ x, y: y + BAR_H, w: COLW, h: zoneH });
    }
    const tx = x + 0.25, tw = COLW - 0.5, ty = y + BAR_H + zoneH + 0.16;
    const hh = o.headH ?? 0.66;
    K.text(typo(o.heading), tx, ty, tw, hh, { size: o.headSize || 19, bold: true, valign: "top", name: "заголовок" });
    if (o.body) K.text(typo(o.body), tx, ty + hh + 0.06, tw, y + h - (ty + hh + 0.06) - (o.bottom ?? 0.1), { size: o.bodySize || 15, color: SLATE, valign: "top", name: "описание" });
    if (o.after) o.after({ x: tx, y: ty + hh + 0.06, w: tw, bottom: y + h });
  }
  // Стрелка-связка между соседними карточками (только там, где это последовательность)
  function connector(K, i, zoneH = 1.6) {
    const d = 0.46, cx = colX(i) + COLW + GAP / 2, cy = CARD_Y + BAR_H + zoneH / 2;
    K.oval(cx - d / 2, cy - d / 2, d, { fill: INK, line: WHITE, lw: 1.5, name: "связка" });
    K.iconIn("FaArrowRight", "white", cx - d / 2, cy - d / 2, d, d, 0.2);
  }
  // Строка статуса «значок + подпись»
  function statusRow(K, x, y, w, tone, iconName, label, rest) {
    K.rect(x, y + 0.03, 0.22, 0.22, { fill: tone, line: INK, lw: 1, name: "маркер" });
    K.iconIn(iconName, "white", x, y + 0.03, 0.22, 0.22, 0.12);
    K.text([{ text: label + " ", options: { bold: true, color: tone } }, { text: rest, options: { color: INK } }], x + 0.32, y, w - 0.32, 0.28, { size: 12, name: "статус" });
  }

  // ====================== СЛАЙД 1. ТИТУЛ ======================
  pres.addSection({ title: "Проект" });
  {
    const s = pres.addSlide({ masterName: "Титул", sectionTitle: "Проект" });
    const K = kit(s, "Титул");
    s.addText("SPORTZANIA ID //", { placeholder: "title" });
    s.addText("THE RESIDENT PASSPORT", { placeholder: "subtitle" });
    s.addText("Единый цифровой паспорт резидента лагеря и онлайн-школы SportZania", { placeholder: "lead" });
    K.img(A.chrome, MX, 3.95, 3.5, 0.44, "хром");
    K.text("УРОВЕНЬ: РЕЗИДЕНТ 2027", MX, 3.95, 3.5, 0.44, { size: 13, bold: true, align: "center", cs: 1.5, line: INK, lw: 2, name: "статус резидента" });

    // Макет интерфейса — главный визуал титула
    const ix = 7.4, iy = 1.3, iw = 5.35, ih = iw * (941 / 1672);
    K.rect(ix, iy, iw, ih, { fill: WHITE, line: INK, lw: 2, shadow: 8, name: "рамка макета" });
    s.addImage({ data: poster, x: ix + 0.05, y: iy + 0.05, w: iw - 0.1, h: ih - 0.1, objectName: "Макет интерфейса паспорта", altText: "Макет интерфейса SportZania ID: профиль резидента, радар отряда, барометр дня, радар компетенций и лидерборд" });
    K.chip("МАКЕТ ИНТЕРФЕЙСА ПАСПОРТА", ix + 0.2, iy + ih - 0.16, 2.75, 0.32, { fill: INK, size: 10, cs: 1, line: WHITE });
    K.star(ix - 0.3, iy - 0.22, 0.52, { fill: COBALT, line: INK, lw: 1.5, name: "искра" });
    K.star(ix + iw - 0.12, iy + ih - 0.5, 0.34, { fill: COBALT, line: INK, lw: 1.25, name: "искра" });

    const info = [
      ["АВТОР И КАТЕГОРИЯ", "Костарев Фёдор, 11 лет", "Категория Middle (11–14 лет). Куратор проекта — Альбина Костарева."],
      ["ЗАКАЗЧИК КЕЙСА", "ООО «Спортзания»", "Резидент Фонда «Сколково»: премиальный детский отдых и круглогодичная онлайн-школа."],
      ["КЛЮЧЕВОЙ ТЕЗИС", "Смена длится весь год", "Паспорт сохраняет навыки, проекты и друзей и ведёт резидента из лагеря в онлайн-школу."],
    ];
    info.forEach(([badge, heading, body], i) => card(s, K, i, { y: 4.76, h: 1.9, zoneH: 0, badge, heading, body, headSize: 17, headH: 0.34, bodySize: 14, bottom: 0.1 }));
    s.addNotes("Здравствуйте! Меня зовут Фёдор Костарев, мне 11 лет, категория Middle. Я представляю проект SportZania ID — единый цифровой паспорт резидента для лагеря и онлайн-школы SportZania. Главная мысль проекта: смена не должна заканчиваться в день отъезда. Паспорт сохраняет навыки, проекты и друзей ребёнка и ведёт его дальше — в онлайн-школу. Справа — макет интерфейса, по которому я собрал работающий веб-прототип.");
  }

  // ====================== СЛАЙД 2. ПРОБЛЕМА ======================
  pres.addSection({ title: "Проблема" });
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Проблема" });
    const K = kit(s, "Проблема");
    s.addText("АНАЛИЗ РЫНКА И ПРЕДПОСЫЛКИ", { placeholder: "section" });
    s.addText("Куда исчезает прогресс ребёнка после смены?", { placeholder: "title" });
    const pain = (z, t) => K.chip(t, z.x + 0.26, z.y + 1.2, z.w - 0.52, 0.28, { fill: RED, size: 10, cs: 0.5, name: "боль" });

    card(s, K, 0, {
      badge: "БОЛЬ РОДИТЕЛЕЙ",
      heading: "Премиальная смена — бумажная грамота",
      body: "Семья платит за развитие, а получает грамоту и фотографии. Рост гибких навыков не оцифрован, и к осени достижения забываются.",
      draw: (z) => {
        const px = z.x + 0.5, py = z.y + 0.16;
        K.panel(px, py, 1.25, 0.9, { name: "грамота" });
        K.text("ГРАМОТА", px, py + 0.07, 1.25, 0.2, { size: 10, bold: true, align: "center", cs: 1 });
        [0.36, 0.48, 0.6].forEach((dy, k) => K.hline(px + 0.16, py + dy, k === 2 ? 0.55 : 0.93, { color: SILVER, lw: 2 }));
        K.oval(px + 0.92, py + 0.56, 0.24, { fill: COBALT, line: INK, lw: 1, name: "печать" });
        K.text("+", z.x + 1.75, py + 0.2, 0.41, 0.5, { size: 26, bold: true, color: WHITE, align: "center" });
        const qx = z.x + 2.16;
        K.panel(qx, py, 1.25, 0.9, { name: "фото" });
        K.rect(qx + 0.08, py + 0.08, 1.09, 0.56, { fill: TINT, line: INK, lw: 1 });
        K.iconIn("FaImage", "cobalt", qx + 0.08, py + 0.08, 1.09, 0.56, 0.32);
        K.text("ФОТО", qx, py + 0.67, 1.25, 0.2, { size: 10, bold: true, align: "center", cs: 1 });
        pain(z, "ИТОГ СМЕНЫ: ГРАМОТА И ФОТО");
      },
    });
    card(s, K, 1, {
      badge: "ПОДРОСТОК 11–14 ЛЕТ",
      heading: "Школьное портфолио — «не моё»",
      body: "Казённые дневники подростки сами не открывают. Робота, код и видео показать негде, а контакты друзей по отряду тонут в чатах.",
      draw: (z) => {
        const px = z.x + 0.4, py = z.y + 0.16, pw = 2.2;
        K.panel(px, py, pw, 0.9, { name: "дневник" });
        K.rect(px, py, pw, 0.22, { fill: SILVER, tr: 55, line: INK, lw: 1.5 });
        K.text("ЭЛЕКТРОННЫЙ ДНЕВНИК", px + 0.1, py, pw - 0.2, 0.22, { size: 9, bold: true, color: SLATE, cs: 0.5 });
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) K.rect(px + 0.1 + c * 0.51, py + 0.32 + r * 0.185, 0.46, 0.12, { fill: SILVER, tr: c === 0 ? 20 : 60 });
        K.iconIn("FaFaceMeh", "white", px + pw, py, z.w - 0.4 - pw - 0.3, 0.9, 0.6);
        pain(z, "ПРОЕКТЫ ПОКАЗАТЬ НЕГДЕ");
      },
    });
    card(s, K, 2, {
      badge: "УПУЩЕННАЯ ВЫГОДА БИЗНЕСА",
      heading: "Лагерь и онлайн-школа живут врозь",
      body: "Между каникулами контакт с лояльной семьёй теряется. Нет инструмента, который по успехам смены порекомендует курс.",
      draw: (z) => {
        const py = z.y + 0.16, bw = 1.25, bh = 0.9, lx = z.x + 0.26, rx = z.x + z.w - 0.26 - bw;
        K.panel(lx, py, bw, bh, { name: "лагерь" });
        K.iconIn("FaCampground", "cobalt", lx, py + 0.1, bw, 0.4, 0.36);
        K.text("ЛАГЕРЬ", lx, py + 0.56, bw, 0.24, { size: 10, bold: true, align: "center", cs: 1 });
        K.panel(rx, py, bw, bh, { name: "онлайн-школа" });
        K.iconIn("FaGraduationCap", "cobalt", rx, py + 0.1, bw, 0.4, 0.38);
        K.text("ОНЛАЙН-ШКОЛА", rx, py + 0.56, bw, 0.24, { size: 10, bold: true, align: "center", cs: 0.5 });
        K.hline(lx + bw + 0.04, py + bh / 2, rx - lx - bw - 0.08, { color: WHITE, lw: 2.5, dash: "dash", name: "разрыв" });
        const d = 0.4, cx = (lx + bw + rx) / 2;
        K.oval(cx - d / 2, py + bh / 2 - d / 2, d, { fill: RED, line: INK, lw: 1.5, name: "разрыв" });
        K.iconIn("FaXmark", "white", cx - d / 2, py + bh / 2 - d / 2, d, d, 0.2);
        pain(z, "МЕЖСЕЗОНЬЕ: СВЯЗЬ ПОТЕРЯНА");
      },
    });
    s.addNotes("Мы начали с вопроса: куда исчезает прогресс ребёнка после смены? Мы увидели три проблемы. Первая — родители: они платят за развитие, а получают бумажную грамоту и фотографии. Вторая — мы, подростки: школьные портфолио скучные, туда никто не заходит сам, а свои проекты показать негде. Третья — бизнес: лагерь и онлайн-школа SportZania живут отдельно, и между каникулами связь с семьёй теряется.");
  }

  // ====================== СЛАЙД 3. ПРИВАТНОСТЬ ======================
  pres.addSection({ title: "Решение" });
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Решение" });
    const K = kit(s, "Приватность");
    s.addText("ИННОВАЦИЯ ПРИВАТНОСТИ // 152-ФЗ", { placeholder: "section" });
    s.addText("Три уровня доступа: защита от сталкерства", { placeholder: "title" });
    const rows = (a, vis, hid) => {
      statusRow(K, a.x, a.bottom - 0.78, a.w, GREEN, "FaCheck", vis[0], vis[1]);
      statusRow(K, a.x, a.bottom - 0.44, a.w, RED, "FaLock", hid[0], hid[1]);
    };
    card(s, K, 0, {
      badge: "УРОВЕНЬ 1 // КОНТУР СМЕНЫ",
      heading: "Интерактивная карта лагеря",
      body: "Корпуса, отряды и карточки ребят — на одной карте. Открытого сталкерства нет.",
      draw: (z) => {
        [["Маша", "Python"], ["Артём", "Видео"], ["Диана", "Баскетбол"]].forEach(([nme, hobby], k) =>
          K.polaroid(z.x + 0.26 + k * 1.195, z.y + 0.16, nme, hobby, { lock: true, handleColor: COBALT }));
      },
      after: (a) => rows(a, ["Видно:", "аватар, хобби, отряд"], ["Скрыто:", "соцсети и телефоны"]),
    });
    card(s, K, 1, {
      badge: "УРОВЕНЬ 2 // КОНТУР ДОВЕРИЯ",
      heading: "Friend-Lock: цифровое рукопожатие",
      body: "Telegram, TikTok, VK и телефон закрыты, пока оба участника не подтвердят дружбу.",
      draw: (z) => {
        const lx = z.x + 0.26, rx = z.x + z.w - 1.26, y = z.y + 0.16;
        K.polaroid(lx, y, "Федя", "@fedya_tech", { handleColor: COBALT });
        K.polaroid(rx, y, "Маша", "@masha_z", { handleColor: COBALT });
        const mx = lx + 1.0 + 0.12, mw = rx - mx - 0.12;
        K.text("ЗАПРОС", mx, y + 0.02, mw, 0.2, { size: 9, bold: true, color: WHITE, align: "center", cs: 1 });
        K.hline(mx, y + 0.3, mw, { color: WHITE, lw: 2, end: "triangle", name: "запрос" });
        K.hline(mx, y + 0.98, mw, { color: WHITE, lw: 2, begin: "triangle", name: "подтверждение" });
        K.text("ПОДТВЕРЖДЕНИЕ", mx - 0.1, y + 1.06, mw + 0.2, 0.2, { size: 9, bold: true, color: WHITE, align: "center", cs: 0.5 });
        const d = 0.5, cx = mx + mw / 2;
        K.oval(cx - d / 2, y + 0.64 - d / 2, d, { fill: GREEN, line: INK, lw: 1.5, name: "замок открыт" });
        K.iconIn("FaLockOpen", "white", cx - d / 2, y + 0.64 - d / 2, d, d, 0.24);
      },
      after: (a) => rows(a, ["Открыто:", "взаимным друзьям"], ["Закрыто:", "для всех остальных"]),
    });
    card(s, K, 2, {
      badge: "УРОВЕНЬ 3 // ВНЕШНИЙ КОНТУР",
      heading: "Публичная визитка-портфолио",
      body: "По ссылке учителя, лицеи и олимпиады видят только подтверждённые достижения.",
      draw: (z) => {
        const px = z.x + 0.26, py = z.y + 0.16, pw = z.w - 0.52, ph = 1.28;
        K.panel(px, py, pw, ph, { name: "окно браузера" });
        K.rect(px, py, pw, 0.26, { fill: SILVER, tr: 55, line: INK, lw: 1.5 });
        [RED, SILVER, GREEN].forEach((c, k) => K.oval(px + 0.1 + k * 0.14, py + 0.085, 0.09, { fill: c }));
        K.text("sportzania.id/fedya_tech", px + 0.6, py, pw - 0.7, 0.26, { size: 9.5, bold: true, color: SLATE });
        K.img(A.miniRadar, px + 0.12, py + 0.34, 0.86, 0.86, "мини-радар");
        const cx = px + 1.12, cw = 1.04;
        K.chip("НАВЫКИ", cx, py + 0.42, cw, 0.28, { fill: GREEN });
        K.chip("ПРОЕКТЫ", cx + cw + 0.08, py + 0.42, cw, 0.28, { fill: GREEN });
        K.chip("КОНТАКТЫ", cx, py + 0.84, cw, 0.28, { fill: RED });
        K.chip("КОМНАТА", cx + cw + 0.08, py + 0.84, cw, 0.28, { fill: RED });
      },
      after: (a) => rows(a, ["Видно:", "радар навыков, проекты"], ["Скрыто:", "контакты, номер комнаты"]),
    });
    connector(K, 0); connector(K, 1);
    s.addNotes("Главный страх родителей и детей — что профиль увидят посторонние. Поэтому в паспорте три уровня доступа, и мы проектировали их с учётом закона о персональных данных, 152-ФЗ. Первый уровень — карта лагеря: видны аватар, хобби и отряд, а соцсети и телефоны скрыты. Второй уровень — Friend-Lock: контакты открываются, только когда оба участника подтвердили дружбу, как цифровое рукопожатие. Третий уровень — публичная ссылка: учителя и олимпиады видят только навыки и проекты, без контактов и номера комнаты.");
  }

  // ====================== СЛАЙД 4. АДАПТАЦИЯ ======================
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Решение" });
    const K = kit(s, "Адаптация");
    s.addText("АДАПТАЦИЯ И НЕТВОРКИНГ", { placeholder: "section" });
    s.addText("«Общие вайбы»: свои находятся за 48 часов", { placeholder: "title" });
    card(s, K, 0, {
      badge: "ЦЕННОСТНЫЙ ОБМЕН",
      heading: "Заполнил профиль — получил ключ",
      body: "Вместо скучной анкеты — игра: цели, хобби и интересы на 100% открывают карту отрядов. Профиль заполняют сами (Value Exchange).",
      draw: (z) => {
        const px = z.x + 0.26, py = z.y + 0.16, pw = z.w - 0.52, ph = 1.28;
        K.panel(px, py, pw, ph, { name: "профиль" });
        ["Цели", "Хобби", "Интересы"].forEach((t, k) => {
          const ry = py + 0.16 + k * 0.34;
          K.rect(px + 0.16, ry + 0.02, 0.24, 0.24, { fill: GREEN, line: INK, lw: 1 });
          K.iconIn("FaCheck", "white", px + 0.16, ry + 0.02, 0.24, 0.24, 0.13);
          K.text(t, px + 0.52, ry, 1.0, 0.28, { size: 11.5, bold: true });
        });
        K.vline(px + 1.5, py + 0.14, ph - 0.28, { color: SILVER, lw: 1 });
        const rx = px + 1.64, rw = pw - 1.64 - 0.16;
        K.text("100%", rx, py + 0.1, rw, 0.46, { size: 28, bold: true, color: COBALT });
        K.rect(rx, py + 0.6, rw, 0.13, { fill: COBALT, line: INK, lw: 1, name: "прогресс" });
        K.rect(rx, py + 0.86, rw, 0.3, { fill: INK, name: "ключ" });
        K.icon("FaKey", "white", rx + 0.12, py + 0.935, 0.15);
        K.text("КЛЮЧ К КАРТЕ", rx + 0.32, py + 0.86, rw - 0.38, 0.3, { size: 9.5, bold: true, color: WHITE, align: "center", name: "ключ" });
      },
    });
    card(s, K, 1, {
      badge: "ФИЛЬТРЫ НА КАРТЕ",
      heading: "Карта подсвечивает единомышленников",
      body: "Кнопки «Кто кодит на Python?» и «Кто монтирует видео?» подсвечивают ребят с теми же увлечениями — есть повод заговорить.",
      draw: (z) => {
        const lx = z.x + 0.26, lw = 2.0;
        K.chip("Кто кодит на Python?", lx, z.y + 0.2, lw, 0.32, { fill: WHITE, color: COBALT, size: 10.5 });
        K.chip("Кто монтирует видео?", lx, z.y + 0.64, lw, 0.32, { color: WHITE, line: WHITE, size: 10.5 });
        K.chip("Кто играет в баскетбол?", lx, z.y + 1.08, lw, 0.32, { color: WHITE, line: WHITE, size: 10.5 });
        const gx = z.x + 2.5, d = 0.34, g = 0.07, hit = new Set([1, 3, 8]);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const k = r * 3 + c, x = gx + c * (d + g), y = z.y + 0.2 + r * (d + g + 0.02);
          if (hit.has(k)) { K.oval(x, y, d, { fill: WHITE, line: GREEN, lw: 2.5, name: "совпадение" }); K.iconIn("FaUser", "cobalt", x, y, d, d, 0.16); }
          else { K.oval(x, y, d, { fill: WHITE, tr: 78, line: WHITE, lw: 1, name: "резидент" }); K.iconIn("FaUser", "white", x, y, d, d, 0.14); }
        }
      },
    });
    card(s, K, 2, {
      badge: "ПЕРВЫЕ 48 ЧАСОВ",
      heading: "Команда — ещё до первого сбора",
      body: "Безопасный запрос в друзья — и резидент знает, с кем объединиться в проектную команду. Стеснение уходит за первые два дня.",
      draw: (z) => {
        K.text("48", z.x + 0.26, z.y + 0.12, 1.5, 0.95, { size: 64, bold: true, color: WHITE });
        K.text("ЧАСОВ", z.x + 0.3, z.y + 1.08, 1.5, 0.28, { size: 14, bold: true, color: WHITE, cs: 4 });
        const sx = z.x + 2.0, d = 0.2;
        K.vline(sx + d / 2, z.y + 0.36, 0.9, { color: WHITE, lw: 2 });
        [["Заезд", WHITE], ["Первый вечер", WHITE], ["Своя команда", GREEN]].forEach(([t, c], k) => {
          const y = z.y + 0.26 + k * 0.45;
          K.oval(sx, y, d, { fill: c, line: k === 2 ? WHITE : INK, lw: 1.5, name: "шаг" });
          K.text(t, sx + 0.34, y - 0.04, 1.5, 0.28, { size: 11.5, bold: true, color: WHITE });
        });
      },
    });
    s.addNotes("В первые дни в лагере многим страшно подойти и познакомиться. Мы придумали ценностный обмен: заполни цели, хобби и интересы на сто процентов — и получи ключ к карте отрядов. Никто не заставляет, ребята заполняют профиль сами, потому что хотят найти своих. На карте работают быстрые фильтры: кто кодит на Python, кто монтирует видео. Они подсвечивают единомышленников, и уже за первые 48 часов у каждого появляется своя команда.");
  }

  // ====================== СЛАЙД 5. АТМОСФЕРА ======================
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Решение" });
    const K = kit(s, "Атмосфера");
    s.addText("АТМОСФЕРА И УДЕРЖАНИЕ", { placeholder: "section" });
    s.addText("Барометр дня, стрики и лидерборд смены", { placeholder: "title" });
    card(s, K, 0, {
      badge: "ВЕЧЕРНИЙ ЧЕК-ИН // 21:30",
      heading: "Барометр атмосферы на языке подростка",
      body: "Две минуты перед отбоем: ползунок от «Сегодня токсично» до «Сегодня имба!». Честная рефлексия без оценок — и монеты Zania Coins.",
      draw: (z) => {
        const px = z.x + 0.26, py = z.y + 0.16, pw = z.w - 0.52, ph = 1.28;
        K.panel(px, py, pw, ph, { name: "барометр" });
        K.icon("FaCloudBolt", "red", px + 0.18, py + 0.12, 0.24);
        K.text("ТОКСИЧНО", px + 0.48, py + 0.1, 1.2, 0.28, { size: 10, bold: true, color: RED, cs: 0.5 });
        K.icon("FaFire", "green", px + pw - 0.4, py + 0.11, 0.24);
        K.text("ИМБА!", px + pw - 1.68, py + 0.1, 1.2, 0.28, { size: 10, bold: true, color: GREEN, align: "right", cs: 0.5 });
        const tx = px + 0.18, tw = pw - 0.36, ty = py + 0.5;
        K.img(A.track, tx, ty, tw, 0.16, "шкала");
        K.rect(tx, ty, tw, 0.16, { line: INK, lw: 1.5, name: "шкала" });
        const kd = 0.34, kx = tx + tw * 0.85 - kd / 2;
        K.oval(kx, ty + 0.08 - kd / 2, kd, { fill: WHITE, line: INK, lw: 2, name: "ползунок" });
        K.oval(kx + 0.11, ty + 0.08 - 0.06, 0.12, { fill: COBALT, name: "ползунок" });
        K.chip("СЕГОДНЯ ИМБА!  +10 монет Zania", tx, py + 0.86, tw, 0.3, { fill: TINT, color: COBALT, line: COBALT, dash: "dash", size: 10 });
      },
    });
    card(s, K, 1, {
      badge: "ПУЛЬС ЛАГЕРЯ",
      heading: "Анонимная тепловая карта отрядов",
      body: "Психологи видят настроение отрядов в реальном времени. Растёт «токсично» — вожатый мягко гасит конфликт до звонков родителей.",
      draw: (z) => {
        const px = z.x + 0.26, py = z.y + 0.16, pw = z.w - 0.52, ph = 1.28;
        K.panel(px, py, pw, ph, { name: "тепловая карта" });
        const data = [[1, 0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0, 0], [1, 1, 2, 2, 3, 3, 2]];
        const tone = [[GREEN, 0], [GREEN, 55], [RED, 55], [RED, 0]];
        const gx = px + 0.98, cw = 0.295, chh = 0.2, g = 0.04;
        data.forEach((row, r) => {
          const y = py + 0.14 + r * 0.27;
          K.text("Отряд " + (r + 1), px + 0.14, y - 0.02, 0.8, 0.24, { size: 10, bold: true });
          row.forEach((v, c) => K.rect(gx + c * (cw + g), y, cw, chh, { fill: tone[v][0], tr: tone[v][1], line: INK, lw: 0.75, name: "день" }));
        });
        K.rect(gx + 4 * (cw + g) - 0.03, py + 0.14 + 2 * 0.27 - 0.03, 2 * cw + g + 0.06, chh + 0.06, { line: INK, lw: 2.25, name: "сигнал" });
        K.chip("СИГНАЛ ВОЖАТОМУ: ОТРЯД 3", gx, py + 0.94, 7 * cw + 6 * g, 0.24, { fill: INK, size: 9, cs: 0.5 });
      },
    });
    card(s, K, 2, {
      badge: "СТРИКИ И ЛИДЕРБОРД",
      heading: "Привычка возвращаться каждый вечер",
      body: "Чек-ин продлевает огонь стрика и приносит монеты. Честный лидерборд Топ-10 поощряет вклад в проекты и взаимовыручку.",
      draw: (z) => {
        const px = z.x + 0.26, py = z.y + 0.16, pw = 2.08, rh = 0.32;
        K.panel(px, py, pw, 1.28, { name: "лидерборд" });
        [["03", "@kirill_code", "11 320"], ["04", "@masha_z", "10 980"], ["05", "@fedya_tech", "10 770"], ["06", "@tema_play", "10 210"]].forEach(([n, nick, pts], r) => {
          const y = py + r * rh, me = r === 2;
          if (me) K.rect(px, y, pw, rh, { fill: TINT, line: INK, lw: 1.5, name: "моя строка" });
          else if (r > 0) K.hline(px, y, pw, { color: SILVER, lw: 0.75 });
          K.text(n + "  " + nick, px + 0.1, y, 1.35, rh, { size: 9.5, bold: true, color: me ? COBALT : INK });
          K.text(pts, px + pw - 0.7, y, 0.6, rh, { size: 9.5, bold: true, color: me ? COBALT : SLATE, align: "right" });
        });
        const rx = px + pw + 0.14, rw = z.w - 0.52 - pw - 0.14;
        K.rect(rx, py, rw, 0.58, { fill: INK, line: WHITE, lw: 1.25, name: "стрик" });
        K.icon("FaFire", "white", rx + 0.1, py + 0.17, 0.24);
        K.text("СТРИК", rx + 0.42, py + 0.06, rw - 0.46, 0.2, { size: 9, bold: true, color: WHITE, cs: 1 });
        K.text("7 ДНЕЙ", rx + 0.42, py + 0.26, rw - 0.46, 0.26, { size: 13, bold: true, color: WHITE });
        K.img(A.chrome, rx, py + 0.7, rw, 0.58, "хром");
        K.rect(rx, py + 0.7, rw, 0.58, { line: INK, lw: 1.5, name: "монеты" });
        K.text("420", rx, py + 0.73, rw, 0.32, { size: 17, bold: true, align: "center" });
        K.text("МОНЕТ ZANIA", rx, py + 1.03, rw, 0.2, { size: 9, bold: true, align: "center", cs: 0.5 });
      },
    });
    s.addNotes("Традиционную лагерную «свечку» мы превратили в двухминутный ритуал. Каждый вечер в 21:30 резидент двигает ползунок барометра: от «сегодня токсично» до «сегодня имба». Это честно и без оценок. Руководство лагеря получает анонимную тепловую карту настроения отрядов: если в одном отряде растёт «токсично», вожатый успевает помочь до того, как позвонят встревоженные родители. А чтобы ребята возвращались каждый вечер, есть стрики, монеты Zania Coins и честный лидерборд Топ-10 — он поощряет проекты и взаимовыручку.");
  }

  // ====================== СЛАЙД 6. ПРОДУКТОВЫЙ КОНТУР ======================
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Решение" });
    const K = kit(s, "Продукт");
    const ZH = 1.9;
    s.addText("ПРОДУКТОВЫЙ КОНТУР", { placeholder: "section" });
    s.addText("Навыки, проекты и следующий шаг резидента", { placeholder: "title" });
    card(s, K, 0, {
      zoneH: ZH,
      badge: "РАДАР 5D-КОМПЕТЕНЦИЙ",
      heading: "Пять навыков — одна картина роста",
      body: "Лидерство, Технологии, Команда, Английский и Спорт. Оценки ставят тьюторы по итогам реальных проектов смены.",
      draw: (z) => {
        s.addChart(pres.charts.RADAR, [{ name: "Оценка тьюторов", labels: ["Лидерство 92", "Технологии 87", "Команда 90", "Английский 78", "Спорт 85"], values: [92, 87, 90, 78, 85] }], {
          x: z.x + 0.08, y: z.y + 0.04, w: z.w - 0.16, h: z.h - 0.08,
          radarStyle: "filled", chartColors: ["FFFFFF"], chartColorsOpacity: 35,
          catAxisLabelColor: "FFFFFF", catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
          valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25,
          valGridLine: { color: "9DB4F5", size: 0.75 }, catGridLine: { style: "none" },
          showLegend: false, showTitle: false, showValue: false,
          objectName: "Радар 5D-компетенций", altText: "Радар компетенций: Лидерство 92, Технологии 87, Команда 90, Английский 78, Спорт 85",
        });
      },
    });
    card(s, K, 1, {
      zoneH: ZH,
      badge: "ВИТРИНА ПРОЕКТОВ",
      heading: "Портфолио и резюме в один клик",
      body: "Фото робота, ссылка на код и роль в команде. Резюме для лицеев и олимпиад — без личных контактов.",
      draw: (z) => {
        const tile = (x, icon, title, role) => {
          const y = z.y + 0.18, w = 1.3, h = 1.58;
          K.panel(x, y, w, h, { name: "проект" });
          K.rect(x + 0.08, y + 0.08, w - 0.16, 0.66, { fill: TINT, line: INK, lw: 1 });
          K.iconIn(icon, "cobalt", x + 0.08, y + 0.08, w - 0.16, 0.66, 0.38);
          K.text(title, x + 0.08, y + 0.8, w - 0.16, 0.4, { size: 10, bold: true, valign: "top" });
          K.chip(role, x + 0.08, y + 1.24, w - 0.16, 0.24, { fill: INK, size: 9, cs: 0.5 });
        };
        tile(z.x + 0.26, "FaRobot", "Робот-сортировщик", "ТИМЛИД");
        tile(z.x + 1.7, "FaVideo", "Фильм отряда", "МОНТАЖЁР");
        const px = z.x + 3.14, pw = z.w - 3.14 - 0.16;
        K.iconIn("FaFilePdf", "white", px, z.y + 0.42, pw, 0.56, 0.5);
        K.text("PDF", px, z.y + 1.04, pw, 0.24, { size: 12, bold: true, color: WHITE, align: "center", cs: 1 });
        K.text("1 клик", px - 0.06, z.y + 1.28, pw + 0.12, 0.22, { size: 10, bold: true, color: WHITE, align: "center" });
      },
    });
    card(s, K, 2, {
      zoneH: ZH,
      badge: "МОСТ В ОНЛАЙН-ШКОЛУ",
      heading: "Курс по сильным сторонам резидента",
      body: "Паспорт анализирует интересы смены и рекомендует курс онлайн-школы со статусной скидкой резидента.",
      draw: (z) => {
        const py = z.y + 0.18, bw = 1.32, bh = 0.66, lx = z.x + 0.26, rx = z.x + z.w - 0.26 - bw;
        K.panel(lx, py, bw, bh, { name: "лагерь" });
        K.iconIn("FaCampground", "cobalt", lx, py + 0.06, bw, 0.32, 0.28);
        K.text("ЛАГЕРЬ", lx, py + 0.4, bw, 0.2, { size: 9.5, bold: true, align: "center", cs: 1 });
        K.panel(rx, py, bw, bh, { name: "онлайн-школа" });
        K.iconIn("FaGraduationCap", "cobalt", rx, py + 0.06, bw, 0.32, 0.3);
        K.text("ОНЛАЙН-ШКОЛА", rx, py + 0.4, bw, 0.2, { size: 9.5, bold: true, align: "center" });
        K.hline(lx + bw + 0.03, py + bh / 2, rx - lx - bw - 0.06, { color: WHITE, lw: 3, name: "мост" });
        const d = 0.4, cx = (lx + bw + rx) / 2;
        K.oval(cx - d / 2, py + bh / 2 - d / 2, d, { fill: GREEN, line: INK, lw: 1.5, name: "мост" });
        K.iconIn("FaCheck", "white", cx - d / 2, py + bh / 2 - d / 2, d, d, 0.19);
        const cy = z.y + 1.02, cw = z.w - 0.52, chh = 0.74;
        K.panel(lx, cy, cw, chh, { name: "рекомендация" });
        K.text("РЕКОМЕНДАЦИЯ КУРСА", lx + 0.14, cy + 0.06, 2.0, 0.2, { size: 9, bold: true, color: COBALT, cs: 0.5 });
        K.text("Python + Разговорный английский B1", lx + 0.14, cy + 0.27, 2.02, 0.42, { size: 10.5, bold: true, valign: "top" });
        K.chip("СКИДКА РЕЗИДЕНТА", lx + cw - 1.16, cy + 0.14, 1.02, 0.46, { fill: GREEN, size: 9.5 });
      },
    });
    s.addNotes("Паспорт стоит на трёх опорах. Первая — радар пяти компетенций: лидерство, технологии, команда, английский и спорт. Оценки ставят тьюторы по реальным проектам, а не по тестам. Вторая — витрина проектов: фото робота, ссылка на код, моя роль в команде. Одним кликом паспорт собирает PDF-резюме для лицея или олимпиады. Третья — мост в онлайн-школу: паспорт видит сильные стороны и рекомендует курс, например Python и разговорный английский B1, со скидкой резидента. Так разрыв между лагерем и школой со второго слайда закрывается.");
  }

  // ====================== СЛАЙД 7. БИЗНЕС-МОДЕЛЬ ======================
  pres.addSection({ title: "Бизнес и запуск" });
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Бизнес и запуск" });
    const K = kit(s, "Бизнес");
    s.addText("БИЗНЕС-МОДЕЛЬ И ЭФФЕКТ ДЛЯ SPORTZANIA", { placeholder: "section" });
    s.addText("Что паспорт даёт бизнесу SportZania", { placeholder: "title" });
    const stat = (z, big, label, icon) => {
      K.text(big, z.x + 0.26, z.y + 0.1, 2.8, 0.92, { size: 50, bold: true, color: WHITE });
      K.text(label, z.x + 0.28, z.y + 1.02, z.w - 0.56, 0.46, { size: 12, bold: true, color: WHITE, valign: "top" });
      K.rect(z.x + z.w - 0.78, z.y + 0.2, 0.52, 0.52, { line: WHITE, lw: 1.5, name: "значок" });
      K.iconIn(icon, "white", z.x + z.w - 0.78, z.y + 0.2, 0.52, 0.52, 0.26);
    };
    card(s, K, 0, {
      badge: "ПОВТОРНЫЕ ПРОДАЖИ",
      heading: "Смена продаёт учебный" + NB + "год",
      body: "Рекомендация опирается на реальные успехи ребёнка — это забота, а не реклама. Растёт LTV: доход от семьи за всё время.",
      draw: (z) => stat(z, "25–30%", "семей переходят в курсы онлайн-школы — цель пилота", "FaArrowTrendUp"),
    });
    card(s, K, 1, {
      badge: "УДЕРЖАНИЕ СЕМЕЙ",
      heading: "Семьи остаются с брендом",
      body: "Барометр ловит недовольство ещё на смене, а стрики и курсы держат связь между каникулами. Отток семей (Churn Rate) снижается.",
      draw: (z) => stat(z, "365", "дней в году семья на связи с брендом, а не только в дни смены", "FaHeart"),
    });
    card(s, K, 2, {
      badge: "ВИРАЛЬНЫЙ ОХВАТ",
      heading: "Паспортом хочется делиться",
      body: "Подростки публикуют паспорта, бейджи и стрики в своих соцсетях. Их контент (UGC) приводит новые семьи без рекламного бюджета.",
      draw: (z) => stat(z, "0 ₽", "на рекламу: о лагере рассказывают сами резиденты", "FaShareNodes"),
    });
    s.addNotes("Теперь о том, зачем это компании. Первый эффект — повторные продажи: рекомендация курса опирается на реальные успехи ребёнка, и наша цель на пилоте — чтобы 25–30 процентов семей продолжили учиться в онлайн-школе. Второй эффект — удержание: барометр помогает решать проблемы ещё на смене, а стрики и курсы держат связь с семьёй весь год. Третий эффект — охват: ребята сами делятся паспортами и стриками в соцсетях, и о SportZania узнают новые семьи без затрат на рекламу. Цифра 25–30% — это гипотеза, которую мы проверим на пилоте.");
  }

  // ====================== СЛАЙД 8. ДОРОЖНАЯ КАРТА ======================
  {
    const s = pres.addSlide({ masterName: "Три колонки", sectionTitle: "Бизнес и запуск" });
    const K = kit(s, "Дорожная карта");
    s.addText("ДОРОЖНАЯ КАРТА MVP // AMAKS «НОВАЯ ИСТРА» 4★", { placeholder: "section" });
    s.addText("Пилот на зимней смене 2–9 января 2027 года", { placeholder: "title" });
    const stage = (i, badge, date, days, heading, steps, metric) => card(s, K, i, {
      badge, heading, headH: 0.36,
      draw: (z) => {
        K.text(date, z.x + 0.26, z.y + 0.14, z.w - 0.52, 0.6, { size: 30, bold: true, color: WHITE });
        const cw = 0.38, g = (z.w - 0.52 - 8 * cw) / 7;
        for (let d = 2; d <= 9; d++) {
          const on = days.includes(d), x = z.x + 0.26 + (d - 2) * (cw + g);
          K.text(String(d), x, z.y + 0.92, cw, 0.44, { size: 13, bold: true, align: "center", color: on ? COBALT : WHITE, fill: on ? WHITE : undefined, line: on ? INK : WHITE, lw: on ? 1.5 : 1, name: "день смены" });
        }
      },
      after: (a) => {
        steps.forEach((t, k) => {
          const y = a.y + 0.06 + k * 0.4;
          K.rect(a.x, y + 0.04, 0.24, 0.24, { fill: GREEN, line: INK, lw: 1, name: "шаг" });
          K.iconIn("FaCheck", "white", a.x, y + 0.04, 0.24, 0.24, 0.13);
          K.text(typo(t), a.x + 0.36, y, a.w - 0.36, 0.32, { size: 15, color: SLATE, name: "шаг" });
        });
        K.text([{ text: "ИЗМЕРЯЕМ: ", options: { bold: true } }, { text: metric, options: { bold: true } }], a.x, a.bottom - 0.6, a.w, 0.36, { size: 11, color: COBALT, fill: TINT, line: COBALT, lw: 1, align: "center", name: "метрика" });
      },
    });
    stage(0, "ЭТАП 1 // СТАРТ СМЕНЫ", "2–3 ЯНВАРЯ", [2, 3], "Онбординг и карта",
      ["QR-код на бейдже — профиль", "Интересы — ключ к карте", "Friend-Lock с первого дня"], "заполненные профили");
    stage(1, "ЭТАП 2 // ЖИЗНЬ СМЕНЫ", "4–8 ЯНВАРЯ", [4, 5, 6, 7, 8], "Барометр и стрики",
      ["Чек-ин атмосферы в 21:30", "Контакты — по Friend-Lock", "Монеты, стрики, лидерборд"], "ежедневные чек-ины");
    stage(2, "ЭТАП 3 // ФИНАЛ", "9 ЯНВАРЯ", [9], "Паспорт и курс",
      ["Награждаем активных ребят", "Паспорт успехов — родителям", "Курс со скидкой резидента"], "конверсию в курсы");
    connector(K, 0); connector(K, 1);
    s.addNotes("Мы предлагаем проверить идею на пилоте — на зимней смене со 2 по 9 января 2027 года в отеле AMAKS «Новая Истра». Второго и третьего января — заезд: ребята сканируют QR-код на бейдже, заполняют профиль и получают ключ к карте. С четвёртого по восьмое — жизнь смены: вечерний барометр, обмен контактами через Friend-Lock, монеты и лидерборд. Девятого января — финал: награждаем активных резидентов, а родители получают паспорт успехов и рекомендацию курса. На каждом этапе мы измеряем результат. Спасибо за внимание, я готов ответить на вопросы!");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
