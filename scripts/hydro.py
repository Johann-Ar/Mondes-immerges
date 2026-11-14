"""
Textures de l'eau du globe (équirectangulaires, nord en haut) :
  rivers.png (4096×2048) : le réseau des eaux douces, tracé en lignes fines sur les terres
    R     les fleuves (Natural Earth, rangs 0 à 8 : des plus grands à la Dordogne), épaisseur selon le rang
    G, B  phase de l'écoulement (sin, cos) : distance à la mer le long du réseau (parcours en largeur depuis
          les embouchures) ; le globe y fait descendre l'encre vers l'aval, et les splats en tirent leur sens
  river-seeds.bin : 32 768 points de départ (uint16 x, y en uv) des splats fluviaux
  depth.jpg (2048×1024, niveaux de gris)
    profondeur de l'océan, 0 sur les terres, 1 vers 7 000 m (ETOPO, racine : les plateaux restent lisibles)
Sources : Natural Earth, Rivers + lake centerlines 1:10 M (domaine public) ;
          NOAA ETOPO1 (domaine public).
Usage : python scripts/hydro.py <ne_10m_rivers_lake_centerlines (sans extension)> <etopo.nc> public/textures
        (numpy, scipy, pillow)
"""
import sys
from collections import deque
import struct

import numpy as np
from PIL import Image, ImageDraw
from scipy.io import netcdf_file
from scipy.ndimage import binary_dilation, distance_transform_edt, gaussian_filter, label, minimum_position, zoom

W, H = 4096, 2048
rivers, etopo, out = sys.argv[1:4]


def dbf(path):
    """Attributs d'un shapefile (format dBase), sans dépendance."""
    b = open(path, 'rb').read()
    n, hl, rl = struct.unpack('<IHH', b[4:12])
    fields, o = [], 32
    while b[o] != 0x0D:
        fields.append((b[o : o + 11].split(b'\0')[0].decode(), b[o + 16]))
        o += 32
    rows = []
    for i in range(n):
        r, d, p = b[hl + i * rl + 1 : hl + (i + 1) * rl], {}, 0
        for name, ln in fields:
            d[name] = r[p : p + ln].decode('utf-8', 'replace').strip('\0 ')
            p += ln
        rows.append(d)
    return rows


def shp(path):
    """Polylignes d'un shapefile : une liste de tableaux (lon, lat) par enregistrement."""
    b, o, out = open(path, 'rb').read(), 100, []
    while o < len(b):
        clen = struct.unpack('>i', b[o + 4 : o + 8])[0]
        rec = b[o + 8 : o + 8 + clen * 2]
        o += 8 + clen * 2
        if struct.unpack('<i', rec[:4])[0] == 0:
            out.append([])
            continue
        n_parts, n_pts = struct.unpack('<ii', rec[36:44])
        parts = list(np.frombuffer(rec[44 : 44 + 4 * n_parts], '<i4')) + [n_pts]
        pts = np.frombuffer(rec[44 + 4 * n_parts : 44 + 4 * n_parts + 16 * n_pts], '<f8').reshape(-1, 2)
        out.append([pts[a:e] for a, e in zip(parts[:-1], parts[1:])])
    return out


# Fleuves : tracés continus de Natural Earth (1:10 M), du rang 0 (Nil, Amazone…) au rang 8 (Dordogne…).
# Les rivières plus petites sont laissées de côté. Épaisseur et intensité suivent le rang ; dessin à
# résolution ×4 puis réduit, pour des bords lissés et des fleuves fins.
S = 4
canvas = Image.new('L', (W * S, H * S), 0)
draw = ImageDraw.Draw(canvas)
for row, lines in zip(dbf(rivers + '.dbf'), shp(rivers + '.shp')):
    rank = int(row['scalerank'] or 99)
    if rank > 8 or not row['featurecla'].startswith('River'):  # ni canaux, ni lignes au milieu des lacs
        continue
    width = max(2, round((1.2 - rank * 0.085) * S))  # de 1,2 pixel (rang 0) à 0,5 pixel (rang 8)
    value = round(255 * (1.0 - rank * 0.04))
    for line in lines:
        x = (line[:, 0] + 180) / 360 * W * S
        y = (90 - line[:, 1]) / 180 * H * S
        for k in range(len(x) - 1):
            if abs(x[k + 1] - x[k]) > W * S / 2:  # traversée du méridien 180° : segment ignoré
                continue
            draw.line([(x[k], y[k]), (x[k + 1], y[k + 1])], fill=value, width=width)
R = np.array(canvas.resize((W, H), Image.BOX), dtype='f4') / 255
R = np.clip(R * 2.4, 0, 1)  # un tracé d’un demi-pixel reste plein, sans pointillés aux diagonales

# Profondeur
f = netcdf_file(etopo, mmap=False)
z = f.variables['altitude'][:].astype('f4')
if f.variables['latitude'][0] < f.variables['latitude'][-1]:
    z = z[::-1]
