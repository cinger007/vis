# 第 2 章 · 数据可视化流程

> 对应你的飞书文档：**4. 数据可视化流程.docx**
>
> 源码 + 演示：见 `lesson/index.html`（讲解 ⇄ 代码 ⇄ 演示 三 tab 集成页面）

本章用 4 个章节把可视化完整链路拆给你看：**流程模型 → 数据聚合 → 树布局 → 列表渲染**。
陈为教材中的 Card、Mackinlay、van Wijk 三个理论模型，D3.hierarchy 模块，DOM 事件机制，都会嵌在案例的"为什么这么做"位置。

---

## 2.1 数据可视化流程（Card · Mackinlay · van Wijk）

### 你的原案例

3 个可视化流程模型：
1. 参考 Card 1999 模型绘制流程图（Box Flowcharts）
2. Mackinlay 自动化准则
3. van Wijk 模型（含交互反馈）

原图是一张概念图。本节课用 D3 重画这张概念图，每个节点点击后展开在三个模型中的对应细节。

### 嵌入的理论

**Card 数据流模型（Card, Mackinlay & Shneiderman, 1999）**

数据可视化的"管道"：
- **原始数据** (Raw Data) → **数据表** (Data Tables) → **视觉结构** (Visual Structure) → **视图** (Views)
- 嵌套变换：D → T → V → C/L/S（Camera/Light/Screen）

**Mackinlay 自动化准则（Mackinlay 1986）**

对每种数据类型，自动选"量化准确性最高"的视觉通道：
- 数值型 → 位置（量化误差最小）
- 有序型 → 长度、密度
- 类别型 → 色调、形状

**van Wijk 反馈模型（van Wijk 2005）**

强调**交互反馈循环**：
```
View ⇆ Filter ⇆ Param ⇆ Other Views
```

### 关键代码 ① SVG 流程图节点

⭐ **标记要点**：SVG `<marker>` + `marker-end` 定义箭头；D3 classed() 做状态切换。

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

**关键点解释**：
- `marker-end="url(#arrowhead)"` 是 SVG 引用的方式 —— 用 URL 引用 `<defs>` 里定义的形状。
- `classed("selected", predicate)` 接收布尔函数，一次性切换所有节点状态，**比手动 forEach 简洁**。

### 教学要点

- **三个模型描述同一件事的不同侧面**
  - Card 给"管道"、Mackinlay 给"自动决策"、van Wijk 给"反馈环"
  - <strong>是叠加关系，不是冲突关系</strong>

---

## 2.2 数据变换：原数据 → 数据表（d3.rollup 聚合）

> **在流程中的位置**：Card 1999 数据流模型第一段箭头「原始数据 → 数据表」。这是 **数据变换（Data Transformation）**。

### 你的原案例

用新生数据按"专业 / 班级"做 **rollup 分桶聚合**。
你演示的核心是 d3.rollup 的链式调用 —— 一个函数完成多维度分组。

### 嵌入的理论

**理论补丁：数据变换的四大操作（Card 1999 D 层）**

从「原始数据」到「数据表」，D 层做四类操作：

| 操作 | 做什么 | D3 实现 |
|---|---|---|
| 清洗 / 过滤 | 去缺失、去异常、筛选满足条件的行 | `.filter()`、`d3.csv(row)` 回调 |
| 聚合 / 汇总 | 按 key 分组，把同组归约为一个值 | `d3.rollup()`、`d3.group()` |
| 连接 / 关联 | 按键把两张表拼起来 | `d3.map` + 手动索引 |
| 派生 / 衍生 | 由已有列算出新列（如"班级"→"专业"） | row 回调里算一个新字段 |

**本节演示的 rollup 聚合属于"聚合"这一行**。读懂这张表，你才知道数据变换是整个流水线的"第一公里"。

**d3.rollup 是"按 key 分桶、再 reduce 一次"的函数式组合**：

