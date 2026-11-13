// Растровые ассеты колоды: глобус-wireframe, штрихкод, штриховка, градиенты, иконки.
// Всё рисуется из SVG и переводится в PNG через sharp.
const sharp = require("sharp");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const fa = require("react-icons/fa6");

const toData = async (svg) =>
  "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");

// Каркасный глобус: меридианы и параллели сферы с наклоном, дальняя сторона — бледнее.
function globeSVG(hex, size = 720, sw = 5) {
  const R = size * 0.46, cx = size / 2, cy = size / 2;
  const tilt = (22 * Math.PI) / 180, spin = (18 * Math.PI) / 180;
  const proj = (lat, lon) => {
    const x = Math.cos(lat) * Math.sin(lon + spin), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon + spin);
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    return [cx + R * x, cy - R * y2, z2];
  };
  const curves = [];
  for (let k = 0; k < 6; k++) {
    const lon = (k * Math.PI) / 6, pts = [];
    for (let i = 0; i <= 120; i++) pts.push(proj(-Math.PI + (i * 2 * Math.PI) / 120, lon));
    curves.push(pts);
  }
  for (const deg of [-60, -30, 0, 30, 60]) {
    const lat = (deg * Math.PI) / 180, pts = [];
    for (let i = 0; i <= 120; i++) pts.push(proj(lat, (i * 2 * Math.PI) / 120));
    curves.push(pts);
  }
  let front = "", back = "";
  for (const pts of curves) {
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1, z1] = pts[i - 1], [x2, y2, z2] = pts[i];
      const seg = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
      if (z1 + z2 >= 0) front += seg; else back += seg;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<g fill="none" stroke="#${hex}" stroke-linecap="round">
<path d="${back}" stroke-width="${sw * 0.6}" opacity="0.38"/>
<path d="${front}" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${R}" stroke-width="${sw * 1.3}"/>
</g></svg>`;
}

// Ретро-штрихкод: ширины штрихов выводятся из строки, поэтому рисунок всегда один и тот же.
function barcodeSVG(hex, seed = "SKOLKOVO-2026-SPORTZANIA-ID") {
  const H = 120;
  let x = 0, bars = "";
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    const w = [4, 10, 6, 14][c % 4], g = [5, 8, 4][(c >> 2) % 3];
    bars += `<rect x="${x}" y="0" width="${w}" height="${H}" fill="#${hex}"/>`;
    x += w + g;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${H}" viewBox="0 0 ${x} ${H}">${bars}</svg>`;
}

// Диагональная штриховка для плашек карточек.
function hatchSVG(hex, n = 5) {
  const H = 120, bw = 26, gap = 20, skew = 46, W = n * (bw + gap) + skew;
  let p = "";
  for (let i = 0; i < n; i++) {
    const x = i * (bw + gap);
    p += `<polygon points="${x + skew},0 ${x + skew + bw},0 ${x + bw},${H} ${x},${H}" fill="#${hex}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`;
}

const gradientSVG = (stops, w, h, angle = 0) => {
  const a = (angle * Math.PI) / 180;
  const x2 = Math.cos(a), y2 = Math.sin(a);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}">
${stops.map(([o, c]) => `<stop offset="${o}" stop-color="#${c}"/>`).join("")}
</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`;
};

// Мини-радар для макета публичной визитки.
function miniRadarSVG(hex, vals = [92, 87, 90, 78, 85]) {
  const S = 400, c = S / 2, R = 170;
  const pt = (i, r) => {
    const a = ((Math.PI * 2) / 5) * i - Math.PI / 2;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  };
  let g = "";
  for (let l = 1; l <= 4; l++) g += `<polygon points="${[0, 1, 2, 3, 4].map((i) => pt(i, (R / 4) * l)).join(" ")}" fill="none" stroke="#94A3B8" stroke-width="4"/>`;
  for (let i = 0; i < 5; i++) g += `<line x1="${c}" y1="${c}" x2="${pt(i, R).split(",")[0]}" y2="${pt(i, R).split(",")[1]}" stroke="#0A0F1D" stroke-width="4"/>`;
  g += `<polygon points="${vals.map((v, i) => pt(i, (R * v) / 100)).join(" ")}" fill="#${hex}" fill-opacity="0.3" stroke="#${hex}" stroke-width="10" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${g}</svg>`;
}

async function buildAssets(HEX) {
  const A = { icons: {} };
  A.globeCobalt = await toData(globeSVG(HEX.accent1));
  A.globeInk = await toData(globeSVG(HEX.dk1));
  A.barcode = await toData(barcodeSVG(HEX.dk1));
  A.hatch = await toData(hatchSVG(HEX.accent1));
  A.track = await toData(gradientSVG([[0, HEX.accent3], [0.5, "FDE68A"], [1, HEX.accent2]], 1200, 64));
  A.chrome = await toData(gradientSVG([[0, "FFFFFF"], [0.35, "CBD5E1"], [0.7, "94A3B8"], [1, "FFFFFF"]], 800, 360, 35));
  A.miniRadar = await toData(miniRadarSVG(HEX.accent1));

  const tones = { white: "FFFFFF", ink: HEX.dk1, cobalt: HEX.accent1, green: HEX.accent2, red: HEX.accent3 };
  A.icon = async (name, tone) => {
    const key = name + ":" + tone;
    if (!A.icons[key]) {
      if (!fa[name]) throw new Error("Нет иконки " + name);
      const svg = renderToStaticMarkup(React.createElement(fa[name], { size: 320 })).replace(/currentColor/g, "#" + tones[tone]);
      A.icons[key] = await toData(svg);
    }
    return A.icons[key];
  };
  return A;
}

module.exports = { buildAssets, globeSVG, barcodeSVG, hatchSVG, gradientSVG };
