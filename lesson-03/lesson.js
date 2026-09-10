// Doc-03 色彩专题 · 集成教学页面 · 8 个 demo
// =========================================
//   3.1 颜色模型基础   → d-3-1 color-models
//   3.2 colormap 三类  → d-3-2 colormap-principles
//   3.3 Lab 色域图    → d-3-3 lab-gamut
//   3.4 色系搭配规则  → d-3-4 color-harmony
//   3.5 科研经典配色  → d-3-5 classic-palettes
//   3.6 对错案例对比  → d-3-6 good-vs-bad
//   3.7 鲜艳+低饱和  → d-3-7 muted-saturated
//   3.8 CVD 论文图测  → d-3-8 cvd-paper-test
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

// 公共工具：颜色空间转换 + CVD 模拟（颜色专题 8 个 demo 共用）
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

const CVD_MATRICES = {
  protanopia:   [[0.567, 0.433, 0.000], [0.558, 0.442, 0.000], [0.000, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0.000], [0.700, 0.300, 0.000], [0.000, 0.300, 0.700]],
  tritanopia:   [[0.950, 0.050, 0.000], [0.000, 0.433, 0.567], [0.000, 0.475, 0.525]]
};

function simulateCVD(rgb, type) {
  const m = CVD_MATRICES[type];
  const [r, g, b] = rgb;
  return [
    Math.round(Math.max(0, Math.min(255, r * m[0][0] + g * m[0][1] + b * m[0][2]))),
    Math.round(Math.max(0, Math.min(255, r * m[1][0] + g * m[1][1] + b * m[1][2]))),
    Math.round(Math.max(0, Math.min(255, r * m[2][0] + g * m[2][1] + b * m[2][2])))
  ];
}

const rgbStr = ([r, g, b]) => `rgb(${r},${g},${b})`;

// 5 大科研经典配色（7 色以内）
const CLASSIC_PALETTES = {
  'Wong 2011':         ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7'],
  'Paul Tol bright':   ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB'],
  'Paul Tol muted':    ['#332288', '#88CCEE', '#44AA99', '#117733', '#999933', '#DDCC77', '#CC6677', '#882255'],
  'Okabe-Ito':         ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7'],
  'Tableau 10':        ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'],
  'Paired (12)':       ['#A6CEE3', '#1F78B4', '#B2DF8A', '#33A02C', '#FB9A99', '#E31A1C', '#FDBF6F', '#FF7F00', '#CAB2D6', '#6A3D9A', '#FFFF99', '#B15928'],
  'Viridis (seq)':     ['#440154', '#3B528B', '#21918C', '#5EC962', '#FDE725'],
  'Cividis (seq)':     ['#00224E', '#2C3F75', '#61678A', '#938B9A', '#C1AB80', '#E6CC65'],
  'RdBu (div)':        ['#67001F', '#D6604D', '#F4A582', '#FDFDFF,', '#92C5DE', '#4393C3', '#053061']
};

