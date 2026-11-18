# Wildlife playbook — ⚠️ DRAFT (2 wildlife cases so far: 0025, 9532)

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
7. **Lens Blur** (user, Camera Raw Filter; §B.2) — after every scripted pass is done and approved.
8. User-only last: standalone brush.
   (Remove is the exception: it comes first, before any scripted pass — §B.3.)

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
1. **Tone it down:** inverted subject mask: Exp −0.05…−0.10, Highlights −0.20 (hotspots), Sat −0.05…−0.15 (**−0.20 when fur and ground share a hue: C\* −29% on grass/sand, 9532**; check an accent such as red meat is inside the Select Subject mask), **Texture −0.20…−0.40, Clarity −0.10…−0.20**
   → CHECK: background detail −30% or more, subject untouched (diff map), no halo at the mask edge.
2. **Blur it:** Camera Raw **Lens Blur** (dialog-only → user step) when the background is still busy after step 1. Watch the mask edge on fur/feathers. *(1 case: 0025)*
   - **Order:** default is Lens Blur **last**, after the scripted passes are approved — it changes how the other effects read, so judge them with the blur in place. A later scripted write is safe **if it resends every key**, including `$Lblr`, `$DMIn` and the depth corrections (`DepthBasedCorrections` in `$LCs`), with `$BigT` omitted. Verified on 0025 on a saved copy: an identity write and a tonal write (Pull off, Pull Copy −0.10 → −0.06) left the depth block, `$Lblr` and `$DMIn` byte-identical and the blurred background's detail unchanged (±0.4%); the tonal change landed exactly as before. *(1 case; a crash/restart can still lose a pass — read the live filter first.)*
   - **Do it, then re-judge:** the blur removes background detail (0025: −88% in the blurred upper background, bottom grass unchanged) and does **not** change tone or the other local effects: Push/Pull Copy effect with the blur on vs off matched to ≤ 0.04 L\* everywhere (map correlation 1.000; four-way control on the final file). If the light "looks weaker" after a blur it is perception, not the blur eating the gradient. Re-judge by eye; adjust by hand in the dialog.
   - **Edge check at 1:1 (do it):** the blur follows its own depth map, not the Select Subject mask. On 0025 the neck edge was clean but **fine feather tips and stray hairs that stick out past the subject were blurred away** (feather skirt, a long stray hair on the neck). Paint those into the subject depth (the depth refinement brush) before saving. A diff of blur-on vs blur-off at 1:1 (|ΔL\*|×15) shows exactly where it bites.
   - **Mask:** reopening the dialog for the blur recomputed the Select Subject mask (digests and Origin changed; bird tone changed ≤ 0.3 L\*).
