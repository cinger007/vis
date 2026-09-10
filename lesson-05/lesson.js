// Doc-05 时序数据可视化 · 集成教学页面 · 5 个 demo
// =========================================
//   5.1 时间属性      → d-5-1 attributes
//   5.2 标准时序图    → d-5-2 french-names
//   5.3 日历热图     → d-5-3 cal-heatmap
//   5.4 阿基米德螺旋 → d-5-4 spiral
//   5.5 Storyline    → d-5-5 storyline
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
  if (fn) { fn(mount); mount.dataset.rendered = "1"; }
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
// ⭐ d-5-1 · 时间属性（5.1）
// =========================================
window.DEMOS["d-5-1"] = async function (mount) {
  const TIME_ATTRIBUTES = [
    { key: "ordered",             name: "有序性",      icon: "↗",  color: "#3b82f6",
      desc: "时间是有序的。两个事件发生的时间有先后次序，与因果关系紧密相连。",
      example: "火车时刻表、事件日志（log）、git commit history" },
    { key: "continuous",          name: "连续性",      icon: "∞",  color: "#10b981",
      desc: "时间是连续的。两个时间点之间总存在另一个时间点。",
      example: "实时传感器数据（温度、心率）、流式数据流" },
    { key: "periodic",            name: "周期性",      icon: "🔁", color: "#f59e0b",
      desc: "许多自然过程有循环规律（季节、昼夜）。可采用循环时间域表示。",
      example: "24h 体温、12 个月气温、年周期销售" },
    { key: "spatial_independent", name: "独立于空间",  icon: "✂️", color: "#8b5cf6",
      desc: "时间与空间紧相关，但科学过程大多将它们独立处理。",
      example: "折线图 x 轴只用时间、y 轴只用度量；时序不混用空间" },
    { key: "structured",          name: "结构性",      icon: "📐", color: "#ec4899",
      desc: "时间尺度分年/月/日/时/分/秒，分割既有自然反映（昼夜）也有人为定义。",
      example: "日历/周排列、闰年调整、工作日 vs 周末" }
  ];

  mount.innerHTML = `
    <h4>📘 时间的 5 个核心属性</h4>
    <p class="demo-hint">点每张卡片 → 显示详细解释 + 影响哪些可视化设计。设计时序图前先确认这 5 个属性。</p>
    <div class="attr-grid" id="attr-grid"></div>
    <div class="attr-detail" id="attr-detail" style="margin-top:14px;">
      <p style="color:#94a3b8;font-size:13px;">↑ 点卡片查看详情</p>
    </div>
  `;

  const grid = mount.querySelector("#attr-grid");
  const detail = mount.querySelector("#attr-detail");

  function renderDetail(attr) {
    detail.innerHTML = `
      <div class="attr-detail-card" style="border-left:4px solid ${attr.color};">
        <h4>${attr.icon} ${attr.name} <small style="font-size:11px;color:#94a3b8;font-weight:400">key: ${attr.key}</small></h4>
        <p style="margin:6px 0 10px;color:#334155;line-height:1.7;">${attr.desc}</p>
        <div class="example">
          <strong>实际例子：</strong> ${attr.example}
        </div>
        <div class="visual-hint" style="margin-top:8px;font-size:12px;color:#64748b;">
          <strong>影响可视化：</strong>
          ${attr.key === 'ordered' ? '线图、散点图按时间排序，乱序会导致语义错误' :
            attr.key === 'continuous' ? '线图 vs 柱图的选用——连续数据用线，离散事件用柱/点' :
            attr.key === 'periodic' ? '螺旋图 / polar / 日历热图能更好表达周期性' :
            attr.key === 'spatial_independent' ? '避免在时序图中混用空间编码（颜色映射空间）' :
            '日历/工作日/闰年等特殊时间尺度要在数据预处理时正确处理'}
        </div>
      </div>
    `;
  }

  TIME_ATTRIBUTES.forEach(attr => {
    const card = document.createElement("div");
    card.className = "attr-card";
    card.style.borderTop = `4px solid ${attr.color}`;
    card.innerHTML = `
      <div class="attr-icon" style="color:${attr.color}">${attr.icon}</div>
      <div class="attr-name">${attr.name}</div>
      <div class="attr-key">key: ${attr.key}</div>
    `;
    card.addEventListener("click", () => renderDetail(attr));
    grid.appendChild(card);
  });
};

