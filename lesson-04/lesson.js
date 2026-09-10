// Doc-04 低维数据可视化 · 集成教学页面 · 5 个 demo
// =========================================
//   4.1 数据转换       → d-4-1 crime-loader
//   4.2 坐标轴变换     → d-4-2 coordinate-transform
//   4.3 曲线拟合       → d-4-3 curve-fitting
//   4.4 倾角感知       → d-4-4 slope-perception
//   4.5 等值线         → d-4-5 marching-squares
// =========================================

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

window.DEMOS = window.DEMOS || {};


// ============================================================
// 统一章节导航 + Tab 切换 + 自动渲染 demo（patched by patch_lesson_js.py）
// ============================================================
function __resolveDemoName(mount) {
  return (mount.dataset && mount.dataset.demo)
      || (mount.id && mount.id.replace(/^demo-mount-/, ""))
      || null;
}
function __renderDemo(mount) {
  if (!mount || mount.dataset.rendered) return;
  const name = __resolveDemoName(mount);
  if (!name) return;
  const fn = (window.DEMOS && window.DEMOS[name]) || (typeof DEMOS !== "undefined" && DEMOS[name]);
  if (!fn) return;
  // async demo 也要 await，否则 await 后的 throw 不会被 try/catch 捕获
  Promise.resolve()
    .then(() => fn(mount))
    .then(() => { mount.dataset.rendered = "1"; })
    .catch(err => {
      // 友好的错误显示，方便定位哪个 demo 跑不起来
      console.error(`[demo ${name}]`, err);
      mount.dataset.rendered = "error";
      const msg = (err && err.stack) ? String(err.stack) : String(err);
      mount.innerHTML = `<div class="demo-error"><strong>Demo ${name} 跑不起来：</strong><pre>${msg.replace(/[<&>]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre></div>`;
    });
}
function __renderAllDemos() {
  document.querySelectorAll(".demo-mount, [id^='demo-mount-']").forEach(__renderDemo);
}
function __activateChapter(id) {
  if (!id) return;
  document.querySelectorAll(".chapter-nav a[data-chapter]").forEach(l => {
    l.classList.toggle("active", l.dataset.chapter === id);
  });
  document.querySelectorAll(".chapter").forEach(c => {
    const isActive = c.id === id;
    c.classList.toggle("active", isActive);
    if (isActive) {
      // 自动切到 demo tab
      c.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === "demo"));
      c.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === "demo"));
      // 渲染 demo 并滚动
      const mount = c.querySelector(".demo-mount, [id^='demo-mount-']");
      __renderDemo(mount);
      setTimeout(() => {
        if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  });
}
function __bindLessonNav() {
  // 章节 anchor 链接
  document.querySelectorAll(".chapter-nav a[data-chapter]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = a.dataset.chapter;
      if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
      __activateChapter(id);
    });
  });
  // Tab 按钮
  document.querySelectorAll(".chapter .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const chapter = btn.closest(".chapter");
      if (!chapter) return;
      const tab = btn.dataset.tab;
      chapter.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      chapter.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
      if (tab === "demo") {
        const mount = chapter.querySelector(".demo-mount, [id^='demo-mount-']");
        __renderDemo(mount);
      }
    });
  });
  // hashchange
  window.addEventListener("hashchange", () => {
    const id = location.hash.replace(/^#/, "");
    if (id) __activateChapter(id);
  });
}
// 页面初始（module 加载后立即执行）
__bindLessonNav();
// 延迟到下一个 microtask，等当前 module 跑完（DEMOS 注册完毕）再渲染
queueMicrotask(() => __renderAllDemos());
// 如果 URL 带 hash，激活对应章节
if (location.hash) {
  const initialId = location.hash.replace(/^#/, "");
  if (initialId) queueMicrotask(() => __activateChapter(initialId));
}

// =========================================
// ⭐ d-4-1 · 数据转换（4.1）
// =========================================
window.DEMOS["d-4-1"] = async function (mount) {
  mount.innerHTML = `
    <h4>📘 数据转换：长格式 vs 宽格式</h4>
    <p class="demo-hint">crime.csv 是宽格式（每个州一行，每个指标一列）。可视化和 d3 操作通常需要长格式（每行一个观测）。</p>
    <div id="data-shape"></div>
    <h4 style="margin-top:16px">🔄 转换代码</h4>
    <pre><code class="lang-js">// ⭐ d3.csv 第二参做类型转换
const raw = await d3.csv('./data/crime.csv', d3.autoType);
console.log(raw[0]);  // {state: 'Alabama', population: 3979000, ...}

// 宽格式 → 长格式：每行一个 (州, 指标, 值)
const long = raw.flatMap(d =>
  ['murder','robbery','burglary'].map(key => ({
    state: d.state, metric: key, value: d[key]
  }))
);</code></pre>
    <div id="data-preview"></div>
  `;

  const raw = await d3.csv('./data/crime.csv', d3.autoType);

  const shapeDiv = mount.querySelector("#data-shape");
  if (!shapeDiv) return;
  shapeDiv.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0;">
      <div>
        <h5 style="margin:0 0 6px;color:#4338ca">宽格式（CSV 原样）</h5>
        <pre style="font-size:11px;background:#f8fafc;color:#1e293b;padding:8px;border-radius:4px;overflow:auto;max-height:180px;">
${raw.slice(0, 3).map(d => JSON.stringify(d, null, 0)).join('\n')}
...
共 ${raw.length} 行 × ${Object.keys(raw[0]).length} 列</pre>
      </div>
      <div>
        <h5 style="margin:0 0 6px;color:#4338ca">长格式（转换后）</h5>
        <pre style="font-size:11px;background:#f8fafc;color:#1e293b;padding:8px;border-radius:4px;overflow:auto;max-height:180px;">
${raw.slice(0, 3).flatMap(d => ['murder','robbery','burglary'].map(k => JSON.stringify({state:d.state,metric:k,value:d[k]}))).slice(0, 9).join('\n')}
...
共 ${raw.length * 3} 行 × 3 列</pre>
      </div>
    </div>
  `;

  const prev = mount.querySelector("#data-preview");
  prev.innerHTML = `
    <h4 style="margin-top:12px">📊 前 10 行预览</h4>
    <table class="decision-table" style="font-size:11px;">
      <thead><tr><th>州</th><th>人口</th><th>谋杀</th><th>抢劫</th><th>盗窃</th></tr></thead>
      <tbody>
        ${raw.slice(0, 10).map(d => `<tr><td>${d.state}</td><td>${d.population.toLocaleString()}</td><td>${d.murder}</td><td>${d.robbery.toLocaleString()}</td><td>${d.burglary.toLocaleString()}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
};

// =========================================
// ⭐ d-4-2 · 三层坐标变换（4.2）
// =========================================
window.DEMOS["d-4-2"] = async function (mount) {
  const raw = await d3.csv('./data/crime.csv', d3.autoType);
  const data = raw.map(d => ({ state: d.state, x: d.murder, y: d.robbery }));

  const W = 720, H = 360, M = { t: 30, r: 20, b: 40, l: 50 };
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;

  const xScaleData = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)]).range([0, innerW]);
  const yScaleData = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)]).range([innerH, 0]);
  const xScaleScreen = d3.scaleLinear().domain([0, innerW]).range([M.l, M.l + innerW]);
  const yScaleScreen = d3.scaleLinear().domain([innerH, 0]).range([M.t + innerH, M.t]);

  mount.innerHTML = `<h4>📘 三层坐标变换</h4>
    <p class="demo-hint">数据空间 → 坐标系空间 → 屏幕空间。每一层职责不同，错位就会出问题。</p>
    <div class="demo-control">
      <label><input type="radio" name="xscale" value="linear" checked> x: linear</label>
      <label><input type="radio" name="xscale" value="log"> x: log</label>
      <label><input type="radio" name="xscale" value="sqrt"> x: sqrt</label>
    </div>
    <svg class="heatmap-svg" width="${W}" height="${H}" id="scatter"></svg>
    <div id="code-trace"></div>
  `;

  const svg = d3.select(mount.querySelector("#scatter"));
  let curXType = "linear";

  function render() {
    let xDataScale;
    if (curXType === "log") xDataScale = d3.scaleLog().domain([1, d3.max(data, d => d.x)]).range([0, innerW]);
    else if (curXType === "sqrt") xDataScale = d3.scaleSqrt().domain([0, d3.max(data, d => d.x)]).range([0, innerW]);
    else xDataScale = xScaleData;

    svg.selectAll("*").remove();

    svg.append("g").selectAll("line")
      .data(xDataScale.ticks(5)).enter().append("line")
      .attr("x1", d => xScaleScreen(xDataScale(d))).attr("x2", d => xScaleScreen(xDataScale(d)))
      .attr("y1", M.t).attr("y2", M.t + innerH)
      .attr("stroke", "#e2e8f0");

    const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain(xDataScale.domain()).range(xDataScale.range())).tickFormat(d => d);
    svg.append("g").attr("transform", `translate(${M.l},${M.t + innerH})`).call(xAxis);
    svg.append("g").attr("transform", `translate(${M.l},${M.t})`).call(d3.axisLeft().scale(yScaleData));

    svg.selectAll("circle")
      .data(data).enter().append("circle")
      .attr("cx", d => xScaleScreen(xDataScale(d.x)))
      .attr("cy", d => yScaleScreen(yScaleData(d.y)))
      .attr("r", 4)
      .attr("fill", "#6366f1")
      .attr("opacity", 0.7);

    svg.append("text").attr("x", M.l + innerW / 2).attr("y", M.t + innerH + 32)
      .attr("text-anchor", "middle").style("font-size", "12px").text("Murder rate →");
    svg.append("text").attr("transform", `translate(${M.l - 36},${M.t + innerH/2}) rotate(-90)`)
      .attr("text-anchor", "middle").style("font-size", "12px").text("Robbery rate →");
  }

  mount.querySelectorAll("input[name=xscale]").forEach(r => {
    r.addEventListener("change", e => { curXType = e.target.value; render(); });
  });

  mount.querySelector("#code-trace").innerHTML = `
    <h4 style="margin-top:14px">⭐ 关键代码：三层映射</h4>
    <pre><code class="lang-js">// 数据空间：值域 → 坐标系（0..innerW）
const xData = d3.scaleLinear().domain([0, maxX]).range([0, innerW]);
// 坐标系空间 → 屏幕空间（加 margin 偏移）
const xScreen = d3.scaleLinear().domain([0, innerW]).range([M.l, M.l + innerW]);
// 渲染
.attr('cx', d => xScreen(xData(d.x)))</code></pre>
  `;

  render();
};

// =========================================
// ⭐ d-4-3 · 曲线拟合（4.3，10 种曲线对比）
// =========================================
window.DEMOS["d-4-3"] = async function (mount) {
  const raw = await d3.csv('./data/crime.csv', d3.autoType);
  const data = raw.map(d => ({ x: d.population, y: d.murder }));

  const W = 720, H = 380, M = { t: 20, r: 20, b: 36, l: 50 };
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;

  const xScale = d3.scaleLog().domain(d3.extent(data, d => d.x)).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.y) * 1.1]).range([innerH, 0]);
  const xScreen = d3.scaleLinear().domain([0, innerW]).range([M.l, M.l + innerW]);
  const yScreen = d3.scaleLinear().domain([innerH, 0]).range([M.t + innerH, M.t]);

  const curveTypes = [
    { name: "linear",    label: "Linear（直线）" },
    { name: "monotoneX", label: "Monotone X" },
    { name: "natural",   label: "Natural" },
    { name: "basis",     label: "Basis" },
    { name: "cardinal",  label: "Cardinal" },
    { name: "catmullRom",label: "Catmull-Rom" },
    { name: "step",      label: "Step" },
    { name: "stepBefore",label: "Step Before" },
    { name: "stepAfter", label: "Step After" },
    { name: "curveBundle",label: "Bundle" }
  ];

  mount.innerHTML = `
    <h4>📘 曲线拟合：插值 vs 平滑</h4>
    <p class="demo-hint">同 50 个州的人口-谋杀率散点，用 10 种 curve 各画一条线。点击切换。</p>
    <div class="demo-control" id="curve-tabs" style="margin-bottom:12px"></div>
    <svg class="heatmap-svg" width="${W}" height="${H}" id="curves"></svg>
    <div id="curve-note"></div>
  `;

  const tabs = mount.querySelector("#curve-tabs");
  const svg = d3.select(mount.querySelector("#curves"));
  const note = mount.querySelector("#curve-note");

  function renderCurve(idx) {
    const ct = curveTypes[idx];

    const sorted = [...data].sort((a, b) => a.x - b.x);
    const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y));
    if (ct.name !== "linear" && ct.name !== "step" && ct.name !== "stepBefore" && ct.name !== "stepAfter") {
      line.curve(d3[ct.name]);
    } else if (ct.name.startsWith("step")) {
      line.curve(d3[ct.name]);
    }

    svg.selectAll("*").remove();

    svg.append("g").selectAll("line")
      .data(yScale.ticks(6)).enter().append("line")
      .attr("x1", M.l).attr("x2", M.l + innerW)
      .attr("y1", d => yScreen(yScale(d))).attr("y2", d => yScreen(yScale(d)))
      .attr("stroke", "#e2e8f0");

    svg.append("g").attr("transform", `translate(${M.l},${M.t + innerH})`)
      .call(d3.axisBottom().scale(xScale).tickFormat(d3.format(".0s")));
    svg.append("g").attr("transform", `translate(${M.l},${M.t})`)
      .call(d3.axisLeft().scale(yScale));

    svg.selectAll("circle").data(data).enter().append("circle")
      .attr("cx", d => xScreen(xScale(d.x))).attr("cy", d => yScreen(yScale(d.y)))
      .attr("r", 3).attr("fill", "#94a3b8").attr("opacity", 0.5);

    svg.append("path").datum(sorted)
      .attr("fill", "none").attr("stroke", "#6366f1").attr("stroke-width", 2)
      .attr("d", line);

    note.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><code>linear</code>、<code>step*</code> 是基础</li>
        <li><code>monotoneX</code>：保证原序列单调不出现伪震荡</li>
        <li><code>natural</code>、<code>catmullRom</code>：过所有点的平滑样条</li>
        <li>拟合 vs 插值：插值过所有点但容易过拟合；拟合（regression）只看趋势</li>
      </ul>
    `;
  }

  curveTypes.forEach((c, i) => {
    const btn = document.createElement("label");
    btn.textContent = c.label;
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("label").forEach(l => l.classList.remove("active"));
      btn.classList.add("active");
      renderCurve(i);
    });
    tabs.appendChild(btn);
  });

  renderCurve(0);
};