z = z[:, :-1]
z = zoom(z, (H / z.shape[0], W / z.shape[1]), order=1)
G = np.sqrt(np.clip(-z / 7000, 0, 1))
G = gaussian_filter(G, 0.8) * (z < 0)
# Embouchures : le tracé Natural Earth s'arrête souvent avant la côte ETOPO (jusqu'à ~50 km). Chaque bout de
# fleuve proche de la mer est prolongé jusqu'à elle par un estuaire qui s'évase, et mord un peu sur la mer
# pour se fondre dans le noir de l'océan.
# la côte visée est celle qu'affiche le globe (seuil de depth.jpg), pas le zéro ETOPO : les hauts-fonds y restent de la terre
shown = G > 0.045
ds, (iy, ix) = distance_transform_edt(~shown, return_indices=True)
ends, n = label((R > 0.12) & (ds <= 16), structure=np.ones((3, 3)))
mouth = Image.new('L', (W * S, H * S), 0)
pen = ImageDraw.Draw(mouth)
for y, x in minimum_position(ds, ends, range(1, n + 1)) if n else []:
    sy, sx = iy[y, x], ix[y, x]
    a, b = np.array([x, y], 'f4') + 0.5, np.array([sx, sy], 'f4') + 0.5
    b = b + (b - a) / max(np.hypot(*(b - a)), 1) * 3  # 3 pixels dans la mer
    v = R[y, x]
    steps = max(2, int(np.hypot(*(b - a)) * 2))
    for k in range(steps):
        t0, t1 = k / steps, (k + 1) / steps
        p0, p1 = a + (b - a) * t0, a + (b - a) * t1
        w = max(2, round((0.6 + 1.0 * t1**2) * S))  # étroit en amont, large à la mer
        pen.line([tuple(p0 * S), tuple(p1 * S)], fill=round(255 * v), width=w)
M = np.clip(np.array(mouth.resize((W, H), Image.BOX), dtype='f4') / 255 * 1.6, 0, 1)
R = np.maximum(R, M)
R *= ~shown | (M > 0)  # pas d'eau douce en mer, sauf l'estuaire

u8 = lambda a: (a * 255 + 0.5).astype('u1')
Image.fromarray(u8(G)).resize((W // 2, H // 2), Image.BOX).save(f'{out}/depth.jpg', quality=90, optimize=True)

# Réseau et sens d'écoulement
net = R > 0.12
sea = z < 0
dist = np.full((H, W), -1, 'i4')
q = deque()
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
# embouchures : le tracé Natural Earth s'arrête souvent quelques pixels avant la côte ETOPO ; tout point du
# réseau à moins de 8 pixels de la mer en fait office
coastal = binary_dilation(sea, iterations=8) & ~sea
for y, x in zip(*np.nonzero(net & coastal)):
    dist[y, x] = 0
    q.append((y, x))
# un tracé peut s'arrêter juste avant la côte ou se couper à une confluence : on franchit les petites coupures (3 pixels) pour que les
# affluents restent reliés à la mer
bridge = binary_dilation(net, iterations=3) & ~sea
while q:
    y, x = q.popleft()
    for dy, dx in N8:
        yy, xx = y + dy, (x + dx) % W
        if 0 <= yy < H and bridge[yy, xx] and dist[yy, xx] < 0:
            dist[yy, xx] = dist[y, x] + 1
            q.append((yy, xx))
# Bassins fermés (Okavango, Amou-Daria, fleuves qui finissent dans un lac sans issue) : chaque morceau du réseau
# non relié à la mer s'écoule vers son point le plus bas, pour que tous les grands fleuves soient dessinés
to_sea = dist >= 0
lab, n = label(bridge & (dist < 0), structure=np.ones((3, 3)))
if n:
    low = minimum_position(z, lab, range(1, n + 1))
    for y, x in low:
        dist[y, x] = 0
        q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in N8:
            yy, xx = y + dy, (x + dx) % W
            if 0 <= yy < H and bridge[yy, xx] and dist[yy, xx] < 0:
                dist[yy, xx] = dist[y, x] + 1
                q.append((yy, xx))
# Phase de l'écoulement : distance à la mer le long du réseau, enroulée (sin, cos) pour être interpolée sans
# saut ; le shader fait descendre des impulsions d'encre vers l'aval. Bassins fermés : présence seule, sans impulsion.
P = 40  # période, en pixels
phase = 2 * np.pi * dist / P
reach = (dist >= 0).astype('f4')
ps = gaussian_filter(np.sin(phase) * reach, 0.7) / np.maximum(gaussian_filter(np.maximum(reach, net), 0.7), 1e-4)
pc = gaussian_filter(np.cos(phase) * reach, 0.7) / np.maximum(gaussian_filter(np.maximum(reach, net), 0.7), 1e-4)
# tracé adouci comme le relief des lacs : un profil en cloche plutôt qu'un trait d'un pixel, dont la courbe de
# niveau reste lisse une fois interpolée par la carte graphique (pas de bords en escalier ni de coupures)
soft = np.clip(gaussian_filter(R, 0.9) * 2.2, 0, 1) * binary_dilation(net, iterations=3)
img = np.stack([soft, ps * 0.5 + 0.5, pc * 0.5 + 0.5], -1)  # tracé des fleuves
Image.fromarray(u8(np.clip(img, 0, 1))).save(f'{out}/rivers.png', optimize=True)

# Points de départ des splats fluviaux : sur les fleuves atteints depuis la mer, répartis sur tout le réseau
w = ((R > 0.06) * net).ravel().astype("f8")  # uniforme sur tout le réseau, bassins fermés compris : tout lit noir a ses splats
idx = np.random.default_rng(7).choice(w.size, 32768, p=w / w.sum())
sy, sx = np.divmod(idx, W)
seeds = np.stack([(sx + 0.5) / W, 1 - (sy + 0.5) / H], -1)  # uv, nord en v = 1
(seeds * 65535 + 0.5).astype('<u2').tofile(f'{out}/river-seeds.bin')
print('ok', out)
