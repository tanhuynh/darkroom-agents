#!/usr/bin/env python3
"""prophoto_to_srgb.py — convert a Photoshop-saved ProPhoto RGB PNG to sRGB for measure_all.py / wb.py.

Usage:  python3 prophoto_to_srgb.py in_prophoto.png [more.png ...]     ->  in_prophoto_srgb.png

Why: batchPlay `convertToProfile` can pop up a Convert to Profile dialog; if the user closes it, the call
still echoes SUCCESS and the PNG stays ProPhoto (read as sRGB it is ~19 codes darker and less chroma).
So the render recipe saves the 16-bit ProPhoto duplicate as-is and converts here (no dialog to trap).

Math: ProPhoto (ROMM, D50, gamma 1.8 with linear toe) -> XYZ D50 -> sRGB (Bradford-adapted matrix) -> sRGB OETF,
relative colorimetric, no black-point compensation. Verified against Photoshop's own conversion: mean |diff| 0.04
of an 8-bit code (0025, Nov 2026). Out-of-gamut values are clipped. Output is 16-bit RGB (alpha dropped).
"""
import sys
import numpy as np
import cv2

M_SRGB = np.array([[0.4360747, 0.3850649, 0.1430804],
                   [0.2225045, 0.7168786, 0.0606169],
                   [0.0139322, 0.0971045, 0.7141733]])      # sRGB linear -> XYZ D50
M_PRO = np.array([[0.7977, 0.1352, 0.0313],
                  [0.2880, 0.7119, 0.0001],
                  [0.0000, 0.0000, 0.8249]])                # ProPhoto linear -> XYZ D50
M = np.linalg.inv(M_SRGB) @ M_PRO                           # ProPhoto linear -> sRGB linear


def convert(rgb):
    lin = np.where(rgb < 16 / 512, rgb / 16, rgb ** 1.8)
    s = np.clip(lin @ M.T, 0, 1)
    return np.where(s <= 0.0031308, 12.92 * s, 1.055 * np.power(s, 1 / 2.4) - 0.055)


def main(paths):
    for p in paths:
        a = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        if a is None:
            sys.exit(f"cannot read {p}")
        full = 65535.0 if a.dtype == np.uint16 else 255.0
        rgb = a[:, :, :3][:, :, ::-1].astype(np.float64) / full
        out = (np.clip(convert(rgb), 0, 1) * 65535 + 0.5).astype(np.uint16)[:, :, ::-1]
        dst = p[:-4] + "_srgb.png"
        cv2.imwrite(dst, out)
        print(dst)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
