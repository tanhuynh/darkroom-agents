# In fog, Dehaze (and Clarity/Texture) amplify noise: denoise first, keep local Dehaze small
- **Agent:** claude
- **Target:** playbooks/landscape.md §F and §G (Fog-specific); engine.md §8 (calibrations); materials.md (Fog / low cloud)
- **Type:** new rule + engine fact
- **Rule:** IF the frame is mostly fog or low cloud and a correction brings the veiled subject forward → DO NOT use local Dehaze above about +0.10 before the noise is handled: Dehaze +0.25 on a hero oval added **+17–20% grain** in the fog (high-pass std of L\*, σ 1.5 px, 1:1) and +3.1 L\* darkening of the fog, Dehaze +0.10 added +7–8%. → apply a **global Denoise** first (user step; Enhance > Denoise, here 30 then compared with 48), then judge Dehaze/Clarity/Texture on the denoised render; lift the veiled rock with Shadows/Exposure if Dehaze is too noisy (colour is flatter then: C\* 11.3 vs 13.4).
  → CHECK a 1:1 crop of plain fog before and after: grain stays within ~+10% of the undehazed value; fog at the top is not blotchy.
- **Evidence:** case 9944 (ISO 250, 1/80 f/11): fog patch grain Dehaze 0 / +0.10 / +0.25 = 1.91 / 2.06 / 2.29 (top right) and 2.77 / 2.95 / 3.24 (mid right); with Denoise 30: 0.91 and 1.63, with 48: 0.63 and 1.33 (no denoise 1.87 / 2.74). Rock structure (σ2.5 high-pass) 3.89 → 2.74 (30) → 2.46 (48); detail on plain rock vs the unedited frame 0 → −11% (30) → −14% (48), fog −41…−47% (30) / −58…−60% (48). The grain metric mixes real texture with noise in rock; the fog numbers are mostly noise.
- **Conflicts with:** none (playbook §F already says never to dehaze the far plane; this adds the noise cost).
- **Scope:** seen on 1 case (9944).
