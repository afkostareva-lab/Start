#!/usr/bin/env python3
"""Пингвин-топпер для кофейного стаканчика. Генерирует STL по цветам.
Запуск: python3 make_penguin.py   (нужны numpy, scikit-image, trimesh, fast-simplification)
Все размеры в мм. Пингвин смотрит в сторону -Y, Z вверх."""
import os, sys
import numpy as np
from skimage import measure
import trimesh

VOX = 0.15            # шаг сетки, мм (меньше = глаже и тяжелее файл)
SCALE = 1.0           # общий масштаб фигурки
# Круглый выступ снизу — вставляется в углубление на крышке. Подгоните под свои крышки!
PEG_D = 12.0          # диаметр выступа, мм (= диаметр углубления минус ~0.2)
PEG_H = 4.0           # высота выступа, мм
BASE_RX, BASE_RY = 11.0, 10.5                 # полуоси овальной площадки под пингвином
LIFT = PEG_H + (max(BASE_RX, BASE_RY) - PEG_D/2) - 1.4   # подъём фигурки над столом
OUT = os.path.dirname(os.path.abspath(__file__))

xs = np.arange(-13.875, 13.8, VOX, dtype=np.float32)
ys = np.arange(-14.075, 12.0, VOX, dtype=np.float32)
zs = np.arange(-0.675, 36.0 + LIFT, VOX, dtype=np.float32)
X, Y, ZG = np.meshgrid(xs, ys, zs, indexing="ij")
Z = ZG - LIFT           # координата Z в системе пингвина (верх площадки = 2.4)

def ell(c, r):
    """Приближённое SDF эллипсоида."""
    k = np.sqrt(((X-c[0])/r[0])**2 + ((Y-c[1])/r[1])**2 + ((Z-c[2])/r[2])**2)
    return (k - 1.0) * min(r)
def sph(c, r): return np.sqrt((X-c[0])**2 + (Y-c[1])**2 + (Z-c[2])**2) - r
def smin(a, b, k):
    h = np.clip(0.5 + 0.5*(b-a)/k, 0, 1)
    return b + (a-b)*h - k*h*(1-h)
U = np.minimum
I = np.maximum
def stadium(L, W):   # 2D-овал (стадион) в плане XY
    r = W/2
    return np.sqrt(np.maximum(np.abs(X)-(L/2-r), 0)**2 + Y**2) - r

HEAD = (0, 0, 20.5)
# --- основание
e2 = (np.sqrt((X/BASE_RX)**2 + ((Y+1)/BASE_RY)**2) - 1)*min(BASE_RX, BASE_RY)
rho = np.sqrt(X**2 + (Y+1)**2)
base = I(I(e2, Z - 2.4), e2 + (Z - 1.6))                 # площадка с фаской сверху
base = I(base, PEG_H + np.maximum(rho - PEG_D/2, 0) - ZG)  # низ — воронка 45°, без поддержек
peg_r = PEG_D/2 - 0.4*np.clip((1.2 - ZG)/1.2, 0, 1)       # заходная фаска на конце
base = U(base, I(rho - peg_r, ZG - PEG_H - 0.5))
# --- тело + голова + крылья + хвост
body = ell((0, 0.5, 9.5), (9, 8, 10))
head = sph(HEAD, 8.0)
torso = smin(body, head, 3.0)
for s in (-1, 1):
    wx = X - s*8.7 - s*0.25*(10.5 - Z)      # крыло слегка оттопырено книзу
    wing = (np.sqrt((wx/2.1)**2 + ((Y-0.3)/3.8)**2 + ((Z-10.5)/5.8)**2) - 1)*2.1
    torso = smin(torso, wing, 1.2)
