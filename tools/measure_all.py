#!/usr/bin/env python3
"""
Unified measurement and visual proof script for adb-mcp Photoshop workflows.
Combines dynamic WB binning, 3x3 visual weight mapping, crop grid preview,
and before/after regional diff + visual proof overlays in one execution.

Usage:
  1. Baseline / WB + 3x3 Composition Check:
     python measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]

  2. Post-Pass Verification (Diff + Visual Overlays):
     python measure_all.py diff <before.png> <after.png> [--hero x0,y0,x1,y1] [--out-dir ./measure]

  Optional --mask <alpha.png> (both commands): subject alpha (white = subject, any size, resampled to
  the render). Adds subject vs background vs edge-ring statistics. A Photoshop select_subject export is a
  PROXY for the Camera Raw mask - use it only after the mask passed the quality gate (WORKFLOW.md step 4).
  --ring N sets the edge-ring half-width in px (default 6, at the render's size).
"""

import argparse
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage import color, filters


def load_rgb(path):
    """Float RGB in [0,1] at the file's native bit depth (16-bit PNGs keep full precision).
    PIL's convert("RGB") truncates 16-bit renders to 8-bit, which costs shadow precision
    (deep-shadow b* bins, L* p1) — so read with OpenCV when available."""
    try:
        import cv2
        raw = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    except ImportError:
        raw = None
    if raw is None:  # no OpenCV or unreadable by it -> PIL (8-bit) fallback
        return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0
    scale = 65535.0 if raw.dtype == np.uint16 else 255.0
    if raw.ndim == 2:
        raw = np.dstack([raw] * 3)
    return raw[..., :3][..., ::-1].astype(np.float32) / scale  # BGR(A) -> RGB


def to_lab(arr):
    """Returns (8-bit PIL image for overlays, float RGB, Lab)."""
    img = Image.fromarray(np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8))
    return img, arr, color.rgb2lab(arr)


def load_lab(path):
    return to_lab(load_rgb(path))


def local_detail(L):
    gx = filters.sobel_h(L)
    gy = filters.sobel_v(L)
    return np.hypot(gx, gy)


def load_mask(path, shape):
    """Subject alpha in [0,1] resampled to shape=(h,w). RGBA with a varying alpha channel uses the
    alpha; otherwise the first channel (white = subject). 16-bit aware."""
    im = Image.open(path)
    if im.mode == "RGBA" and im.getchannel("A").getextrema()[0] < 255:
        im = im.getchannel("A")
    if im.mode in ("I;16", "I", "I;16B", "I;16L"):
        arr = np.asarray(im, dtype=np.float32) / 65535.0
        im = Image.fromarray(np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8))
    else:
        im = im.convert("L")
    if im.size != (shape[1], shape[0]):
        im = im.resize((shape[1], shape[0]), Image.Resampling.BILINEAR)
    return np.asarray(im, dtype=np.float32) / 255.0


def mask_regions(alpha, ring):
    """Boolean regions from a soft alpha: subject (core, eroded by ring), background (core),
    edge ring (band of +/- ring px around the 0.5 contour)."""
    hard = alpha >= 0.5
    if ring > 0:
        ball = ndi.generate_binary_structure(2, 1)
        inner = ndi.binary_erosion(hard, ball, iterations=ring)
        outer = ndi.binary_dilation(hard, ball, iterations=ring)
    else:
        inner, outer = hard, hard
    return {"Subject (core)": inner, "Background": ~outer, "Edge ring": outer & ~inner}


def run_subject_report(lab, det, alpha, ring):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    regions = mask_regions(alpha, ring)
    n = alpha.size
    print("\n=== SUBJECT vs BACKGROUND (mask proxy) ===")
    print(f"Subject area {np.mean(alpha >= 0.5) * 100:.1f}% of frame, edge ring +/-{ring}px")
    print(f"{'Region':<16} {'Px %':>6} {'L*':>6} {'a*':>7} {'b*':>7} {'C*':>6} {'Detail':>7}")
    print("-" * 60)
    for name, m in regions.items():
        if m.sum() == 0:
            print(f"{name:<16} {'0.0':>6}  (empty)")
            continue
        print(
            f"{name:<16} {m.sum() / n * 100:>6.1f} {np.median(L[m]):>6.1f} {np.median(a[m]):>+7.2f} "
            f"{np.median(b[m]):>+7.2f} {np.median(C[m]):>6.1f} {np.mean(det[m]):>7.2f}"
        )
    s_m, b_m = regions["Subject (core)"], regions["Background"]
    if s_m.sum() and b_m.sum():
        sep_L = np.median(L[s_m]) - np.median(L[b_m])
        sep_C = np.median(C[s_m]) - np.median(C[b_m])
        busy = np.mean(det[b_m]) / (np.mean(det[s_m]) + 1e-8)
        hot = float(np.mean(L[b_m] > np.percentile(L[s_m], 95))) * 100.0
        print(f"Separation: dL* {sep_L:+.1f}, dC* {sep_C:+.1f} (subject - background)")
        print(f"Background busyness (detail bg/subject): {busy:.2f}")
        print(f"Background pixels brighter than subject p95: {hot:.1f}%")


