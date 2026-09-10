// lesson.js —— Doc-01 集成教学页面交互逻辑
// 1) 章节切换  2) Tab 切换  3) Demo 注入

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


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

const DEMOS = {};

// ---------- 3.1 数据加载演示 ----------
DEMOS["d-3-1"] = async (mount) => {
  mount.innerHTML = `
    <div class="console" id="d-3-1-log">加载中...</div>
    <h4>转换后数据（前 10 行）</h4>
    <div id="d-3-1-table"></div>
    <h4>字段映射</h4>
    <table class="theory-table">
      <thead><tr><th>CSV 中文</th><th>JS 变量</th><th>类型</th></tr></thead>
      <tbody>
          <tr><td>序号</td><td>id</td><td>Number</td></tr>
          <tr><td>姓名</td><td>name</td><td>String</td></tr>
          <tr><td>生日</td><td>birthday</td><td>Date</td></tr>
          <tr><td>年龄</td><td>age</td><td>Number</td></tr>
          <tr><td>班级</td><td>class</td><td>String</td></tr>
        </tbody>
    </table>
    <button id="d-3-1-reload" class="demo-btn">重新加载</button>
  `;
  const log = (msg) => {
    const el = document.getElementById("d-3-1-log");
    if (el) el.textContent += "\n" + msg;
  };
  const run = async () => {
    const el = document.getElementById("d-3-1-log");
    if (el) el.textContent = "⏳ 加载 ./data/newstudent.csv...";
    function transformRow(d) {
      return {
        id:       +d["序号"],
        name:     d["姓名"].trim(),
        gender:   d["性别"].trim(),
        birthday: new Date(d["生日"]),
        age:      +d["年龄"],
        class:    d["班级"].trim(),
      };
    }
    const data = await d3.csv("./data/newstudent.csv", transformRow);
    log(`✓ 共 ${data.length} 条`);
    log("【类型验证】");
    log(`typeof data[0].age  →  ${typeof data[0].age}`);
    log(`data[0].birthday instanceof Date  →  ${data[0].birthday instanceof Date}`);
    log(`data[0].age + 1  →  ${data[0].age + 1}（Number 可计算）`);
    log("");
    log("【前 3 条】");
    log(JSON.stringify(data.slice(0, 3).map(d => ({
      ...d, birthday: d.birthday.toISOString().slice(0, 10)
    })), null, 2));

    const tbl = document.getElementById("d-3-1-table");
    tbl.innerHTML = `<table class="theory-table">
      <thead><tr><th>id</th><th>name</th><th>gender</th><th>birthday</th><th>age</th><th>class</th></tr></thead>
      <tbody>${data.slice(0, 10).map(d => `<tr>
        <td>${d.id}</td><td>${d.name}</td><td>${d.gender}</td>
        <td>${d.birthday.toISOString().slice(0, 10)}</td>
        <td>${d.age}</td><td>${d.class}</td>
      </tr>`).join("")}</tbody>
    </table>`;
  };
  document.getElementById("d-3-1-reload").addEventListener("click", run);
  await run();
};

