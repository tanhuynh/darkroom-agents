# Sky/fog Highlights −0.08 on a smooth fog sky moved L* by only −0.8 (not the −3…−4 seen on near-white ramps)
- **Agent:** claude
- **Target:** playbooks/landscape.md §F (Sky) and §G (Fog-specific); engine.md §8 (calibrations)
- **Type:** change rule (adds a surface qualifier to the existing sky numbers)
- **Rule:** IF the sky is a smooth fog (L\* median ~84, p95 ~89, texture ~0.2, no clipped cores) and the Sky AI mask covers it (whole-sky mask, no ramp) → DO NOT forecast from the near-white-ramp numbers: Highlights −0.08 → **−0.8 L\*** (range −0.2…−0.9; top band 87.4 → 86.6, mid fog 81.2 → 80.3); reaching −3…−4 L\* needs roughly Highlights −0.25…−0.30 (not tested — hypothesis). Dehaze below +0.25 shows nothing on fog, so leave it out of the plan.
  → CHECK the fog still increases in density with distance and does not turn grey; measure the sky zone before and after.
- **Evidence:** case 9884: sky zone L\* 84.5 → 83.6 (−0.83 median; p5/p95 of ΔL\* −0.94/−0.18), rock zones changed ≤ 0.14. Compare 9834 (ramp ∩ bright range 0.72/0.84/1/1, Highlights −0.10 → −3.8 L\*) and 9751 (whole-sky mask on textured cloud, Highlights −0.10 → −5…−7).
- **Conflicts with:** none (it narrows §F's "Highlights −0.25…−0.40 → −3…−5" to bright ramps and clouds with texture).
- **Scope:** seen on 1 case (9884); the cause (smooth tone vs mask shape) is a hypothesis.
