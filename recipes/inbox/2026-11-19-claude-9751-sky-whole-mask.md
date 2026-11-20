# A whole-sky mask needs much smaller values than the landscape §F "sky top ramp ∩ bright range" numbers
- **Agent:** claude
- **Target:** playbooks/landscape.md §F (Sky bullet)
- **Type:** change rule (calibration)
- **Rule:** IF the sky correction uses the full **Select Sky** mask (no ramp, no Luminance Range) → DO start at Highlights −0.10, Exp −0.02, Texture +0.15, Dehaze +0.10 (clouds −5…−7 L\*); the §F values (Highlights −0.25…−0.40, Exp −0.05) are for a ramp ∩ bright range and measured on cloud cores → CHECK the median sky ΔL\* on the render (not the cores) and subtract the subject (blend 1) if hair or edges meet the sky.
- **Evidence:** case 9751 (overcast, ~35% cloud): Highlights −0.25, Exp −0.04, Dehaze +0.10 on the whole Sky mask → top row ΔL\* −8.5…−11 (forecast −3…−4); Highlights −0.10, Exp −0.02 → −5…−7. Without the Subject subtraction the sky mask reached the windblown hair (probe: hair ΔL\* p10 −35); with it the hair edge was clean at 1:1.
- **Conflicts with:** playbooks/landscape.md §F numbers only when applied to a whole-sky mask (not a contradiction of the ramp rule).
- **Scope:** seen on 1 case (9751).
