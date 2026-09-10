# Chapter 2 · Data Visualization Pipeline

> Corresponding to your Feishu (飞书) document: **4. 数据可视化流程.docx**
>
> Source code + demo: see `lesson/index.html` (explanation ⇄ code ⇄ demo, three-tab integrated page)

This chapter breaks the complete visualization pipeline down for you across 4 sections: **pipeline model → data aggregation → tree layout → list rendering**.
The three theoretical models from Chen Wei's textbook (陈为教材) — Card, Mackinlay, and van Wijk — along with the D3.hierarchy module and the DOM event mechanism, are embedded exactly where the cases answer "why we do it this way".

---

## 2.1 Data Visualization Pipeline (Card · Mackinlay · van Wijk)

### Your original case

Three visualization pipeline models:
1. Draw a flowchart based on the Card 1999 model (Box Flowcharts)
2. Mackinlay's automation principles
3. The van Wijk model (with interactive feedback)

The original image is a concept diagram. In this lesson we redraw it with D3; clicking each node expands the corresponding details within the three models.

### Embedded theory

**Card data flow model (Card, Mackinlay & Shneiderman, 1999)**

The "pipeline" of data visualization:
- **Raw Data (原始数据)** → **Data Tables (数据表)** → **Visual Structure (视觉结构)** → **Views (视图)**
- Nested transforms: D → T → V → C/L/S (Camera/Light/Screen)

**Mackinlay automation principles (Mackinlay 1986)**

For each data type, automatically choose the visual channel with the "highest quantitative accuracy":
- Numerical → position (smallest quantitative error)
- Ordinal → length, density
- Categorical → hue, shape

**van Wijk feedback model (van Wijk 2005)**

Emphasizes the **interactive feedback loop**:
```
View ⇆ Filter ⇆ Param ⇆ Other Views
```

### Key code ① SVG flowchart nodes

⭐ **Key point to mark**: SVG `<marker>` + `marker-end` define the arrowhead; D3 `classed()` handles state switching.

```js
// 1. 用 <defs> + <marker> 定义箭头
svg.append("defs").append("marker")
   .attr("id", "arrowhead")
   .attr("refX", 8)            // 箭头位置校准
   .attr("orient", "auto")      // 跟随线方向旋转
   .append("path").attr("d", "M0,-5L10,0L0,5");

// 2. 用 marker-end 引用箭头
svg.append("line")
   .attr("marker-end", "url(#arrowhead)")  // 把箭头"装"到线段末端
   .attr("x1", x1).attr("y1", y)
   .attr("x2", x2).attr("y2", y);

// 3. classed 状态管理（关键）
svg.selectAll(".node").classed("selected", n => n.id === d.id);
```

**Key point explanation**:
- `marker-end="url(#arrowhead)"` is SVG's reference mechanism — referencing a shape defined in `<defs>` via URL.
- `classed("selected", predicate)` takes a boolean function and switches the state of all nodes at once, which is **cleaner than a manual forEach**.

### Teaching points

- **The three models describe different facets of the same thing**
  - Card gives the "pipeline", Mackinlay gives "automated decisions", van Wijk gives the "feedback loop"
  - <strong>They are complementary, not conflicting</strong>

---

## 2.2 Data Transformation: Raw → Data Table (d3.rollup aggregation)

> **Where this sits in the pipeline**: Card 1999 data-flow model, first arrow "raw data → data table". This is **Data Transformation**.

### Your original case

Use freshman data to perform **rollup bucketing aggregation** by "major / class".
The core of your demo is d3.rollup's chained calls — one function completes multi-dimensional grouping.

### Embedded theory

**Theory patch: the four operations of data transformation (Card 1999, D layer)**

| Operation | What it does | D3 implementation |
|---|---|---|
| Clean / filter | Remove missing/outliers; keep rows matching a condition | `.filter()`, `d3.csv(row)` callback |
| Aggregate | Group by key, reduce each group to one value | `d3.rollup()`, `d3.group()` |
| Join | Combine two tables by key | `d3.map` + manual indexing |
| Derive | Compute a new column from existing ones (e.g., "class" → "major") | compute a new field in the row callback |

**The rollup aggregation demonstrated here belongs to the "aggregate" row.** Reading this table, you realize data transformation is the "first kilometer" of the whole pipeline.

**d3.rollup is a functional composition of "bucket by key, then reduce once"**:

