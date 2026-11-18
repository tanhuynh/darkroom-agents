
AI-Assisted RAW Photo Editing in Photoshop: Claude vs. Gemini


1. What I Built

I wired up an AI-assisted photo editing pipeline on macOS using Adobe Photoshop, a local Model Context Protocol (MCP) bridge (adb-mcp), and custom Python computer-vision scripts (measure_all.py). Instead of generating or painting fake pixels, the AI acts like a master retoucher and color scientist:
1. It exports a working preview of my Canon R5 RAW Smart Object and runs Python math in CIELAB (L*, a*, b*) color space to measure true white balance, tonal distribution, and a 3×3 rule-of-thirds visual weight map.
2. It diagnoses technical flaws (FIX) vs. subjective creative options (TASTE) and proposes a non-destructive Camera Raw Smart Filter plan (using radial gradients, linear ramps, and Luminance Range masks).
3. Once I approve the plan, it applies all sliders and masks directly into Photoshop's Camera Raw Filter via batchPlay—leaving every slider 100% editable by hand afterward—and generates a before/after ΔL* diff heatmap and 1:1 crop to prove the masks landed cleanly without clipping.

2. Why Use an LLM to Edit RAW Files vs. Manual Editing?

• Objective Math Before Touching Sliders: Instead of guessing why a photo feels flat or whether foliage has a color cast, Python measures exact LAB values. On a recent Bryce Canyon landscape, it proved my cloud highlights were dead-neutral while isolating a hidden -12 b* blue skylight cast strictly inside deep forest shadows.
• Surgical Luminance & Mask Precision: Creating intersecting radial + Luminance Range masks by hand in Camera Raw takes tedious trial and error. The AI calculates exact normalized mask coordinates, avoids clipping deep crevices (0.00 ΔL* shift in shadows), and verifies every change quantitatively.
• 100% Non-Destructive & Reversible: Everything lives inside a single native Camera Raw Smart Filter on the RAW Smart Object—no baked pixels, no destructive layers, and every final recipe is saved as reusable JSON/Markdown rules.
• Self-Calibrating Passes: When a slider under- or over-shoots on Pass 1, the AI measures the exact pixel shift (for example, learning that +0.01 LocalTemperature shifts b* by about +0.15 in deep shade) and calculates the exact adjustment for Pass 2.

3. Cost of Using Gemini (Pay-As-You-Go API)

• No Monthly Subscription Required: Using Gemini CLI with a pay-as-you-go Google AI Studio API key avoids $20/month subscriptions and weekly free-tier lockouts.
• Real-World Per-Photo Cost: A heavy, unoptimized 90-turn test session on gemini-3.8-flash (processing ~11.1 million tokens, 95% of which were automatically cached at a 90% discount) cost $1.46 total.
• Optimized Cost: After consolidating our Python measurement and visual overlay scripts into a single measure_all.py execution per checkpoint, a full multi-step photo edit drops to roughly $0.25–$0.40 per image.

4. Head-to-Head Differences: Claude vs. Gemini

I ran a blind A/B test on the exact same 16:9 cropped Bryce Canyon RAW file using shared instructions (CLAUDE.md symlinked to GEMINI.md):
• Aesthetic Philosophy:
	• Claude ("Restrained Storyteller"): Favored milder contrast (+2.5 L* on the hero spire) and focused on calming distracting bright foreground rubble (−5.3 to −6.4 L* plus slight texture softening) while leaving the distant plateau rim hazy (0.0 ΔL*). The result naturally funnels the viewer's eye straight into the center of the canyon.
	• Gemini ("Bold Global Sculptor"): Treated the frame like a contrast-and-histogram optimization problem—lifting the shaded amphitheater bowl higher (+3.96 L*), pulling down the overcast sky (−6.06 L*), and dehazing the distant ridge. Punchy and technically clean with zero crevice clipping, but pulls the eye in multiple directions at once.
• Diagnostic Nuance: Claude caught a localized blue cast in the deep forest shadows (b* = −12.35) and warmed only the darks (L* < 20), whereas Gemini grouped all trees together as natural high-altitude skylight.
• Speed & Visual Feedback: Claude executed faster and automatically surfaced visual proof overlays (diffmap, dbmap, and 1:1 hero crops) during the session so I could inspect mask boundaries visually before saving—a workflow we have now coded directly into our shared GEMINI.md rules for our next wildlife photography head-to-head test.