// lesson.js —— Doc-02 集成教学页面交互逻辑
// 1) 章节切换  2) Tab 切换  3) 4 个 Demo 注入

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

window.DEMOS = window.DEMOS || {};


// =============================================================
// 数据加载辅助函数（修复 loadStudents 未定义 bug · 2026-09-09）
// =============================================================
async function loadStudents() {
  return await d3.csv("./data/newstudent.csv", d => {
    const cls = d["班级"].trim();
    return {
      id:       +d["序号"],
      name:     d["姓名"].trim(),
      gender:   d["性别"].trim(),
      birthday: d["生日"].trim(),
      age:      +d["年龄"],
      class:    cls,
      hometown: d["籍贯"].trim(),
      nation:   d["民族"].trim(),
      // 从班级提取专业（"软件工程1班" → "软件工程"），用于 d-4-2/4-3/4-4 rollup 分组
      major:    cls.replace(/[\d班]+$/, "").trim(),
    };
  });
}


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

// ---------- 4.1 流程概念图（Card / Mackinlay / van Wijk） ----------
DEMOS["d-4-1"] = (mount) => {
  mount.innerHTML = `
    <div class="controls">
      <span style="font-size:13px;color:#475569;">👇 点击任一节点查看该步骤在三个理论中的对应关系</span>
    </div>
    <svg class="flow-svg" id="d-4-1-svg" viewBox="0 0 920 200"></svg>
    <div class="flow-detail" id="d-4-1-detail">点击上方任一节点（Card 1999 / Mackinlay 1986 / van Wijk 的对应）→</div>
  `;

  const nodes = [
    { id: "data",  label: "① 原始数据",
      c: "#3b82f6",
      detail: "<strong>Card 1999 模型：原始数据 (Raw Data)</strong> —— 一切可视化的起点。<br>" +
              "<strong>Mackinlay 1986：</strong> 无需变换，直接进入 mapping pipeline。<br>" +
              "<strong>van Wijk：</strong> 这是用户最直接看到的「数据集」，通常是 DBMS 表 / CSV / JSON。<br>" +
              "<em>本节课例子：newstudent.csv（80 条 2025 级新生）</em>"
    },
    { id: "tform", label: "② 数据变换",
      c: "#a855f7",
      detail: "<strong>Card 1999：</strong>派生数据 (Derived Data) —— filter / sort / group / derive / aggregate。<br>" +
              "<strong>关键：</strong>D3 的 d3.rollup、d3.group 全部是这一层的实现。<br>" +
              "<strong>van Wijk：</strong>数据到视图的「Transformations」，决定接下来能看到什么。<br>" +
              "<em>例子：80 条 → 按「专业 → 班级」聚合 → 班级学生人数</em>"
    },
    { id: "map",   label: "③ 视觉映射",
      c: "#f59e0b",
      detail: "<strong>Card 1999：</strong>可视化结构 (Visualization Mapping)，D → T → V。<br>" +
              "<strong>Mackinlay 1986：</strong>自动化准则 —— 数值属性最佳通道是位置（位置量化误差最小），类别属性最佳通道是色调。<br>" +
              "<strong>关键决策：</strong>把「年龄」映射到位置（X）、把「性别」映射到颜色（hue）。<br>" +
              "<em>本节课例子：d3.scaleLinear(x) + d3.scaleOrdinal(colors)</em>"
    },
    { id: "view",  label: "④ 视图渲染",
      c: "#10b981",
      detail: "<strong>Card 1999：</strong>视图变换 (View Transformation)，C → L → S 三层。<br>" +
              "· <strong>C 层：</strong>camera 决定观察位置（虚拟摄像机）<br>" +
              "· <strong>L 层：</strong>light 决定阴影、深度（z 轴）<br>" +
              "· <strong>S 层：</strong>screen 把虚拟坐标映射到真实像素（如 800×600）<br>" +
              "<em>SVG 渲染：&lt;rect x=&quot;100&quot; y=&quot;200&quot; width=&quot;50&quot; height=&quot;30&quot;/&gt;</em>"
    },
    { id: "inter", label: "⑤ 用户交互",
      c: "#ef4444",
      detail: "<strong>van Wijk 模型核心：</strong>反馈循环 —— View → Filter → Param → Other Views。<br>" +
              "<strong>Card 把交互放在最末层：</strong>用户与 view 的交互反向触达数据变换层。<br>" +
              "<strong>常见交互：</strong>zoom（缩放）/ pan（平移）/ select（高亮）/ link（联动）。<br>" +
              "<em>本节课演示：点击节点查看详情（基于事件委托）</em>"
    }
  ];

  const W = 920;
  const NODE_W = 130, NODE_H = 60;
  const pad = (W - nodes.length * NODE_W) / (nodes.length + 1);

  const svg = d3.select("#d-4-1-svg");
  // arrowhead marker
  const defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8).attr("refY", 0)
    .attr("markerWidth", 6).attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#94a3b8");

  // arrows
  nodes.slice(0, -1).forEach((n, i) => {
    const next = nodes[i + 1];
    const x1 = pad + i * (NODE_W + pad) + NODE_W;
    const x2 = pad + (i + 1) * (NODE_W + pad);
    const y = 35 + NODE_H / 2;
    svg.append("line")
       .attr("class", "arrow")
       .attr("x1", x1).attr("y1", y).attr("x2", x2).attr("y2", y)
       .attr("marker-end", "url(#arrowhead)");
  });

  // nodes
  const g = svg.selectAll(".node").data(nodes).join("g")
    .attr("class", "node")
    .attr("transform", (d, i) => `translate(${pad + i * (NODE_W + pad)}, 35)`)
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      svg.selectAll(".node").classed("selected", n => n.id === d.id);
      document.getElementById("d-4-1-detail").innerHTML = d.detail;
    });

  g.append("rect")
    .attr("width", NODE_W).attr("height", NODE_H)
    .attr("fill", d => d.c + "15")                  // 极浅色背景
    .attr("stroke", d => d.c)
    .attr("stroke-width", 2);

  g.append("text")
    .attr("class", "node-label")
    .attr("x", NODE_W / 2).attr("y", NODE_H / 2 + 5)
    .attr("text-anchor", "middle")
    .text(d => d.label);
};

