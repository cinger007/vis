# Chapter 3 Color Topics

> **This lecture is paired with an integrated teaching page**: [`./index.html`](./index.html) (explanation ⇄ code ⇄ demo — freely switch between the three tabs)
>
> Recommended teaching approach: open the lesson page in a browser → select the chapter on the left → toggle between the three tabs (explanation for the underlying principles, code for the ⭐ key points, demo for the actual effects).

---

## 3.1 Color Model Fundamentals

> Why do we need 4 color spaces? What is each one good at? What does the world look like through color-blind eyes?

### Why study color models?
When designing a colormap, you cannot interpolate directly in RGB — because RGB is not perceptually uniform (255,0,0 and 0,255,0 "look" very different in brightness). You need a perceptually uniform color space (Lab / HCL) to interpolate in, in order to get a smooth gradient.

### The 4 major color spaces

- RGB: additive model, device-dependent. The default for screen display.
- HSL: artist-friendly (hue / saturation / lightness are independent), but still not perceptually uniform.
- CIE Lab: perceptually uniform; the gold standard for designing colormaps.
- CMYK: subtractive (printing); not used in web visualization.

### CVD (Color Vision Deficiency)
About 8% of males and 0.5% of females are color-blind. Three common types:

- Protanopia (red-blind): about 1% of males
- Deuteranopia (green-blind): about 6% of males (most common)
- Tritanopia (blue-blind): extremely rare

---

## 3.2 The Three Categories of Colormaps

> Sequential / Diverging / Qualitative. Choosing the wrong type = misleading your readers.

### Three types of colormaps correspond to different data semantics

- Sequential: data with a natural order (population, temperature). Monotonic lightness + monotonic hue. Examples: Viridis / Plasma / Cividis
- Diverging: data with a meaningful "midpoint" (e.g. 0, positive/negative deviation, median of white people). Different colors at the two ends, white/light in the middle. Examples: RdBu / BrBG / PiYG
- Qualitative: unordered data (e.g. product categories). Distinguished by hue, with similar lightness. Examples: Tableau10 / Set1 / Set3

### A typical mistake
Using the diverging RdBu to plot "murder rates of 50 states" (ordered data) — the middle segment is close to white, making it look like the states with "murder rate ≈ 100" are the "midpoint" — but 100 has no semantic meaning; it is purely misleading.

### CVD-friendly checklist

- Viridis / Cividis: ✅ excellent (recommended by Nature Methods)
- RdBu / BrBG: △ moderate (red-green is unfriendly to the color-blind)
- Tableau10 (qualitative): △ depends on hue
- Jet (rainbow spectrum): ⚠ forbidden

---

## 3.3 CIE Lab Gamut Diagram

> In a perceptually uniform color space, what does the gamut look like?

### Why do we need a Lab gamut diagram?
The RGB space is a cube, but you do not know "which colors actually exist and which will be distorted." CIE Lab is a perceptually uniform space where distance ≈ perceived difference to the human eye; it is the standard for designing colormaps and checking the gamut.

### Three gamuts (nested relationship)

- sRGB: the common screen standard (Web / PPT / general scientific figures)
- Adobe RGB: photography / printing, with a wider green gamut
- Rec.2020: 4K TV / HDR, the largest gamut
Colors outside sRGB (such as highly saturated pure green) cannot be displayed on ordinary screens and will be clamped.

### Practical usage

- When converting from d3.lab(L, a, b).rgb(), colors outside sRGB are automatically clamped
- When designing a colormap, use d3.interpolateLab (interpolate in Lab space), which is much smoother than d3.interpolateRgb
- Highly saturated colors only "exist" in print / 4K screens; they may not look accurate on the Web

---

## 3.4 Color Scheme Combination Rules (5 major types)

> Monochromatic / Analogous / Complementary / Triadic / Split-Complementary — when to use which?

### 5 major color-scheme rules

- Monochromatic: same hue, different lightness / saturation. Safe, low-risk.
- Analogous: adjacent on the color wheel ±30°. Harmonious but lacking in contrast.
- Complementary: directly opposite on the color wheel at 180°. Strong contrast but prone to being harsh.
- Triadic: divided into equal 120° segments on the color wheel. Most commonly used for 3 categories.
- Split-Complementary: adjacent to the complement at 150°. A gentler version of complementary.

