# A user-applied global Denoise adds `$FltL` and a very large `$BigT`; scripted writes kept it; AI mask digests change after it
- **Agent:** claude
- **Target:** engine.md §5 (read/write keys; ACCESS: adb-mcp key names) and §9 (who does what)
- **Type:** engine fact (the key names are ACCESS: adb-mcp; the behaviour is DURABLE)
- **Rule:** IF the user applies Denoise (Enhance) in the Camera Raw Filter → the live `get` gains `$FltL` (~5.6 KB XMP: `crs:FilterList`, `Name="Enhance"`, title Denoise, an opaque `CompressedSettings` id that changes with the amount) and `$BigT` grows from ~1 MB to ~57 million characters (the denoised image). DO resend `$FltL` on every write (`tools/ps_filter.js set` does: it resends every key except `$BigT`); do not parse its amount (opaque). After the Denoise the AI masks' `InputDigest` / `LocalInputDigest` / `MaskDigest` and `WholeImageArea` changed once the user refreshed them (Sky, Mountains) — re-read before cloning. Denoise is whole-image (no mask seen in `$FltL`; not verified that no UI option exists). Local masks have only the plain `LocalLuminanceNoise` slider (not tested).
  → CHECK after a write: `$FltL` readback equal; render a plain fog patch — grain stays low (here 0.74 / 1.40 vs 1.87 / 2.74 without denoise).
- **Evidence:** case 9944: three scripted writes after the Denoise (hero range, vignette ×3) left `$BigT` absent in the readback but the denoise rendered unchanged; changing the amount 48 → 30 changed only `$FltL` (`CompressedSettings` id) and left `$LCs` identical.
- **Conflicts with:** none.
- **Scope:** seen on 1 case (9944); the denoise survived writes there, not verified elsewhere.