3. **Remove specific distractions** (bright twig, sign, another animal's leg) — user paints **Remove in the Camera Raw Filter** (readable `$Rtch`). Do it before scripted passes; save first.
4. **Vignette** (radial minus subject): Exp −0.05…−0.10 at the corners — last, light. *(single subject; for a two-face action use the head-centred vignette in §F, which does not subtract the subject — 9532)*
- Prefer quieting over replacing; never generative background replacement (non-destructive rule).
- **CHECK:** subject-vs-background separation up: ΔL* (subject − bg) and Δdetail across the mask edge both increase; subject weight > any background region.

## C. Subject
- **Eye:** small radial on the eye ∩ subject: Exp +0.05…+0.10, Whites +0.05, Clarity +0.05, Texture +0.10 → catchlight visible, no glow. *(1 case: 0025 — judge at 1:1: the 164×120 px box gained +1.5 L\* mean, brightest catchlight px +3.2 L\*; it read 0.00 at 2000 px.)*
- **Fur / feathers:** Texture +0.15…+0.30 (fine detail), Clarity ≤ +0.10 (halos on edges); Dehaze 0.
- **Dark subjects** (black fur, buffalo, crows): need ~1.5–2× exposure for the same lift (dark-subject calibration) — lift with Shadows + Exp on the subject mask, keep the deepest blacks.
- **White subjects** (egrets, snow): Highlights −0.20…−0.40 on the subject first; check p99.9 < ~98 L* before any lift.
- **Face vs body:** a gentle gradient of attention — face crisp/brighter, hindquarters slightly calmer (Exp −0.03…−0.05).
- **CHECK:** eye is the brightest/sharpest small area on the subject at 1:1; no halos; fur reads as texture, not noise.

## D. Noise and B&W
- High-ISO frames: AI Denoise in the raw stage **before** any Texture/Clarity (sharpening amplifies noise). Note the known LrC → PS round-trip bug with AI Denoise; apply Denoise per the current workaround.
- **B&W route** (user habit): high-ISO, soft depth-of-field falloff, or color-cluttered backgrounds → consider B&W (Nik Silver Efex) — mono hides luminance grain and color clutter. Decide before heavy color work.

## E. Push-Pull Directional Light Source (Matt Shannon Technique) *(1 case: 0025)*
Creates atmospheric depth and directional light flow in flat scenes by pulling back the background behind the subject and pushing warm directional light across the forward gaze:
1. **Shadow-Side Burn (The Pull Behind Subject):**
   - **Mask:** Linear gradient, **subtracted by Subject** (`MaskBlendMode="1"`, `MaskInverted="false"`). **Aim it from the subject toward the heaviest background (read the baseline weight grid first), not from the frame edge "behind" the subject.** The position of the subject in the frame decides the direction; there is no fixed "behind". Use **one** pull, not two stacked.
   - **Parameters:** `LocalExposure2012` −0.04…−0.06, `LocalBlacks2012` −0.02, `LocalHighlights2012` −0.04; keep `LocalTemperature` **0** (neutral) unless the natural environment is explicitly cool shadow (cooling warm savanna grass turns it to unnatural cyan mud).
   - **0025 evidence:** crane facing right on the left third, heavy grass along the bottom (Bot-Left 27%, Bot-Right 20% of weight). A horizontal left-edge pull (0.32→0.02, Exp −0.02) moved only the left grass (−1.4…−2.0 L\*). A diagonal pull toward the lower left (0.23,0.34)→(0.11,0.80), subtract Subject, hit the weight: Exp −0.10 → bottom −6.4…−7.4 L\* (too heavy, bottom-left corner ~L\* 28 with the vignette), Exp −0.06 → about −4 L\*, bottom-left grass still ~31. Bird deep darks and whites unchanged (±0.05) in both.
   - **Stacking:** with a vignette and a background-quieting pass already in place, check pure-grass cells against a floor of about L\* 38 after every pull.
2. **Directional Light Kiss (The Push In Front of & Onto Subject):**
   - **Mask:** Large soft radial (Feather: 85–90) entering from the upper corner in the direction of the subject's gaze. **DO NOT subtract the subject**—light must naturally illuminate the subject's facing contour (beak, crown, chest), avoiding a cardboard-cutout reverse halo.
   - **Parameters:** `LocalExposure2012` +0.03…+0.05, `LocalHighlights2012` +0.05…+0.08, `LocalTemperature` **+0.015** (start here; +0.03 read +1.0 b\* on dry grass, about +0.3…0.4 b\* per +0.01), `LocalDehaze` 0…−0.04 (gentle glow; never heavy negative Dehaze which washes out black levels).
   - **0025 evidence:** radial L 0.22 R 1.02 T −0.45 B 0.55, feather 88, Exp +0.03 / Highlights +0.05 → head and beak +1.4 L\*, upper neck +0.7, chest 0.00, no seam at 1:1. **But** the grass in the upper right rose +2.3 L\*, more than the head, so the bird-to-grass gap on the lit side did not widen; the gain is directional light, not separation. **Subtracting the subject was tested and is worse:** the head gets +0.3 L\* instead of +1.3 while the grass stays +2.3 (so the gap shrinks); don't. If separation is the goal, make the radial smaller around the head.
- **CHECK:** Light wraps naturally onto the subject's lit side without a cutout seam; shadow side is anchored without cyan discoloration; no milky haze or clipped highlights; bird-vs-grass gap (ΔL\*, subject minus background) did not shrink on the lit side; pure-grass cells ≥ ~L\* 38.

## F. Multi-subject interaction (a tug, a hand-over, two faces) *(1 case: 9532)*
Goal: the eye goes to the faces/action first, not to a bright body or the foreground.
1. **Measure by region, not by 3×3 cell** (cells mix animal and grass): heads vs bodies vs the brightest background area. In 9532 the heads (L\* 30–33) were darker than the sand (L\* 42): a vignette alone cannot fix that.
2. **Head light** — radial **inside** over both heads and the object between them (feather ~90), Exp +0.10…+0.14, Shadows +0.10 (for a dark object), **no subject subtraction** → heads ≈ +5 L\* on top of the subject lift.
3. **Head vignette** — radial centred on the same ellipse, `MaskInverted="true"`, Exp −0.06, **no subject subtraction** (the bodies fall off with distance), no Saturation on it (keep the animals' colour).
4. **Pull** at the brightest large background (e.g. sand): gradient from the action toward it, minus subject, Exp −0.05, Highlights −0.08, Texture −0.15; floor: pure ground/grass ≥ ~L\* 28.
5. **Accents** (red meat): a subject lift raises chroma with brightness (meat C\* p95 +21%, red channel 0.97) → radial **calm** on the accent: Saturation −0.25, Highlights −0.15; check chroma p95 near the original and 0% of pixels ≥ 0.98.
6. **Eyes:** skip Eye radials when the eyes are dark slits in profile.
- **CHECK:** both heads are the brightest regions; accents not clipped; animals' chroma unchanged or up; headroom ≥ ~12% above the ears, ≥ ~8% under the lowest subject; side edges cut animals at about the same place.
- **Do not** extend the frame with generative fill (invents anatomy, softer pixels, outside the one-filter setup).

## Cases
- **0025** — grey crowned crane, dry savanna grass, flat overcast (`cases/0025.md`). Supports §A crop (lead room), §B.1 background quieting (incl. Highlights/Saturation), §B.2 Lens Blur order, §E Pull/Push — each *(1 case)*. §C Eye was not measurable at 2000 px.
- **9532** — two servals tugging a fish, a third watching, flat overcast (`cases/9532.md`). Supports §B.1 (desaturate the background when fur and ground share a hue), §A (headroom, symmetric edge cuts), §F (head light + vignette, accent calm) — each *(1 case)*. §C Eye radials were useless on dark eyes.
- Next: 2–3 more frames (e.g. Amboseli elephants with Kilimanjaro, a tight portrait, a bird on a busy perch); mark each rule ✅ / revise as they are confirmed, and drop *(1 case)* only on a second case.