// =========================================
// ⭐ d-3-1 · 颜色模型基础（3.1）
// =========================================
window.DEMOS["d-3-1"] = async function (mount) {
  mount.innerHTML = `
    <h4>📘 颜色模型基础</h4>
    <p class="demo-hint">拖动滑块改变颜色，下方 4 个色块同时显示四种颜色空间的呈现，CVD 模拟显示 3 种色盲眼中所见。</p>
    <div class="color-picker-row">
      <label>R <input type="range" id="cr" min="0" max="255" value="100"></label>
      <label>G <input type="range" id="cg" min="0" max="255" value="50"></label>
      <label>B <input type="range" id="cb" min="0" max="255" value="200"></label>
      <div id="rgb-preview" style="height:32px;border-radius:4px;background:rgb(100,50,200);"></div>
    </div>

    <div class="color-grid" id="color-grid"></div>

    <div class="color-space-cards">
      <div class="color-space-card">
        <h5>RGB · 加色模型</h5>
        <p>红绿蓝三色光按强度（0-255）混合。<strong>不感知均匀</strong>：(255,0,0) 与 (0,255,0) 在屏幕上看上去"亮度差很多"。</p>
      </div>
      <div class="color-space-card">
        <h5>HSL · 艺术家友好</h5>
        <p>色相(H)·饱和度(S)·亮度(L)。H 与 L 直观，但 <strong>也不是感知均匀</strong>：HSL=50 与 HSL=80 的"亮差"在 Lab 空间里不相等。</p>
      </div>
      <div class="color-space-card">
        <h5>CIE Lab · 感知均匀</h5>
        <p>由人眼对色彩的实验测量构造，<strong>距离 ≈ 感知差</strong>。设计 colormap 时常用（d3.interpolateLab 是 Lab 空间插值）。</p>
      </div>
      <div class="color-space-card">
        <h5>CMYK · 减色（印刷）</h5>
        <p>青·品红·黄·黑。屏幕显示用不到，但印刷/出版场景必须知道。<span class="note">Web 可视化默认 RGB。</span></p>
      </div>
    </div>

    <h4>👁 CVD（色觉缺陷）模拟</h4>
    <p class="demo-hint">约有 8% 男性、0.5% 女性是色盲。下图把同一颜色在三种常见色盲眼中模拟呈现。</p>
    <div class="cvd-row" id="cvd-row"></div>
  `;

  const grid = mount.querySelector("#color-grid");
  const cvdRow = mount.querySelector("#cvd-row");
  const preview = mount.querySelector("#rgb-preview");
  const cr = mount.querySelector("#cr");
  const cg = mount.querySelector("#cg");
  const cb = mount.querySelector("#cb");

  function render() {
    const r = +cr.value, g = +cg.value, b = +cb.value;
    preview.style.background = rgbStr([r, g, b]);

    const hsl = rgbToHsl(r, g, b);
    const c = d3.color(rgbStr([r, g, b]));
    // d3-color v3 没有 Color#lab/Color#cmyk 实例方法，改用 d3.lab() 构造并手算 cmyk
    const lab = d3.lab(c);
    const labDisp = `L*${lab.l.toFixed(0)} a*${lab.a.toFixed(0)} b*${lab.b.toFixed(0)}`;
    const hslDisp = `H*${hsl[0].toFixed(0)}° S*${hsl[1].toFixed(0)}% L*${hsl[2].toFixed(0)}%`;
    const R = r / 255, G = g / 255, B = b / 255;
    const k = 1 - Math.max(R, G, B);
    const cmyk = {
      c: k === 1 ? 0 : (1 - R - k) / (1 - k),
      m: k === 1 ? 0 : (1 - G - k) / (1 - k),
      y: k === 1 ? 0 : (1 - B - k) / (1 - k),
      k,
    };
    const cmykDisp = `C*${(cmyk.c*100).toFixed(0)} M*${(cmyk.m*100).toFixed(0)} Y*${(cmyk.y*100).toFixed(0)} K*${(cmyk.k*100).toFixed(0)}`;

    grid.innerHTML = `
      <div class="color-cell" style="background:${rgbStr([r,g,b])}">RGB<small>(${r}, ${g}, ${b})</small></div>
      <div class="color-cell" style="background:${rgbStr([r,g,b])}">HSL<small>${hslDisp}</small></div>
      <div class="color-cell" style="background:${rgbStr([r,g,b])}">Lab<small>${labDisp}</small></div>
      <div class="color-cell" style="background:${rgbStr([r,g,b])}">CMYK<small>${cmykDisp}</small></div>
    `;

    const prota = simulateCVD([r, g, b], 'protanopia');
    const deuta = simulateCVD([r, g, b], 'deuteranopia');
    const trita = simulateCVD([r, g, b], 'tritanopia');
    cvdRow.innerHTML = `
      <div class="cvd-cell" style="background:${rgbStr([r,g,b])}">正常视觉</div>
      <div class="cvd-cell" style="background:${rgbStr(prota)}">红色盲</div>
      <div class="cvd-cell" style="background:${rgbStr(deuta)}">绿色盲</div>
      <div class="cvd-cell" style="background:${rgbStr(trita)}">蓝色盲</div>
    `;
  }

  [cr, cg, cb].forEach(el => el.addEventListener("input", render));
  render();
};