// =========================================
// ⭐ d-4-4 · 倾角感知（4.4，Cleveland 1984）
// =========================================
window.DEMOS["d-4-4"] = async function (mount) {
  let angle = 45;
  const W = 720, H = 320;
  const line = (a) => {
    const r = (a * Math.PI) / 180;
    const x1 = 100, y1 = 240, x2 = x1 + 240 * Math.cos(r), y2 = y1 - 240 * Math.sin(r);
    return [x1, y1, x2, y2];
  };

  mount.innerHTML = `
    <h4>📘 倾角感知（Cleveland 1984）</h4>
    <p class="demo-hint">人眼对斜率的感知 <strong>不是</strong> 线性。Cleveland 1984 实验：<strong>45° 倾角</strong> 是"看上去差距最小、最接近真实值"的角度。</p>
    <div class="slope-control">
      <label>角度：</label>
      <input type="range" id="angle" min="5" max="85" value="45">
      <span class="slope-readout" id="readout">45°</span>
    </div>
    <svg class="slope-svg" width="${W}" height="${H}" id="slope-svg"></svg>
    <div id="slope-expl"></div>
  `;

  const svg = d3.select(mount.querySelector("#slope-svg"));
  const expl = mount.querySelector("#slope-expl");
  const angleInput = mount.querySelector("#angle");
  const readout = mount.querySelector("#readout");

  function render() {
    angle = +angleInput.value;
    readout.textContent = angle + "°";
    svg.selectAll("*").remove();

    const [rx1, ry1, rx2, ry2] = line(45);
    svg.append("line").attr("x1", rx1).attr("y1", ry1).attr("x2", rx2).attr("y2", ry2)
      .attr("stroke", "#cbd5e1").attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
    svg.append("text").attr("x", rx2 + 8).attr("y", ry2 + 4)
      .attr("font-size", 11).attr("fill", "#94a3b8").text("45° 参考");

    const [x1, y1, x2, y2] = line(angle);
    svg.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
      .attr("stroke", "#6366f1").attr("stroke-width", 3);
    svg.append("circle").attr("cx", x1).attr("cy", y1).attr("r", 5).attr("fill", "#6366f1");
    svg.append("circle").attr("cx", x2).attr("cy", y2).attr("r", 5).attr("fill", "#6366f1");

    svg.append("text").attr("x", x1 - 10).attr("y", y1 + 4)
      .attr("text-anchor", "end").attr("font-size", 12).text("起点");
    svg.append("text").attr("x", x2 + 10).attr("y", y2 + 4)
      .attr("font-size", 12).text("终点");

    const rad = (angle * Math.PI) / 180;
    const ax = x1 + 50 * Math.cos(rad / 2);
    const ay = y1 - 50 * Math.sin(rad / 2);
    svg.append("text").attr("x", ax).attr("y", ay)
      .attr("font-size", 12).attr("fill", "#4338ca").attr("font-weight", 600)
      .text(angle + "°");

    expl.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><strong>Stevens 幂律</strong>：斜率感知 ≈ (真实斜率)^1.0 ~ 1.3 区间</li>
        <li><strong>45°</strong> 是视觉"中点"：人眼对靠近 45° 的斜率估计最准</li>
        <li>设计图表时：让关键数据斜率落在 30°-60°，避免在 0° 或 90° 附近做趋势对比</li>
        <li>例：增长曲线若是指数增长，前期很缓、后期很陡，应换 log 轴让斜率落在 ~45°</li>
      </ul>
    `;
  }

  angleInput.addEventListener("input", render);
  render();
};

// =========================================
// ⭐ d-4-5 · Marching Squares 等值线（4.5）
// =========================================
window.DEMOS["d-4-5"] = async function (mount) {
  const N = 8;
  function field(x, y) {
    const cx = 3.5, cy = 4;
    return Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / 6) +
           0.3 * Math.exp(-((x - 1) ** 2 + (y - 6) ** 2) / 3);
  }
  const grid = [];
  for (let y = 0; y < N; y++) {
    grid.push([]);
    for (let x = 0; x < N; x++) grid[y].push(field(x, y));
  }

  const W = 720, H = 460;
  const cellSize = 40;
  const margin = 30;
  let threshold = 0.5;

  const EDGE_TABLE = [
    [],
    [[3, 0]],
    [[0, 1]],
    [[3, 1]],
    [[1, 2]],
    [[3, 0], [1, 2]],
    [[0, 2]],
    [[3, 2]],
    [[2, 3]],
    [[2, 0]],
    [[0, 1], [2, 3]],
    [[2, 1]],
    [[1, 3]],
    [[1, 0]],
    [[0, 3]],
    []
  ];

  mount.innerHTML = `
    <h4>📘 Marching Squares 等值线</h4>
    <p class="demo-hint">标量场被离散化为网格后，给定阈值，追踪 <strong>值=阈值</strong> 的曲线。拖滑块改变阈值。</p>
    <div class="ms-threshold-control">
      <label>阈值：</label>
      <input type="range" id="th" min="0.05" max="0.95" step="0.05" value="0.5">
      <span class="slope-readout" id="th-readout">0.50</span>
    </div>
    <svg class="ms-svg" width="${W}" height="${H}" id="ms-svg"></svg>
    <div id="ms-expl"></div>
  `;

  const svg = d3.select(mount.querySelector("#ms-svg"));
  const thInput = mount.querySelector("#th");
  const readout = mount.querySelector("#th-readout");
  const expl = mount.querySelector("#ms-expl");

  function render() {
    threshold = +thInput.value;
    readout.textContent = threshold.toFixed(2);
    svg.selectAll("*").remove();

    const xMax = d3.max(grid.flat()), xMin = d3.min(grid.flat());
    const fillScale = d3.scaleSequential(d3.interpolateViridis).domain([xMin, xMax]);

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const px = margin + x * cellSize;
        const py = margin + y * cellSize;
        svg.append("rect")
          .attr("x", px).attr("y", py)
          .attr("width", cellSize).attr("height", cellSize)
          .attr("fill", fillScale(grid[y][x]))
          .attr("stroke", "#cbd5e1").attr("stroke-width", 0.5);
      }
    }

    for (let y = 0; y < N - 1; y++) {
      for (let x = 0; x < N - 1; x++) {
        const tl = grid[y][x],     tr = grid[y][x + 1];
        const bl = grid[y + 1][x], br = grid[y + 1][x + 1];
        let code = 0;
        if (bl > threshold) code |= 1;
        if (br > threshold) code |= 2;
        if (tr > threshold) code |= 4;
        if (tl > threshold) code |= 8;

        const lines = EDGE_TABLE[code];
        const px = margin + x * cellSize;
        const py = margin + y * cellSize;
        const edges = [
          [px, py + cellSize / 2],
          [px + cellSize / 2, py + cellSize],
          [px + cellSize, py + cellSize / 2],
          [px + cellSize / 2, py]
        ];

        lines.forEach(([a, b]) => {
          svg.append("line")
            .attr("x1", edges[a][0]).attr("y1", edges[a][1])
            .attr("x2", edges[b][0]).attr("y2", edges[b][1])
            .attr("class", "ms-contour");
        });
      }
    }

    expl.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><strong>16 种 case</strong>：每个 cell 4 个角的"是否大于阈值"决定 case 编号 0-15</li>
        <li>每种 case 对应 0/1/2 条线段，把"超过阈值"和"未超过阈值"的两片区域分开</li>
        <li>扩展到 3D 叫 Marching Cubes（128 种 case）</li>
        <li>应用：地形等高线、医学 MRI 等值面、密度等高图</li>
      </ul>
    `;
  }

  thInput.addEventListener("input", render);
  render();
};
