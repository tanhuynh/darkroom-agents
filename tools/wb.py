#!/usr/bin/env python3
"""wb.py — image-agnostic white-balance check (Step 1 of the session workflow).

Usage:  python3 wb.py render_16.png [more.png ...] [--sky-rows N] [--save8]

Input: 16- or 8-bit sRGB PNG from the measurement loop (duplicate merged ->
imageSize 2000 -> convertToProfile sRGB -> save_document_as PNG).

No hard-coded sample boxes. Samples are picked by tone and color:
  * sky/cloud: rows above the auto-detected horizon (or --sky-rows N),
    low-chroma pixels binned by L* density (thin vs dense cloud / fog)
  * blue sky:  sky rows with b* < -12
  * pale rock / limestone / snow: L* > 72, C* < 30, below the horizon, binned by L*
  * foliage:   L* < 45, a* < 5 (green/neutral darks), binned by L* — deep bins going
               blue (b* << 0) = open-shade skylight cast, not a global cast
  * red rock / shadowed rock: chroma-selected warm tones (rock-scatter reference)
  * hue histogram of C* > 8 pixels, L* percentiles, per-channel clipping

Reading it (see ps-acr-recipes.md §1):
  * A true global cast shifts every neutral bin the same way (clouds AND pale rock AND darks).
  * Dense cloud/fog near a*≈0, b*≈0; thin cloud/fog warm at the rock's hue = scatter, leave it.
  * Cloud bases / distance slightly cool (b* < 0) is natural.
  * Only deep shadows blue -> local fix (darks-only range mask), not raw WB.
No skimage needed (pure numpy sRGB->Lab D65), so it also runs in the device VM.
"""
import sys, argparse
import numpy as np
import cv2


def srgb_to_lab(rgb):
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return L, a, b


def load(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if im is None:
        sys.exit(f'cannot read {p}')
    scale = 65535.0 if im.dtype == np.uint16 else 255.0
    if im.ndim == 2:
        im = np.dstack([im] * 3)
    return im[..., :3][..., ::-1].astype(np.float64) / scale


def horizon_row(L, C, B, override=None):
    """Last row (from the top) that is still mostly sky: bright & low-chroma, or blue."""
    if override is not None:
        return override
    skyish = ((L > 70) & (C < 20)) | ((B < -10) & (L > 50))
    frac = cv2.blur(skyish.mean(axis=1).astype(np.float32).reshape(-1, 1), (1, 9)).ravel()
    rows = np.where(frac < 0.5)[0]
    return int(rows[0]) if rows.size else 0


def rep(name, L, A, B, C, m, minn=50):
    n = int(m.sum())
    if n < minn:
        print(f'  {name:26s} n={n:7d}  (too few)')
        return
    a, b = np.median(A[m]), np.median(B[m])
    print(f'  {name:26s} n={n:7d}  L {np.median(L[m]):5.1f}  a* {a:+6.2f}  b* {b:+6.2f}'
          f'  C {np.median(C[m]):5.1f}  hue {np.degrees(np.arctan2(b, a)):5.0f}')


def analyse(p, sky_rows=None, save8=False):
    im = load(p)
    L, A, B = srgb_to_lab(im)
    C = np.hypot(A, B)
    H = (np.degrees(np.arctan2(B, A)) + 360) % 360
    h, w = L.shape
    yy = np.mgrid[:h, :w][0]
    hz = horizon_row(L, C, B, sky_rows)
    sky, land = yy < hz, yy >= hz
    print(f'== {p.split("/")[-1]}  {w}x{h}  horizon row {hz} ({100 * hz / h:.0f}% sky rows)')

    print(' Sky / cloud density bins (low chroma, above horizon)')
    for lo, hi in [(60, 70), (70, 80), (80, 88), (88, 94), (94, 101)]:
        rep(f'cloud L{lo}-{hi}', L, A, B, C, sky & (L >= lo) & (L < hi) & (C < 20) & (B > -12))
    rep('blue sky', L, A, B, C, sky & (B < -12))

    print(' Low-chroma land (fog / grey cliff / haze), by density')
    for lo, hi in [(60, 68), (68, 75), (75, 82), (82, 88), (88, 101)]:
        rep(f'neutral land L{lo}-{hi}', L, A, B, C, land & (L >= lo) & (L < hi) & (C < 8))

    print(' Pale rock / limestone / snow (L>72, C<30, below horizon)')
    for lo, hi in [(72, 78), (78, 84), (84, 90), (90, 101)]:
        rep(f'pale L{lo}-{hi}', L, A, B, C, land & (L >= lo) & (L < hi) & (C < 30))

    print(' Foliage / dark neutrals (L<45, a*<5) by density — deep bins blue = skylight')
    for lo, hi in [(0, 10), (10, 20), (20, 30), (30, 45)]:
        rep(f'darks L{lo}-{hi}', L, A, B, C, land & (L >= lo) & (L < hi) & (A < 5) & (C > 2))
    rep('green foliage (hue 90-160)', L, A, B, C, land & (L < 50) & (C > 4) & (H > 90) & (H < 160))

    print(' Warm references (rock scatter)')
    rep('red rock C>20 L40-75', L, A, B, C, (C > 20) & (L > 40) & (L < 75))
    rep('shadow rock L<30 a*>0', L, A, B, C, (L < 30) & (C > 8) & (A > 0))

    print(' Hue histogram, C*>8 (% of image, median L*)')
    m = C > 8
    for h0 in range(0, 360, 30):
        s = m & (H >= h0) & (H < h0 + 30)
        if s.mean() >= 0.001:
            print(f'  {h0:3d}-{h0 + 30:3d}°  {100 * s.mean():5.1f}%  L {np.median(L[s]):4.0f}')

    print('  L* p0.1/p1/p50/p99/p99.9', np.percentile(L, [0.1, 1, 50, 99, 99.9]).round(1))
    for c, n in zip(range(3), 'RGB'):
        print(f'  {n} clipped {100 * (im[..., c] > 0.995).mean():.2f}%  crushed {100 * (im[..., c] < 0.005).mean():.2f}%')

    if save8:
        out = p.rsplit('/', 1)[-1].replace('16.png', '8.png').replace('.png', '_8.png') \
            if '16.png' not in p else p.rsplit('/', 1)[-1].replace('16.png', '8.png')
        cv2.imwrite(out, (im[..., ::-1] * 255).round().astype(np.uint8))
        print(f'  wrote {out}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('png', nargs='+')
    ap.add_argument('--sky-rows', type=int, default=None, help='override auto horizon (rows of sky from top)')
    ap.add_argument('--save8', action='store_true', help='also write an 8-bit copy (old wb.py behavior)')
    a = ap.parse_args()
    for p in a.png:
        analyse(p, a.sky_rows, a.save8)