```js
const result = d3.rollup(
  data,                    // 输入数组
  v => v.length,           // reducer
  d => d.major,            // key1（外层）
  d => d.class             // key2（内层）
);
```

It returns a **`Map`** (not an array, not an object):
- Iterate with `for ([k, v] of m)` or `m.entries()`
- Nested rollup produces a nested Map
- Difference from `d3.group`: rollup reduces the in-group data into **a single value**, while group preserves the **original array**

**OLAP slice / dice / drill (Codd 1993)**

| OLAP operation | Actual equivalent |
|---|---|
| Slice (切片) | `.filter()` then rollup |
| Dice (切块) | multi-key rollup |
| Drill (钻取) | nested rollup + recursive expand |

**Teaching point**: The "drill-down interaction" in visualization systems is usually backed by a combination of rollup + hierarchy.

### Key code ① Two-level rollup

⭐ **Key point to mark**: d3.rollup's keys parameter is a rest parameter (...keys).

```js
const nested = d3.rollup(
  students,
  v => v.length,           // 每组聚合为单一值（这里是 count）
  d => d.major,            // 外层 key
  d => d.class             // 内层 key（rest 参数，可继续加）
);

for (const [major, inner] of nested) {
  for (const [cls, count] of inner) {
    console.log(major, cls, count);
  }
}
```

### Key code ② Extract major with regex

⭐ **Key point to mark**: regex `/^(.+?)(\d+班)$/` — `.+?` is a **non-greedy** match.

```js
const data = await d3.csv("./data/newstudent.csv", d => {
  const cls = d["班级"].trim();
  const m = cls.match(/^(.+?)(\d+班)$/);  // 中间非贪婪 + 末尾"数字+班"
  return {
    id:    +d["序号"],
    name:  d["姓名"].trim(),
    class: cls,
    major: m ? m[1] : cls,  // "软件工程1班" → "软件工程"
  };
});
```

**Key point explanation**:
- `.+?` is a **non-greedy** match — keeps the middle as short as possible, leaving the end for `\d+班`
- Without this non-greedy match: `.+` would consume the entire string, and `m[1]` would be undefined
- **Students often fall into this regex pitfall — it must be mastered**

---

## 2.3 Visual Mapping: Data → Visual Structure (Reingold-Tilford + channel theory)

> **Where this sits in the pipeline**: following 2.2, we now have a "data table". This is the second arrow, "data table → visual structure", i.e. **Visual Mapping**.

### Your original case

Section 4.2 mentioned "tree-structure visualization". This section expands on the **tree layout algorithm** — once you have hierarchical data, how do you place nodes on screen without collisions? Essentially it uses the "position channel" to do visual mapping.

### Embedded theory

**Theory core: what is a visual channel? Mackinlay's ranking (Figure 1)**

A visual channel is the carrier that "encodes data onto a visual element": position, length, area, angle, color, shape, texture. **Mackinlay (1986)** gave the classic ranking: for *different data types*, the quantitative accuracy of each channel differs.

> 📷 **Figure 1 · Mackinlay 1986 channel ranking** (see `img/01-mackinlay-ranking.png` on the page)
> For Quantitative / Ordinal / Nominal data, the quantitative-accuracy ordering of each channel. Position is always the most accurate.

- **Position**: ranks #1 for all three data types
- **Quantitative data**: length → angle → slope → area (bar charts beat area charts)
- **Nominal data**: position → hue → texture → connection → shape

**Theory core: marks and visual channels (Figures 2 & 3)**

The visual structure is built on **marks**: Point, Line, Area. These marks are "marked up" through **channels**: position, color, shape, tilt, size.

> 📷 **Figure 2 · Three families of marks** (`img/02-marks-points-lines-areas.png`): Points / Lines / Areas, the skeleton of the visual structure.
>
> 📷 **Figure 3 · Visual-channel families** (`img/03-channels-position-color-shape.png`): Position (horizontal / vertical / both), Color, Shape, Tilt, Size (length / area / volume).

**Theory core: two channel classes — Magnitude vs Identity (Figures 4 & 5)**

By "whether it can express magnitude," channels split into two classes:
- **Magnitude channels**: express *ordered / quantitative* attributes (position on a common scale is best; length / tilt / area next; luminance / saturation / volume weakest)
- **Identity channels**: express *categorical* attributes (spatial region, hue, motion, shape — distinguish "different classes" but cannot rank "more vs less")

