# The Camera Raw Filter's Calibration panel is separate filter keys: readable and writable by script (raw-SO calibration is not)
- **Agent:** claude
- **Target:** `engine.md` §5 (Read: keys list) and §9 (Who does what: "White balance, Calibration")
- **Type:** engine fact; the key names are ACCESS (adb-mcp), the behavior is DURABLE
- **Rule:** IF the user sets Calibration in the **Camera Raw Filter** (not the raw SO) → the live filter has `$RHue $RSat $GHue $GSat $BHue $BSat $BlkB` (dialog value = stored value, integers; Blue Hue −8, Saturation +7 read back as −8 / 7) → DO include them in every resend (`ps_filter.js set` resends all keys), diff them with the rest of the filter, and a scripted change of just one is possible by editing the saved `get` JSON. Raw-SO calibration is still not readable.
  → CHECK: Blue Saturation +10 → +7 moved L\* −0.1, C\* −0.2, b\* −0.2 evenly everywhere; Blue Hue −8 / Sat +10 together added about +0.4 L\*, +0.6 b\*, +1.4 C\* (+6% chroma) on orange rock with almost no blue in the frame (blue primary crosstalk, not a blue shift).
- **Evidence:** case 9799: keys appear in `get` after the user's dialog edit; value read back as 10 then 7; render diff above.
- **Not verified:** the Red and Green primaries' keys (assumed by name); whether writing them from a script needs an AI refresh.
- **Scope:** 1 case.