// =========================================
// ⭐ d-3-2 · colormap 三类（3.2）
// =========================================
window.DEMOS["d-3-2"] = async function (mount) {
  const sample = [
    0,2,4,7,9,12,15,18,21,24,28,32,35,38,41,45,48,51,55,58,
    62,66,70,74,78,82,86,90,94,98,102,106,110,114,115,122,126,130,135,140,
    145,150,160,170,180,200,220,240,280,350
  ];
  const seq = d3.scaleSequential(d3.interpolateViridis).domain([0, 350]);
  const div = d3.interpolateRdBu;
  const cat = d3.scaleOrdinal(d3.schemeTableau10);

  mount.innerHTML = `
    <h4>📘 colormap 三类选择</h4>
    <p class="demo-hint">三类 colormap 对应不同数据语义。选错类型 = 误导读者。</p>

    <h4 style="margin-top:14px">🎨 三类速记</h4>
    <table class="decision-table">
      <thead><tr><th>类型</th><th>适用</th><th>例子</th><th>CVD 友好</th></tr></thead>
      <tbody>
        <tr><td><strong>顺序型</strong></td><td>有序数值（人口、温度）</td>
            <td><div class="colormap-strip" id="strip-seq"></div>Viridis</td><td>✓ 优</td></tr>
        <tr><td><strong>发散型</strong></td><td>偏离中位数（±%、Z 分数）</td>
            <td><div class="colormap-strip" id="strip-div"></div>RdBu</td><td>△ 中</td></tr>
        <tr><td><strong>定性型</strong></td><td>无序类别（产品、性别）</td>
            <td><div class="colormap-strip" id="strip-cat"></div>Tableau10</td><td>△ 与色相相关</td></tr>
      </tbody>
    </table>

    <h4 style="margin-top:14px">🔥 50 州谋杀率（顺序型 Viridis 演示）</h4>
    <div id="seq-bar"></div>

    <h4 style="margin-top:14px">⚠ 错误示例：发散型 RdBu 画有序数据</h4>
    <p class="demo-hint" style="color:#dc2626">用 RdBu（发散型）画"50 州谋杀率"会让"中段 100 附近的州看上去"接近白色"——但 100 没有任何语义意义，纯属误导。</p>
    <div id="div-bar"></div>
  `;

  function strip(id, scale, n = 16) {
    const el = mount.querySelector("#" + id);
    el.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.style.background = typeof scale === "function" ? scale(i / (n - 1)) : scale(i / (n - 1));
      el.appendChild(d);
    }
  }
  strip("strip-seq", d3.scaleSequential(d3.interpolateViridis));
  strip("strip-div", d3.interpolateRdBu);
  strip("strip-cat", d3.scaleOrdinal(d3.schemeTableau10));

  function bar(id, scale) {
    const el = mount.querySelector("#" + id);
    el.innerHTML = "";
    sample.forEach((v, i) => {
      const d = document.createElement("div");
      d.style.cssText = `display:inline-block;width:14px;height:50px;background:${typeof scale === "function" ? scale(v / 350) : scale(1 - v / 350)};`;
      el.appendChild(d);
    });
  }
  bar("seq-bar", seq);
  bar("div-bar", div);
};

