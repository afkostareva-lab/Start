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
# Заглушка в питьевое отверстие крышки (овал). Подгоните под свои крышки!
PLUG_LEN, PLUG_W, PLUG_DEPTH = 10.2, 4.2, 7.0   # длина, ширина, глубина входа в крышку
POCKET_GAP = 0.2      # зазор гнезда под заглушку в основании (на сторону)
POCKET_H = 3.0        # глубина гнезда в основании
OUT = os.path.dirname(os.path.abspath(__file__))

xs = np.arange(-13.875, 13.8, VOX, dtype=np.float32)
ys = np.arange(-14.075, 12.0, VOX, dtype=np.float32)
zs = np.arange(-0.675, 36.0, VOX, dtype=np.float32)
X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")

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
base = I(ell((0, -1, 0), (12, 11, 1e3)), Z - 2.4)
base = I(base, (np.sqrt((X/12)**2 + ((Y+1)/11)**2) - 1)*11 + (Z - 1.6))  # фаска сверху
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
# --- гнездо под заглушку снизу
pocket = I(stadium(PLUG_LEN + 2*POCKET_GAP, PLUG_W + 2*POCKET_GAP), Z - POCKET_H)

floor = -Z
def cut(a, *others):
    for o in others: a = I(a, -o)
    return a
parts = {
    "red_hat":    I(cut(hat, eyes, beak), floor),
    "orange":     I(cut(orange, eyes), floor),
    "white":      I(cut(white, eyes, orange, hat), floor),
}
everything = I(U(U(black_all, hat), U(orange, eyes)), floor)
parts["black"] = cut(everything, parts["red_hat"], parts["orange"], parts["white"], pocket)
solid = cut(everything, pocket)

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

if __name__ == "__main__":
    targets = {"black": 120000, "red_hat": 150000, "white": 40000, "orange": 30000}
    for name, sdf in parts.items():
        m = mesh(sdf, targets[name])
        m.export(os.path.join(OUT, f"penguin_{name}.stl"))
        print(name, len(m.faces), "tris, watertight:", m.is_watertight, "bodies:", m.body_count,
              "bounds:", np.round(m.bounds, 1).tolist())
    m = mesh(solid, 250000)
    m.export(os.path.join(OUT, "penguin_single_color.stl"))
    print("single", len(m.faces), m.is_watertight, np.round(m.bounds, 1).tolist())
    # заглушка: печатается отдельно, вклеивается в гнездо
    H = POCKET_H - 0.2 + PLUG_DEPTH
    taper = np.clip((Z - (H - 2.0))/2.0, 0, 1)*0.7       # сужение на конце
    plug = I(I(stadium(PLUG_LEN, PLUG_W) + taper, Z - H), floor)
    m = mesh(plug)
    m.export(os.path.join(OUT, "plug.stl"))
    print("plug", len(m.faces), m.is_watertight, np.round(m.bounds, 1).tolist())
    np.save("/tmp/labels.npy" if len(sys.argv) < 2 else sys.argv[1],
            np.stack([parts[k] for k in ("black", "white", "orange", "red_hat")]).astype(np.float16))