torso = smin(torso, ell((0, 8.2, 4.5), (2.5, 2.5, 2.2)), 1.5)
black_all = smin(torso, base, 1.5)
# --- белые зоны (вровень с поверхностью)
belly = ell((0, -6.5, 9.5), (6.3, 5.5, 7.6))
face = U(sph((-2.9, -6.3, 20.0), 4.3), sph((2.9, -6.3, 20.0), 4.3))
white = I(I(smin(belly, face, 0.8), 2.4 - Z), black_all)
# --- глаза, клюв, лапы
eyes = U(sph((-3.0, -7.35, 20.9), 1.45), sph((3.0, -7.35, 20.9), 1.45))
beak = ell((0, -8.2, 18.6), (1.9, 2.6, 1.3))
feet = U(ell((-4.6, -7.6, 3.3), (2.9, 3.6, 1.7)), ell((4.6, -7.6, 3.3), (2.9, 3.6, 1.7)))
orange = U(beak, feet)
# --- шапка с «вязкой»
th = np.arctan2(Y - HEAD[1], X - HEAD[0])
zrel = Z - (22.2 - 0.12*Y)                     # плоскость края шапки, спереди выше
knit = 0.28*np.cos(14*th + 1.7*Z)*np.cos(14*th - 1.7*Z)
crown = sph(HEAD, 9.1) - knit
ribs = 0.32*np.cos(30*th)
brim = I(sph(HEAD, 10.1) - ribs, zrel - 5.2)
hat = smin(crown, brim, 0.6)
pom = sph((0, 0.3, 31.6), 3.1) - 0.3*np.cos(5*X)*np.cos(5*Y)*np.cos(5*Z)
hat = smin(hat, pom, 0.8)
dh = np.maximum(sph(HEAD, 8.0), 0)
hat = I(hat, -(zrel - 0.95*dh))                # низ отворота под 45° — печать без поддержек
floor = -ZG
def cut(a, *others):
    for o in others: a = I(a, -o)
    return a
parts = {
    "red_hat":    I(cut(hat, eyes, beak), floor),
    "orange":     I(cut(orange, eyes), floor),
    "white":      I(cut(white, eyes, orange, hat), floor),
}
everything = I(U(U(black_all, hat), U(orange, eyes)), floor)
parts["black"] = cut(everything, parts["red_hat"], parts["orange"], parts["white"])
solid = everything

def mesh(sdf, target=None):
    v, f, _, _ = measure.marching_cubes(sdf, 0.0, spacing=(VOX, VOX, VOX))
    v += np.array([xs[0], ys[0], zs[0]])
    m = trimesh.Trimesh(v, f, process=True)
    keep = [c for c in m.split(only_watertight=False) if abs(c.volume) > 0.3]   # убрать микро-осколки
    m = trimesh.util.concatenate(keep)
    if target and len(m.faces) > target:
        d = m.simplify_quadric_decimation(face_count=target)
        if d.is_watertight or not m.is_watertight: m = d   # не портить замкнутость упрощением
    m.apply_scale(SCALE)
    return m

COLORS = {"black": "#1A1A1A", "white": "#FFFFFF", "orange": "#FF8C1A", "red_hat": "#D81E28"}
def write_3mf(path, meshes):
    """Один объект из 4 частей (по цветам) в одном файле 3MF."""
    import zipfile
    names = list(meshes)
    x = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<model unit="millimeter" xml:lang="ru" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">',
         '<resources>', '<basematerials id="1">']
    x += [f'<base name="{n}" displaycolor="{COLORS[n]}"/>' for n in names]
    x.append('</basematerials>')
    for i, n in enumerate(names):
        m = meshes[n]
        x.append(f'<object id="{i+2}" name="{n}" type="model" pid="1" pindex="{i}"><mesh><vertices>')
        x += [f'<vertex x="{a:.3f}" y="{b:.3f}" z="{c:.3f}"/>' for a, b, c in m.vertices]
        x.append('</vertices><triangles>')
        x += [f'<triangle v1="{a}" v2="{b}" v3="{c}"/>' for a, b, c in m.faces]
        x.append('</triangles></mesh></object>')
    x.append('<object id="100" name="penguin_topper" type="model"><components>')
    x += [f'<component objectid="{i+2}"/>' for i in range(len(names))]
    x += ['</components></object>', '</resources>', '<build><item objectid="100"/></build>', '</model>']
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr("3D/3dmodel.model", "\n".join(x))

if __name__ == "__main__":
    targets = {"black": 80000, "red_hat": 100000, "white": 30000, "orange": 20000}
    meshes = {}
    for name, sdf in parts.items():
        m = meshes[name] = mesh(sdf, targets[name])
        m.export(os.path.join(OUT, f"penguin_{name}.stl"))
        print(name, len(m.faces), "tris, watertight:", m.is_watertight, "bodies:", m.body_count,
              "bounds:", np.round(m.bounds, 1).tolist())
    m = mesh(solid, 250000)
    m.export(os.path.join(OUT, "penguin_single_color.stl"))
    print("single", len(m.faces), m.is_watertight, np.round(m.bounds, 1).tolist())
    write_3mf(os.path.join(OUT, "penguin_multicolor.3mf"), meshes)
    np.save("/tmp/labels.npy" if len(sys.argv) < 2 else sys.argv[1],
            np.stack([parts[k] for k in ("black", "white", "orange", "red_hat")]).astype(np.float16))