// =========================================
// ⭐ d-3-3 · Lab 色域图（3.3）
// =========================================
window.DEMOS["d-3-3"] = async function (mount) {
  const W = 600, H = 420;
  let L = 60;

  mount.innerHTML = `
    <h4>📘 CIE Lab 色域图</h4>
    <p class="demo-hint">CIE Lab 是感知均匀的颜色空间。a* 横轴（红↔绿），b* 纵轴（黄↔蓝），L* 决定亮度。<br>
    三种 RGB 工作色域（sRGB / Adobe RGB / Rec.2020）嵌套在 Lab 空间里 —— 越大越能表示更广的颜色。</p>
    <div class="ms-threshold-control">
      <label>L* 亮度：</label>
      <input type="range" id="labL" min="20" max="90" value="60">
      <span class="slope-readout" id="labLReadout">60</span>
    </div>
    <svg class="lab-gamut-svg" width="${W}" height="${H}" id="lab-svg"></svg>
    <div id="lab-note"></div>
  `;

  const svg = d3.select(mount.querySelector("#lab-svg"));
  const labL = mount.querySelector("#labL");
  const labLReadout = mount.querySelector("#labLReadout");
  const note = mount.querySelector("#lab-note");

  const xScale = d3.scaleLinear().domain([-128, 128]).range([40, W - 40]);
  const yScale = d3.scaleLinear().domain([128, -128]).range([20, H - 20]);

  function render() {
    L = +labL.value;
    labLReadout.textContent = L;
    svg.selectAll("*").remove();

    const step = 4;
    for (let a = -128; a <= 128; a += step) {
      for (let b = -128; b <= 128; b += step) {
        const rgb = d3.lab(L, a, b).rgb();
        const cr = Math.max(0, Math.min(255, rgb.r));
        const cg = Math.max(0, Math.min(255, rgb.g));
        const cb = Math.max(0, Math.min(255, rgb.b));
        svg.append("rect")
          .attr("x", xScale(a)).attr("y", yScale(b))
          .attr("width", step * (W - 80) / 256 + 1)
          .attr("height", step * (H - 40) / 256 + 1)
          .attr("fill", `rgb(${cr},${cg},${cb})`)
          .attr("opacity", 0.85);
      }
    }

    svg.append("line").attr("x1", 40).attr("x2", W - 40).attr("y1", H / 2).attr("y2", H / 2)
      .attr("stroke", "#1e293b").attr("stroke-width", 1);
    svg.append("line").attr("x1", W / 2).attr("x2", W / 2).attr("y1", 20).attr("y2", H - 20)
      .attr("stroke", "#1e293b").attr("stroke-width", 1);

    svg.append("text").attr("x", W - 36).attr("y", H / 2 - 6).attr("font-size", 12).attr("fill", "#1e293b").text("a* = +128 红");
    svg.append("text").attr("x", 44).attr("y", H / 2 - 6).attr("font-size", 12).attr("fill", "#1e293b").text("绿 a* = -128");
    svg.append("text").attr("x", W / 2 + 6).attr("y", 24).attr("font-size", 12).attr("fill", "#1e293b").text("黄 b* = +128");
    svg.append("text").attr("x", W / 2 + 6).attr("y", H - 12).attr("font-size", 12).attr("fill", "#1e293b").text("蓝 b* = -128");

    note.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><strong>Lab 空间感知均匀</strong>：色域内任意两点距离 ≈ 人眼感知差</li>
        <li>实际显示色域是 sRGB（约三角内），超出色域的颜色会被 clamp 回 sRGB → 出现"失真"</li>
        <li>Adobe RGB 涵盖绿色更广（看印刷/摄影），Rec.2020 涵盖 4K 电视</li>
        <li>调整 L* 滑块：L* 越低，色域面积越小（暗色只能 saturate 有限）</li>
        <li><strong>实战意义</strong>：从 Lab→RGB 转换（d3.lab(...).rgb()）会让你设计 colormap 时自动处理感知线性</li>
      </ul>
    `;
  }

  labL.addEventListener("input", render);
  render();
};

// =========================================
// ⭐ d-3-4 · 色系搭配规则（3.4）
// =========================================
window.DEMOS["d-3-4"] = async function (mount) {
  const rules = [
    { name: "单色 Monochromatic", offset: 0,            desc: "同一色相不同亮度/饱和" },
    { name: "类比 Analogous",    offset: 30,           desc: "色轮相邻 ±30°" },
    { name: "互补 Complementary",offset: 180,          desc: "色轮正对面 180°" },
    { name: "三等分 Triadic",    offset: 120,          desc: "色轮 120° 等分" },
    { name: "分裂互补 Split",    offset: 150,          desc: "互补色相邻 150°" }
  ];

  let baseH = 210;
  let sat = 60;
  let lit = 55;

  mount.innerHTML = `
    <h4>📘 色系搭配规则（5 大类）</h4>
    <p class="demo-hint">选主色 → 5 张配色方案同时生成。每张色板用一张"假论文插图"展示。</p>
    <div class="ms-threshold-control">
      <label>主色 H：</label>
      <input type="range" id="baseH" min="0" max="360" value="210">
      <span class="slope-readout" id="baseHReadout">210°</span>
    </div>
    <div class="harmony-grid" id="harmony"></div>
    <div id="harmony-note"></div>
  `;

  const grid = mount.querySelector("#harmony");
  const baseHInput = mount.querySelector("#baseH");
  const baseHReadout = mount.querySelector("#baseHReadout");
  const note = mount.querySelector("#harmony-note");

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }

  function palette(h, offset) {
    const cs = [];
    for (let i = -2; i <= 2; i++) {
      const hh = (h + i * offset + 360) % 360;
      cs.push(rgbStr(hslToRgb(hh, sat, lit)));
    }
    return cs;
  }

  function renderPaper(palette, idx) {
    const W = 200, H = 80;
    const svg = `<svg width="${W}" height="${H}">
      ${[10, 30, 50, 70, 90, 110, 130, 150, 170, 190].map((x, i) =>
        `<rect x="${x - 8}" y="${H - 10 - (i * 7) % 60}" width="14" height="${(i * 7) % 60 + 5}" fill="${palette[i % palette.length]}" />`
      ).join('')}
    </svg>`;
    return svg;
  }

  function render() {
    baseH = +baseHInput.value;
    baseHReadout.textContent = baseH + "°";
    grid.innerHTML = "";

    rules.forEach((r, i) => {
      const pal = palette(baseH, r.offset);
      const card = document.createElement("div");
      card.className = "harmony-card";
      card.innerHTML = `
        <h5>${r.name}</h5>
        <div class="harmony-swatch">
          ${pal.map(c => `<div style="background:${c}"></div>`).join('')}
        </div>
        <p>${r.desc}</p>
        <div class="harmony-preview" style="background:${pal[2]}">假论文图</div>
        <div style="margin-top:4px">${renderPaper(pal, i)}</div>
      `;
      grid.appendChild(card);
    });

    note.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><strong>单色</strong>：最安全、最不刺眼。适合"严肃"科研图（如 Nature 黑白经济型配色）</li>
        <li><strong>类比</strong>：和谐但缺少对比度。适合"层级"或"分组"少的情况</li>
        <li><strong>互补</strong>：对比度强但易刺眼。适合"突出重点"（如对照实验组）</li>
        <li><strong>三等分</strong>：3 种类别时最常用（如 处理/对照/安慰剂）</li>
        <li><strong>分裂互补</strong>：互补的"温和版"——主色 1 + 强调 2（主对比但不刺眼）</li>
      </ul>
    `;
  }

  baseHInput.addEventListener("input", render);
  render();
};

