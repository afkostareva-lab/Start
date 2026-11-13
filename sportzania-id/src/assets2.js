// Ассеты второй версии: бумага с точечной сеткой, белый глобус и штрихкод,
// экраны, вырезанные из утверждённого макета интерфейса (плаката).
const sharp = require("sharp");
const base = require("./assets.js");

const png = async (svg) => "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");

// Кремовая бумага с точечной сеткой, как на фоне веб-прототипа
function paperSVG(hex, dot) {
  const W = 2000, H = 1125, step = 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><pattern id="d" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${step / 2}" cy="${step / 2}" r="1.5" fill="#${dot}"/></pattern></defs>
<rect width="${W}" height="${H}" fill="#${hex}"/><rect width="${W}" height="${H}" fill="url(#d)"/></svg>`;
}

// Области макета 1672x941, из которых берутся экраны
const CROPS = {
  profile: [18, 128, 434, 572],
  coins: [18, 708, 434, 182],
  squad: [470, 130, 622, 322],
  barometer: [1098, 140, 557, 312],
  leaders: [1070, 476, 585, 396],
};

async function buildAssets2(HEX, posterPath) {
  const A = await base.buildAssets(HEX);
  A.paper = await png(paperSVG(HEX.lt1, "DDD7C9"));
  A.barcodeWhite = await png(base.barcodeSVG("FFFFFF"));
  // Большой белый глобус для обложки: заранее обрезан по краям слайда
  const G = 1400;
  const globe = await sharp(Buffer.from(base.globeSVG("FFFFFF", G, 5))).png().toBuffer();
  A.globeCover = "image/png;base64," + (await sharp(globe).extract({ left: 0, top: 255, width: 1089, height: 1145 }).png().toBuffer()).toString("base64");
  A.crop = {};
  for (const [k, [left, top, width, height]] of Object.entries(CROPS)) {
    const buf = await sharp(posterPath).extract({ left, top, width, height })
      .resize({ width: width * 2, kernel: "lanczos3" }).sharpen({ sigma: 0.7 }).jpeg({ quality: 90 }).toBuffer();
    A.crop[k] = { data: "image/jpeg;base64," + buf.toString("base64"), ratio: height / width };
  }
  return A;
}

module.exports = { buildAssets2 };
