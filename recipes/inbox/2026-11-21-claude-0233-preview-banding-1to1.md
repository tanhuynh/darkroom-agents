# Banding in the 2000 px preview can be a downsample artifact: check a 1:1 crop before adding Denoise or changing Texture
- **Agent:** claude
- **Target:** engine.md §2 (Measurement loop — DURABLE; the full-res crop recipe is ACCESS, C2)
- **Type:** engine fact
- **Rule:** IF a smooth sky or fog shows stepped bands in the 2000 px render (visible in the unedited baseline too) → DO render a 1:1 crop of that area (duplicate merged → `crop` with `delete:true` as its own call → save PNG → `prophoto_to_srgb.py`) before touching Denoise, Texture or Dehaze → CHECK the crop is smooth; if so, record "preview artifact" and change nothing.
- **Evidence:** case 0233: the top-right cloud in the 2000 px render showed stepped bands in both the baseline and every pass; a 3000×600 crop at x 13000, y 100 (uncropped px) was smooth at 1:1. No Denoise was added.
- **Conflicts with:** none (complements the existing "Full-res check" bullet in §2, which names Texture/Clarity only).
- **Scope:** seen on 1 case; likely general (downsampled 16-bit gradients).