def run_subject_diff(lab_a, lab_b, deta, detb, alpha, ring):
    La, Lb = lab_a[..., 0], lab_b[..., 0]
    Ca, Cb = np.hypot(lab_a[..., 1], lab_a[..., 2]), np.hypot(lab_b[..., 1], lab_b[..., 2])
    regions = mask_regions(alpha, ring)
    print("\n=== SUBJECT vs BACKGROUND DIFF (mask proxy) ===")
    print(f"{'Region':<16} {'L* a->b':>13} {'dL*':>7} {'C* a->b':>13} {'Det %':>7} {'max|dL*|':>9}")
    print("-" * 70)
    for name, m in regions.items():
        if m.sum() == 0:
            print(f"{name:<16}  (empty)")
            continue
        la_m, lb_m = np.median(La[m]), np.median(Lb[m])
        ca_m, cb_m = np.median(Ca[m]), np.median(Cb[m])
        da_m, db_m = np.mean(deta[m]), np.mean(detb[m])
        print(
            f"{name:<16} {la_m:>5.1f}->{lb_m:<5.1f} {lb_m - la_m:>+7.2f} "
            f"{ca_m:>5.1f}->{cb_m:<5.1f} {(db_m - da_m) / (da_m + 1e-8) * 100:>+6.1f}% "
            f"{np.max(np.abs(Lb[m] - La[m])):>9.2f}"
        )


def run_baseline(render_path, crop_box=None, out_dir=".", mask_path=None, ring=6):
    os.makedirs(out_dir, exist_ok=True)
    img, _, lab = load_lab(render_path)
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    hue = (np.degrees(np.arctan2(b, a)) + 360.0) % 360.0
    det = local_detail(L)

    print("=== 1. WHITE BALANCE & CHROMATICITY CHECK ===")
    bins = [
        ("Highlights (L>=90)", (L >= 90) & (C < 12)),
        ("Bright Sky/Haze (80-90)", (L >= 80) & (L < 90) & (C < 15)),
        ("Upper Midtones (65-80)", (L >= 65) & (L < 80) & (C < 15)),
        ("Midtones (50-65)", (L >= 50) & (L < 65) & (C < 15)),
        ("Lower Midtones (35-50)", (L >= 35) & (L < 50) & (C < 15)),
        ("Shadows (20-35)", (L >= 20) & (L < 35) & (C < 15)),
        ("Deep Shadows (L<20)", (L < 20)),
        ("Warm Rock / Subject (hue 25-75, C>=15)", (hue >= 25) & (hue <= 75) & (C >= 15)),
        ("Foliage / Greens (hue 80-165, L>=18)", (hue >= 80) & (hue <= 165) & (L >= 18)),
    ]

    print(f"{'Band / Target':<38} {'Pixels':>8} {'L*':>6} {'a*':>7} {'b*':>7} {'C*':>6} {'Hue':>6}")
    print("-" * 82)
    for name, mask in bins:
        n = int(mask.sum())
        if n == 0:
            continue
        print(
            f"{name:<38} {n:>8,d} {np.median(L[mask]):>6.1f} "
            f"{np.median(a[mask]):>+7.2f} {np.median(b[mask]):>+7.2f} "
            f"{np.median(C[mask]):>6.1f} {np.median(hue[mask]):>5.1f}°"
        )

    p1, p5, p50, p95, p99 = np.percentile(L, [1, 5, 50, 95, 99.9])
    print(f"\nTonal Percentiles (L*): p1={p1:.1f}, p5={p5:.1f}, med={p50:.1f}, p95={p95:.1f}, p99.9={p99:.1f}")

    print("\n=== 2. 3x3 RULE-OF-THIRDS VISUAL WEIGHT & DETAIL GRID ===")
    h, w = L.shape
    l_med = np.median(L)
    weight_map = det * (C + 1.0) * np.abs(L - l_med)
    total_w = float(weight_map.sum()) + 1e-8

    row_names = ["Top", "Mid", "Bot"]
    col_names = ["Left", "Center", "Right"]
    print(f"{'Grid Cell':<14} {'Med L*':>7} {'Med C*':>7} {'Detail':>7} {'Weight %':>9}")
    print("-" * 48)
    for r in range(3):
        y0, y1 = int(r * h / 3), int((r + 1) * h / 3)
        for c in range(3):
            x0, x1 = int(c * w / 3), int((c + 1) * w / 3)
            cell_w = float(weight_map[y0:y1, x0:x1].sum()) / total_w * 100.0
            print(
                f"{row_names[r] + '-' + col_names[c]:<14} "
                f"{np.median(L[y0:y1, x0:x1]):>7.1f} "
                f"{np.median(C[y0:y1, x0:x1]):>7.1f} "
                f"{np.mean(det[y0:y1, x0:x1]):>7.2f} "
                f"{cell_w:>8.1f}%"
            )

    if mask_path:
        run_subject_report(lab, det, load_mask(mask_path, L.shape), ring)

    if crop_box:
        cx0, cy0, cx1, cy1 = crop_box
        preview = img.copy()
        draw = ImageDraw.Draw(preview, "RGBA")
        # Dim cropped-out borders
        draw.rectangle([0, 0, w, cy0], fill=(0, 0, 0, 140))
        draw.rectangle([0, cy1, w, h], fill=(0, 0, 0, 140))
        draw.rectangle([0, cy0, cx0, cy1], fill=(0, 0, 0, 140))
        draw.rectangle([cx1, cy0, w, cy1], fill=(0, 0, 0, 140))
        # Crop outline & rule-of-thirds grid
        draw.rectangle([cx0, cy0, cx1, cy1], outline=(255, 220, 80, 255), width=4)
        cw, ch = cx1 - cx0, cy1 - cy0
        for i in (1, 2):
            draw.line([cx0 + cw * i / 3, cy0, cx0 + cw * i / 3, cy1], fill=(255, 255, 255, 180), width=2)
            draw.line([cx0, cy0 + ch * i / 3, cx1, cy0 + ch * i / 3], fill=(255, 255, 255, 180), width=2)
        out_crop = os.path.join(out_dir, "crop_preview.png")
        preview.save(out_crop)
        print(f"\nSaved crop grid preview: {out_crop}")


