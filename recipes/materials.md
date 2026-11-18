# Materials — how surfaces behave under measurement and edits

Location knowledge is stored here as **material behavior**, so it transfers: a new place adds or reuses entries
instead of rewriting the playbooks. ✅ = observed on real images (case IDs); ⚠️ = expected, not yet verified.

## Sandstone / red rock (Bryce, Zion, Antelope)
- ✅ Hue ~44–58°, C* 22–35 when lit; shaded rock hue ~44° (0265, 0028).
- ✅ **Scatters warm light into nearby fog and pale rock**: thin fog warm *at the rock's hue* is scatter, not a cast — don't fix globally (9956).
- ✅ Adobe Landscape profile clips the red channel on lit sandstone → prefer Adobe Color / Standard as the base (Zion/Bryce/Antelope critique sessions, Nov 2026).
- ✅ Shaded red rock inside a darks-only mask warms along with forest shadows under `LocalTemperature` (b* +2.7 at +0.30) — Luminance Range can't separate them (0265).
- ✅ Under fog, shaded rock and dark trees share L* and hue (~45°) → no range mask separates them (9956).
- ✅ Over-lifting rock in flat light turns it chalky ("zombie hoodoos") at Exp ≥ +0.20 (9861).

## Pale limestone / white hoodoo caps
- ✅ Reads cream (hue 70–81°, b* +18…+24) in sun — natural, **not a cast** (0265, 0044).
- ✅ Best WB eyedropper target when a true cast exists — the white tower, not the sky-lit white dune (0028).

## Fog / low cloud
- ✅ Dense fog ≈ neutral; check WB by **fog density bins** (`wb.py`). Distant gaps read slightly cool (b* < 0) — natural aerial blue (9956, 0013).
- ✅ Pinkish fog: Saturation alone removes yellow, not magenta → `LocalTint` −0.15 + Sat −0.15 (9956).
- ✅ Bright fog burns ~2× harder than rock → edge burns Exp ≤ −0.06, long ramp, no Dehaze (9956).
- ✅ Dull grey fog can be made to glow: Radial ∩ Lum 0.40/0.50/0.85/0.95, Exp +0.10 → +5…6 L*, rock 0 (9956).
- ✅ Don't dehaze drifting fog away; haze increasing with distance is the depth cue.

## Clouds / sky
- ✅ Sunlit cores ≈ neutral (a* ±1, b* ±1.5); cloud bases cooler (skylight) — natural (0265, 0044).
- ✅ Cloud structure: top ramp ∩ Lum bright (0.58–0.70 → 1); Highlights −0.25…−0.40, Exp −0.05, Texture +0.10…+0.15, Dehaze +0.10. Darker cloud reads cooler (b* −12 on 0013) — taste (0013, 0265).
- ✅ Don't eyedropper partly clipped cloud for WB (0013).

## Conifer foliage (ponderosa / pine forest)
- ✅ Lit: hue ~105–150° (green) (0265). Overcast: blue-green ~176° is normal (0028).
- ✅ Open shade under clear sky: deep foliage darks go **blue** (b* −8…−12) while lit foliage stays green → local warm-up of darks only (0265).
- ✅ Dark trees with no fog lift cleanly with **spot radials ∩ Lum** (dappled pools, not one gradient) (0028, 0013).

## ⚠️ Not yet observed — expected behavior to verify on first use
- **Snow / ice:** large neutral area → ideal WB reference; shade on snow goes strongly blue (more than foliage); watch clipping in the highlight bins; Texture reveals surface.
- **Water:** reflections carry sky color — don't neutralize them; specular highlights clip legitimately.
- **Grass / savanna (Amboseli):** dry grass is warm yellow (hue ~80–95°), easily over-saturated; heat haze at distance softens detail (don't Dehaze it away).
- **Fur:** carry detail with **Texture**, not Clarity (Clarity halos on fur edges); dark fur needs more exposure for the same lift (dark-subject rule).
- **Feathers:** white plumage clips first — check p99.9 before any lift; iridescence shifts hue with angle (don't "fix" it).
- **Skin of elephants / rhinos:** low chroma, high texture; easily goes muddy when darkened — use Texture/Clarity rather than Exposure for presence.
