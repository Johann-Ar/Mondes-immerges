"""
Textures de l'eau du globe (équirectangulaires, nord en haut) :
  rivers.png (4096×2048) : le réseau des eaux douces, tracé en lignes fines sur les terres
    R     présence des fleuves et rivières (GLWD niveau 3, classe 3) ; lacs, réservoirs
          et grandes zones humides (classes 1, 2, 4 à 6) relient seulement le réseau, sans être tracés
    G, B  phase de l'écoulement (sin, cos) : distance à la mer le long du réseau (parcours en largeur depuis
          les embouchures) ; le globe y fait descendre l'encre vers l'aval, et les splats en tirent leur sens
  river-seeds.bin : 32 768 points de départ (uint16 x, y en uv) des splats fluviaux
  depth.jpg (2048×1024, niveaux de gris)
    profondeur de l'océan, 0 sur les terres, 1 vers 7 000 m (ETOPO, racine : les plateaux restent lisibles)
Sources : WWF Global Lakes and Wetlands Database (Lehner & Döll 2004), usage non commercial et éducatif ;
          NOAA ETOPO1 (domaine public).
Usage : python scripts/hydro.py <dossier glwd_3> <etopo.nc> public/textures   (numpy, scipy, pillow, rasterio)
"""
import sys
from collections import deque
import numpy as np
import rasterio
from PIL import Image
from scipy.io import netcdf_file
from scipy.ndimage import zoom, gaussian_filter

W, H = 4096, 2048
glwd, etopo, out = sys.argv[1:4]

# GLWD : 43200×21600 à 30", lu par bandes, ramené à 8640×4320 (moyenne 5×5) puis à la taille finale
r = rasterio.open(glwd)
F = 5
fresh = np.zeros((r.height // F, r.width // F), 'f4')
wet = np.zeros_like(fresh)
lake = np.zeros_like(fresh)
step = 2160
for y in range(0, r.height, step):
    a = r.read(1, window=((y, y + step), (0, r.width)))
    h = a.shape[0] // F
    def pool(m):
        return m[: h * F].reshape(h, F, -1, F).mean((1, 3))
    fresh[y // F : y // F + h] = pool((a == 3).astype('f4'))
    lake[y // F : y // F + h] = pool(((a == 1) | (a == 2)).astype('f4'))
    wet[y // F : y // F + h] = pool(((a >= 4) & (a <= 6)).astype('f4'))
def fit(m):
    return np.array(Image.fromarray(m).resize((W, H), Image.BOX))
# les rivières fines (un pixel sur cinq) restent visibles : renfort non linéaire
R = np.clip(fit(fresh) * 1.8, 0, 1) ** 0.6
L = fit(lake)
B = np.clip(gaussian_filter(fit(wet), 1.2) * 1.3, 0, 1)

# Profondeur
f = netcdf_file(etopo, mmap=False)
z = f.variables['altitude'][:].astype('f4')
if f.variables['latitude'][0] < f.variables['latitude'][-1]:
    z = z[::-1]
z = z[:, :-1]
z = zoom(z, (H / z.shape[0], W / z.shape[1]), order=1)
G = np.sqrt(np.clip(-z / 7000, 0, 1))
G = gaussian_filter(G, 0.8) * (z < 0)
R *= z >= -5; L *= z >= -5; B *= z >= -50  # pas d'eau douce en mer

u8 = lambda a: (a * 255 + 0.5).astype('u1')
Image.fromarray(u8(G)).resize((W // 2, H // 2), Image.BOX).save(f'{out}/depth.jpg', quality=90, optimize=True)

# Réseau et sens d'écoulement
M = np.maximum(np.maximum(R, L * 0.3), B * 0.18)  # les lacs et marais comptent moins que le courant des fleuves
net = M > 0.12
sea = z < 0
dist = np.full((H, W), -1, 'i4')
q = deque()
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
ys, xs = np.nonzero(net)
for y, x in zip(ys, xs):
    for dy, dx in N8:
        yy, xx = y + dy, (x + dx) % W
        if 0 <= yy < H and sea[yy, xx]:
            dist[y, x] = 0
            q.append((y, x))
            break
while q:
    y, x = q.popleft()
    for dy, dx in N8:
        yy, xx = y + dy, (x + dx) % W
        if 0 <= yy < H and net[yy, xx] and dist[yy, xx] < 0:
            dist[yy, xx] = dist[y, x] + 1
            q.append((yy, xx))
# Phase de l'écoulement : distance à la mer le long du réseau, enroulée (sin, cos) pour être interpolée sans
# saut ; le shader fait descendre des impulsions d'encre vers l'aval. Bassins fermés : présence seule, sans impulsion.
P = 40  # période, en pixels
phase = 2 * np.pi * dist / P
reach = (dist >= 0).astype('f4')
ps = gaussian_filter(np.sin(phase) * reach, 0.7) / np.maximum(gaussian_filter(np.maximum(reach, net), 0.7), 1e-4)
pc = gaussian_filter(np.cos(phase) * reach, 0.7) / np.maximum(gaussian_filter(np.maximum(reach, net), 0.7), 1e-4)
img = np.stack([R * net, ps * 0.5 + 0.5, pc * 0.5 + 0.5], -1)  # tracé : fleuves et rivières seuls (lacs et marais servent seulement à relier le réseau)
Image.fromarray(u8(np.clip(img, 0, 1))).save(f'{out}/rivers.png', optimize=True)

# Points de départ des splats fluviaux : sur les fleuves atteints depuis la mer, répartis sur tout le réseau
w = (R * (dist >= 0)).ravel().astype('f8')
idx = np.random.default_rng(7).choice(w.size, 32768, p=w / w.sum())
sy, sx = np.divmod(idx, W)
seeds = np.stack([(sx + 0.5) / W, 1 - (sy + 0.5) / H], -1)  # uv, nord en v = 1
(seeds * 65535 + 0.5).astype('<u2').tofile(f'{out}/river-seeds.bin')
print('ok', out)
