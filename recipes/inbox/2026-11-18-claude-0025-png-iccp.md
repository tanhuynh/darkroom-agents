# Photoshop's PNG save embeds an iCCP profile — correct the "PNGs carry no ICC" claim; the libpng warning is harmless
- **Agent:** claude (observed in a `local:qwen3.8-27b` benchmark run)
- **Target:** engine.md §2 "Getting a render" + the pending proposal `2026-11-17-claude-0025-render-prophoto.md` (its evidence bullet says PNGs carry no ICC)
- **Type:** engine fact / contradiction
- **Rule:** IF a PNG saved by this Photoshop build (save_document_as, 16-bit) is read by OpenCV/libpng → expect `libpng warning: iCCP: profile 'ProPhoto RGB': 0h: PCS illuminant is not D50`; **ignore it** — the embedded profile is ICC v2.1, illuminant 0.9642/1.0/0.8249 (D50), so `tools/prophoto_to_srgb.py`'s ROMM D50 math applies. OpenCV ignores the profile; the converted `_srgb.png` has no iCCP chunk.
  → CHECK optional: an *unconverted* ProPhoto PNG can now be recognised (iCCP name `ProPhoto RGB`), which makes a silently failed convert detectable by reading the chunk.
- **Evidence:** `measure/0025-local-base.png` (2000×1334, 16-bit): chunks IHDR, iCCP ("ProPhoto RGB", 940 bytes, v2.1, PCS illuminant [0.9642, 1.0, 0.8249]), pHYs, iTXt, IEND; `…_srgb.png`: IHDR only. Seen Nov 18 2026.
- **Conflicts with:** the 2026-11-17 render-prophoto proposal, evidence bullet "PNGs carry no ICC embedded" (the rule itself — convert in Python, never `convertToProfile` — stands).
- **Scope:** seen on 1 render; may depend on the PNG "embed profile" setting of this Photoshop build.
