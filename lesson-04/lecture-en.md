# Chapter 4 Low-Dimensional Data Visualization

> **This lecture comes with an integrated teaching page**: [`./index.html`](./index.html) (Explanation ⇄ Code ⇄ Demo — freely switch among the three tabs)
>
> Recommended teaching approach: open the lesson page in a browser → select a section on the left → switch back and forth among the three tabs (Explanation for principles, Code for ⭐ key points, Demo for actual results).

---

## 4.1 Data Transformation

> Your Crime data is in wide format; visualization often needs long format. A single conversion function solves it.

### 🎨 This section uses colormap (Viridis) to draw the heatmap. For colormap theory, see
               Chapter 3, Section 3.2 — the three types of colormap choices.
             Your original case
Original Section 5.1 used 1985 US 50-state crime data (CSV), containing 8 crime indicator columns.

### Embedded Chen-Wei Textbook Theory

- Long format (long): one observation per row, columns = fields (e.g., {state, metric, value}). Advantage: easy to filter, group, and bind to d3 join.
- Wide format (wide): one entity per row, columns = metrics (e.g., {state, murder, robbery, ...}). Advantage: human-readable and intuitive.
- Conversion: flatMap + looping over key names = done in just a few lines of code.
- d3.autoType: automatically infers column types (number, date, boolean), saving you from manually writing +d.field.

---

## 4.2 Axis Transformation

> Data space → coordinate system space → screen space. Three layers with clear responsibilities; if you get it wrong, everything falls apart.

### Your Original Case
Original Section 5.1.2 used a scatter plot to show the Crime data (murder vs robbery), with axes based on 1985 data.

### Embedded Chen-Wei Textbook Theory

- 

1. Three-layer space:
                
                   Data space: raw values (e.g., population 27058000, murder rate 8)
1. Coordinate system space: normalized to 0..innerWidth (standardized coordinates)
1. Screen space: plus margin offset (final pixel position)

- Why layer: elements within the coordinate system space (lines, points) can be shared, so no recalculation is needed when switching screen sizes. d3.axisBottom automatically handles coordinate system → screen for you.

- 

- scale selection:
                
                  scaleLinear: uniform distribution, most commonly used
- scaleLog: across orders of magnitude (population from 530,000 to 27 million)
- scaleSqrt: area perception (circle area mapped to value)
- scaleBand: categorical axis (bar chart)

---

## 4.3 Curve Fitting

> The same 50 points, drawn with 10 different line.curve styles, look very different. When to use which?

### Your Original Case
Original Section 5.1.3 used a line + scatter plot to show the trend. The original code used curveCatmullRom without explaining why.

### Embedded Chen-Wei Textbook Theory

- 

- Interpolation vs fitting:
                
                  Interpolation: the curve passes through all data points (e.g., Catmull-Rom, Natural)
- Fitting: the curve does not pass through data points, only reflecting the trend (e.g., linear regression LOESS)

- d3.line().curve() provides 10+ curve types; the most commonly used are:
- step family: for discrete steps (digital signals, state transitions)
- catmullRom / natural: tension splines that pass through all points, "look smooth"
- monotoneX: preserves the monotonicity of the original data sequence (no false oscillations)
- Selection principle: data with order → monotoneX / linear; data with large jitter → catmullRom / basis for smoothing; discrete states → step

---

## 4.4 Slope Perception (45° Golden Angle)

### Your Original Case
Original Section 5.1.4 mentions "the optimal average slope is 45°," but does not explain why.

### Embedded Chen-Wei Textbook Theory

- 

- Cleveland 1984 experiment: subjects were asked to estimate the slope of lines, and it was found that:
                
                  When slope = 0° or 90°, estimation error is largest
- When slope = 45°, estimation is most accurate
- It forms a U-shaped curve

- Stevens' power law: perceived slope ≈ (actual slope)^1.0 ~ 1.3. That is, the human eye exaggerates "steepness" by 30%.

- 

- Design principles:
                
                  Keep key data slopes within the 30°~60° range for the most stable read
- When comparing growth curves, use a log axis to keep steepness around 45°
- Avoid trend comparisons below 5° or above 85° (error is too large)

---

## 4.5 Contours (Marching Squares)

### Your Original Case
Original Section 5.2.2 used Marching Squares to extract contours from the Crime data. The original code was a screenshot placeholder.

### Embedded Chen-Wei Textbook Theory

- Marching Squares principle: discretize a scalar field into a grid, where each cell's 4 corners' "whether greater than the threshold" determines the case number 0~15 (2⁴=16 cases). Each case corresponds to 0/1/2 line segments, separating the "above threshold" and "below threshold" regions.
- 16 cases: encoding bit0=BL, bit1=BR, bit2=TR, bit3=TL.
- Extending to 3D: Marching Cubes (Lorensen & Cline 1987), 2⁸=256 cases, commonly used for medical MRI / CT isosurface extraction.

- 

- Application scenarios:
                
                  Topographic contour lines (maps)
- Medical imaging (MRI/CT isosurfaces)
- Density contour plots (kernel density estimation)
- Weather forecasting (isotherms, isobars)

---
