# Vectorise le logo Mondes Immergés depuis le PNG grand format : jaune -> MARK, blanc -> NAME.
# Usage : python3 scripts/trace-logo.py mi-logo-grand-format.png traced.json

import sys, json
from PIL import Image, ImageChops
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
im = im.crop(im.getbbox())
SC = 6
W, H = im.size[0] // SC, im.size[1] // SC
r, g, b, a = im.split()
white = ImageChops.multiply(a, b)                     # blanc : bleu fort
yellow = ImageChops.multiply(a, ImageChops.invert(b)) # jaune : bleu nul
def field(ch):
    ch = ch.resize((W, H), Image.BOX)
    d = ch.tobytes()
    return [[d[y * W + x] / 255 for x in range(W)] for y in range(H)]

def trace(f, t=0.5):
    # marching squares avec interpolation, contours fermés
    Hh, Ww = len(f), len(f[0])
    def v(x, y):
        return f[y][x] if 0 <= x < Ww and 0 <= y < Hh else 0.0
    segs = {}
    def pt(x0, y0, x1, y1):
        a0, a1 = v(x0, y0), v(x1, y1)
        k = (t - a0) / (a1 - a0) if a1 != a0 else 0.5
        return (round(x0 + (x1 - x0) * k, 3), round(y0 + (y1 - y0) * k, 3))
    for y in range(-1, Hh):
        for x in range(-1, Ww):
            c = (v(x, y) > t) * 8 + (v(x + 1, y) > t) * 4 + (v(x + 1, y + 1) > t) * 2 + (v(x, y + 1) > t)
            if c in (0, 15): continue
            T = lambda: pt(x, y, x + 1, y); R = lambda: pt(x + 1, y, x + 1, y + 1)
            B = lambda: pt(x, y + 1, x + 1, y + 1); L = lambda: pt(x, y, x, y + 1)
            table = {1: [(L, B)], 2: [(B, R)], 3: [(L, R)], 4: [(R, T)], 5: [(L, T), (R, B)], 6: [(B, T)], 7: [(L, T)],
                     8: [(T, L)], 9: [(T, B)], 10: [(T, R), (B, L)], 11: [(T, R)], 12: [(R, L)], 13: [(R, B)], 14: [(B, L)]}
            for p, q in table[c]:
                segs[p()] = q()
    loops = []
    while segs:
        start, nxt = segs.popitem()
        loop = [start]
        while nxt in segs:
            loop.append(nxt); nxt = segs.pop(nxt)
        if len(loop) > 3: loops.append(loop)
    return loops

def dp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]; n = (dx * dx + dy * dy) ** 0.5 or 1e-9
    i, m = 0, -1
    for k in range(1, len(pts) - 1):
        d = abs(dy * (pts[k][0] - a[0]) - dx * (pts[k][1] - a[1])) / n
        if d > m: i, m = k, d
    if m > eps: return dp(pts[:i + 1], eps)[:-1] + dp(pts[i:], eps)
    return [a, b]

def path(f):
    parts = []
    for loop in trace(f):
        # simplification en deux moitiés pour un contour fermé
        h = len(loop) // 2
        s = dp(loop[:h + 1], 0.22)[:-1] + dp(loop[h:] + [loop[0]], 0.22)[:-1]
        if len(s) < 3: continue
        parts.append('M' + ' '.join(f'{x:.1f} {y:.1f}'.replace('.0 ', ' ') for x, y in s) + 'Z')
    return ''.join(parts)

res = {'w': W, 'h': H, 'mark': path(field(yellow)), 'name': path(field(white))}
json.dump(res, open(out, 'w'))
print(W, H, len(res['mark']), len(res['name']))