```js
const result = d3.rollup(
  data,                    // 输入数组
  v => v.length,           // reducer
  d => d.major,            // key1（外层）
  d => d.class             // key2（内层）
);
```

它返回 **`Map`**（不是数组、不是对象）：
- 遍历用 `for ([k, v] of m)` 或 `m.entries()`
- 嵌套 rollup 出嵌套 Map
- 与 `d3.group` 的差别：rollup 把组内数据归约成**一个值**，group 保留**原数组**

**OLAP 切片/切块/钻取**（Codd 1993）

| OLAP 操作 | 实际对应 |
|---|---|
| 切片 (Slice) | `.filter()` 后 rollup |
| 切块 (Dice) | 多 key rollup |
| 钻取 (Drill) | 嵌套 rollup + 递归展开 |

**教学要点**：可视化系统的"下钻交互"通常背后就是 rollup + hierarchy 的组合。

### 关键代码 ① 双层 rollup

⭐ **标记要点**：d3.rollup 的 keys 参数是 rest 参数（...keys）。

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

### 关键代码 ② 用正则提取专业

⭐ **标记要点**：正则 `/^(.+?)(\d+班)$/` —— `.+?` 是**非贪婪**匹配。

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

**关键点解释**：
- `.+?` 是**非贪婪**匹配 —— 让中间尽可能短、末尾留给 `\d+班`
- 没这个非贪婪：`.+` 会把整串都匹配走，`m[1]` 就是 undefined
- **这类正则坑学生常踩，必须掌握**

---

## 2.3 视觉映射：数据表 → 视觉结构（Reingold-Tilford + 通道理论）

> **在流程中的位置**：接上节 2.2，我们有了"数据表"。这是第二段箭头「数据表 → 视觉结构」，即 **视觉映射（Visual Mapping）**。

### 你的原案例

你的 4.2 节提到"树形结构可视化"。本节展开**树布局算法**原理 —— 拿到层级数据后，怎么把节点摆到屏幕上不打架？本质上是用「位置通道」做视觉映射。

### 嵌入的理论

**理论核心：什么是视觉通道？Mackinlay 的排名（图 1）**

视觉通道是"把数据编码到视觉元素上"的载体：位置、长度、面积、角度、颜色、形状、纹理。**Mackinlay 1986** 给出经典排名：对*不同数据类型*，各通道的量化精确度不同。

> 📷 **图 1 · Mackinlay 1986 通道排名**（网页见 `img/01-mackinlay-ranking.png`）
> 对 Quantitative / Ordinal / Nominal 三类数据，各通道量化精确度排序。位置（Position）永远最准。

- **位置（Position）**：三种数据类型都是第一
- **定量数据**：长度 → 角度 → 斜率 → 面积（长条图比面积图准）
- **名义数据**：位置 → 色调（hue）→ 纹理 → 连接 → 形状

**理论核心：图元（marks）与视觉通道（图 2、图 3）**

视觉结构由 **图元（mark）** 打底：点（Point）、线（Line）、面（Area）。再通过 **通道** 做记号：位置、颜色、形状、倾斜、大小。

> 📷 **图 2 · 图元三族**（`img/02-marks-points-lines-areas.png`）：点 / 线 / 面，是视觉结构的骨架。
>
> 📷 **图 3 · 视觉通道族**（`img/03-channels-position-color-shape.png`）：位置（水平/垂直/两者）、颜色、形状、倾斜、大小（长度/面积/体积）。

**理论核心：两类通道 —— 幅度 vs 标识（图 4、图 5）**

按"能不能表达量的多少"，通道分两类：
- **幅度通道（Magnitude）**：表达*有序/定量*属性（共用尺度位置最准，长度/倾斜/面积次之，亮度/饱和度/体积最弱）
- **标识通道（Identity）**：表达*类别*属性（空间区域、色调、运动、形状 —— 能区分"不同类"但分不出"谁多谁少"）

