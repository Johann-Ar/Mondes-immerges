"""
Fabrique les deux textures du globe à partir de données publiques (serveur ERDDAP de la NOAA).

    python3 -m venv .venv && .venv/bin/pip install numpy scipy pillow
    .venv/bin/python scripts/textures.py

- public/textures/currents.png : courants de surface NASA/JPL OSCAR (1/3°, moyenne mars-avril 2013).
  R, G : vitesse est, nord, encodées sur ±1,6 m/s (0,5 = immobile) · B : masque océan.
- public/textures/relief.jpg : relief ETOPO1 (NOAA) ombré, terres claires, océan noir.
"""
import os
import urllib.request

import numpy as np
from PIL import Image
from scipy.io import netcdf_file
from scipy.ndimage import gaussian_filter, map_coordinates, zoom

ERDDAP = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/'
OSCAR = ERDDAP + 'jplOscar.nc?' + ','.join(
    f'{c}%5B(2013-03-01):(2013-04-10)%5D%5B(15.0)%5D%5B(80.0):(-80.0)%5D%5B(20.0):(420.0)%5D' for c in 'uv'
)
ETOPO = ERDDAP + 'etopo180.nc?altitude%5B(-90):5:(90)%5D%5B(-180):5:(180)%5D'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'textures')


def fetch(url, name):
    path = os.path.join(os.path.dirname(__file__), '.cache', name)
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print('téléchargement', name)
        urllib.request.urlretrieve(url, path)
    return path


def currents(src, out):
    f = netcdf_file(src, 'r', mmap=False)
    u = f.variables['u'][:, 0].astype('f8'); v = f.variables['v'][:, 0].astype('f8')
    lon = f.variables['longitude'][:]  # 20..420
    lat = f.variables['latitude'][:]   # 80..-80
    u = np.nanmean(np.where(np.isfinite(u), u, np.nan), axis=0)
    v = np.nanmean(np.where(np.isfinite(v), v, np.nan), axis=0)
    # les données couvrent 20..420° : on garde un seul tour (1080 colonnes de 1/3°), ramené à -180..180
    u, v, lon = u[:, :1080], v[:, :1080], lon[:1080]
    L = ((lon + 180) % 360) - 180
    order = np.argsort(L); u, v, L = u[:, order], v[:, order], L[order]
    W, H = 1440, 720
    glon = -180 + (np.arange(W) + 0.5) * 360 / W
    glat = 90 - (np.arange(H) + 0.5) * 180 / H
    X, Y = np.meshgrid(glon, glat)
    ci = (X - L[0]) / (1/3); ri = (lat[0] - Y) / (1/3)
    mask = np.isfinite(u).astype('f8')
    uz, vz = np.nan_to_num(u), np.nan_to_num(v)
    pad = lambda a: np.concatenate([a, a[:, :1]], axis=1)
    coords = [ri, ci]
    U = map_coordinates(pad(uz), coords, order=1, mode='constant', cval=0)
    V = map_coordinates(pad(vz), coords, order=1, mode='constant', cval=0)
    M = map_coordinates(pad(mask), coords, order=1, mode='constant', cval=0)
    U = np.where(M > 0, U / np.maximum(M, 1e-6), 0); V = np.where(M > 0, V / np.maximum(M, 1e-6), 0)
    R = 1.6
    enc = lambda a: np.clip(np.round((np.clip(a, -R, R) / R * 0.5 + 0.5) * 255), 0, 255).astype('u1')
    img = np.dstack([enc(U), enc(V), (np.clip(M, 0, 1) * 255).astype('u1')])
    Image.fromarray(img, 'RGB').save(out, optimize=True)
    spd = np.hypot(U, V)
    prev = (np.clip(spd / 0.8, 0, 1) ** 0.6 * 255).astype('u1')


def relief(src, out):
    f = netcdf_file(src, 'r', mmap=False)
    z = f.variables['altitude'][:].astype('f4')
    lat = f.variables['latitude'][:]
    if lat[0] < lat[-1]: z = z[::-1]          # nord en haut
    z = z[:, :-1]                               # -180..180 sans doublon
    W, H = 4096, 2048
    z = zoom(z, (H / z.shape[0], W / z.shape[1]), order=3)
    latr = np.deg2rad(90 - (np.arange(H) + 0.5) * 180 / H)[:, None]
    land = z > 0
    # Ombrage : gradient corrigé de la latitude, éclairage nord-ouest + lumière zénithale douce
    def shade(e, exag, az=315, alt=40):
        px = 2 * np.pi * 6371000 / W
        gy, gx = np.gradient(e, px)
        gx = gx / np.maximum(np.cos(latr), 0.05)
        gx, gy = gx * exag, gy * exag
        slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
        a, b = np.deg2rad(az), np.deg2rad(alt)
        return np.clip(np.sin(b) * np.cos(slope) + np.cos(b) * np.sin(slope) * np.cos(a - aspect), 0, 1)
    hl = 0.6 * shade(gaussian_filter(z, 0.6), 22) + 0.4 * shade(gaussian_filter(z, 2.5), 30, 280, 55)
    ho = shade(gaussian_filter(np.minimum(z, 0), 1.0), 14)
    def ramp(t, stops):
        t = np.clip(t, 0, 1); out = np.zeros(t.shape + (3,), 'f4')
        xs = [s[0] for s in stops]
        for c in range(3): out[..., c] = np.interp(t, xs, [s[1][c] for s in stops])
        return out
    hexc = lambda h: tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    # Océan : noir chaud, plateaux à peine plus clairs
    depth = np.clip(-z / 6000, 0, 1) ** 0.5
    ocean = ramp(1 - depth, [(0, hexc('#050608')), (0.55, hexc('#0b0d10')), (0.92, hexc('#16191c')), (1, hexc('#24272a'))])
    ocean *= (0.6 + 0.8 * ho)[..., None]
    # Terres : pierre claire → sable → sommets blancs
    elev = np.clip(z / 4500, 0, 1) ** 0.6
    terre = ramp(elev, [(0, hexc('#9d968a')), (0.35, hexc('#b3ab9c')), (0.7, hexc('#c9c2b4')), (1, hexc('#e9e6df'))])
    terre *= (0.45 + 0.75 * hl)[..., None]
    # Glaces (Antarctique, Groenland)
    lond = (-180 + (np.arange(W) + 0.5) * 360 / W)[None, :]
    latd = np.rad2deg(latr)
    ice = land & (((latd > 59) & (lond > -74) & (lond < -10) & (z > 200)) | (latd < -60))
    ice = gaussian_filter(ice.astype('f4'), 2) 
    ice = np.clip(ice, 0, 1)[..., None]
    glace = np.array(hexc('#e6e8e8'))[None, None] * (0.7 + 0.35 * hl[..., None])
    terre = terre * (1 - ice) + glace * ice
    m = gaussian_filter(land.astype('f4'), 0.7)[..., None]
    img = ocean * (1 - m) + terre * m
    img = np.clip(img, 0, 1) ** (1 / 1.0)
    Image.fromarray((img * 255 + 0.5).astype('u1')).save(out, quality=88)


if __name__ == '__main__':
    currents(fetch(OSCAR, 'oscar.nc'), os.path.join(OUT, 'currents.png'))
    relief(fetch(ETOPO, 'etopo.nc'), os.path.join(OUT, 'relief.jpg'))
