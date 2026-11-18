# Wildlife playbook — ⚠️ DRAFT, unverified (no wildlife cases yet)

Built from standard wildlife-editing practice plus the user's stated habits; every rule is a hypothesis until a case
confirms it. Same format as the landscape playbook: **IF → DO → CHECK**, stored XMP units, cite cases as they accrue.
The engine, calibrations and materials apply unchanged (see `materials.md` for fur/feathers/grass expectations).

Typical problem profile (user): subject far and small in the frame, background rarely nice → most of the time goes into
**the crop** and **cleaning/quieting the background**. So this playbook leads with those.

## Default plan
1. **WB** — same density-bin check; neutral references are often missing (savanna, forest) → use clouds, grey rock,
   or the animal's known neutrals (white feathers, grey elephant skin) with care. Golden-hour warmth is intended — don't neutralize it.
2. **Crop** (§A) — decide before any tonal work; check the pixel budget.
3. **User one-click step:** Select Subject in the Camera Raw Filter (creates the subject mask; can't be done headless).
   Everything else builds on that mask (subject vs inverted subject).
4. **Background** (§B), cheapest fix first.
5. **Subject** (§C): eye, texture, local light.
6. **Noise / B&W decision** (§D).
7. User-only last: Remove strokes, standalone brush.

## A. Crop
- **Eye placement:** IF one eye is visible → eye on a thirds line / power point; the eye is the hero, not the body center.
- **Lead room:** space in the direction of gaze / motion ≥ space behind (≈ 60/40 or more for running or flying subjects).
- **Never cut at joints** (ankles, knees, wrists, wingtips, tail tip); if something must be cut, cut mid-limb, decisively.
- **Aspect follows the pose:** vertical for standing/perched birds and giraffes, wide (16:9, 2:1) for running, herds, elephants with landscape.
- **Subject size:** IF the subject fills < ~5% of the frame and the background has no story → crop tighter; IF the setting tells the story (Kilimanjaro behind elephants) → keep the environment and treat it with the landscape playbook.
- **Pixel budget** (R5 II = 8192 px long edge): web ≥ ~2000 px long edge after crop is plenty; print ≥ ~3600 px for 12″ at 300 ppi. Below that: Camera Raw Super Resolution (2×) on the raw *before* cropping, or Generative Upscale for heavy crops.
- **CHECK:** eye on a power point, lead room correct, no amputations, horizon level, crop survives the pixel budget.
- Metrics to add to `measure_all.py` (not built yet): subject bbox / fill %, eye position vs thirds, lead-room ratio from subject bbox + gaze side.

## B. Background — quiet it, cheapest fix first
Measure first: background busyness (detail energy outside the subject mask), bright hotspots (L* > subject's p95), distracting
color patches (C* outliers), lines crossing the subject (twigs, grass stems).
1. **Tone it down:** inverted subject mask: Exp −0.05…−0.10, Highlights −0.20 (hotspots), Sat −0.05…−0.15, **Texture −0.20…−0.40, Clarity −0.10…−0.20**
   → CHECK: background detail −30% or more, subject untouched (diff map), no halo at the mask edge.
2. **Blur it:** Camera Raw **Lens Blur** (dialog-only for now → user step) when the background is still busy after step 1. Watch the mask edge on fur/feathers.
3. **Remove specific distractions** (bright twig, sign, another animal's leg) — user paints **Remove in the Camera Raw Filter** (readable `$Rtch`). Do it before scripted passes; save first.
4. **Vignette** (radial minus subject): Exp −0.05…−0.10 at the corners — last, light.
- Prefer quieting over replacing; never generative background replacement (non-destructive rule).
- **CHECK:** subject-vs-background separation up: ΔL* (subject − bg) and Δdetail across the mask edge both increase; subject weight > any background region.

## C. Subject
- **Eye:** small radial on the eye ∩ subject: Exp +0.05…+0.10, Whites +0.05, Clarity +0.05, Texture +0.10 → catchlight visible, no glow.
- **Fur / feathers:** Texture +0.15…+0.30 (fine detail), Clarity ≤ +0.10 (halos on edges); Dehaze 0.
- **Dark subjects** (black fur, buffalo, crows): need ~1.5–2× exposure for the same lift (dark-subject calibration) — lift with Shadows + Exp on the subject mask, keep the deepest blacks.
- **White subjects** (egrets, snow): Highlights −0.20…−0.40 on the subject first; check p99.9 < ~98 L* before any lift.
- **Face vs body:** a gentle gradient of attention — face crisp/brighter, hindquarters slightly calmer (Exp −0.03…−0.05).
- **CHECK:** eye is the brightest/sharpest small area on the subject at 1:1; no halos; fur reads as texture, not noise.

## D. Noise and B&W
- High-ISO frames: AI Denoise in the raw stage **before** any Texture/Clarity (sharpening amplifies noise). Note the known LrC → PS round-trip bug with AI Denoise; apply Denoise per the current workaround.
- **B&W route** (user habit): high-ISO, soft depth-of-field falloff, or color-cluttered backgrounds → consider B&W (Nik Silver Efex) — mono hides luminance grain and color clutter. Decide before heavy color work.

## Cases
None yet. Start with 2–3 frames (e.g. Amboseli elephants with Kilimanjaro, a tight portrait, a bird on a busy perch) and
mark each rule ✅ / revise as they are confirmed.