// =========================================
// ⭐ d-3-5 · 科研经典配色（3.5）
// =========================================
window.DEMOS["d-3-5"] = async function (mount) {
  const data = Array.from({length: 20}, (_, i) => ({ x: i, y: Math.sin(i / 3) * 5 + i * 0.5 + (i % 3) }));

  mount.innerHTML = `
    <h4>📘 科研经典配色横评</h4>
    <p class="demo-hint">6 大经典科研配色：Wong 2011（Nature 推荐）/ Paul Tol / Okabe-Ito / Tableau / Paired / Viridis。每种都 CVD 友好，<strong>其中 Wong / Okabe-Ito / Paul Tol 是 Nature/Science/Cell 实际在用的</strong>。</p>

    <div class="palette-matrix" id="palettes"></div>

    <h4 style="margin-top:14px">📊 同样数据 + 不同配色（看哪个"耐看"）</h4>
    <div class="demo-control" id="pal-tabs"></div>
    <svg class="heatmap-svg" id="pal-svg" width="720" height="240"></svg>
    <div id="pal-note"></div>
  `;

  const mat = mount.querySelector("#palettes");
  const sources = {
    'Wong 2011':       'Nature Methods 2011 - 8 色 CVD 友好',
    'Paul Tol bright': 'SRON Tech Note 2021 - 7 色白底',
    'Paul Tol muted':  'SRON Tech Note 2021 - 8 色深底',
    'Okabe-Ito':       'Okabe & Ito 2002 - 8 色 CVD 友好',
    'Tableau 10':      'Tableau 10 - 10 色通用',
    'Paired (12)':     'ColorBrewer 12 - 12 色配对',
    'Viridis (seq)':   'Smith et al. 2017 - 顺序型',
    'Cividis (seq)':   'Nuñez et al. 2018 - 顺序型 CVD',
    'RdBu (div)':      'ColorBrewer - 发散型红蓝'
  };
  Object.entries(CLASSIC_PALETTES).forEach(([name, colors]) => {
    const row = document.createElement("div");
    row.className = "palette-name";
    row.textContent = name;
    mat.appendChild(row);

    const strip = document.createElement("div");
    strip.className = "palette-strip";
    colors.forEach(c => {
      const d = document.createElement("div");
      d.style.background = c;
      strip.appendChild(d);
    });
    mat.appendChild(strip);

    const src = document.createElement("div");
    src.className = "palette-source";
    src.textContent = sources[name] || "";
    mat.appendChild(src);
  });

  const tabs = mount.querySelector("#pal-tabs");
  const svg = d3.select(mount.querySelector("#pal-svg"));
  const note = mount.querySelector("#pal-note");

  function drawBars(paletteName) {
    svg.selectAll("*").remove();
    const pal = CLASSIC_PALETTES[paletteName];
    const N = pal.length;
    const W = 720, H = 240, M = { t: 30, r: 20, b: 30, l: 30 };
    const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
    const xScale = d3.scaleBand().domain(d3.range(N)).range([0, innerW]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, 15]).range([innerH, 0]);

    svg.selectAll("rect").data(pal).enter().append("rect")
      .attr("x", (_, i) => M.l + xScale(i))
      .attr("y", (_, i) => M.t + yScale(i + 1))
      .attr("width", xScale.bandwidth())
      .attr("height", (_, i) => innerH - yScale(i + 1))
      .attr("fill", d => d)
      .attr("opacity", 0.9);

    const line = d3.line().x((d, i) => M.l + xScale(i) + xScale.bandwidth() / 2)
                           .y(d => M.t + yScale(d.y))
                           .curve(d3.curveCatmullRom);
    data.forEach((_, li) => {
      if (li >= N) return;
      const sub = data.slice(0, N);
      svg.append("path").datum(sub)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", pal[li % N])
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.6);
    });

    svg.append("text").attr("x", M.l).attr("y", M.t - 8)
      .attr("font-size", 12).attr("font-weight", 600).attr("fill", "#1e293b")
      .text(paletteName);

    note.innerHTML = `
      <h4>⭐ 关键点</h4>
      <ul>
        <li><strong>Wong / Okabe-Ito / Paul Tol</strong>：3 大科研配色黄金标准，色盲友好 + 灰度打印友好</li>
        <li><strong>Tableau 10</strong>：商业图表之王，适合 5-7 类，但红绿对色盲不友好</li>
        <li><strong>Paired (12)</strong>：配对设计（如处理前/后），但 12 色过载眼睛</li>
        <li><strong>顺序型 colormap</strong>（Viridis / Cividis）：仅用于连续数值，不能用于离散类别</li>
        <li>一般原则：<strong>类别数 ≤ 7</strong>，否则用连续 colormap 替代</li>
      </ul>
    `;
  }

  Object.keys(CLASSIC_PALETTES).forEach((name, i) => {
    const btn = document.createElement("label");
    btn.textContent = name;
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("label").forEach(l => l.classList.remove("active"));
      btn.classList.add("active");
      drawBars(name);
    });
    tabs.appendChild(btn);
  });

  drawBars("Wong 2011");
};

