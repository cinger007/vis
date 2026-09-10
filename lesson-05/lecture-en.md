# Chapter 5 Temporal Data Visualization

> **This lecture comes with an integrated teaching page**: [`./index.html`](./index.html) (Explanation ⇄ Code ⇄ Demo — freely switch among the three tabs)
>
> Recommended teaching approach: open the lesson page in a browser → select a section on the left → switch back and forth among the three tabs (Explanation for the principles, Code for the ⭐ key points, Demo for the actual effect).

---

## 5.1 Temporal Attributes

> Time has 5 core attributes: ordered / continuous / periodic / independent of space / structural. Each attribute affects visualization design.

### Your Original Case
The original Section 6.1 listed 5 temporal attributes without any visualization. This chapter turns these 5 attributes into interactive cards.

### Integrating Chen Wei's (陈为) Pedagogical Theory

- Order: Time is ordered; two events have a sequence, tightly linked to causality.
- Continuity: Time is continuous; between any two points in time there always exists another point in time.
- Periodicity: Natural processes often follow cyclic patterns (seasons, day/night), so a cyclic time domain may be used.
- Independence from space: Time is closely related to space, yet scientific processes mostly treat them independently.
- Structure: The time scale is divided into year/month/day/hour/minute/second; the divisions reflect both natural phenomena (day/night) and human conventions (60 seconds).

### Why Are All 5 Attributes Important?
Clarifying these 5 attributes before designing a time-series chart helps avoid common mistakes:

- Missing order → scatter plot misaligned into noise
- Confused continuity → wrong connecting lines for discrete data
- Ignored periodicity → seasonal trends get "flattened out"
- Structural mismatch → errors in weekdays/weekends, leap years

---

## 5.2 Standard Temporal Visualization (Line Chart)

> x-axis = time, y-axis = measurement. The most common time-series chart: the usage frequency of French given names from 1900–2020.

### Your Original Case
The original Section 6.2.1 used a line chart to show the usage-frequency changes of French given names (Marie / Jean / Camille) over several decades. The original page included a "word cloud + mouse highlight + time-range filter", but the code only provided the key line segments.

### Integrating Chen Wei's Pedagogical Theory

- Essence of the standard time-series chart: a 2D line chart with x = time, y = measurement. Its advantage is that trends in the linear time domain are immediately clear.
- Drawback: it is hard to express periodicity — which is why Sections 5.3 (calendar) and 5.4 (spiral) exist.
- Interaction: mouse-hover highlighting, tooltip display, and time-range filtering — standard practice in data journalism.
- Practical choice: for ≤ 50 data points use linear; for 50–500 points use monotoneX / curveCatmullRom; only when > 500 points consider area / box plots.

---

## 5.3 Calendar Heatmap (van Wijk)

> Display a full year of data with "year = row / week = column" to reveal periodicity + within-week trends + holiday anomalies.

### Your Original Case
The original Section 6.2.2 used a calendar heatmap to show Beijing's daily maximum temperature in 2024. Red lines separate each month.

### Integrating Chen Wei's Pedagogical Theory

- Calendar Heatmap: proposed by van Wijk in 2008, with x = week (the nth week of the year), y = day of week, and color = value.
- Use cases: long time series (years) + periodicity (week / month) + anomaly detection (holidays, weekdays vs. weekends).

- Design considerations:

  Each week starts on Sunday (or Monday) — affecting the visual position of "weekends".
- Red lines separate months — more readable than a 7×53 grid.
- Use a sequential colormap (e.g., Viridis) — see Chapter 3, Section 3.2 on colormap.

### The Ingenuity of isMonthDivider
Determine whether 7 days ago and today fall in the same month — if so, draw a same-month divider; otherwise a month line is needed. This is the core algorithm of calendar visualization.

---

## 5.4 Cyclic Time Visualization (Archimedean Spiral)

> Arrange time along a circle (a spiral = circle + continuous expansion). Reveals periodicity: each loop = one cycle.

### Your Original Case
The original Section 6.2.3 laid out dates using an Archimedean spiral (constant-speed spiral), with each loop representing 1 year / 1 month / 1 week. Each date corresponds to a sector-ring on the spiral.

### Integrating Chen Wei's Pedagogical Theory

- Spiral vs. line: a line chart shows "trend" in the linear time domain but struggles to show "periods"; a spiral repeats along the circle, highlighting periodicity.
- Archimedean Spiral: r = a + bθ, expanding at a constant rate (the radius increases by a constant b per turn).
- Dynamic Δθ algorithm: the subtlety of the original document — Δθ = boxSize / √(b² + r²), making the arc length of each sector-ring approximately equal and preserving visual consistency.
- Practical trade-off: spirals suit cycles of "year/season/week" but not "acyclic" or "very long period" data.

### Key Path Generation
Each date corresponds to a sector-ring on the spiral — 4 key points: outer-start / outer-end / inner-end / inner-start, closed back to the start.

---

## 5.5 Storyline Timeline (Jurassic Park)

> Multi-character narrative: each line = a character / organization / process, the y-axis position = convergence/divergence relationship, time = story progression.

### Your Original Case
The original Section 6.2.4 built a Storyline timeline using the 5 characters from Jurassic Park (Alan / T-REX / Raptors / Malcolm / Dilophosaurus). The event layer marks key conflicts with red semi-transparent circles.

### Integrating Chen Wei's Pedagogical Theory

- Origin of Storyline: proposed by Ogawa & Ma at Stanford University in 2008, originally used for movie / academic collaborator relationship networks.
- Core idea: abstract each character/organization/process into a "lifeline"; lines close together = characters meet / conflict, lines apart = characters separate.

1. Three key elements:

   Time-scale mapping: movie duration → SVG width, with the x-axis strictly aligned to scale.
1. Catmull-Rom spline: curveCatmullRom.alpha(0.5) with tension 0.5 — "natural flow" without "over-bending".
1. Event layer: semi-transparent red circle + text, marking key turning points.

- Application scenarios: film analysis, multi-person case timelines, interactive sports events, project task handoffs.

### Why Not monotoneX for Catmull-Rom?
monotoneX guarantees "no over-bending" but makes the line "too straight", losing the narrative "river-like feel". A Catmull-Rom tension of 0.5 is an empirical value — it flows yet does not oscillate.

---
