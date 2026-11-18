# 0265-gemini — Midday amphitheater, Gemini single-pass edit (benchmark)

| agent | role | genre | light | problems addressed | location | filter JSON |
|---|---|---|---|---|---|---|
| gemini | benchmark | landscape | midday, clear, open shade | murky bowl, flat sky, right edge | Bryce, 2026-11-02 | not archived yet — Gemini to export `crf-0265-gemini.json` from `_52_0265-Edit-gemini.tif` |

Same 16:9 crop as the final. One Camera Raw Filter, 4 corrections (read from the open document 2026-11-17):
- **Sky Cloud Structure:** top ramp (Zero y 0.22 → Full y 0.03) ∩ Lum 0.65/0.78/1/1; Exp −0.05, Highlights −0.30, Dehaze +0.10, Texture +0.15 → sky −6 L*.
- **Central Amphitheater Presence:** radial T.22 L.20 B.62 R.70 F75 ∩ Lum 0.16/0.26/0.55/0.70; Exp +0.10, Shadows +0.20, Clarity +0.15, Texture +0.15, Sat +0.05 → mid detail +16%, crevices 8.4 → 8.0.
- **Distant Rim Clarity:** radial T.12 L.05 B.30 R.95 F70 ∩ Lum 0.22/0.32/0.60/0.75; Exp −0.025, Clarity +0.10, Dehaze +0.15 → rim −2.3 L*, +4% detail (against the depth rule).
- **Right Frame Edge Calming:** linear (Zero x 0.84 → Full x 1.0) ∩ Lum 0.45/0.58/1/1; Exp −0.0625, Highlights −0.10, Sat −0.05.

**Compared with the final** (`0265.md`, `comparisons/0265-claude-vs-gemini.md`): stronger mid-ground structure and cloud modeling
(both adopted into the final via passes 3–5 → landscape §E/§F); hero spire untouched (detail −1%), bottom-right rubble barely calmed,
forest shadow cast not addressed (b* −8.0), distant rim dehazed.

**Rules this case supports:** landscape §E structure pass (origin of the midtone-face mask), §F cloud values; counter-example for §F "never dehaze the far rim".
