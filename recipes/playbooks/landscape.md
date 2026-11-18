# Landscape playbook

Rules are written as **IF** (what `measure_all.py` / `wb.py` / the eye shows) **→ DO** (starting values, stored XMP units)
**→ CHECK** (what must hold after the render). Values are starting ranges, not presets — render → measure → adjust.
Each rule cites the cases it came from (`cases/<id>.md`). Rules seen on one image only are marked *(1 case)* — promote or
revise when a second image confirms or contradicts them.

## Default plan
1. **WB** (§A) → 2. **Crop** (§B) → 3. **Subject edit**: hero crispness + calm the loud edges + local casts (§C, §D) →
4. **Structure pass** on the mid-ground (§E) → 5. **Sky / depth** (§F) → 6. user-only steps last (Remove, brush).

## A. White balance — cast vs scatter vs local shade
- **IF** every neutral shifts the same way (clouds *and* pale rock *and* foliage hue off: e.g. limestone b* −14…−20, trees −102°)
  **→** true global cast → user fixes in the raw SO (eyedropper on a lit neutral; Tint matters — cyan casts need Tint +5…+7)
  **→ CHECK** lit neutrals a*≈0, rock hue back to ~55°, foliage green/blue-green. *(0028, 0013)*
- **IF** dense fog/cloud cores are neutral but thin fog / pale rock is warm *at the rock's hue*
  **→** scatter, leave it (a global fix turns dense fog and distance cyan). *(9956, 0265)*
- **IF** only the deepest darks (L* 10–20) are blue (b* < −8) while lit foliage is green
  **→** open-shade skylight → local: radial over the shaded zone ∩ Lum 0/0/0.14/0.24, `LocalTemperature` +0.25…+0.30, Tint +0.04, **no Shadows**
  **→ CHECK** darks b* ≈ −3…−5, foliage hue unchanged, crevices not lifted; distant haze (L* 30–45) still cool. *(0265, 1 case)*
- Faint residual green in clouds (a* ≈ −1…−1.5) is optional Tint +2…+3 in the raw SO — taste.

## B. Composition & crop
- **IF** the weight map peaks away from the subject (corner rubble, dead sky with <2% weight, competing fins at an edge)
  **→** crop first, before tonal work: 16:9 to drop dead sky/foreground, side trim to move the hero onto a third, 2.4:1 for panos
  **→ CHECK** hero on a thirds line/point, leading lines (gully, ridge, wash) still enter the frame, nothing important cut. *(0265, 0013, 9861, 0028, 9956, 9792)*
- Keep a framing element that must enter from its corner (branch, fin) rather than cropping through it. *(9792, 1 case)*
- Mock crops on the preview with a thirds grid (`--crop`) before touching Photoshop.
- Before "fixing" a color patch at an edge, check what it is (real red cliff vs vignetting). *(9861)*

## C. Hero separation — crispness over brightness
- **IF** the hero is not the brightest/most detailed mass
  **→** hero radial (feather 55–60) ∩ Lum on its lit faces (0.30/0.40/0.85/0.95): Clarity +0.15…+0.22, Texture +0.12…+0.22, Exp +0.05 (+0.20 EV), Highlights −0.15
  **→ CHECK** hero +2…+3 L*, detail +10…+30% (judge at 1:1), top not clipping. *(0265, 0044, 0013)*
- **IF** the hero is darker than its surroundings
  **→** separate by darkening the *surround* (Exp −0.08, Sat −0.05, radial minus hero) plus hero crispness; cap the hero lift (~+0.10 stored)
  **→ CHECK** hero ≥ surround by ~5–10 L* or separated by chroma; no chalky rock. *(0028, 0013, 9861)*
- Keep competing look-alikes (other hoodoos/fins) **out** of hero masks. *(0028)*
- **Secondary anchor at a frame edge** (a fin/tree that frames the scene): radial ∩ its tone range (e.g. 0.05/0.12/0.50/0.62, keeps fog/sky out), Clarity/Texture +0.20, Dehaze +0.15 → detail +15%; +0.12/+0.08 was too timid. *(9956, 1 case)*
- **Every bottom burn / vignette must subtract the hero radial** or it darkens the hero's base. *(0028)*

## D. Calm the loud edges
- **IF** a bright, textured edge/corner mass carries more weight than the hero
  **→** radial or gradient on it: Exp −0.06…−0.08, Highlights −0.15, Sat −0.05…−0.10, **and Texture −0.15 / Clarity −0.10** (weight on busy rubble is texture-driven; burns alone barely move it)
  **→ CHECK** its weight drops and the eye goes to the hero first — stop there even if the weight ratio still favors the edge. *(0265, 9956, 9785)*
- Edge burns over bright fog: Exp ≤ −0.06, long ramp (last ~20% of the frame), no Dehaze; target edge ≈ interior, never a dark band. *(9956)*
- Frame burn for a light pool: (bottom ∪ left ∪ right) ∩ below-horizon, Exp −0.08, Sat −0.05. *(9785, 1 case)*

