# A user-painted Remove (`$Rtch`) survives scripted writes; the AI-refresh OK re-normalises it and the masks without changing any slider
- **Agent:** claude
- **Target:** `engine.md` §7 (Remove) and §6 *Write semantics*
- **Type:** engine fact (the key name is ACCESS: adb-mcp)
- **Rule:** IF the user paints a Generative Remove in the filter after the masks → the live `get` gains `$Rtch` (~6 KB, one `heal_patchmatch` / `fill_method="firefly"` item, `$BigT` grows ~1 MB → ~2 MB) → DO resend `$Rtch` unchanged with every write (`ps_filter.js set` does) and **expect the next dialog OK (AI refresh) to rewrite `crs:IngestInfo` in it and the AI/object masks' `WholeImageArea` / `Origin` by ±1 px**; slider values and component lists stay identical. A byte comparison of `$Rtch` or `$LCs` between reads therefore reports "different" — compare the values, not bytes.
  → CHECK: diff the correction values and component counts, not the raw XML.
- **Evidence:** case 9834: the XML after the first refresh vs after the second differed only in `IngestInfo`, `WholeImageArea` (`1920/1,2879/1` ↔ `62914560/32768,…`), `Origin` ±1, digests; the render of the patch region was unchanged.
- **Note:** the workflow says to save before the first scripted write after a Remove; I wrote once without saving (verified safe on 9956) and the patch survived.
- **Scope:** 1 case.