// ---------- 4.2 数据分类树（d3.rollup 多层聚合） ----------
DEMOS["d-4-2"] = async (mount) => {
  const data = await loadStudents();

  mount.innerHTML = `
    <div class="controls">
      <label>第 1 层分组：
        <select id="d-4-2-k1">
          <option value="gender" selected>gender 性别</option>
          <option value="major">major 专业</option>
          <option value="class">class 班级</option>
          <option value="hometown">hometown 籍贯</option>
        </select>
      </label>
      <label>第 2 层分组：
        <select id="d-4-2-k2">
          <option value="" selected>— 无（单层）—</option>
          <option value="gender">gender</option>
          <option value="major">major</option>
          <option value="class">class</option>
        </select>
      </label>
      <label>每组聚合：
        <select id="d-4-2-val">
          <option value="count" selected>count 计数</option>
          <option value="ages">ages 年龄列表</option>
          <option value="avgAge">avgAge 平均年龄</option>
        </select>
      </label>
    </div>
    <div class="console" id="d-4-2-out">计算中...</div>
    <p class="demo-legend">
      <span style="color:#a855f7">★</span> <strong>d3.rollup(data, reduceFn, key1, key2)</strong>：
      多层 key 时，外层为 key1、内层为 key2；reduceFn 把同组数据聚合为单一值。
    </p>
  `;

  const $k1 = document.getElementById("d-4-2-k1");
  const $k2 = document.getElementById("d-4-2-k2");
  const $val = document.getElementById("d-4-2-val");
  const $out = document.getElementById("d-4-2-out");

  function run() {
    const k1 = $k1.value, k2 = $k2.value, val = $val.value;

    const reduceFn = val === "count"  ? v => v.length
                   : val === "avgAge" ? v => +(d3.mean(v, d => d.age).toFixed(2))
                                      : v => v.map(d => d.age).join(",");

    // 注意：d3.rollup 接收 keys 是 rest 参数
    const result = d3.rollup(data, reduceFn, d => d[k1], ...(k2 ? [d => d[k2]] : []));

    $out.innerText = formatMap(result, k1);
  }

  // 自定义嵌套 Map 打印（d3 默认 toString 不好看）
  function formatMap(m, label) {
    const lines = [`d3.rollup 按「${label}」聚合的结果 →`];
    function walk(node, depth) {
      if (node instanceof Map) {
        for (const [k, v] of node) {
          lines.push(`  ${"  ".repeat(depth)}├── "${k}"`);
          walk(v, depth + 1);
        }
      } else {
        lines.push(`  ${"  ".repeat(depth)}└── ${JSON.stringify(node)}`);
      }
    }
    walk(m, 1);
    return lines.join("\n");
  }

  $k1.addEventListener("change", run);
  $k2.addEventListener("change", run);
  $val.addEventListener("change", run);
  run();
};