> 📷 **图 4 · 幅度通道**（`img/04-magnitude-channels.png`）：有序属性，按精确度排序。
>
> 📷 **图 5 · 标识通道**（`img/05-identity-channels.png`）：类别属性 —— 空间区域 / 色调 / 运动 / 形状。

**本节案例的落点**：树布局（Reingold-Tilford）本质上就是一种**视觉映射** —— 用*位置通道*把层级关系编码成"父在上、子在下的树"。

**Reingold-Tilford 算法（1981，至今仍是 d3.tree() 的核心）**

核心思路（3 遍遍历）：
1. **第一遍（自底向上）：**对每个父节点，计算其左右子树"占用多少横向空间"
2. **第二遍（自顶向下）：**给每个节点分配**绝对 x 坐标**（保证兄弟节点紧贴父节点中线且不重叠）
3. **第三遍：**处理"线程"（threads）—— 修复子节点跨父中线时的对齐

复杂度：**O(n)** 时间。

**d3-hierarchy 模块全家桶：**

| API | 用途 |
|---|---|
| `hierarchy(data)` | 嵌套 data → 计算 parent/children/depth |
| `tree().size([h, w])` | Reingold-Tilford 算法，左右布局 |
| `cluster().size([h, w])` | 所有叶子对齐到同一深度 |
| `treemap().tile(...)` | 面积布局（slice-and-dice / squarified） |
| `pack().radius(...)` | circle packing |
| `partition().size([h, w])` | icicle / sunburst |

### 关键代码 ① hierarchy + tree 三步走

⭐ **标记要点**：tree.x 是深度方向、tree.y 是水平方向 —— 横向树 swap 坐标轴。

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

**关键点解释**：
- `treeData.x` 是**深度方向**（垂直），`treeData.y` 是**水平方向**
- 所以 `linkHorizontal` 用 `x=d.y, y=d.x` —— 横向 swap
- **这种"x 轴走 y、y 轴走 x"的 swap 是横向树特有的**

### 关键代码 ② separation

⭐ **标记要点**：separation 接收函数，返回 `[node, parent]` 之间的间隔倍数。

```js
const treeLayout = d3.tree()
  .size([360, 720])
  .separation((a, b) => (a.parent === b.parent ? 1 : 2));
                              //   ↑ 兄弟节点紧贴        ↑ 非兄弟至少隔 2 倍
```

`0.5` → 全部挤一起；`2.0` → 树变宽。Demo 里有 slider 实时调。

---

## 2.4 视图渲染与用户交互（classed + 事件委托 + 动画 transition）

> **在流程中的位置**：接上节 2.3，我们有了"视觉结构"。本节是最后两段箭头「视觉结构 → 视图」（渲染）和「视图 ↔ 用户」（交互反馈）。Card 的 V 层 + van Wijk 的反馈环都落在这里。

### 你的原案例

原文档用了 `classed` 控制节点样式、用 `stopPropagation` 阻止冒泡。重点是**把 D3 树布局输出变成可交互的 HTML 列表**。

### 嵌入的理论

**理论补丁：动画 —— 视图渲染的"时间维"**

动画（transition）不是"花哨"，而是视图渲染在*时间维*上的展开。D3 用 `.transition().duration(ms)` 让属性从旧值平滑过渡到新值。教学价值在 `duration` 一个参数：

- `duration=0`：瞬间跳变，看不出"变化过程"
- `duration=500`：0.5 秒过渡，看到展开/收缩/位移的流畅过程
- `duration>1500`：太慢，学生开始走神

**本节的交互 demo 特意加了 duration 滑块**，现场改变这个参数，直观看到"渲染如何随时间展开"。

**DOM 事件三阶段**：

1. **捕获 (capturing)**：window → document → ... → 目标元素（从外到内）
2. **目标 (target)**：目标元素本身
3. **冒泡 (bubbling)**：目标元素 → ... → document → window（从内到外）