def run_diff(before_path, after_path, hero_box=None, out_dir=".", mask_path=None, ring=6):
    os.makedirs(out_dir, exist_ok=True)
    img_a, _, lab_a = load_lab(before_path)
    img_b, _, lab_b = load_lab(after_path)

    if lab_a.shape != lab_b.shape:
        # resample the float data (not just the overlay image) so Lab stats compare aligned pixels
        h_a, w_a = lab_a.shape[:2]
        try:
            import cv2
            arr_b = cv2.resize(load_rgb(after_path), (w_a, h_a), interpolation=cv2.INTER_AREA)
        except ImportError:
            arr_b = np.asarray(img_b.resize((w_a, h_a), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0
        img_b, _, lab_b = to_lab(arr_b)

    La, aa, ba = lab_a[..., 0], lab_a[..., 1], lab_a[..., 2]
    Lb, ab, bb = lab_b[..., 0], lab_b[..., 1], lab_b[..., 2]
    Ca, Cb = np.hypot(aa, ba), np.hypot(ab, bb)
    deta, detb = local_detail(La), local_detail(Lb)

    dL = Lb - La
    db = bb - ba
    h, w = La.shape

    print("=== POST-PASS REGIONAL COMPARISON (3x3 GRID + TONAL BANDS) ===")
    print(f"{'Region':<18} {'L* a->b':>13} {'dL*':>7} {'C* a->b':>13} {'Det %':>7} {'db*':>7}")
    print("-" * 70)

    row_names = ["Top", "Mid", "Bot"]
    col_names = ["Left", "Center", "Right"]
    for r in range(3):
        y0, y1 = int(r * h / 3), int((r + 1) * h / 3)
        for c in range(3):
            x0, x1 = int(c * w / 3), int((c + 1) * w / 3)
            la_m, lb_m = np.median(La[y0:y1, x0:x1]), np.median(Lb[y0:y1, x0:x1])
            ca_m, cb_m = np.median(Ca[y0:y1, x0:x1]), np.median(Cb[y0:y1, x0:x1])
            da_m, db_m = np.mean(deta[y0:y1, x0:x1]), np.mean(detb[y0:y1, x0:x1])
            det_pct = (db_m - da_m) / (da_m + 1e-8) * 100.0
            print(
                f"{row_names[r] + '-' + col_names[c]:<18} "
                f"{la_m:>5.1f}->{lb_m:<5.1f} {lb_m - la_m:>+7.2f} "
                f"{ca_m:>5.1f}->{cb_m:<5.1f} {det_pct:>+6.1f}% "
                f"{np.median(db[y0:y1, x0:x1]):>+7.2f}"
            )

    # Tonal bands check (verifies crevices & highlights stay protected)
    print("-" * 70)
    bands = [
        ("Deep Darks (L<15)", La < 15),
        ("Shadows (15-30)", (La >= 15) & (La < 30)),
        ("Midtones (30-65)", (La >= 30) & (La < 65)),
        ("Highlights (L>=85)", La >= 85),
    ]
    for name, mask in bands:
        if mask.sum() == 0:
            continue
        la_m, lb_m = np.median(La[mask]), np.median(Lb[mask])
        ca_m, cb_m = np.median(Ca[mask]), np.median(Cb[mask])
        da_m, db_m = np.mean(deta[mask]), np.mean(detb[mask])
        det_pct = (db_m - da_m) / (da_m + 1e-8) * 100.0
        print(
            f"{name:<18} "
            f"{la_m:>5.1f}->{lb_m:<5.1f} {lb_m - la_m:>+7.2f} "
            f"{ca_m:>5.1f}->{cb_m:<5.1f} {det_pct:>+6.1f}% "
            f"{np.median(db[mask]):>+7.2f}"
        )

    if mask_path:
        run_subject_diff(lab_a, lab_b, deta, detb, load_mask(mask_path, La.shape), ring)

    # 1. |dL*| x 15 mask map
    diff_vis = np.clip(np.abs(dL) * 15.0, 0, 255).astype(np.uint8)
    diffmap_path = os.path.join(out_dir, "diffmap.png")
    Image.fromarray(diff_vis).save(diffmap_path)

    # 2. db* color-shift map (warm=red/yellow, cool=blue)
    db_rgb = np.zeros((h, w, 3), dtype=np.uint8)
    db_rgb[..., 0] = np.clip(db * 25.0, 0, 255).astype(np.uint8)
    db_rgb[..., 1] = np.clip(np.abs(db) * 10.0, 0, 255).astype(np.uint8)
    db_rgb[..., 2] = np.clip(-db * 25.0, 0, 255).astype(np.uint8)
    dbmap_path = os.path.join(out_dir, "dbmap.png")
    Image.fromarray(db_rgb).save(dbmap_path)

    # 3. Side-by-side before/after composite
    comp = Image.new("RGB", (w * 2, h))
    comp.paste(img_a, (0, 0))
    comp.paste(img_b, (w, 0))
    ba_path = os.path.join(out_dir, "before_after.png")
    comp.save(ba_path)

    print(f"\nSaved visual overlays in {out_dir}:")
    print(f"  - Mask map (|dL*|x15): {diffmap_path}")
    print(f"  - Color shift (db*):   {dbmap_path}")
    print(f"  - Side-by-side:        {ba_path}")

    # 4. Optional 1:1 hero crop comparison
    if hero_box:
        hx0, hy0, hx1, hy1 = hero_box
        crop_a = img_a.crop((hx0, hy0, hx1, hy1))
        crop_b = img_b.crop((hx0, hy0, hx1, hy1))
        hw, hh = crop_a.size
        hero_comp = Image.new("RGB", (hw * 2, hh))
        hero_comp.paste(crop_a, (0, 0))
        hero_comp.paste(crop_b, (hw, 0))
        hero_path = os.path.join(out_dir, "hero_zoom.png")
        hero_comp.save(hero_path)
        print(f"  - Hero zoom (A | B):   {hero_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unified adb-mcp measurement & visual proof tool")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_base = sub.add_parser("baseline")
    p_base.add_argument("render")
    p_base.add_argument("--crop", help="x0,y0,x1,y1 in preview pixels")
    p_base.add_argument("--out-dir", default="./measure")
    p_base.add_argument("--mask", help="subject alpha PNG (white = subject); adds subject/background stats")
    p_base.add_argument("--ring", type=int, default=6, help="edge-ring half-width in px")

    p_diff = sub.add_parser("diff")
    p_diff.add_argument("before")
    p_diff.add_argument("after")
    p_diff.add_argument("--hero", help="x0,y0,x1,y1 in preview pixels")
    p_diff.add_argument("--out-dir", default="./measure")
    p_diff.add_argument("--mask", help="subject alpha PNG (white = subject); adds subject/background stats")
    p_diff.add_argument("--ring", type=int, default=6, help="edge-ring half-width in px")

    args = parser.parse_args()
    if args.cmd == "baseline":
        cbox = tuple(map(int, args.crop.split(","))) if args.crop else None
        run_baseline(args.render, crop_box=cbox, out_dir=args.out_dir, mask_path=args.mask, ring=args.ring)
    elif args.cmd == "diff":
        hbox = tuple(map(int, args.hero.split(","))) if args.hero else None
        run_diff(args.before, args.after, hero_box=hbox, out_dir=args.out_dir, mask_path=args.mask, ring=args.ring)