### Selection principles

- Serious research: monochromatic (Nature's economical black-and-white palette)
- Hierarchy / grouping: analogous
- Highlighting a focal point: complementary (experimental group vs control group)
- 3 categories: triadic
- General cases: split-complementary (contrast without being harsh)

---

## 3.5 Classic Scientific Palettes

> Wong / Paul Tol / Okabe-Ito / Tableau / Paired / Viridis — what are the top journals using?

### 3 gold standards

- Wong 2011: recommended in Nature Methods 8:441; 8 colors, CVD-friendly, grayscale-print-friendly
- Paul Tol: SRON Tech Note; bright (white background) / muted (dark background) / high-contrast (contrast
- Okabe-Ito 2002: 8 colors, CVD-friendly, the early default for Nature / Science

### Commercial / general-purpose

- Tableau 10: the king of business charts, 10 colors, red-green pair is unfriendly to the color-blind
- Paired (12): paired design (before / after treatment), 12 colors is overloaded

### Sequential / Diverging

- Viridis: the default for matplotlib / d3, perceptually uniform + CVD-friendly
- Cividid: a CVD-strengthened version of Viridis (clearer blue / yellow separation)
- RdBu: diverging red-blue

### Practical principles

- Number of categories ≤ 7; when there are many categories, switch to a continuous colormap
- Must pass CVD simulation testing
- Prefer palettes that are CVD-friendly + grayscale-friendly (top journals all use this set)

---

## 3.6 Right-vs-Wrong Case Comparison

> 4 figures, 3 wrong and 1 right. Click the one you think is "right."

### 4 typical mistakes

- ⚠ Rainbow spectrum Jet: not perceptually uniform + not CVD-friendly + not print-friendly. Already banned by Nature.
- ⚠ Red-green contrast: in red-green color blindness, the two nearly become the same color (the most serious accessibility problem)
- ⚠ Too many colors, 12 colors: beyond 7, the eye cannot distinguish them
- ✅ Wong 8 colors: CVD-friendly + grayscale-print-friendly + categories ≤ 8

### Teaching points
Let students vote with their own hands — this deepens their understanding of "why it is wrong" — seeing the theory alone is not as deep as making a wrong choice once in practice.

---

## 3.7 Vivid + Low-Saturation Philosophy Generator

> Number of colors ≤ 7, vivid colors + low saturation = good-looking and durable. The algorithm automatically generates a 5–7 color combination.

### Your color philosophy (distilled into 3 rules)

1. Number of colors ≤ 7: beyond 7, the eye can no longer tell them apart
1. Vivid colors (high H distinction): use H to widen the inter-class distance (≥30°)
1. Low saturation (S 30–50%): no single color should be too "loud"; durable

### Empirical formulas

- Primary color S = 70–80% (vivid but not harsh)
- Supporting colors S = 30–50% (low saturation, durable)
- Use complementary or analogous for accent colors; do not make everything fully saturated
- Use L = 85–90% for highlights (e.g. background, annotations)

### 7-color generation rule
Primary color + 2 analogous (±30°) + 1 low-saturation analogous + 1 complementary + 1 low-saturation complementary + 1 highlight = 7 colors, conforming to the "≤ 7" principle.

---

## 3.8 CVD Academic-Figure Test

> Can your figure still be understood through color-blind eyes? Test it with real top-journal figures.

### 3 "classic paper figure" cases

- Figure 1: 5-category scatter (Wong palette) — Nature style
- Figure 2: sequential heatmap (Viridis) — the most common scientific figure
- Figure 3: red-green contrast (wrong case) — common but serious

### CVD testing workflow

1. Export the figure as PNG
1. Simulate with Coblis or Color Oracle
1. Check whether it can still be distinguished (lightness contrast / shape / labels)

### Measured conclusions

- Wong / Okabe-Ito / Paul Tol: ✅ distinguishable under all 3 types of CVD
- Red-green contrast: ⚠ nearly the same color to green-blind eyes (most serious)
- Nature / Science / Cell have gradually migrated to CVD-friendly palettes

---