> 📷 **Figure 4 · Magnitude channels** (`img/04-magnitude-channels.png`): ordered attributes, ordered by accuracy.
>
> 📷 **Figure 5 · Identity channels** (`img/05-identity-channels.png`): categorical attributes — spatial region / hue / motion / shape.

**Where this lesson lands**: tree layout (Reingold-Tilford) is essentially a **visual mapping** — it uses the *position channel* to encode hierarchy as "parent above, children below".

**Reingold-Tilford algorithm (1981, still the core of d3.tree() today)**

Core idea (3 passes):
1. **First pass (bottom-up):** for each parent node, compute how much horizontal space its left and right subtrees "occupy"
2. **Second pass (top-down):** assign an **absolute x coordinate** to each node (ensuring sibling nodes stay tight to the parent's midline and do not overlap)
3. **Third pass:** handle "threads" — fix alignment when child nodes cross the parent's midline

Complexity: **O(n)** time.

**d3-hierarchy module full toolkit:**

| API | Purpose |
|---|---|
| `hierarchy(data)` | nested data → compute parent/children/depth |
| `tree().size([h, w])` | Reingold-Tilford algorithm, left-right layout |
| `cluster().size([h, w])` | align all leaves to the same depth |
| `treemap().tile(...)` | area layout (slice-and-dice / squarified) |
| `pack().radius(...)` | circle packing |
| `partition().size([h, w])` | icicle / sunburst |

### Key code ① hierarchy + tree three steps

⭐ **Key point to mark**: tree.x is the depth direction, tree.y is the horizontal direction — the horizontal tree swaps the axes.

```js
// 1. hierarchy：嵌套 JSON → parent/children/depth
const root = d3.hierarchy(rootData);

// 2. tree layout：x/y 坐标
const treeLayout = d3.tree().size([360, 720]);
const treeData = treeLayout(root);

// 3. links：path 走 linkHorizontal
g.selectAll(".link").data(treeData.links()).join("path")
  .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));  // ⭐ swap

// 4. nodes
const ng = g.selectAll(".node").data(treeData.descendants()).join("g")
  .attr("transform", d => `translate(${d.y}, ${d.x})`);  // ⭐ swap

ng.append("circle").attr("r", 5);
ng.append("text")
  .attr("text-anchor", d => d.children ? "end" : "start")
  .attr("x", d => d.children ? -8 : 8)
  .text(d => d.data.name);
```

**Key point explanation**:
- `treeData.x` is the **depth direction** (vertical), `treeData.y` is the **horizontal direction**
- So `linkHorizontal` uses `x=d.y, y=d.x` — the horizontal swap
- **This "x-axis takes y, y-axis takes x" swap is unique to horizontal trees**

### Key code ② separation

⭐ **Key point to mark**: separation takes a function that returns the spacing multiplier between `[node, parent]`.

```js
const treeLayout = d3.tree()
  .size([360, 720])
  .separation((a, b) => (a.parent === b.parent ? 1 : 2));
                              //   ↑ siblings stay tight        ↑ non-siblings at least 2x apart
```

`0.5` → everything squeezed together; `2.0` → the tree widens. The demo has a slider for real-time adjustment.

---

## 2.4 View Rendering & User Interaction (classed + event delegation + transition)

> **Where this sits in the pipeline**: following 2.3, we now have a "visual structure". This section covers the last two arrows: "visual structure → view" (rendering) and "view ↔ user" (interaction feedback). Card's V layer + van Wijk's feedback loop both land here.

### Your original case

The original document used `classed` to control node styling and `stopPropagation` to block bubbling. The key point is **turning D3 tree layout output into an interactive HTML list**.

### Embedded theory

**Theory patch: animation — the "time dimension" of view rendering**

Animation (transition) isn't "fancy" — it's the *time dimension* of view rendering. D3 uses `.transition().duration(ms)` to smoothly interpolate an attribute from its old value to a new one. The pedagogical value lies in a single `duration` parameter:

- `duration=0`: instant jump — you can't "see the change happen"
- `duration=500`: a 0.5s transition — you see expand / collapse / move smoothly
- `duration>1500`: too slow — students start to drift

**This lesson's interactive demo adds a duration slider** so you can change this parameter live and see "how rendering unfolds over time."

**DOM event three phases**:

1. **Capturing**: window → document → ... → target element (outside to inside)
2. **Target**: the target element itself
3. **Bubbling**: target element → ... → document → window (inside to outside)

By default, listeners attach to the bubbling phase. `e.stopPropagation()` truncates bubbling so the upper layers no longer fire.

**Event Delegation**:

| Problem | Solution |
|---|---|
| Binding click to each of 1000 `li` in a list → slow, memory-heavy | Bind click once on the parent element (`ul`) |
| New elements need re-binding | Use `e.target.closest('.label')` to find the actually clicked element |

**Advantage**: one listener replaces N, and future-added elements are automatically supported.

### Key code ① Event delegation (toggle vs select)

⭐ **Key point to mark**: the toggle button uses stopPropagation to prevent bubbling to the `li`'s select listener.

```js
function buildList(liSel, d) {
  const label = liSel.append("span").attr("class", "label");

  label.on("click.toggle", (event) => {
    // ⭐ 关键 ①：阻止冒泡 —— toggle 不该触发"选中"
    event.stopPropagation();
    d.data._collapsed = !d.data._collapsed;
    render();
  });

  liSel.on("click.select", (event) => {
    // ⭐ 关键 ②：toggle click 已被 stopPropagation 阻断，不会到这里
    document.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
    liSel.classed("selected", true);  // D3 class 切换
  });
}
```

**Key point explanation**:
- Without stopPropagation → clicking toggle would trigger both "toggle collapse" and "select node" at once, which confuses the user
- This is a core teaching point of the DOM event mechanism

### Key code ③ D3 transition (transition + duration)

⭐ **Key point to mark**: `transition + duration` = letting attributes change smoothly over time.

```js
// Key: transition + duration = smooth change over time
svg.selectAll(".node")
  .transition()                    // enter the transition state
  .duration(DURATION)              // duration (ms), controlled by slider
  .attr("transform", d => `translate(${d.y}, ${d.x})`)
  .attr("opacity", 1);

// New nodes entering: set opacity=0 first, then transition to 1 → fade-in
ng.attr("opacity", 0)
  .transition().duration(DURATION).attr("opacity", 1);
```

### Key code ④ Animation duration slider (HTML/CSS control)

```html
<!-- HTML slider: listen for input to change DURATION -->
<input id="dur" type="range" min="0" max="1500" step="50" value="500">

<!-- JS: replay the animation after changing DURATION -->
document.getElementById("dur").addEventListener("input", e => {
  DURATION = +e.target.value;
  render();   // redo the transition with the new duration
});
```

### Key code ② Nested recursive buildList

⭐ **Key point to mark**: `selection.each()` + `d3.select(this)` is the key pattern for D3 ↔ native DOM interop.

```js
function render() {
  $tree.innerHTML = "";  // 全量重画（树结构变化没法增量更新）
  const ul = d3.create("ul");
  ul.selectAll("li").data([root]).join("li")
    .each(function(d) { buildList(d3.select(this), d); });
  $tree.appendChild(ul.node());
}
```

**Key point explanation**:
- D3 has no API for "smart updating" tree structures (hierarchy changes) — a full redraw is simplest
- `selection.each()` together with `d3.select(this)` converts the native element back into a selection

---

## 🎯 Summary: Chen Wei's textbook (陈为教材) chapters covered in this chapter

| Chen Wei's textbook (陈为教材) | Covered in |
|---|---|
| Ch1.5 Visualization process model (Card, Mackinlay, van Wijk) | 2.1 |
| Ch3 Data transformation (rollup / group / data table, D layer) | 2.2 |
| Ch6 Visual mapping & tree / hierarchical data (hierarchy / tree / cluster) | 2.3 |
| Ch7 Interaction (event mechanism / stopPropagation / transition animation) | 2.4 |

---

## ❓ Suggested in-class questions

1. **(2.1)** Why does the van Wijk model emphasize the "View ⇆ Filter" loop? What happens without a feedback loop?
2. **(2.2)** What is the key difference between `d3.rollup` and `d3.group` in return type? Of the four data-transformation operations, which one does rollup belong to?
3. **(2.3)** In Mackinlay's ranking, why is "position" #1 for all three data types? How does tree layout encode hierarchy via the "position channel"?
4. **(2.4)** Without stopPropagation, events would bubble to document and window. What is the essential difference between `duration=0` and `duration=500` in how students perceive "the change over time"?

---

## 📂 How to run

```bash
cd docs/doc-02-数据可视化流程/lesson
python -m http.server 8080
# 浏览器：http://localhost:8080
```