// =========================================
// ⭐ d-3-6 · 对错案例对比（3.6）
// =========================================
window.DEMOS["d-3-6"] = async function (mount) {
  const cases = [
    { name: "A：彩虹谱 Jet",         type: "wrong",   reason: "Jet 非感知均匀 + CVD 不友好 + 打印不友好", palette: d3.interpolateRainbow },
    { name: "B：红绿对比",           type: "wrong",   reason: "红绿对红绿色盲完全不可分辨（约 6% 男性）", palette: (t) => d3.interpolateRgb("#dc2626", "#16a34a")(t) },
    { name: "C：颜色过多 12 色",     type: "wrong",   reason: "类别超过 7 种时，眼睛无法区分；应合并或用连续 colormap", palette: (t) => d3.interpolateSinebow(t) },
    { name: "D：Wong 8 色（对）",    type: "correct", reason: "Wong 2011 配色：CVD 友好 + 灰度打印友好 + 类别数 ≤ 8", palette: (t) => CLASSIC_PALETTES["Wong 2011"][Math.floor(t * 7.99)] }
  ];

  mount.innerHTML = `
    <h4>📘 对错案例对比（4 张图，请你投票）</h4>
    <p class="demo-hint">同样 8 类数据，用 4 种配色方案。点击你认为"对"的那张。</p>
    <div class="quiz-grid" id="quiz"></div>
    <div id="quiz-result"></div>
  `;

  const grid = mount.querySelector("#quiz");
  const result = mount.querySelector("#quiz-result");

  function makeSampleBars(palette) {
    const data = Array.from({length: 8}, (_, i) => 2 + (i * 1.3 + 0.5) % 5 + Math.sin(i) * 1.2);
    const W = 200, H = 100;
    let bars = "";
    const bw = (W - 16) / 8;
    data.forEach((v, i) => {
      const color = palette(i / 7);
      bars += `<rect x="${8 + i * bw}" y="${H - 8 - v * 14}" width="${bw - 2}" height="${v * 14}" fill="${color}" />`;
    });
    return `<svg width="${W}" height="${H}" style="background:#fafafa;border:1px solid #e2e8f0;">${bars}</svg>`;
  }

  cases.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    card.innerHTML = `
      <h5 style="margin:0 0 6px;font-size:12px;color:#475569">${c.name}</h5>
      ${makeSampleBars(c.palette)}
      <div class="quiz-card-label">点我投票</div>
    `;
    card.addEventListener("click", () => {
      cards.forEach((cc, ii) => {
        cc.classList.remove("correct", "wrong");
        if (ii === i) cc.classList.add(c.type);
        else cc.classList.add(c.type === "correct" ? "wrong" : "");
      });
      result.innerHTML = `
        <div class="quiz-result">
          <strong>答案：${c.name}</strong> ${c.type === "correct" ? "✅ 正确" : "⚠ 错"}<br>
          <span style="font-size:12px;">${c.reason}</span>
        </div>
      `;
    });
    grid.appendChild(card);
  });

  const cards = grid.querySelectorAll(".quiz-card");
};