默认监听的是冒泡阶段。`e.stopPropagation()` 截断冒泡，让上层不再触发。

**事件委托（Event Delegation）**：

| 问题 | 解法 |
|---|---|
| 列表 1000 个 li 各绑 click → 慢、内存大 | 给父元素（ul）绑 1 次 click |
| 新增元素要重新绑 | 用 `e.target.closest('.label')` 找实际点击元素 |

**优势**：1 个监听器代替 N 个、未来新增元素自动支持。

### 关键代码 ① 事件委托（toggle vs select）

⭐ **标记要点**：toggle 按钮上 stopPropagation 阻止冒泡到 li 的 select 监听器。

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

**关键点解释**：
- 不 stopPropagation → 点 toggle 时同时触发"切换折叠"和"选中节点"，用户看着会困惑
- 这是 DOM 事件机制的核心教学点

### 关键代码 ② 嵌套递归 buildList

⭐ **标记要点**：`selection.each()` + `d3.select(this)` 是 D3 与原生 DOM 互操作的关键模式。

```js
function render() {
  $tree.innerHTML = "";  // 全量重画（树结构变化没法增量更新）
  const ul = d3.create("ul");
  ul.selectAll("li").data([root]).join("li")
    .each(function(d) { buildList(d3.select(this), d); });
  $tree.appendChild(ul.node());
}
```

**关键点解释**：
- D3 没有"智能更新"树结构（层级变化）的 API —— 全量重画最简单
- `selection.each()` 配合 `d3.select(this)` 把原生元素转回 selection

### 关键代码 ③ D3 过渡动画（transition + duration）

⭐ **标记要点**：`transition + duration` = 让属性随时间平滑变化。

```js
// 关键：transition + duration = 让属性随时间平滑变化
svg.selectAll(".node")
  .transition()                    // 进入过渡状态
  .duration(DURATION)              // 时长（ms），滑块控制
  .attr("transform", d => `translate(${d.y}, ${d.x})`)
  .attr("opacity", 1);

// 新节点进入时：先设 opacity=0，再过渡到 1 → 淡入效果
ng.attr("opacity", 0)
  .transition().duration(DURATION).attr("opacity", 1);
```

### 关键代码 ④ 动画时长滑块（HTML/CSS 控制）

```html
<!-- HTML 滑块：监听 input 事件即可改 DURATION -->
<input id="dur" type="range" min="0" max="1500" step="50" value="500">

<!-- JS：改变 DURATION 后重放动画 -->
document.getElementById("dur").addEventListener("input", e => {
  DURATION = +e.target.value;
  render();   // 用新时长重新做一次过渡
});
```

---

## 🎯 总结：本章覆盖到的陈为教材章节

| 陈为教材 | 覆盖位置 |
|---|---|
| Ch1.5 可视化过程模型（Card, Mackinlay, van Wijk） | 2.1 |
| Ch3 数据变换（rollup / group / 数据表 D 层） | 2.2 |
| Ch6 视觉映射与树/层次数据（hierarchy / tree / cluster） | 2.3 |
| Ch7 交互（事件机制 / stopPropagation / 动画 transition） | 2.4 |

---

## ❓ 课堂提问建议

1. **(2.1)** van Wijk 模型为什么强调"View ⇆ Filter"这个回路？没有反馈环会怎样？
2. **(2.2)** `d3.rollup` 和 `d3.group` 在返回类型上有什么关键区别？数据变换四操作里，rollup 属于哪一个？
3. **(2.3)** Masonlay 排名里为什么"位置"对三种数据类型都是第一？树布局怎么用"位置通道"编码层级关系？
4. **(2.4)** 不 stopPropagation 的话，事件会冒泡到 document、window。`duration=0` 和 `duration=500` 对学生感知"变化过程"有什么本质区别？

---

## 📂 启动方式

```bash
cd docs/doc-02-数据可视化流程/lesson
python -m http.server 8080
# 浏览器：http://localhost:8080
```
