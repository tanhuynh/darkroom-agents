#!/usr/bin/env python3
"""Synthetic check of measure_all.py --mask (no Photoshop). Run: .venv/bin/python tools/test_measure_mask.py"""
import os, subprocess, sys, tempfile
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import measure_all as m

H, W = 200, 300
yy, xx = np.mgrid[0:H, 0:W]
alpha = ((xx - 150) ** 2 + (yy - 100) ** 2 < 50 ** 2).astype(np.float32)   # disc subject r=50

def rgb_from_L(Lmap):
    g = np.clip(Lmap / 100.0, 0, 1)            # near-neutral grey is enough for L* checks
    return np.dstack([g, g, g]).astype(np.float32)

def L_of(arr):
    return m.color.rgb2lab(arr)[..., 0]

base = rgb_from_L(np.where(alpha > 0, 60.0, 30.0))
after = base.copy()
after[alpha > 0] = rgb_from_L(np.full((H, W), 70.0))[alpha > 0]     # lift subject only

tmp = tempfile.mkdtemp()
def save(name, arr):
    p = os.path.join(tmp, name)
    Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8)).save(p)
    return p
pb, pa = save("before.png", base), save("after.png", after)
pm = save("mask.png", np.dstack([alpha] * 3))
# mask at half size must resample to the render
half = Image.fromarray((alpha * 255).astype(np.uint8)).resize((W // 2, H // 2), Image.Resampling.BILINEAR)
pmh = os.path.join(tmp, "mask_half.png"); half.save(pmh)

# 1. regions
reg = m.mask_regions(m.load_mask(pm, (H, W)), 6)
assert reg["Subject (core)"].sum() < alpha.sum() < (reg["Subject (core)"] | reg["Edge ring"]).sum()
assert not (reg["Subject (core)"] & reg["Background"]).any() and not (reg["Edge ring"] & reg["Background"]).any()
assert abs(m.load_mask(pmh, (H, W)).shape[0] - H) == 0

# 2. diff numbers: subject +~10 L*, background 0.00
lab_a, lab_b = m.color.rgb2lab(base), m.color.rgb2lab(after)
dL = lab_b[..., 0] - lab_a[..., 0]
assert abs(np.median(dL[reg["Subject (core)"]]) - 10) < 0.6, np.median(dL[reg["Subject (core)"]])
assert np.abs(dL[reg["Background"]]).max() < 1e-3

# 3. CLI end to end (both commands, full-size and half-size mask)
for mask in (pm, pmh):
    for cmd in (["baseline", pb], ["diff", pb, pa]):
        out = subprocess.run([sys.executable, os.path.join(HERE, "measure_all.py"), *cmd,
                              "--mask", mask, "--out-dir", tmp], capture_output=True, text=True)
        assert out.returncode == 0, out.stderr
        assert "SUBJECT vs BACKGROUND" in out.stdout
d = subprocess.run([sys.executable, os.path.join(HERE, "measure_all.py"), "diff", pb, pa, "--mask", pm,
                    "--out-dir", tmp], capture_output=True, text=True).stdout
bg = [l for l in d.splitlines() if l.startswith("Background")][-1]
assert "+0.00" in bg and bg.split()[-1] == "0.00", bg
# 4. no --mask: unchanged output
n = subprocess.run([sys.executable, os.path.join(HERE, "measure_all.py"), "baseline", pb, "--out-dir", tmp],
                   capture_output=True, text=True)
assert n.returncode == 0 and "SUBJECT" not in n.stdout
print("OK: mask regions, resample, diff numbers, CLI")
