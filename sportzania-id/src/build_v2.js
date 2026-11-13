// SPORTZANIA ID // THE RESIDENT PASSPORT — версия 2: «плакат-паспорт».
// У каждого слайда своя композиция вокруг одного крупного визуала; экраны взяты из макета интерфейса.
// Зависимости: npm install pptxgenjs sharp react react-dom react-icons
// Запуск: node build_v2.js <выходной.pptx> poster.jpg <путь к scripts/apply_theme.js из навыка pptx>
const pptxgen = require("pptxgenjs");
const { buildAssets2 } = require("./assets2.js");

const OUT = process.argv[2] || "SportZania_ID_v2.pptx";
const POSTER = process.argv[3];
const { applyTheme } = require(process.argv[4]);

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
  ["FaIdCard", "white"], ["FaRotateRight", "white"], ["FaHeart", "white"], ["FaShareNodes", "white"],
];

(async () => {
  const A = await buildAssets2(HEX, POSTER);
  const IC = {};
  for (const [n, t] of ICONS) IC[n + ":" + t] = await A.icon(n, t);
  const poster = "image/jpeg;base64," + require("fs").readFileSync(POSTER).toString("base64");

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
      { text: { text: "SK KIDS CHALLENGE 2026 // ТЕХНОПАРК «СКОЛКОВО»", options: { x: MX, y: 0.5, w: 5.5, h: 0.36, margin: 0, fontSize: 11, bold: true, color: WHITE, fill: { color: INK }, align: "center", valign: "middle", charSpacing: 1 } } },
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
      { text: { text: "/ 8", options: { x: 10.24, y: 0.42, w: 0.5, h: 0.36, margin: 0, fontSize: 14, bold: true, color: SLATE, align: "left", valign: "middle" } } },
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
    s.addText(typo("Единый цифровой паспорт резидента лагеря и онлайн-школы SportZania"), { placeholder: "lead" });

    // Паспортные поля вместо карточек
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

    // Макет интерфейса поверх кобальтового поля с глобусом
    const ix = 6.6, iy = 2.72, iw = 6.2, ih = iw * (941 / 1672);
    K.rect(ix, iy, iw, ih, { fill: WHITE, line: INK, lw: 2, shadow: 8, name: "рамка макета" });
    s.addImage({ data: poster, x: ix + 0.05, y: iy + 0.05, w: iw - 0.1, h: ih - 0.1, objectName: "Макет интерфейса паспорта", altText: "Макет интерфейса SportZania ID: профиль резидента, радар отряда, барометр дня, радар компетенций и лидерборд" });
    K.chip("МАКЕТ ИНТЕРФЕЙСА ПАСПОРТА", ix + 0.2, iy - 0.16, 2.75, 0.32, { fill: INK, cs: 1, line: WHITE });
    K.stamp("ВЕБ-ПРОТОТИП РАБОТАЕТ", 10.75, 6.72, 3.5, 0.5, WHITE, -3, 13);
    K.star(ix + iw - 0.3, iy - 0.3, 0.56, { fill: WHITE, line: INK, lw: 1.5, name: "искра" });
    s.addNotes("Здравствуйте! Меня зовут Фёдор Костарев, мне 11 лет, категория Middle. Я представляю проект SportZania ID — единый цифровой паспорт резидента для лагеря и онлайн-школы SportZania. Главная мысль проекта: смена не должна заканчиваться в день отъезда. Паспорт сохраняет навыки, проекты и друзей ребёнка и ведёт его дальше — в онлайн-школу. Справа — макет интерфейса, по нему я собрал работающий веб-прототип.");
  }

  // ====================== 2. ПРОБЛЕМА: было / стало ======================
  pres.addSection({ title: "Проблема" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Проблема" });
    const K = kit(s, "Проблема");
    head(s, "АНАЛИЗ РЫНКА И ПРЕДПОСЫЛКИ", "Куда исчезает прогресс ребёнка после смены?");
    const by = 2.08, bh = 2.56, bw = 5.45, ax = XR - bw;
    const wins = ["Собрал робота", "Победил в турнире", "Подтянул английский", "Нашёл друзей"];
    const slot = (x0, k) => [x0 + 0.25 + (k % 2) * 2.6, by + 0.82 + Math.floor(k / 2) * 0.82];

    // Было: день отъезда
    K.rect(MX, by, bw, bh, { fill: COBALT, line: INK, lw: 2, shadow: 6, name: "день отъезда" });
    K.chip("ДЕНЬ ОТЪЕЗДА", MX + 0.25, by + 0.24, 1.9, 0.34, { fill: INK, line: WHITE, size: 11, cs: 1 });
    K.text("всё получилось", MX + 2.3, by + 0.24, 2.9, 0.34, { size: 14, bold: true, color: WHITE });
    wins.forEach((t, k) => {
      const [x, y] = slot(MX, k);
      K.rect(x, y, 2.35, 0.6, { fill: WHITE, line: INK, lw: 1.5, shadow: 3, name: "достижение" });
      K.rect(x + 0.14, y + 0.16, 0.28, 0.28, { fill: GREEN, line: INK, lw: 1 });
      K.iconIn("FaCheck", "white", x + 0.14, y + 0.16, 0.28, 0.28, 0.15);
      K.text(t, x + 0.54, y, 1.78, 0.6, { size: 14, bold: true, name: "достижение" });
    });

    // Время идёт
    K.text("ЧЕРЕЗ\n2 МЕСЯЦА", MX + bw + 0.14, by + 0.62, ax - MX - bw - 0.2, 0.46, { size: 10.5, bold: true, align: "center", cs: 0.5, raw: true });
    K.hline(MX + bw + 0.2, by + bh / 2, ax - MX - bw - 0.36, { lw: 4, end: "triangle", name: "время" });

    // Стало: достижения исчезли
    K.rect(ax, by, bw, bh, { fill: CARD, tr: 35, line: INK, lw: 2, dash: "dash", name: "что осталось" });
    K.chip("ЧТО ОСТАЛОСЬ", ax + 0.25, by + 0.24, 1.9, 0.34, { color: INK, line: INK, size: 11, cs: 1 });
    K.text("грамота и фотографии", ax + 2.3, by + 0.24, 2.9, 0.34, { size: 14, bold: true, color: SLATE });
    wins.forEach((t, k) => {
      const [x, y] = slot(ax, k);
      K.text(t, x, y, 2.35, 0.6, { size: 14, bold: true, color: SILVER, strike: true, align: "center", line: SILVER, lw: 1.5, dash: "dash", name: "забытое достижение" });
    });
    K.rect(ax + 0.9, by + 1.25, 3.65, 0.74, { fill: PAPER, line: RED, lw: 3, rot: -6, name: "штамп" });
    K.text("НЕ ОЦИФРОВАНО", ax + 0.96, by + 1.31, 3.53, 0.62, { size: 22, bold: true, color: RED, align: "center", cs: 2, line: RED, lw: 0.75, rot: -6, name: "штамп" });

    // Три потери — строкой, без карточек
    const ry = 4.98, cw = 3.72, xs = [MX, MX + 4.3, MX + 8.6];
    K.hline(MX, ry, CW, { lw: 2 });
    [4.55, 8.85].forEach((x) => K.vline(x, ry + 0.18, 1.42, { color: SILVER, lw: 1 }));
    [
      ["РОДИТЕЛИ", "Платили за развитие — получили грамоту", "Рост гибких навыков не оцифрован и к осени забывается."],
      ["ПОДРОСТОК 11–14 ЛЕТ", "Проекты и друзья теряются в чатах", "Школьные портфолио казённые: сами подростки туда не заходят."],
      ["БИЗНЕС SPORTZANIA", "Лагерь и онлайн-школа живут врозь", "Между каникулами связь с лояльной семьёй обрывается."],
    ].forEach(([who, loss, why], k) => {
      K.rect(xs[k], ry + 0.24, 0.16, 0.16, { fill: RED, name: "маркер потери" });
      K.text(who, xs[k] + 0.28, ry + 0.19, cw - 0.28, 0.26, { size: 11, bold: true, color: RED, cs: 1.5 });
      K.text(loss, xs[k], ry + 0.5, cw, 0.66, { size: 18, bold: true, valign: "top" });
      K.text(why, xs[k], ry + 1.18, cw, 0.5, { size: 13.5, color: SLATE, valign: "top" });
    });
    s.addNotes("Мы начали с вопроса: куда исчезает прогресс ребёнка после смены? В день отъезда всё отлично: собрал робота, победил в турнире, подтянул английский, нашёл друзей. Но проходит пара месяцев — и остаются только грамота и фотографии, потому что ничего не оцифровано. Теряют все трое. Родители платили за развитие, а получили грамоту. Мы, подростки, не можем показать свои проекты, а контакты друзей тонут в чатах. А у SportZania лагерь и онлайн-школа живут отдельно, и между каникулами связь с семьёй обрывается.");
  }

  // ====================== 3. ПРИВАТНОСТЬ: экран + лестница доступа ======================
  pres.addSection({ title: "Решение" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Приватность");
    head(s, "ИННОВАЦИЯ ПРИВАТНОСТИ // 152-ФЗ", "Три уровня доступа: никакого сталкерства");
    const lw = 4.3;
    const fh = K.frame(A.crop.squad, MX, 2.42, lw, "ЭКРАН ИЗ МАКЕТА ПАСПОРТА", "Экран «Радар отряда»: карточки соотрядников с замками и кнопкой «Запрос в друзья»");
    K.text("Отряд видит аватар и хобби, а соцсети и телефон закрыты замком. Открыть их можно только взаимным запросом в друзья.", MX, 2.42 + fh + 0.22, lw, 1.05, { size: 15, color: SLATE, valign: "top" });
    K.stamp("ЗАЩИТА ДАННЫХ // 152-ФЗ", MX + 1.75, 6.3, 3.3, 0.46, GREEN, -3, 12.5);

    const lx = 5.2, rw = XR - lx, rh = 1.33;
    [
      ["1", "Карта лагеря", "Открытый контур: вся смена", ["Видно:", "аватар, хобби, отряд"], ["Скрыто:", "соцсети и телефоны"]],
      ["2", "Friend-Lock", "Контур доверия: взаимные друзья", ["Открыто:", "Telegram, TikTok, VK, телефон"], ["Закрыто:", "всем без взаимной дружбы"]],
      ["3", "Публичная ссылка", "Внешний контур: учителя, лицеи, олимпиады", ["Видно:", "радар навыков, проекты"], ["Скрыто:", "контакты, номер комнаты"]],
    ].forEach(([num, name, who, open, shut], k) => {
      const y = 2.15 + k * (rh + 0.18);
      K.rect(lx, y, rw, rh, { fill: CARD, line: INK, lw: 2, shadow: 5, name: "уровень " + num });
      K.rect(lx, y, 1.05, rh, { fill: COBALT, line: INK, lw: 2, name: "номер уровня" });
      K.text("УРОВЕНЬ", lx, y + 0.13, 1.05, 0.2, { size: 9.5, bold: true, color: WHITE, align: "center", cs: 1 });
      K.text(num, lx, y + 0.3, 1.05, 0.92, { size: 48, bold: true, color: WHITE, align: "center" });
      K.text(name, lx + 1.27, y + 0.14, 2.6, 0.42, { size: 19, bold: true });
      K.text(who, lx + 1.27, y + 0.6, 2.55, 0.6, { size: 12.5, color: SLATE, valign: "top" });
      K.vline(lx + 3.98, y + 0.16, rh - 0.32, { color: SILVER, lw: 1 });
      K.status(lx + 4.16, y + 0.15, rw - 4.36, GREEN, "FaCheck", open[0], open[1], { h: 0.48 });
      K.status(lx + 4.16, y + 0.71, rw - 4.36, RED, "FaLock", shut[0], shut[1], { h: 0.48 });
    });
    s.addNotes("Главный страх родителей и детей — что профиль увидят посторонние. Поэтому в паспорте три уровня доступа, и мы проектировали их с учётом закона о персональных данных, 152-ФЗ. Первый уровень — карта лагеря: вся смена видит аватар, хобби и отряд, а соцсети и телефоны скрыты. Второй уровень — Friend-Lock: контакты открываются, только когда оба участника подтвердили дружбу, как цифровое рукопожатие. Третий уровень — публичная ссылка: учителя и олимпиады видят только навыки и проекты, без контактов и номера комнаты. Слева — экран из макета: у каждого соотрядника замок и кнопка «Запрос в друзья».");
  }

  // ====================== 4. АДАПТАЦИЯ: шаги + большая карта ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Адаптация");
    head(s, "АДАПТАЦИЯ И НЕТВОРКИНГ", "«Общие вайбы»: свои находятся за 48 часов");
    K.text("48", MX, 1.98, 2.0, 1.3, { size: 96, bold: true, color: COBALT, raw: true, name: "48 часов" });
    K.text("ЧАСОВ", 2.42, 2.3, 1.9, 0.42, { size: 22, bold: true, cs: 3 });
    K.text("от заезда до своей команды", 2.44, 2.72, 1.9, 0.5, { size: 13, color: SLATE, valign: "top" });
    [
      ["Заполни профиль на 100%", "Цели, хобби и интересы — добровольно, а не для галочки"],
      ["Получи ключ к карте", "Ценностный обмен (Value Exchange) вместо скучной анкеты"],
      ["Найди своих по фильтру", "И отправь безопасный запрос в друзья"],
    ].forEach(([t, sub], k) => {
      const y = 3.72 + k * 0.94;
      K.text(String(k + 1), MX, y, 0.5, 0.5, { size: 18, bold: true, color: WHITE, fill: INK, align: "center", name: "шаг" });
      K.text(t, MX + 0.68, y - 0.04, 3.4, 0.34, { size: 16, bold: true });
      K.text(sub, MX + 0.68, y + 0.3, 3.4, 0.5, { size: 13, color: SLATE, valign: "top" });
    });

    // Карта лагеря — главный визуал
    const mx = 4.85, my = 2.1, mw = XR - mx, mh = 4.42;
    K.rect(mx, my, mw, mh, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "карта лагеря" });
    K.rect(mx, my, mw, 0.45, { fill: INK, line: INK, lw: 2 });
    K.img(A.hatch, mx + mw - 0.72, my + 0.06, 0.62, 0.33, "штриховка");
    K.text("ИНТЕРАКТИВНАЯ КАРТА ЛАГЕРЯ", mx + 0.22, my, 5, 0.45, { size: 11, bold: true, color: WHITE, cs: 1 });
    const fyy = my + 0.62;
    K.text("ФИЛЬТР", mx + 0.25, fyy, 0.75, 0.36, { size: 10, bold: true, cs: 1 });
    K.chip("Кто кодит на Python?", mx + 1.03, fyy, 2.0, 0.36, { fill: COBALT, size: 11, shadow: 3 });
    K.chip("Кто монтирует видео?", mx + 3.15, fyy, 2.0, 0.36, { fill: WHITE, color: INK, size: 11 });
    K.chip("Кто играет в баскетбол?", mx + 5.27, fyy, 2.25, 0.36, { fill: WHITE, color: INK, size: 11 });
    const fx = mx + 0.25, fy = my + 1.15, fw = mw - 0.5, fhh = 2.62;
    K.rect(fx, fy, fw, fhh, { fill: COBALT, line: INK, lw: 2, name: "поле карты" });
    const zw = (fw - 0.2 * 5) / 4, d = 0.4, hits = [[4], [0, 7], [5], [2]];
    for (let z = 0; z < 4; z++) {
      const zx = fx + 0.2 + z * (zw + 0.2), zy = fy + 0.2;
      K.rect(zx, zy, zw, fhh - 0.4, { fill: WHITE, tr: 88, line: WHITE, lw: 1.5, name: "отряд" });
      K.text("ОТРЯД " + (z + 1), zx + 0.13, zy + 0.07, zw - 0.2, 0.26, { size: 10.5, bold: true, color: WHITE, cs: 1 });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const k = r * 3 + c, x = zx + (zw - (3 * d + 0.16)) / 2 + c * (d + 0.08), y = zy + 0.42 + r * (d + 0.14);
        if (z === 1 && k === 4) { K.text("ВЫ", x, y, d, d, { size: 9.5, bold: true, color: WHITE, fill: INK, line: WHITE, lw: 1.5, align: "center", name: "ваш профиль" }); continue; }
        if (hits[z].includes(k)) { K.oval(x, y, d, { fill: WHITE, line: GREEN, lw: 3, name: "совпадение" }); K.iconIn("FaUser", "cobalt", x, y, d, d, 0.19); }
        else { K.oval(x, y, d, { fill: WHITE, tr: 80, line: WHITE, lw: 1, name: "резидент" }); K.iconIn("FaUser", "white", x, y, d, d, 0.16); }
      }
    }
    const ly = fy + fhh + 0.14;
    K.oval(fx, ly + 0.03, 0.24, { fill: WHITE, line: GREEN, lw: 2.5 });
    K.text("совпадение по фильтру", fx + 0.34, ly, 2.2, 0.3, { size: 11.5, bold: true });
    K.rect(fx + 2.75, ly + 0.03, 0.24, 0.24, { fill: INK });
    K.text("ваш профиль", fx + 3.09, ly, 1.4, 0.3, { size: 11.5, bold: true });
    K.icon("FaLock", "ink", fx + 4.62, ly + 0.05, 0.2);
    K.text("контакты — через Friend-Lock", fx + 4.92, ly, 2.6, 0.3, { size: 11.5, bold: true });
    s.addNotes("В первые дни в лагере многим страшно подойти и познакомиться. Мы придумали ценностный обмен: заполни цели, хобби и интересы на сто процентов — и получи ключ к карте отрядов. Никто не заставляет, ребята заполняют профиль сами, потому что хотят найти своих. На карте работают быстрые фильтры: кто кодит на Python, кто монтирует видео, кто играет в баскетбол. Карта подсвечивает единомышленников во всех отрядах, и уже за первые 48 часов у каждого появляется своя команда. Контакты при этом по-прежнему открываются только через Friend-Lock.");
  }

  // ====================== 5. АТМОСФЕРА: один ритуал — два результата ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Атмосфера");
    head(s, "АТМОСФЕРА И УДЕРЖАНИЕ", "Барометр дня: лагерь слышит каждый отряд");
    const lw = 4.6;
    const bh = K.frame(A.crop.barometer, MX, 2.42, lw, "ЭКРАН ИЗ МАКЕТА ПАСПОРТА", "Экран «Барометр дня»: ползунок от «Токсично» до «Имба»");
    const ty = 2.42 + bh + 0.2;
    K.text("21:30", MX, ty, 2.15, 0.82, { size: 52, bold: true, color: COBALT, raw: true });
    K.text("КАЖДЫЙ ВЕЧЕР", MX + 0.04, ty + 0.82, 2.1, 0.26, { size: 11, bold: true, color: SLATE, cs: 2 });
    K.text("Две минуты перед отбоем", MX + 2.4, ty + 0.02, lw - 2.4, 0.6, { size: 16, bold: true, valign: "top" });
    K.text("Ползунок на языке подростка — честно и без оценок.", MX + 2.4, ty + 0.64, lw - 2.4, 0.75, { size: 13, color: SLATE, valign: "top" });

    // Развилка: один чек-ин — два результата
    const jx = 5.52, ox = 5.98, y1 = 3.12, y2 = 5.43;
    K.hline(MX + lw + 0.08, 2.42 + bh / 2, jx - MX - lw - 0.08, { lw: 3, name: "развилка" });
    K.vline(jx, y1, y2 - y1, { lw: 3, name: "развилка" });
    K.hline(jx, y1, ox - jx - 0.06, { lw: 3, end: "triangle", name: "развилка" });
    K.hline(jx, y2, ox - jx - 0.06, { lw: 3, end: "triangle", name: "развилка" });

    // Результат для лагеря: тепловая карта
    const pw = 3.2, py = 2.15, ph = 1.95;
    K.rect(ox, py, pw, ph, { fill: WHITE, line: INK, lw: 2, shadow: 6, name: "тепловая карта" });
    K.text("ПУЛЬС ОТРЯДОВ", ox + 0.15, py + 0.08, 1.6, 0.24, { size: 10, bold: true, cs: 1 });
    const gx = ox + 0.95, cw = 0.27, g = 0.04, ch = 0.23;
    K.text("ДНИ СМЕНЫ", ox + pw - 1.25, py + 0.08, 1.1, 0.24, { size: 9.5, bold: true, color: SLATE, align: "right", cs: 0.5 });
    for (let c = 0; c < 7; c++) K.text(String(c + 2), gx + c * (cw + g), py + 0.36, cw, 0.2, { size: 9.5, bold: true, color: SLATE, align: "center", raw: true });
    const tone = [[GREEN, 0], [GREEN, 55], [RED, 55], [RED, 0]];
    [[1, 0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0, 0], [1, 1, 2, 2, 3, 3, 2]].forEach((row, r) => {
      const y = py + 0.6 + r * 0.3;
      K.text("Отряд " + (r + 1), ox + 0.15, y, 0.78, ch, { size: 10, bold: true });
      row.forEach((v, c) => K.rect(gx + c * (cw + g), y, cw, ch, { fill: tone[v][0], tr: tone[v][1], line: INK, lw: 0.75, name: "день" }));
    });
    K.rect(gx + 4 * (cw + g) - 0.03, py + 0.6 + 2 * 0.3 - 0.03, 2 * cw + g + 0.06, ch + 0.06, { line: INK, lw: 2.25, name: "сигнал" });
    K.chip("СИГНАЛ ВОЖАТОМУ: ОТРЯД 3", gx - 0.8, py + 1.58, 7 * cw + 6 * g + 0.8, 0.26, { fill: INK, size: 9.5, cs: 0.5 });
    const cx = ox + pw + 0.3, cwid = XR - cx;
    K.text("ДЛЯ ЛАГЕРЯ", cx, py + 0.02, cwid, 0.24, { size: 11, bold: true, color: COBALT, cs: 1.5 });
    K.text("Анонимная тепловая карта отрядов", cx, py + 0.3, cwid, 0.68, { size: 18, bold: true, valign: "top" });
    K.text("Растёт «токсично» — вожатый мягко гасит конфликт до звонков родителей.", cx, py + 1.02, cwid, 0.9, { size: 14, color: SLATE, valign: "top" });

    // Результат для резидента: стрики и лидерборд
    const qy = 4.35;
    K.frame(A.crop.leaders, ox, qy, pw, null, "Экран «Активность смены // Лидерборд»: места с первого по десятое и кубки");
    K.text("ДЛЯ РЕЗИДЕНТА", cx, qy + 0.02, cwid, 0.24, { size: 11, bold: true, color: COBALT, cs: 1.5 });
    K.text("Стрики, монеты и лидерборд Топ-10", cx, qy + 0.3, cwid, 0.68, { size: 18, bold: true, valign: "top" });
    K.text("Чек-ин продлевает стрик и приносит Zania Coins. Лидерборд поощряет вклад в проекты и взаимовыручку.", cx, qy + 1.02, cwid, 1.1, { size: 14, color: SLATE, valign: "top" });
    s.addNotes("Традиционную лагерную «свечку» мы превратили в двухминутный ритуал. Каждый вечер в 21:30 резидент двигает ползунок барометра: от «сегодня токсично» до «сегодня имба». Это честно и без оценок. У одного чек-ина два результата. Первый — для лагеря: руководство и психологи видят анонимную тепловую карту настроения отрядов. Если в одном отряде растёт «токсично», вожатый успевает помочь до того, как позвонят встревоженные родители. Второй — для самого резидента: чек-ин продлевает стрик и приносит монеты Zania Coins, а честный лидерборд Топ-10 поощряет проекты и взаимовыручку.");
  }

  // ====================== 6. ПРОДУКТ: разворот паспорта ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Решение" });
    const K = kit(s, "Продукт");
    head(s, "ПРОДУКТОВЫЙ КОНТУР", "Что внутри паспорта резидента");
    const bx = MX, by = 2.12, bw = 8.25, bh = 4.4, fold = bx + bw / 2;
    K.rect(bx, by, bw, bh, { fill: CARD, line: INK, lw: 2, shadow: 6, name: "разворот паспорта" });
    K.vline(fold, by, bh, { color: SILVER, lw: 1.5, dash: "dash", name: "сгиб" });
    const pageHead = (x, w, l, r) => {
      K.text(l, x, by + 0.12, w - 1.2, 0.26, { size: 10, bold: true, color: COBALT, cs: 1.5 });
      K.text(r, x + w - 1.2, by + 0.12, 1.2, 0.26, { size: 10, bold: true, color: SLATE, align: "right", cs: 1 });
      K.hline(x, by + 0.42, w, { lw: 1 });
    };
    // Левая страница: профиль
    const px = bx + 0.24, pw = bw / 2 - 0.48;
    pageHead(px, pw, "ПРОФИЛЬ РЕЗИДЕНТА", "ID #8492");
    const cw = 2.3, ch = cw * A.crop.profile.ratio, cy = by + 0.58;
    K.img(A.crop.profile.data, px, cy, cw, ch, "профиль", "Карточка профиля: @fedya_tech, уровень «Резидент 2027»");
    const sx = px + cw + 0.2, sw = pw - cw - 0.2;
    [["ОТРЯД", "2 · Новая Истра"], ["ИНТЕРЕСЫ", "Python, роботы, баскетбол, видео"], ["СТРИК", "7 дней подряд"]].forEach(([l, v], k) => {
      const y = cy + [0, 0.62, 1.7][k];
      K.text(l, sx, y, sw, 0.2, { size: 9.5, bold: true, color: COBALT, cs: 1 });
      K.text(v, sx, y + 0.21, sw, k === 1 ? 0.8 : 0.34, { size: 11.5, bold: true, valign: "top" });
    });
    K.img(A.crop.coins.data, sx, cy + ch - sw * A.crop.coins.ratio, sw, sw * A.crop.coins.ratio, "монеты", "Хромированная плашка: монеты Zania — 420");
    K.text(mrz("ID<8492<<FEDYA<TECH<<RESIDENT<2027", 34), px, by + bh - 0.42, pw, 0.24, { size: 10, bold: true, color: SLATE, font: MONO, cs: 1, raw: true, name: "машиночитаемая строка" });

    // Правая страница: радар, проекты, рекомендация
    const rx = fold + 0.56, rw = bx + bw - 0.24 - rx;
    pageHead(fold + 0.24, bw / 2 - 0.48, "КОМПЕТЕНЦИИ И ПРОЕКТЫ", "СМЕНА 2–9.01");
    s.addChart(pres.charts.RADAR, [{ name: "Оценка тьюторов", labels: ["Лидерство 92", "Технологии 87", "Команда 90", "Английский 78", "Спорт 85"], values: [92, 87, 90, 78, 85] }], {
      x: fold + 0.3, y: by + 0.46, w: bw / 2 - 0.5, h: 2.12,
      radarStyle: "filled", chartColors: [HEX.accent1], chartColorsOpacity: 30,
      catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25,
      valGridLine: { color: "94A3B8", size: 0.75 }, catGridLine: { style: "none" },
      showLegend: false, showTitle: false, showValue: false,
      objectName: "Радар 5D-компетенций", altText: "Радар компетенций: Лидерство 92, Технологии 87, Команда 90, Английский 78, Спорт 85",
    });
    const tyy = by + 2.66, trh = 0.42;
    [["FaRobot", "Робот-сортировщик", "тимлид"], ["FaVideo", "Фильм отряда", "монтажёр"]].forEach(([ic, t, role], k) => {
      const y = tyy + k * (trh + 0.08);
      K.rect(rx, y, rw, trh, { fill: WHITE, line: INK, lw: 1.5, shadow: 3, name: "проект" });
      K.rect(rx, y, trh, trh, { fill: TINT, line: INK, lw: 1.5 });
      K.iconIn(ic, "cobalt", rx, y, trh, trh, 0.24);
      K.text(t, rx + trh + 0.12, y, rw - trh - 1.2, trh, { size: 10.5, bold: true });
      K.text("роль: " + role, rx + rw - 1.12, y, 1.02, trh, { size: 9.5, color: SLATE, align: "right" });
    });
    const ry = by + 3.68;
    K.rect(rx, ry, rw, 0.56, { fill: TINT, line: COBALT, lw: 1.5, name: "рекомендация курса" });
    K.text("Python + Разговорный английский B1", rx + 0.12, ry, rw - 1.42, 0.56, { size: 10.5, bold: true });
    K.chip("СКИДКА РЕЗИДЕНТА", rx + rw - 1.2, ry + 0.09, 1.1, 0.38, { fill: GREEN, size: 9.5 });
    const marker = (num, x, y, d) => K.text(num, x, y, d, d, { size: d > 0.4 ? 15 : 12, bold: true, color: WHITE, align: "center", raw: true, name: "маркер " + num });
    const mk = (num, y) => { K.oval(fold + 0.1, y, 0.36, { fill: COBALT, line: INK, lw: 1.5, name: "маркер" }); marker(num, fold + 0.1, y, 0.36); };
    mk("1", by + 0.6); mk("2", tyy + 0.28); mk("3", ry + 0.1);

    // Пояснения справа
    const ex = 9.12, ew = XR - ex;
    [
      ["Радар 5D-компетенций", "Пять навыков оценивают тьюторы — по реальным проектам смены, а не по тестам."],
      ["Витрина проектов", "Фото робота, код, роль в команде. PDF-резюме для лицеев и олимпиад — в один клик."],
      ["Мост в онлайн-школу", "Паспорт рекомендует курс по сильным сторонам — со скидкой резидента."],
    ].forEach(([t, body], k) => {
      const y = 2.2 + k * 1.48;
      if (k) K.hline(ex, y - 0.16, ew, { color: SILVER, lw: 1 });
      K.oval(ex, y, 0.46, { fill: COBALT, line: INK, lw: 1.5, name: "маркер" }); marker(String(k + 1), ex, y, 0.46);
      K.text(t, ex + 0.62, y, ew - 0.62, 0.46, { size: 17, bold: true });
      K.text(body, ex + 0.62, y + 0.5, ew - 0.62, 0.8, { size: 13.5, color: SLATE, valign: "top" });
    });
    s.addNotes("Вот что внутри паспорта — как на развороте настоящего документа. Слева профиль резидента: отряд, интересы, стрик и монеты. Справа три главные части. Первая — радар пяти компетенций: лидерство, технологии, команда, английский и спорт. Оценки ставят тьюторы по реальным проектам, а не по тестам. Вторая — витрина проектов: фото робота, ссылка на код, моя роль в команде. Одним кликом паспорт собирает PDF-резюме для лицея или олимпиады. Третья — мост в онлайн-школу: паспорт видит сильные стороны и рекомендует курс, например Python и разговорный английский B1, со скидкой резидента.");
  }

  // ====================== 7. БИЗНЕС: круг вместо разовой продажи ======================
  pres.addSection({ title: "Бизнес и запуск" });
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Бизнес и запуск" });
    const K = kit(s, "Бизнес");
    head(s, "БИЗНЕС-МОДЕЛЬ И ЭФФЕКТ ДЛЯ SPORTZANIA", "Одна смена превращается в целый учебный год");
    const nw = 2.6, nh = 1.08, x1 = MX, x2 = 4.4, y1 = 2.15, y2 = 5.42;
    const node = (x, y, fill, icon, t, sub) => {
      K.rect(x, y, nw, nh, { fill, line: INK, lw: 2, shadow: 5, name: "звено круга" });
      K.icon(icon, "white", x + 0.18, y + 0.16, 0.34);
      K.text(t, x + 0.64, y + 0.12, nw - 0.74, 0.42, { size: 12.5, bold: true, color: WHITE, cs: 0.5 });
      K.text(sub, x + 0.2, y + 0.58, nw - 0.36, 0.42, { size: 11.5, color: WHITE, valign: "top" });
    };
    node(x1, y1, COBALT, "FaCampground", "СМЕНА В ЛАГЕРЕ", "первое знакомство с брендом");
    node(x2, y1, INK, "FaIdCard", "ПАСПОРТ РЕЗИДЕНТА", "навыки, проекты, барометр");
    node(x2, y2, COBALT, "FaGraduationCap", "ОНЛАЙН-ШКОЛА", "курс по рекомендации паспорта");
    node(x1, y2, GREEN, "FaRotateRight", "СЛЕДУЮЩАЯ СМЕНА", "семья возвращается");
    K.hline(x1 + nw + 0.16, y1 + nh / 2, x2 - x1 - nw - 0.3, { lw: 3.5, end: "triangle", name: "круг" });
    K.vline(x2 + nw / 2, y1 + nh + 0.2, y2 - y1 - nh - 0.34, { lw: 3.5, end: "triangle", name: "круг" });
    K.hline(x1 + nw + 0.14, y2 + nh / 2, x2 - x1 - nw - 0.3, { lw: 3.5, begin: "triangle", name: "круг" });
    K.vline(x1 + nw / 2, y1 + nh + 0.14, y2 - y1 - nh - 0.34, { lw: 3.5, begin: "triangle", name: "круг" });
    const cd = 1.72, ccx = (x1 + x2 + nw) / 2, ccy = (y1 + y2 + nh) / 2;
    K.oval(ccx - cd / 2, ccy - cd / 2, cd, { fill: WHITE, line: INK, lw: 2, shadow: 5, name: "LTV" });
    K.text("LTV", ccx - cd / 2, ccy - 0.56, cd, 0.6, { size: 32, bold: true, color: COBALT, align: "center" });
    K.text("растёт с каждым кругом", ccx - 0.62, ccy + 0.04, 1.24, 0.46, { size: 10.5, bold: true, color: SLATE, align: "center", valign: "top" });

    const rx = 7.4, rw = XR - rx;
    K.rect(rx, 2.15, rw, 1.86, { fill: COBALT, line: INK, lw: 2, shadow: 6, name: "главный показатель" });
    K.text("ПОВТОРНЫЕ ПРОДАЖИ", rx + 0.28, 2.27, 3, 0.24, { size: 10.5, bold: true, color: WHITE, cs: 1.5 });
    K.text("25–30%", rx + 0.26, 2.48, 3.3, 0.9, { size: 54, bold: true, color: WHITE, raw: true });
    K.text("семей продолжают учиться в онлайн-школе SportZania", rx + 0.28, 3.38, 3.5, 0.5, { size: 12.5, bold: true, color: WHITE, valign: "top" });
    K.stamp("ГИПОТЕЗА ПИЛОТА", rx + rw - 1.2, 2.86, 1.95, 0.44, WHITE, -8, 10.5);
    [
      ["FaHeart", "Меньше оттока семей (Churn Rate)", "Барометр ловит недовольство на смене, стрики и курсы держат связь весь год.", 4.22],
      ["FaShareNodes", "Виральный охват (UGC)", "Резиденты делятся паспортами и стриками в соцсетях — новые семьи приходят без рекламы.", 5.42],
    ].forEach(([icon, t, body, y]) => {
      K.rect(rx, y, rw, 1.08, { fill: CARD, line: INK, lw: 2, shadow: 5, name: "эффект" });
      K.rect(rx + 0.2, y + 0.22, 0.64, 0.64, { fill: INK, name: "значок" });
      K.iconIn(icon, "white", rx + 0.2, y + 0.22, 0.64, 0.64, 0.3);
      K.text(t, rx + 1.04, y + 0.1, rw - 1.2, 0.36, { size: 15, bold: true });
      K.text(body, rx + 1.04, y + 0.47, rw - 1.2, 0.54, { size: 12.5, color: SLATE, valign: "top" });
    });
    s.addNotes("Теперь о том, зачем это компании. Сейчас смена — разовая покупка. С паспортом получается круг: смена в лагере — паспорт резидента — онлайн-школа — следующая смена. С каждым кругом растёт LTV, то есть доход от одной семьи за всё время. Первый эффект — повторные продажи: наша цель на пилоте — чтобы 25–30 процентов семей продолжили учиться в онлайн-школе. Это гипотеза, и пилот её проверит. Второй эффект — меньше оттока: барометр помогает решать проблемы ещё на смене, а стрики держат связь весь год. Третий — охват: ребята сами делятся паспортами в соцсетях, и о SportZania узнают новые семьи.");
  }

  // ====================== 8. ДОРОЖНАЯ КАРТА: календарь смены ======================
  {
    const s = pres.addSlide({ masterName: "Плакат", sectionTitle: "Бизнес и запуск" });
    const K = kit(s, "Дорожная карта");
    head(s, "ДОРОЖНАЯ КАРТА MVP // AMAKS «НОВАЯ ИСТРА» 4★", "Пилот: зимняя смена 2–9 января 2027 года");
    const g = 0.12, tw = (CW - 7 * g) / 8, ty = 2.14, th = 1.2;
    const phaseOf = (d) => (d <= 3 ? 0 : d <= 8 ? 1 : 2);
    const fills = [COBALT, CARD, GREEN], inks = [WHITE, INK, WHITE];
    ["СБ", "ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"].forEach((wd, k) => {
      const d = k + 2, p = phaseOf(d), x = MX + k * (tw + g);
      K.rect(x, ty, tw, th, { fill: fills[p], line: INK, lw: 2, shadow: 4, name: "день смены" });
      K.text(wd, x, ty + 0.1, tw, 0.22, { size: 10.5, bold: true, color: inks[p], align: "center", cs: 1.5 });
      K.text(String(d), x, ty + 0.3, tw, 0.62, { size: 38, bold: true, color: p === 1 ? COBALT : inks[p], align: "center", raw: true });
      K.text("ЯНВАРЯ", x, ty + 0.9, tw, 0.2, { size: 9.5, bold: true, color: inks[p], align: "center", cs: 1 });
    });
    const span = (a, b) => [MX + (a - 2) * (tw + g), (b - a + 1) * tw + (b - a) * g];
    [[2, 3, COBALT], [4, 8, INK], [9, 9, GREEN]].forEach(([a, b, c]) => { const [x, w] = span(a, b); K.rect(x, ty + th + 0.2, w, 0.1, { fill: c, name: "этап" }); });

    const cols = [[MX, 3.3], [4.25, 4.2], [8.8, XR - 8.8]];
    [4.03, 8.58].forEach((x) => K.vline(x, 3.9, 2.6, { color: SILVER, lw: 1 }));
    [
      ["ЭТАП 1 // 2–3 ЯНВАРЯ", COBALT, "Онбординг и карта", ["QR-код на бейдже — профиль", "Интересы — ключ к карте", "Friend-Lock с первого дня"], "заполненные профили"],
      ["ЭТАП 2 // 4–8 ЯНВАРЯ", INK, "Барометр и стрики", ["Чек-ин атмосферы в 21:30", "Контакты — по Friend-Lock", "Монеты, стрики, лидерборд"], "ежедневные чек-ины"],
      ["ЭТАП 3 // 9 ЯНВАРЯ", GREEN, "Паспорт и курс", ["Награждаем активных ребят", "Паспорт успехов — родителям", "Курс со скидкой резидента"], "конверсию в курсы"],
    ].forEach(([label, c, title, steps, metric], k) => {
      const [x, w] = cols[k], y = 3.88;
      K.rect(x, y + 0.03, 0.26, 0.26, { fill: c, line: INK, lw: 1.5, name: "этап" });
      K.text(label, x + 0.38, y, w - 0.38, 0.32, { size: 11, bold: true, cs: 1.5 });
      K.text(title, x, y + 0.4, w, 0.44, { size: 20, bold: true });
      steps.forEach((t, i) => {
        const sy = y + 0.98 + i * 0.4;
        K.rect(x, sy + 0.04, 0.24, 0.24, { fill: GREEN, line: INK, lw: 1, name: "шаг" });
        K.iconIn("FaCheck", "white", x, sy + 0.04, 0.24, 0.24, 0.13);
        K.text(t, x + 0.36, sy, w - 0.36, 0.32, { size: 14.5, color: SLATE });
      });
      K.text("ИЗМЕРЯЕМ: " + metric, x, y + 2.26, Math.min(w, 3.4), 0.34, { size: 11, bold: true, color: COBALT, fill: TINT, line: COBALT, lw: 1, align: "center", name: "метрика" });
    });
    s.addNotes("Мы предлагаем проверить идею на пилоте — на зимней смене со 2 по 9 января 2027 года в отеле AMAKS «Новая Истра». Второго и третьего января — заезд: ребята сканируют QR-код на бейдже, заполняют профиль и получают ключ к карте. С четвёртого по восьмое — жизнь смены: вечерний барометр, обмен контактами через Friend-Lock, монеты и лидерборд. Девятого января — финал: награждаем активных резидентов, а родители получают паспорт успехов и рекомендацию курса. На каждом этапе мы измеряем результат: заполненные профили, ежедневные чек-ины и конверсию в курсы. Спасибо за внимание, я готов ответить на вопросы!");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