// =========================================
// ⭐ d-5-2 · 法国人名折线图（5.2）
// =========================================
window.DEMOS["d-5-2"] = async function (mount) {
  const res = await fetch('./data/french_names.json');
  const data = await res.json();

  const W = 720, H = 380, M = { t: 30, r: 30, b: 50, l: 60 };
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;

  const parseYear = d3.timeParse("%Y");
  const series = {};
  Object.entries(data.names).forEach(([name, arr]) => {
    series[name] = arr.map(d => ({ year: parseYear(String(d.year)), count: d.count }));
  });

  const all = Object.values(series).flat();
  const xDomain = d3.extent(all, d => d.year);
  const yMax = d3.max(all, d => d.count);

  const xScale = d3.scaleTime().domain(xDomain).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerH, 0]);

  const COLORS = { Marie: "#db2777", Jean: "#2563eb", Camille: "#059669" };

  mount.innerHTML = `
    <h4>📘 法国人名使用频率（1900-2020）</h4>
    <p class="demo-hint">鼠标移到线上 → 黑色垂直参考线 + 圆点 + tip 显示具体数值。点击名字标签切换显示。</p>
    <div class="demo-control" id="name-tabs"></div>
    <svg class="ts-svg" width="${W}" height="${H}" id="lines"></svg>
    <div id="lines-note"></div>
  `;

  const tabs = mount.querySelector("#name-tabs");
  const svg = d3.select(mount.querySelector("#lines"));
  const visible = new Set(Object.keys(series));

  function render() {
    svg.selectAll("*").remove();

    svg.append("g").selectAll("line")
      .data(yScale.ticks(6)).enter().append("line")
      .attr("x1", M.l).attr("x2", M.l + innerW)
      .attr("y1", d => M.t + yScale(d)).attr("y2", d => M.t + yScale(d))
      .attr("stroke", "#e2e8f0");

    svg.append("g").attr("transform", `translate(${M.l},${M.t + innerH})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%Y")));
    svg.append("g").attr("transform", `translate(${M.l},${M.t})`)
      .call(d3.axisLeft(yScale).ticks(6));

    svg.append("text").attr("x", M.l + innerW / 2).attr("y", M.t + innerH + 36)
      .attr("text-anchor", "middle").style("font-size", "12px").text("年份 →");
    svg.append("text").attr("transform", `translate(${M.l - 44},${M.t + innerH/2}) rotate(-90)`)
      .attr("text-anchor", "middle").style("font-size", "12px").text("每年出生数 →");

    const line = d3.line()
      .x(d => xScale(d.year)).y(d => M.t + yScale(d.count))
      .curve(d3.curveMonotoneX);

    Object.entries(series).forEach(([name, arr]) => {
      if (!visible.has(name)) return;
      svg.append("path").datum(arr)
        .attr("fill", "none").attr("stroke", COLORS[name]).attr("stroke-width", 2.5)
        .attr("d", line);
    });

    const focus = svg.append("g").style("display", "none");
    focus.append("line").attr("class", "hover-line")
      .attr("y1", M.t).attr("y2", M.t + innerH).attr("stroke", "#1e293b").attr("stroke-width", 1);
    focus.append("text").attr("class", "tip").attr("text-anchor", "middle")
      .style("font-size", "11px").style("font-weight", "600");

    const overlay = svg.append("rect")
      .attr("x", M.l).attr("y", M.t).attr("width", innerW).attr("height", innerH)
      .attr("fill", "none").attr("pointer-events", "all");
    overlay.on("mouseover", () => focus.style("display", null))
      .on("mouseout",  () => focus.style("display", "none"))
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const date = xScale.invert(mx - M.l);
        const year = date.getFullYear();
        focus.attr("transform", `translate(${xScale(parseYear(String(year)))},0)`);
        const parts = Object.entries(series)
          .filter(([n]) => visible.has(n))
          .map(([n, arr]) => {
            const v = arr.find(d => d.year.getFullYear() === year);
            return `${n}: ${v ? v.count : '-'}人`;
          });
        focus.select("text").attr("y", M.t - 8).text(`${year} 年 — ${parts.join(" | ")}`);
      });
  }

  Object.keys(series).forEach(name => {
    const btn = document.createElement("label");
    btn.innerHTML = `<input type="checkbox" checked> ${name}`;
    btn.classList.add("active");
    btn.querySelector("input").addEventListener("change", e => {
      if (e.target.checked) { visible.add(name); btn.classList.add("active"); }
      else { visible.delete(name); btn.classList.remove("active"); }
      render();
    });
    tabs.appendChild(btn);
  });

  mount.querySelector("#lines-note").innerHTML = `
    <h4>⭐ 关键点</h4>
    <ul>
      <li><code>d3.timeParse('%Y')</code> 把 '1965' 字符串转 Date 对象</li>
      <li><code>scaleTime</code> 自动按时间跨度选 tick 间隔（10 年间距）</li>
      <li>通用 hover 模板：透明矩形捕获 + focus g 显示垂直线 + 圆点 + 文字 tip</li>
    </ul>
  `;

  render();
};

// =========================================
// ⭐ d-5-3 · 日历热图（5.3）
// =========================================
window.DEMOS["d-5-3"] = async function (mount) {
  const dataRaw = await d3.csv('./data/weather_2024.csv', d3.autoType);
  const byKey = new Map(dataRaw.map(d => [d.date, d.temp_max]));

  const year = 2024;
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);

  const days = d3.timeDay.range(start, end).map(d => ({
    date: d,
    value: byKey.get(d3.timeFormat('%Y-%m-%d')(d)) ?? 0
  }));

  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([30, -5]);

  const cellSize = 16;
  const W = 800, H = 220;
  const M = { t: 30, l: 30 };

  function weekColSunday(date) {
    return Math.floor(d3.timeDay.count(d3.timeYear.floor(date), date) / 7);
  }
  function dayIndexSunday(date) {
    return date.getDay();
  }
  function isFirstDayOfMonth(date) {
    return date.getDay() !== 0 && date.getMonth() > 0 && date.getDate() === 1;
  }
  function isMonthDivider(date) {
    const sevenDaysAgo = d3.timeDay.offset(date, -7);
    return date.getFullYear() !== sevenDaysAgo.getFullYear()
        || date.getMonth()    !== sevenDaysAgo.getMonth();
  }

  mount.innerHTML = `
    <h4>📘 2024 年北京每日最高温（van Wijk 日历热图）</h4>
    <p class="demo-hint">x = 周（年内的第几周），y = 星期几，色 = 最高温（蓝=冷 / 红=热）。鼠标 hover 看具体数值。月份之间用红色分隔线。</p>
    <div class="ms-threshold-control">
      <label>colormap：</label>
      <select id="cmap">
        <option value="RdYlBu" selected>RdYlBu（红黄蓝）</option>
        <option value="Viridis">Viridis（顺序型）</option>
        <option value="Cividis">Cividis（顺序型 CVD）</option>
      </select>
    </div>
    <svg class="cal-svg" width="${W}" height="${H}" id="cal"></svg>
    <div id="cal-legend"></div>
  `;

  const svg = d3.select(mount.querySelector("#cal"));
  const sel = mount.querySelector("#cmap");
  const legend = mount.querySelector("#cal-legend");
  let g;  // 修复 g is not defined bug · 2026-09-09

  function render() {
    svg.selectAll("*").remove();
    const interp = d3['interpolate' + sel.value];
    colorScale.interpolator(interp);

    g = svg.append("g").attr("transform", `translate(${M.l},${M.t})`);

    g.selectAll("rect.cell")
      .data(days).join("rect")
      .attr("class", "cell")
      .attr("width", cellSize).attr("height", cellSize)
      .attr("x", d => weekColSunday(d.date) * cellSize)
      .attr("y", d => dayIndexSunday(d.date) * cellSize)
      .attr("rx", 1.5).attr("ry", 1.5)
      .attr("fill", d => colorScale(d.value))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#1e293b").attr("stroke-width", 1.5);
        showTip(event, `${d3.timeFormat("%Y-%m-%d")(d.date)} ${d.value.toFixed(1)}°C`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
        hideTip();
      });

    g.selectAll("line.month-boundary")
      .data(days.filter(d => isFirstDayOfMonth(d.date)))
      .join("line")
      .attr("class", "month-boundary")
      .attr("x1", d => weekColSunday(d.date) * cellSize)
      .attr("x2", d => weekColSunday(d.date) * cellSize + cellSize)
      .attr("y1", d => dayIndexSunday(d.date) * cellSize)
      .attr("y2", d => dayIndexSunday(d.date) * cellSize)
      .attr("stroke", "#dc2626").attr("stroke-width", 1.5);

    g.selectAll("line.month-divider")
      .data(days.filter(d => isMonthDivider(d.date)))
      .join("line")
      .attr("class", "month-divider")
      .attr("x1", d => weekColSunday(d.date) * cellSize)
      .attr("x2", d => weekColSunday(d.date) * cellSize)
      .attr("y1", d => dayIndexSunday(d.date) * cellSize)
      .attr("y2", d => dayIndexSunday(d.date) * cellSize + cellSize)
      .attr("stroke", "#dc2626").attr("stroke-width", 1.5);

    const months = d3.timeMonth.range(start, end);
    g.selectAll("text.month-label")
      .data(months).join("text")
      .attr("class", "month-label")
      .attr("x", d => weekColSunday(d) * cellSize + 2)
      .attr("y", -8)
      .style("font-size", "10px").style("fill", "#475569")
      .text(d => d3.timeFormat("%b")(d));

    g.selectAll("text.day-label")
      .data(["日", "一", "二", "三", "四", "五", "六"])
      .join("text")
      .attr("class", "day-label")
      .attr("x", -4).attr("y", (_, i) => i * cellSize + cellSize - 4)
      .attr("text-anchor", "end")
      .style("font-size", "9px").style("fill", "#64748b")
      .text(d => d);

    legend.innerHTML = `
      <div class="cal-legend-bar">
        <span class="legend-low">-5°C</span>
        <div class="legend-strip" id="legend-strip"></div>
        <span class="legend-high">30°C</span>
      </div>
    `;
    const strip = mount.querySelector("#legend-strip");
    for (let i = 0; i <= 30; i++) {
      const t = -5 + (i / 30) * 35;
      const d = document.createElement("div");
      d.style.background = colorScale(t);
      strip.appendChild(d);
    }
  }

  function showTip(event, text) {
    let tip = mount.querySelector(".ts-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "ts-tip";
      tip.style.cssText = "position:absolute;background:#1e293b;color:white;padding:4px 8px;border-radius:3px;font-size:11px;pointer-events:none;z-index:1000;";
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.left = (event.pageX + 10) + "px";
    tip.style.top  = (event.pageY - 24) + "px";
  }
  function hideTip() {
    const tip = mount.querySelector(".ts-tip");
    if (tip) tip.remove();
  }

  sel.addEventListener("change", render);
  render();
};

// =========================================
// ⭐ d-5-4 · 阿基米德螺旋（5.4）
// =========================================
window.DEMOS["d-5-4"] = async function (mount) {
  const dataRaw = await d3.csv('./data/weather_2024.csv', d3.autoType);
  const byKey = new Map(dataRaw.map(d => [d.date, d.temp_max]));
  const year = 2024;
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);
  const days = d3.timeDay.range(start, end);

  const boxSize = 22;
  const coilGap = boxSize * 1.4;
  const b = coilGap / (2 * Math.PI);
  const startRadius = 60;
  let theta = (startRadius - 0) / b;

  function pos(t) {
    const r = 0 + b * t;
    return { x: r * Math.cos(t), y: r * Math.sin(t), r };
  }
  function angleDelta(r) { return boxSize / Math.sqrt(b * b + r * r); }

  const W = 720, H = 720;
  const M = { t: H / 2, l: W / 2 };

  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([30, -5]);

  mount.innerHTML = `
    <h4>📘 阿基米德螺旋日历（2024）</h4>
    <p class="demo-hint">每个回路 = 1 年（实际是 1 个周期）。鼠标 hover 看日期 + 温度。扇环角度动态调整：<code>Δθ = boxSize / √(b² + r²)</code> 让弧长近似相等。</p>
    <div class="ms-threshold-control">
      <label>每周起始：</label>
      <select id="weekstart">
        <option value="0" selected>周日</option>
        <option value="1">周一</option>
      </select>
    </div>
    <svg class="spiral-svg" width="${W}" height="${H}" id="spiral-svg"></svg>
    <div id="spiral-note"></div>
  `;

  const svg = d3.select(mount.querySelector("#spiral-svg"));
  const weekSel = mount.querySelector("#weekstart");

  function render() {
    svg.selectAll("*").remove();
    theta = (startRadius - 0) / b;
    const firstDayOfWeek = +weekSel.value;
    const offset = (firstDayOfWeek - start.getDay() + 7) % 7;
    const dayCount = 366;
    const segs = [];

    for (let i = 0; i < dayCount; i++) {
      const t0 = theta;
      const p = pos(t0);
      theta += angleDelta(p.r);
      const t1 = theta;
      const date = d3.timeDay.offset(start, i + offset);
      const dateKey = d3.timeFormat('%Y-%m-%d')(date);
      const value = byKey.get(dateKey);
      segs.push({ t0, t1, date, value });
    }

    const ringT = 1.4;
    svg.selectAll("path.seg")
      .data(segs).join("path")
      .attr("class", "seg")
      .attr("d", d => {
        const r0 = pos(d.t0).r, r1 = pos(d.t1).r;
        const rg0 = r0 + ringT, rg1 = r1 + ringT;
        const x0o = rg0 * Math.cos(d.t0), y0o = rg0 * Math.sin(d.t0);
        const x1o = rg1 * Math.cos(d.t1), y1o = rg1 * Math.sin(d.t1);
        const x1i = r1 * Math.cos(d.t1), y1i = r1 * Math.sin(d.t1);
        const x0i = r0 * Math.cos(d.t0), y0i = r0 * Math.sin(d.t0);
        return `M ${x0o} ${y0o} A ${rg0} ${rg0} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${r1} ${r1} 0 0 0 ${x0i} ${y0i} Z`;
      })
      .attr("fill", d => d.value != null ? colorScale(d.value) : "#e2e8f0")
      .attr("stroke", "#fff").attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#1e293b").attr("stroke-width", 1.5);
        showTip(event, `${d3.timeFormat('%Y-%m-%d')(d.date)}: ${d.value?.toFixed(1) ?? '-'}°C`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
        hideTip();
      });

    const months = d3.timeMonth.range(start, end);
    svg.selectAll("text.month-label")
      .data(months).join("text")
      .attr("class", "month-label")
      .attr("x", d => {
        const t = theta;
        return pos(t).r * Math.cos(t);
      })
      .attr("y", d => pos(theta).r * Math.sin(theta))
      .style("font-size", "10px").style("fill", "#475569")
      .text(d => d3.timeFormat("%b")(d));
  }

  function showTip(event, text) {
    let tip = mount.querySelector(".ts-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "ts-tip";
      tip.style.cssText = "position:absolute;background:#1e293b;color:white;padding:4px 8px;border-radius:3px;font-size:11px;pointer-events:none;z-index:1000;";
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.left = (event.pageX + 10) + "px";
    tip.style.top  = (event.pageY - 24) + "px";
  }
  function hideTip() {
    const tip = mount.querySelector(".ts-tip");
    if (tip) tip.remove();
  }

  svg.attr("viewBox", `${-M.l} ${-M.t} ${W} ${H}`);
  weekSel.addEventListener("change", render);
  render();
};

// =========================================
// ⭐ d-5-5 · Storyline（5.5，侏罗纪公园）
// =========================================
window.DEMOS["d-5-5"] = async function (mount) {
  // 数据：侏罗纪公园 5 个角色
  const data = {
    title: "侏罗纪公园 (Jurassic Park, 1993)",
    duration_min: 127,
    characters: [
      { name: "Alan Grant & Kids", color: "#1976d2", width: 4, points: [
        { time:  5, y:  80 }, { time: 18, y: 130 }, { time: 38, y: 180 },
        { time: 65, y: 150 }, { time: 78, y:  80 }, { time: 88, y: 110 },
        { time:105, y:  60 }, { time:125, y:  40 }
      ]},
      { name: "T-REX", color: "#d32f2f", width: 6, points: [
        { time: 75, y: 280 }, { time: 78, y: 130 }, { time: 88, y: 200 },
        { time:100, y: 250 }, { time:120, y: 290 }
      ]},
      { name: "Raptors", color: "#f57c00", width: 4, points: [
        { time: 50, y: 320 }, { time: 80, y: 290 }, { time: 95, y: 230 },
        { time:108, y: 180 }, { time:118, y: 100 }
      ]},
      { name: "Malcolm", color: "#7b1fa2", width: 3, points: [
        { time: 22, y:  40 }, { time: 45, y:  90 }, { time: 70, y: 120 },
        { time: 82, y: 130 }, { time: 95, y: 200 }, { time:120, y: 240 }
      ]},
      { name: "Dilophosaurus", color: "#388e3c", width: 3, points: [
        { time: 38, y: 350 }, { time: 48, y: 320 }, { time: 58, y: 340 }
      ]}
    ],
    events: [
      { time: 78, x: 78, y: 105, name: "T-REX 攻击", desc: "T-REX 冲出围栏攻击 Alan & Kids 的车" },
      { time: 48, x: 48, y: 335, name: "Nedry 事件", desc: "Dilophosaurus 攻击 Nedry" }
    ]
  };

  const W = 800, H = 460, M = { t: 30, r: 30, b: 40, l: 110 };

  const xScale = d3.scaleLinear().domain([0, data.duration_min]).range([M.l, W - M.r]);
  const yScale = d3.scaleLinear().domain([0, 400]).range([H - M.b, M.t]);

  mount.innerHTML = `
    <h4>📘 Storyline 时间线：《侏罗纪公园》5 角色</h4>
    <p class="demo-hint">每条彩色曲线 = 1 个角色的"生命线"。y 越靠近 = 角色聚拢（相遇/冲突）；y 远离 = 分离。半透明红圈 = 关键事件。鼠标 hover 看事件详情。</p>
    <div class="demo-control" id="alpha-control">
      <label>曲线张力：</label>
      <input type="range" id="alpha" min="0" max="1" step="0.1" value="0.5">
      <span class="slope-readout" id="alpha-readout">0.5</span>
    </div>
    <svg class="storyline-svg" width="${W}" height="${H}" id="storyline"></svg>
    <div id="storyline-note"></div>
  `;

  const svg = d3.select(mount.querySelector("#storyline"));
  const alphaInput = mount.querySelector("#alpha");
  const alphaReadout = mount.querySelector("#alpha-readout");
  const note = mount.querySelector("#storyline-note");

  function render() {
    const alpha = +alphaInput.value;
    alphaReadout.textContent = alpha.toFixed(1);
    svg.selectAll("*").remove();

    svg.append("g").selectAll("line")
      .data(d3.range(0, data.duration_min + 1, 20)).enter().append("line")
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", M.t).attr("y2", H - M.b)
      .attr("stroke", "#e2e8f0");

    svg.append("g").attr("transform", `translate(0,${H - M.b})`)
      .call(d3.axisBottom(xScale).ticks(8));
    svg.append("text").attr("x", W / 2).attr("y", H - 6)
      .attr("text-anchor", "middle").style("font-size", "11px").text("电影时间 (分钟) →");

    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.y))
      .curve(d3.curveCatmullRom.alpha(alpha));

    data.characters.forEach(c => {
      svg.append("path")
        .datum(c.points)
        .attr("d", line)
        .attr("stroke", c.color).attr("stroke-width", c.width)
        .attr("fill", "none").attr("opacity", 0.9);

      svg.append("text")
        .attr("x", M.l - 8)
        .attr("y", yScale(c.points[0].y))
        .attr("text-anchor", "end")
        .attr("font-size", "12px").attr("font-weight", 600)
        .attr("fill", c.color)
        .text(c.name);
    });

    const eventLayer = svg.append("g").attr("class", "event-layer");
    data.events.forEach(ev => {
      const ex = xScale(ev.time);
      const ey = yScale(ev.y);
      const grp = eventLayer.append("g").attr("class", "event")
        .style("cursor", "pointer")
        .on("mouseenter", (e) => showTip(e, `${ev.name}\n${ev.desc}`))
        .on("mouseleave", () => hideTip());
      grp.append("circle")
        .attr("cx", ex).attr("cy", ey).attr("r", 18)
        .attr("fill", "rgba(220, 38, 38, 0.15)").attr("stroke", "none");
      grp.append("circle")
        .attr("cx", ex).attr("cy", ey).attr("r", 4)
        .attr("fill", "#dc2626");
      grp.append("text")
        .attr("x", ex).attr("y", ey - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "10").attr("font-weight", 600).attr("fill", "#cc0000")
        .text(ev.name);
    });
  }

  function showTip(event, text) {
    let tip = mount.querySelector(".ts-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "ts-tip";
      tip.style.cssText = "position:absolute;background:#1e293b;color:white;padding:6px 10px;border-radius:4px;font-size:11px;pointer-events:none;z-index:1000;white-space:pre-line;max-width:200px;";
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.left = (event.pageX + 12) + "px";
    tip.style.top  = (event.pageY - 12) + "px";
  }
  function hideTip() {
    const tip = mount.querySelector(".ts-tip");
    if (tip) tip.remove();
  }

  alphaInput.addEventListener("input", render);

  note.innerHTML = `
    <h4>⭐ 关键点</h4>
    <ul>
      <li><strong>3 大元素</strong>：时间尺度映射（<code>scaleLinear</code>）+ Catmull-Rom 样条（<code>alpha=0.5</code>）+ 事件层（红圈标注）</li>
      <li><strong>y 表达"关系"</strong>：T-REX 和 Grant 在 t=78 都画到 y=130，<strong>视觉聚拢 = "T-REX 攻击"</strong></li>
      <li><strong>alpha 调张力</strong>：0=接近直线，1=过度弯曲，0.5=标准（流动但不震荡）</li>
      <li><strong>事件层独立</strong>：半透明红圈 + 文字，可单独动画、独立筛选</li>
    </ul>
  `;

  render();
};