## E. Structure pass on the mid-ground (adopted 0265 — Claude + Gemini merge)
- **IF** the mid-ground is murky (median L* ~20–25) or its detail is low
  **→** lift the **midtone/lit faces, never the shadows**: radial over the mid-ground ∩ Lum **0.16/0.26/0.55/0.70**, Exp +0.08…+0.10, Shadows +0.10…+0.20, Sat +0.05; plus Clarity +0.15 **and** Texture +0.15 on the same range
  **→ CHECK** crevices (L* < 12) at or below their original L*; lit faces +3…+5 L*; mid detail +10…+15%; mid-ground still darker than the hero. *(0265; supported by 9956 hub light)*
- A darks range (0.05/0.12/0.45/0.60) with Shadows only fills the crevices and flattens the scene (pass 2 → crevices 8.4 → 9.7, detail +1%). *(0265)*
- Crevice "unplug" (only if they are crushed, p1 ≈ 2): Radial ∩ Lum 0/0/0.08/0.16, Shadows +0.20, Blacks +0.10 → stop at p1 ~3.5. *(9956, 1 case)*
- Dark subject / hub in the mid-ground needs ~1.5–2× the exposure (Exp +0.12…+0.17) ∩ lit-faces range (0.05/0.12/0.60/0.80). *(9956)*

## F. Depth, haze and sky
- **Never dehaze or clarify the farthest plane** — increasing haze is the depth cue. Background detail: Clarity/Texture ≤ +0.12, Dehaze ≤ +0.08, faded toward the haze. *(9956, 0013, 0265)*
- **IF** a mid-distance hazy area should come forward (forest/wall behind the hero)
  **→** Dehaze +0.25…+0.60 + Clarity +0.15 (not an exposure burn — that makes a dark blob: −25% detail)
  **→ CHECK** detail up, L* down ~5–8, haze still increasing with distance. *(9861, 9956)*
- Distant ravines: radials ∩ Lum shadows 0/0/0.30/0.42, Exp −0.04, Blacks −0.10 → −2…−3 L*; don't push far darks toward foreground darks (FG ~12 vs far ~24). *(0013, 1 case)*
- Sky: top ramp ∩ bright range, Highlights −0.25…−0.40, Exp −0.05, Texture +0.15, Dehaze +0.10 → cores −3…−5 L*. *(0265, 0013, 9785)*
- Storm break with no light below: light pool (feathered radial, Exp +0.09, Sat +0.03) + frame burn + sky top darkening; order dark top → glowing break → lit field → darker frame. *(9785, 1 case)*

## G. Fog-specific
- Keep the order **sky > fog > land**, and the darkest mid-ground darkest. *(9792)*
- Underexposed land under bright fog (bimodal: land L* ~12, sky ~86): start low — Exp +0.25, Shadows +0.20, Blacks +0.10, Sat +0.10 → ~30 L*; sky Highlights −0.25, Exp −0.05, Dehaze +0.10 → ~76. Higher values made it "sunlit" and erased the fog band. *(9792, 1 case)*
- Rock emerging from fog: fade gradient ∩ rock-tone range (measure first; e.g. 0.05/0.12/0.48/0.60), Texture +0.25, Clarity +0.15 → +20…39% detail, fog untouched; may then need a foreground calm. *(9956)*
- Flat fog light: rock Exp lifts ≤ +0.06…+0.10 (+0.20 → chalky); separate via the surroundings. *(9861)*
- ❌ Don't try to lift trees inside fogged crevices — no mask separates them from shaded rock. *(9956)*
- Ridge crest in fog: dehaze band along the crest (two gradients, `acr_band.py`) ∩ Vegetation − rock, Dehaze +0.40. *(9822, 1 case)*

## H. Trees and foliage (no fog)
- **IF** dark trees should read
  **→** several small spot radials ∩ Lum 0/0.08/0.42/0.52, Exp +0.15…+0.24, Shadows +0.30, Sat +0.10, Temp +0.06 (dappled, not one gradient); optionally deepen a band afterwards with Color Range on the green, Exp −0.03…−0.08
  **→ CHECK** rock ΔL* 0; skip far forest near fog (goes grey). *(0028, 0013)*
- Big foreground tree: object mask ∩ Color Range on needles, Texture +0.25, Clarity ≤ +0.15 (more → bright rim). *(0013, 1 case)*

## I. Color
- Global saturation shifts rock to orange; prefer Calibration Blue primary Sat +5…+7 / Hue −9 (raw SO) for even rock + greens. *(0028, 1 case)*
- Saturation cuts show up as "cooler" b* on warm rock in Δb* maps — not a cast.

## Critique standards (landscape)
- Say what works first (composition, leading lines, DR retention, shadow detail, tonal balance), then top 2–3 FIX vs TASTE.
- Web default; print only when the user says so (then strict clipping/gamut). Ignore the mat.
- Restrained, center-guiding sculpting; the user likes some saturation and finds overly cautious edits flat — the structure pass (§E) is the answer to "flat", not global contrast.