// =========================================
// ⭐ d-3-7 · 鲜艳+低饱和 哲学生成器（3.7）
// =========================================
window.DEMOS["d-3-7"] = async function (mount) {
  let H = 220, S = 70, L = 55;

  mount.innerHTML = `
    <h4>📘 配色哲学：鲜艳 + 低饱和（耐看的设计）</h4>
    <p class="demo-hint">选主色 → 算法生成 5-7 色搭配：主色 + 2 类比色 + 1 互补强调 + 1 低饱和高亮。<br>
    <strong>用户原则</strong>：颜色数量 ≤ 7、鲜艳颜色（高 H 区分度）+ 低饱和度（S 30-50%）= <strong>好看又耐看</strong>。</p>
    <div class="philosophy-row">
      <div class="philosophy-inputs">
        <label>主色 H <input type="range" id="phH" min="0" max="360" value="220"></label>
        <label>主色 S <input type="range" id="phS" min="20" max="100" value="70"></label>
        <label>主色 L <input type="range" id="phL" min="30" max="80" value="55"></label>
        <p style="font-size:11px;color:#64748b;line-height:1.6;margin-top:10px">
          <strong>经验公式</strong>：<br>
          • 主色 S = 70-80%（鲜明）<br>
          • 配套色 S = 30-50%（低饱和，耐看）<br>
          • 强调色用互补或类比，<strong>不要全饱和</strong><br>
          • 高亮用 L=85-90%（如背景、注释）
        </p>
      </div>
      <div class="philosophy-output">
        <h5>🎨 生成的 7 色板</h5>
        <div class="harmony-swatch" id="phPalette" style="height:48px;"></div>
        <h5 style="margin-top:12px">📄 假论文插图（看效果）</h5>
        <div class="philosophy-paper" id="phPaper"></div>
      </div>
    </div>
  `;

  const phH = mount.querySelector("#phH");
  const phS = mount.querySelector("#phS");
  const phL = mount.querySelector("#phL");
  const pal = mount.querySelector("#phPalette");
  const paper = mount.querySelector("#phPaper");

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }
  function hslHex(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  function genPalette(H, S, L) {
    return [
      hslHex((H - 30 + 360) % 360, S * 0.6, L * 1.1),
      hslHex((H - 30 + 360) % 360, S, L),
      hslHex(H, S, L),
      hslHex((H + 30) % 360, S, L),
      hslHex((H + 30) % 360, S * 0.6, L * 1.1),
      hslHex((H + 180) % 360, S * 0.8, L * 0.95),
      hslHex(H, S * 0.2, L * 1.4)
    ];
  }

  function makePaper(palette) {
    return `
      <div class="philosophy-paper-card" style="background:${palette[2]};color:#fff">
        <strong>实验组</strong><br>主色 HSL
      </div>
      <div class="philosophy-paper-card" style="background:${palette[5]};color:#fff">
        <strong>对照组</strong><br>互补
      </div>
      <div class="philosophy-paper-card" style="background:${palette[6]};color:#1e293b;border:1px solid #cbd5e1">
        <strong>注释层</strong><br>高亮低饱和
      </div>
    `;
  }

  function render() {
    H = +phH.value; S = +phS.value; L = +phL.value;
    const palette = genPalette(H, S, L);
    pal.innerHTML = palette.map(c => `<div style="background:${c}"></div>`).join('');
    paper.innerHTML = makePaper(palette);
  }

  [phH, phS, phL].forEach(el => el.addEventListener("input", render));
  render();
};

