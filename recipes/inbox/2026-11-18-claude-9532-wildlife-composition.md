# Wildlife: head-centred light pool + vignette, desaturated background, local calm for an accent, headroom/edge cuts
- **Agent:** claude
- **Target:** playbooks/wildlife.md — §A (crop), §B.1 (background), new §F (multi-subject interaction)
- **Type:** new rule
- **Rule:**
  1. **§F Multi-subject interaction (a tug, a fight, a hand-over):** IF the point is the action between two faces → DO build a **light pool on the heads** (radial inside, Exp +0.10…+0.14, Shadows +0.10 for a dark object between them, feather ~90, **no subject subtraction**) **and** a vignette centred on the same ellipse (Exp −0.06, `MaskInverted=true`, **no subject subtraction** so the bodies fall off with distance; no Saturation on it, so the animals keep their colour) → CHECK: both heads are the brightest regions (≥ any body or the foreground), measured by region, not by 3×3 cell (cells mix animal and grass).
  2. **IF the brightest large area is foreground ground** (here sand ~15 L\* above the heads) → DO a pull aimed at it (gradient from the action toward that area, minus subject, Exp −0.05, Highlights −0.08, Texture −0.15) on top of the vignette; floor: pure ground/grass cells ≥ ~L\* 28.
  3. **§B.1 add:** IF the animal's fur and the ground/dry grass share a hue (all ~70–75°) → **desaturate the background** on the inverted-subject mask (Saturation −0.15…−0.25 ≈ −22…−30% C\*) and keep the animals' chroma; check the **accent** (red meat, a tongue, a collar) is inside the Select Subject mask or it will grey out.
  4. **Saturated accent:** a subject lift raises chroma with brightness (meat +8 L\* → C\* p95 +21%, red channel at 0.97). IF an accent is near the red-channel limit → add a **local calm** (radial on it: Saturation −0.25, Highlights −0.15) → CHECK chroma p95 back near the original and 0% of pixels ≥ 0.98.
  5. **Eye radials (§C):** skip them when the eyes are dark slits in profile — nothing to brighten.
  6. **§A:** headroom ≥ ~12% above the ears (7% read as tight) and ≥ ~8% under the lowest subject; when both side edges cut animals, cut them at about the same place (both mid-limb/mid-body); do not extend the frame with generative fill (invents anatomy, softer pixels, needs a pixel layer outside the one-filter setup).
- **Evidence:** case 9532 — heads 33.2 → 41.8 and 29.9 → 38.1 L\*, sand 41.6 → 31.8, grass C\* −18…−30%, meat C\* p95 66.7 → 56.7 (original 53.7) with 0% red clipping; crop rounds in the case card.
- **Conflicts with:** 0025's "vignette minus subject" (wildlife §B.4): that one protects a lone subject; here the bodies should fall off, so the vignette does **not** subtract the subject — narrow §B.4's IF to "single subject".
- **Scope:** seen on 1 case (9532) — mark *(1 case)*.
