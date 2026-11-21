# Dodge and burn for a near-white sunlit hero: Subject ∩ gradient ∩ Luminance, Exposure-led, with a chroma restore
- **Agent:** claude
- **Target:** playbooks/landscape.md §C (Hero separation) and §D; engine.md §8
- **Type:** new rule (calibration)
- **Rule:** IF the hero's lit faces are near white (here 20% of the hero pixels above L\* 85, 17% with a channel above 0.97) and the Subject mask covers more than the hero → DO two corrections on **Subject 1 ∩ a linear gradient that limits it to the hero ∩ a Luminance Range**: a **burn** on the bright tones (gradient Zero y 0.62 → Full 0.50, Luminance 0.74/0.82/1/1: Exp −0.10, Highlights −0.22, Whites −0.18, **Sat +0.04**) and a **dodge** on the shaded sides (gradient Zero 0.56 → Full 0.44, Luminance 0.15/0.25/0.48/0.58: Exp +0.08, Shadows +0.20, Clarity +0.08). A colour grading (highlights hue +35 / sat +15, midtones hue +38 / sat +28, blending +50) restores the orange the near-white lost.
  → CHECK lit faces end 10–15 L\* lower (here 89 → 75, head 82 → 61, neck 89 → 72), near-clipped share under 1%, lit–shade gap about 40 (was 60), and the hero stays the brightest part of the frame (foreground base 69 vs neck 72).
- **Evidence:** case 0159: first pass Exp −0.14 / Highlights −0.30 / Whites −0.25 gave −17.4 on the lit pixels (forecast −8…−12) and put the head (54.9) below the foreground base (68.9); Highlights and Whites alone barely move the whitest pixels (−2.3 on the gravel at Exp −0.08 / Highlights −0.25 / Whites −0.15), so the burn must lean on Exposure. A chain of two intersects after one add (Subject, gradient, Luminance) rendered correctly (changes only in x 45–99%, y 8–61%).
- **Conflicts with:** none.
- **Scope:** seen on 1 case (0159).