// =========================================
// ⭐ d-3-8 · CVD 论文图测（3.8）
// =========================================
window.DEMOS["d-3-8"] = async function (mount) {
  mount.innerHTML = `
    <h4>📘 CVD 论文图测：你的图在色盲眼里还看得懂吗？</h4>
    <p class="demo-hint">下面 3 张"经典论文图"，模拟在 3 种视觉下的呈现。第一张常出现在 Nature Methods，第二张是顺序型热图，第三张是红绿对比。</p>
    <div class="cvd-paper" id="papers"></div>
    <div id="cvd-paper-note"></div>
  `;

  const papers = mount.querySelector("#papers");

  function makeScatter(palette) {
    const W = 220, H = 110;
    const N = 5;
    let pts = "";
    d3.range(40).forEach(i => {
      const cat = i % N;
      const x = 20 + (i * 7) % 180;
      const y = 15 + (i * 11) % 80;
      pts += `<circle cx="${x}" cy="${y}" r="5" fill="${palette[cat]}" opacity="0.85" />`;
    });
    return `<svg width="${W}" height="${H}" style="background:#fff;border:1px solid #e2e8f0;">${pts}</svg>`;
  }

  function makeHeatmap(scale) {
    const W = 220, H = 110;
    let cells = "";
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 14; c++) {
        const t = (r * 14 + c) / 70;
        cells += `<rect x="${c * 16}" y="${r * 22}" width="16" height="22" fill="${scale(t)}" />`;
      }
    }
    return `<svg width="${W}" height="${H}" style="background:#fff;border:1px solid #e2e8f0;">${cells}</svg>`;
  }

  function makeRedGreen() {
    const W = 220, H = 110;
    const pal = ["#dc2626", "#16a34a", "#dc2626", "#16a34a", "#dc2626"];
    let bars = "";
    d3.range(5).forEach(i => {
      bars += `<rect x="${20 + i * 36}" y="${20 + (i % 2) * 5}" width="30" height="${70 - i * 5}" fill="${pal[i]}" />`;
    });
    return `<svg width="${W}" height="${H}" style="background:#fff;border:1px solid #e2e8f0;">${bars}</svg>`;
  }

  function cvdTransformSvg(svgString, type) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    doc.querySelectorAll("[fill]").forEach(el => {
      const c = d3.color(el.getAttribute("fill"));
      if (!c) return;
      const rgb = [Math.round(c.rgb().r), Math.round(c.rgb().g), Math.round(c.rgb().b)];
      const sim = simulateCVD(rgb, type);
      el.setAttribute("fill", rgbStr(sim));
    });
    return new XMLSerializer().serializeToString(doc);
  }

  const paperData = [
    { name: "📊 论文图 1：5 类别散点（Wong 配色）",  makeSvg: () => makeScatter(CLASSIC_PALETTES["Wong 2011"]) },
    { name: "🌡️ 论文图 2：顺序型热图（Viridis）", makeSvg: () => makeHeatmap(d3.interpolateViridis) },
    { name: "⚠ 论文图 3：红绿对比（错误案例）",     makeSvg: () => makeRedGreen() }
  ];

  paperData.forEach(p => {
    const card = document.createElement("div");
    card.className = "cvd-paper-card";
    const original = p.makeSvg();
    const deuta = cvdTransformSvg(original, 'deuteranopia');
    const prota = cvdTransformSvg(original, 'protanopia');
    card.innerHTML = `
      <h5>${p.name}</h5>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;font-size:9px;">
        <div><div style="color:#94a3b8;margin-bottom:2px">正常</div>${original}</div><br/>
        <div><div style="color:#94a3b8;margin-bottom:2px">红盲</div>${prota}</div><br/>
        <div><div style="color:#94a3b8;margin-bottom:2px">绿盲</div>${deuta}</div><br/>
      </div>
    `;
    papers.appendChild(card);
  });

  mount.querySelector("#cvd-paper-note").innerHTML = `
    <h4>⭐ 关键点</h4>
    <ul>
      <li><strong>图 1（Wong）</strong>：5 类别散点在 CVD 眼中仍可分辨。✅ 推荐</li>
      <li><strong>图 2（Viridis）</strong>：顺序型热图在 CVD 眼中亮度单调性保持。✅ 推荐</li>
      <li><strong>图 3（红绿）</strong>：在绿盲眼里：红和绿几乎变成同色：（看 prota/deuta 列）。⚠ 禁用</li>
      <li><strong>实测流程</strong>：把图导出 PNG → 用 <a href="https://www.color-blindness.com/coblis-color-blindness-simulator/" target="_blank">Coblis</a> 模拟 → 看是否仍能区分</li>
      <li><strong>Wong 2011</strong> 是 Nature Methods 8:441 推荐，几乎所有顶标都改用 CVD 友好配色了</li>
    </ul>
  `;
};