// ---------- 4.3 树布局（Reingold-Tilford 算法） ----------
DEMOS["d-4-3"] = async (mount) => {
  const data = await loadStudents();

  mount.innerHTML = `
    <div class="controls">
      <label>聚合层次：
        <select id="d-4-3-keys">
          <option value="major:class" selected>专业 → 班级</option>
          <option value="major:class:gender">专业 → 班级 → 性别</option>
          <option value="gender:major:class">性别 → 专业 → 班级</option>
          <option value="hometown:major">籍贯 → 专业</option>
        </select>
      </label>
      <label>节点间距：
        <input id="d-4-3-sep" type="range" min="0.1" max="2" step="0.05" value="0.6" />
        <span id="d-4-3-sep-out">0.6</span>
      </label>
    </div>
    <svg class="tree-svg tree-layout-svg" id="d-4-3-svg" viewBox="0 0 800 360"></svg>
    <p class="demo-legend">
      <strong>Reingold-Tilford 算法：</strong>1981 年提出，仍是 d3.tree() 的核心实现。每个父节点的子节点
      均匀分配左右两侧的空间，子节点的位置是递归计算父节点位置 ± 偏移。
    </p>
  `;

  const $keys = document.getElementById("d-4-3-keys");
  const $sep  = document.getElementById("d-4-3-sep");
  const $out  = document.getElementById("d-4-3-sep-out");

  function getHierarchy() {
    const path = $keys.value.split(":");
    let rootData = { count: data.length };

    // 用 d3.rollup 嵌套聚合
    let innermost = data;
    const keys = path.slice().reverse();
    let fn = arr => arr;  // 叶子就是列表本身
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const prev = fn;
      fn = (arr) => {
        const m = d3.rollup(arr, prev, d => d[k]);
        return m;
      };
    }

    rootData.children = fn(data);
    return rootData;
  }

  function buildNodeRec(d, label = "所有学生") {
    if (d instanceof Map) {
      const children = [];
      for (const [key, val] of d) {
        children.push(buildNodeRec(val, key));
      }
      return { name: label, children };
    }
    // 叶子：d 是数组（之前 fn(arr) = arr 链路最终终止）
    return { name: `${label} (${d.length})`, value: d.length, _students: d };
  }

  function render() {
    const sep = +$sep.value;
    $out.textContent = sep.toString();

    const raw = getHierarchy();
    const root = d3.hierarchy(buildNodeRec(raw.children));
    const width = 800, height = 360;
    const treeLayout = d3.tree().size([height - 40, width - 80]).separation((a, b) => (a.parent === b.parent ? 1 : sep));
    const treeData = treeLayout(root);

    const svg = d3.select("#d-4-3-svg");
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", "translate(40, 20)");

    // links
    g.selectAll(".link").data(treeData.links()).join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y).y(d => d.x));

    // nodes
    const ng = g.selectAll(".node").data(treeData.descendants()).join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y}, ${d.x})`);

    ng.append("circle").attr("r", 5);
    ng.append("text")
      .attr("dy", 4)
      .attr("x", d => d.children ? -8 : 8)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);
  }

  $keys.addEventListener("change", render);
  $sep.addEventListener("input", render);
  render();
};

// ---------- 4.4 树形列表渲染（classed + 事件委托 + stopPropagation + 动画 transition） ----------
DEMOS["d-4-4"] = async (mount) => {
  const data = await loadStudents();

  // d3.rollup → { major: { class: [students...] } }
  const grouped = d3.rollup(data,
    v => v,                              // 班级 → 学生列表
    d => d.major,
    d => d.class);

  // 转为 JSON 树（hierarchy 友好的格式）
  function toJSON(map, label = "全部新生") {
    if (map instanceof Map) {
      const children = [];
      for (const [k, v] of map) children.push(toJSON(v, k));
      return { name: label, children };
    }
    return { name: `${label} (${map.length}人)`, students: map };
  }

  const rootData = toJSON(grouped, "2025 级新生");
  const root = d3.hierarchy(rootData);

  // 给每个节点加一份展开状态
  root.descendants().forEach(d => d.data._collapsed = false);

  // 动画时长（滑块实时控制）
  let DURATION = 500;

  mount.innerHTML = `
    <div class="controls">
      <button id="d-4-4-expand-all"  class="demo-btn">全部展开</button>
      <button id="d-4-4-collapse-all" class="demo-btn secondary">全部折叠</button>
      <label style="font-size:13px;color:#475569;">动画时长
        <input id="d-4-4-dur" type="range" min="0" max="1500" step="50" value="500" style="vertical-align:middle;">
        <span id="d-4-4-dur-out" style="width:40px;display:inline-block;text-align:right;">500ms</span>
      </label>
      <span style="font-size:12px;color:#64748b;">👆 点 toggle 折叠 · 点「选中」看事件委托 · 拖滑块看 transition</span>
    </div>
    <div class="tree-list" id="d-4-4-tree"></div>
    <p class="console" id="d-4-4-info">点击任意班级条目 → 看事件冒泡 & delegated handler 的日志</p>
    <p class="demo-legend">
      <strong>关键技术：</strong>
      <code>classed("selected", bool)</code> 链式状态控制 ·
      <code>stopPropagation()</code> 阻止冒泡 ·
      <code>e.target.closest(".label")</code> 事件委托 ·
      <code>.transition().duration(ms)</code> 动画
    </p>
  `;

  const $tree = document.getElementById("d-4-4-tree");
  const $info = document.getElementById("d-4-4-info");

  function render() {
    $tree.innerHTML = "";
    const ul = d3.create("ul");
    ul.selectAll("li").data([root]).join("li")
      .each(function (d) { buildList(d3.select(this), d); });
    $tree.appendChild(ul.node());
  }

  function buildList(liSel, d) {
    liSel.attr("class", d.data._collapsed ? "collapsed" : "");

    const label = liSel.append("span").attr("class", "label");

    // toggle 折叠（带动画）
    if (d.children) {
      label.append("span").attr("class", "toggle").text(d.data._collapsed ? "▶" : "▼");
    } else {
      label.append("span").attr("class", "toggle").text("·");
    }
    label.append("span").text(d.data.name);
    if (d.data.students) {
      label.append("span").attr("class", "count").text(d.data.students.length);
    }

    // 关键 ①：阻止 label 上的 click 冒泡（避免误触发"选中"）
    label.on("click.toggle", (event) => {
      event.stopPropagation();
      d.data._collapsed = !d.data._collapsed;
      render();
    });

    // 关键 ②：点击 li 触发"选中"（事件委托 —— ul 上不必逐个监听）
    liSel.on("click.select", (event) => {
      // 关键：不要再次选到 toggle 按钮
      if (event.target.classList.contains("toggle")) return;
      const all = $tree.querySelectorAll("li");
      all.forEach(li => li.classList.remove("selected"));
      liSel.classed("selected", true);
      $info.innerHTML = `<strong>事件冒泡日志：</strong><br>` +
        `  · 触发节点：<code>${d.data.name}</code><br>` +
        `  · e.target = 元素 .label（不是 ul）<br>` +
        `  · li 的 click 监听器被调用（事件委托）<br>` +
        `  · toggle 按钮上 stopPropagation() 阻止冒泡，所以不触发本监听器`;
    });

    if (d.children && !d.data._collapsed) {
      const subUL = liSel.append("ul");
      // ⭐ 关键 ③：transition + duration —— 子列表"淡入"，时长由滑块控制
      if (DURATION > 0) {
        subUL.style("opacity", 0)
             .transition().duration(DURATION).style("opacity", 1);
      }
      subUL.selectAll("li").data(d.children).join("li")
        .each(function (sub) { buildList(d3.select(this), sub); });
    }
  }

  document.getElementById("d-4-4-expand-all").onclick = () => {
    root.descendants().forEach(d => d.data._collapsed = false);
    render();
  };
  document.getElementById("d-4-4-collapse-all").onclick = () => {
    root.descendants().forEach(d => d.data._collapsed = true);
    render();
  };

  // 动画时长滑块：实时改 DURATION 并重放
  const $dur = document.getElementById("d-4-4-dur");
  const $durOut = document.getElementById("d-4-4-dur-out");
  $dur.addEventListener("input", () => {
    DURATION = +$dur.value;
    $durOut.textContent = DURATION + "ms";
    render();
  });

  render();
};

// 启动第一个章节的 demo（如果在加载时正好展示 ch-4-1）
document.addEventListener("DOMContentLoaded", () => {
  const firstMount = document.querySelector(".chapter.active .tab-panel[data-panel='demo'] .demo-mount");
  if (firstMount && !firstMount.dataset.rendered) {
    const name = firstMount.dataset.demo;
    if (DEMOS[name]) DEMOS[name](firstMount);
    firstMount.dataset.rendered = "1";
  }
});