// ---------- 3.2 DIKW 金字塔 ----------
DEMOS["d-3-2"] = (mount) => {
  const W = 600, H = 360, cx = W / 2;
  const LAYERS = [
    { name: "Wisdom",   cn: "智慧", color: "#9333ea", h: 60, topW: 60,
      desc: "运用知识做出明智判断与战略决策。回答「为什么」与「应该怎么做」。",
      viz: "战略仪表盘、决策树" },
    { name: "Knowledge", cn: "知识", color: "#0891b2", h: 80, topW: 90,
      desc: "对信息的进一步提炼和理解，形成模式、规律、关联。回答「如何」。",
      viz: "统计模型、机器学习预测" },
    { name: "Information", cn: "信息", color: "#059669", h: 100, topW: 120,
      desc: "经过处理、组织、赋予上下文的数据。回答「谁、什么、何时、何地」。",
      viz: "折线图、柱状图、热力图" },
    { name: "Data", cn: "数据", color: "#64748b", h: 120, topW: 150,
      desc: "原始、离散的观察结果，缺乏上下文与意义。",
      viz: "原始表格、CSV 文件" },
  ];
  mount.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div><div id="d-3-2-svg"></div></div>
      <div id="d-3-2-detail" class="demo-detail">← 点击金字塔任意层</div>
    </div>
  `;
  const svg = d3.select("#d-3-2-svg").append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("style", "max-width:600px;");
  LAYERS.forEach((layer, i) => {
    const botW = layer.topW + 60;
    const yTop = 20 + i * 80;
    const yBot = yTop + layer.h;
    const path = `M ${cx - layer.topW / 2} ${yTop}
      L ${cx + layer.topW / 2} ${yTop}
      L ${cx + botW / 2} ${yBot}
      L ${cx - botW / 2} ${yBot} Z`;
    const g = svg.append("g").style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).select("path").transition().duration(150)
          .attr("fill", d3.color(layer.color).brighter(0.5));
      })
      .on("mouseout", function () {
        d3.select(this).select("path").transition().duration(150)
          .attr("fill", layer.color);
      })
      .on("click", () => {
        document.getElementById("d-3-2-detail").innerHTML = `
          <h4 style="color:${layer.color}">${layer.cn}（${layer.name}）</h4>
          <p>${layer.desc}</p>
          <p><strong>典型可视化：</strong>${layer.viz}</p>`;
      });
    g.append("path").attr("d", path)
      .attr("fill", layer.color).attr("stroke", "white").attr("stroke-width", 2);
    g.append("text").attr("x", cx).attr("y", (yTop + yBot) / 2)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "white").attr("font-size", 16).attr("font-weight", 600)
      .text(`${layer.cn} · ${layer.name}`);
  });
};

// ---------- 3.3 属性 × 视觉通道 ----------
DEMOS["d-3-3"] = (mount) => {
  const DATA = [
    { name: "张三", major: "软件工程", classNo: 1, age: 18 },
    { name: "李四", major: "软件工程", classNo: 1, age: 19 },
    { name: "王五", major: "软件工程", classNo: 2, age: 20 },
    { name: "赵六", major: "软件工程", classNo: 2, age: 17 },
    { name: "孙七", major: "数据科学", classNo: 1, age: 21 },
    { name: "周八", major: "数据科学", classNo: 1, age: 22 },
    { name: "吴九", major: "数据科学", classNo: 2, age: 19 },
  ];
  mount.innerHTML = `
    <div class="demo-sub">
      <h4>3.3.1 类别 → 色相（✓ 正确）</h4>
      <svg id="d-3-3-cat" style="width:100%; height:140px;"></svg>
    </div>
    <div class="demo-sub">
      <h4>3.3.2 序数 → 亮度（✓ 正确）</h4>
      <svg id="d-3-3-ord" style="width:100%; height:80px;"></svg>
    </div>
    <div class="demo-sub">
      <h4>3.3.3 数值 → 位置（✓ 正确）</h4>
      <svg id="d-3-3-num" style="width:100%; height:160px;"></svg>
    </div>
    <div class="demo-sub">
      <h4>3.3.4 ❌ 数值 → 色相（错配，看不出大小）</h4>
      <svg id="d-3-3-bad" style="width:100%; height:160px;"></svg>
    </div>
  `;
  // 类别 → 色相
  {
    const svg = d3.select("#d-3-3-cat");
    const W = 600, H = 140;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const majors = [...new Set(DATA.map(d => d.major))];
    const color = d3.scaleOrdinal().domain(majors).range(d3.schemeTableau10);
    const x = d3.scaleBand().domain(DATA.map(d => d.name)).range([40, W - 20]).padding(0.3);
    svg.selectAll("rect").data(DATA).join("rect")
      .attr("x", d => x(d.name)).attr("y", 20).attr("width", x.bandwidth()).attr("height", 50)
      .attr("fill", d => color(d.major));
    svg.selectAll("text").data(DATA).join("text")
      .attr("x", d => x(d.name) + x.bandwidth() / 2).attr("y", 90)
      .attr("text-anchor", "middle").attr("font-size", 11).text(d => d.name);
  }
  // 序数 → 亮度
  {
    const svg = d3.select("#d-3-3-ord");
    const W = 600, H = 80;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const levels = [1, 2, 3, 4, 5];
    const x = d3.scaleBand().domain(levels).range([40, W - 20]).padding(0.2);
    const brightness = d3.scaleLinear().domain([1, 5]).range(["#f1f5f9", "#0f172a"]);
    svg.selectAll("rect").data(levels).join("rect")
      .attr("x", d => x(d)).attr("y", 10).attr("width", x.bandwidth()).attr("height", 40)
      .attr("fill", d => brightness(d));
  }
  // 数值 → 位置
  {
    const svg = d3.select("#d-3-3-num");
    const W = 600, H = 160;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain(d3.extent(DATA, d => d.age)).range([60, W - 20]);
    const y = d3.scaleBand().domain(DATA.map(d => d.name)).range([10, H - 40]).padding(0.3);
    svg.append("g").attr("transform", `translate(0, ${H - 30})`).call(d3.axisBottom(x).ticks(5));
    svg.selectAll("circle").data(DATA).join("circle")
      .attr("cx", d => x(d.age)).attr("cy", d => y(d.name) + y.bandwidth() / 2).attr("r", 7)
      .attr("fill", "#2563eb");
    svg.selectAll("text").data(DATA).join("text")
      .attr("x", 55).attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end").attr("font-size", 11).text(d => d.name);
  }
  // 错配
  {
    const svg = d3.select("#d-3-3-bad");
    const W = 600, H = 160;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const x = d3.scaleBand().domain(DATA.map(d => d.name)).range([40, W - 20]).padding(0.3);
    const hue = d3.scaleSequential(d3.interpolateRainbow).domain(d3.extent(DATA, d => d.age));
    svg.selectAll("rect").data(DATA).join("rect")
      .attr("x", d => x(d.name)).attr("y", 10).attr("width", x.bandwidth()).attr("height", 50)
      .attr("fill", d => hue(d.age));
    svg.selectAll("text").data(DATA).join("text")
      .attr("x", d => x(d.name) + x.bandwidth() / 2).attr("y", 80)
      .attr("text-anchor", "middle").attr("font-size", 11).text(d => `${d.name}（${d.age}）`);
  }
};

// ---------- 3.4 D3 8 个数组函数 ----------
DEMOS["d-3-4"] = (mount) => {
  mount.innerHTML = `
    <div class="controls">
      <label>函数：
        <select id="d-3-4-sel">
          <option value="map">map</option>
          <option value="reduce">reduce</option>
          <option value="cross">cross</option>
          <option value="merge">merge</option>
          <option value="pairs">pairs</option>
          <option value="transpose">transpose</option>
          <option value="zip">zip</option>
          <option value="filter">filter</option>
          <option value="group">group ★</option>
          <option value="rollup">rollup ★</option>
        </select>
      </label>
    </div>
    <div id="d-3-4-out"></div>
  `;
  const SPECS = {
    map: { in: [1, 2, 3, 4], fn: () => d3.map([1,2,3,4], x => x * x), hint: "把每个元素平方" },
    reduce: { in: [1, 2, 3, 4], fn: () => d3.reduce([1,2,3,4], (a, b) => a + b, 0), hint: "求和" },
    cross: { in: ['A','B','C'], fn: () => d3.cross(['A','B'], [1,2]), hint: "笛卡尔积" },
    merge: { in: [[1,2],[3,4]], fn: () => d3.merge([[1,2],[3,4],[5]]), hint: "扁平合并" },
    pairs: { in: [1,2,3,4], fn: () => d3.pairs([1,2,3,4]), hint: "相邻元素对" },
    transpose: { in: [[1,2,3],[4,5,6]], fn: () => d3.transpose([[1,2,3],[4,5,6]]), hint: "矩阵转置" },
    zip: { in: [['A','B','C'],[1,2,3]], fn: () => d3.zip(['A','B','C'],[1,2,3]), hint: "按位合并" },
    filter: { in: [1,2,3,4,5], fn: () => d3.filter([1,2,3,4,5], x => x > 2), hint: "保留 > 2 的" },
    group: { in: null, fn: () => {
      const data = [{c:'1班',n:1},{c:'1班',n:2},{c:'2班',n:3},{c:'2班',n:4}];
      return d3.group(data, d => d.c);
    }, hint: "按班级分组（保留所有元素）" },
    rollup: { in: null, fn: () => {
      const data = [{c:'1班',n:1},{c:'1班',n:2},{c:'2班',n:3},{c:'2班',n:4}];
      return d3.rollup(data, v => v.length, d => d.c);
    }, hint: "按班级聚合（每班人数）" },
  };
  const render = (name) => {
    const s = SPECS[name];
    const out = s.fn();
    document.getElementById("d-3-4-out").innerHTML = `
      <p><strong>${name}</strong> —— ${s.hint}</p>
      <div class="console">输入：${JSON.stringify(s.in)}
输出：${JSON.stringify([...out], null, 2)}</div>`;
  };
  document.getElementById("d-3-4-sel").addEventListener("change", e => render(e.target.value));
  render("map");
};

// ---------- 3.5 Selection 三态 ----------
DEMOS["d-3-5"] = (mount) => {
  mount.innerHTML = `
    <div class="controls">
      <button id="d-3-5-add" class="demo-btn">+ 添加</button>
      <button id="d-3-5-update" class="demo-btn">⇆ 更新</button>
      <button id="d-3-5-remove" class="demo-btn">− 删除</button>
      <button id="d-3-5-reset" class="demo-btn">重置</button>
    </div>
    <p>当前数据：<code id="d-3-5-state">[1, 2, 3]</code></p>
    <svg id="d-3-5-svg" style="width:100%; height:140px;"></svg>
    <p class="demo-legend">
      <span style="color:#10b981">●</span> enter（绿）
      <span style="color:#0ea5e9">●</span> update（蓝）
      <span style="color:#ef4444">●</span> exit（红）
    </p>
  `;
  const svg = d3.select("#d-3-5-svg");
  const W = 700, H = 140;
  svg.attr("viewBox", `0 0 ${W} ${H}`);
  let data = [1, 2, 3];
  const render = () => {
    svg.selectAll("circle").data(data, d => d).join(
      enter => enter.append("circle")
        .attr("cx", d => d * 70 + 60).attr("cy", H / 2).attr("r", 0)
        .attr("fill", "#10b981")
        .call(s => s.transition().duration(400).attr("r", 24)),
      update => update.attr("fill", "#0ea5e9")
        .call(s => s.transition().duration(400)
          .attr("cx", d => d * 70 + 60).attr("r", 24)),
      exit => exit.attr("fill", "#ef4444")
        .call(s => s.transition().duration(400).attr("r", 0).remove())
    );
    document.getElementById("d-3-5-state").textContent = "[" + data.join(", ") + "]";
  };
  document.getElementById("d-3-5-add").onclick = () => { data = [...data, data.length + 1]; render(); };
  document.getElementById("d-3-5-update").onclick = () => { data = data.map(d => d + 0.5); render(); };
  document.getElementById("d-3-5-remove").onclick = () => { data = data.slice(0, -1); render(); };
  document.getElementById("d-3-5-reset").onclick = () => { data = [1, 2, 3]; render(); };
  render();
};