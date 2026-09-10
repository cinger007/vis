// Demo 2 · DIKW 金字塔
// 对应讲义 3.2 数据定义 —— 嵌入陈为 Ch1 拓展理论

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const LAYERS = [
  {
    name: "Wisdom",
    cn: "智慧",
    color: "#9333ea",
    height: 80,                              // 越往上越窄
    example: "决策、战略、最优解",
    desc: "运用知识做出明智判断和战略决策的能力。回答「为什么」以及「我们应该怎么做」。",
    viz: "战略仪表盘、决策树",
  },
  {
    name: "Knowledge",
    cn: "知识",
    color: "#0891b2",
    height: 110,
    example: "模式、规律、关联",
    desc: "对信息的进一步提炼和理解，形成模式、规律、关联，可用于预测和决策。回答「如何」。",
    viz: "统计模型、机器学习预测",
  },
  {
    name: "Information",
    cn: "信息",
    color: "#059669",
    height: 140,
    example: "组织好的数据、报表",
    desc: "经过处理、组织、赋予上下文的数据，回答「谁、什么、何时、何地」。",
    viz: "折线图、柱状图、热力图",
  },
  {
    name: "Data",
    cn: "数据",
    color: "#64748b",
    height: 180,
    example: "原始观测值、原始记录",
    desc: "原始、离散的观察结果，缺乏上下文与意义。",
    viz: "原始表格、CSV 文件",
  },
];

// 画金字塔：用 trapezoid 拼接（D3 path）
const W = 600;
const H = 520;
const cx = W / 2;

const svg = d3.select("#dikw-svg")
  .append("svg")
  .attr("viewBox", `0 0 ${W} ${H}`)
  .attr("width", "100%")
  .attr("style", "max-width:600px; margin: 0 auto;");

const detail = d3.select("#dikw-detail");

function showDetail(layer) {
  detail.html(`
    <h3 style="color:${layer.color}">${layer.cn}（${layer.name}）</h3>
    <p><strong>定义：</strong>${layer.desc}</p>
    <p><strong>典型示例：</strong>${layer.example}</p>
    <p><strong>常用可视化：</strong>${layer.viz}</p>
  `);
}

// 倒序画（Data 在下）
LAYERS.forEach((layer, i) => {
  // 越往上越窄
  const topWidth = 60 + i * 30;
  const botWidth = topWidth + 60;
  const yTop = 20 + i * 100;
  const yBot = yTop + layer.height;

  const path = `
    M ${cx - topWidth / 2} ${yTop}
    L ${cx + topWidth / 2} ${yTop}
    L ${cx + botWidth / 2} ${yBot}
    L ${cx - botWidth / 2} ${yBot}
    Z
  `;

  const g = svg.append("g")
    .style("cursor", "pointer")
    .on("mouseover", function () {
      d3.select(this).select("path").transition().duration(150)
        .attr("fill", d3.color(layer.color).brighter(0.5));
    })
    .on("mouseout", function () {
      d3.select(this).select("path").transition().duration(150)
        .attr("fill", layer.color);
    })
    .on("click", () => showDetail(layer));

  g.append("path")
    .attr("d", path)
    .attr("fill", layer.color)
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  g.append("text")
    .attr("x", cx)
    .attr("y", (yTop + yBot) / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "white")
    .attr("font-size", 16)
    .attr("font-weight", 600)
    .text(`${layer.cn} · ${layer.name}`);
});

// 默认显示 Data
showDetail(LAYERS[3]);

// 添加流程箭头（金字塔右侧）
svg.append("defs")
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 0 10 10")
  .attr("refX", 8)
  .attr("refY", 5)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto-start-reverse")
  .append("path")
  .attr("d", "M 0 0 L 10 5 L 0 10 z")
  .attr("fill", "#1f2937");

svg.append("path")
  .attr("d", `M ${W - 60} ${H - 30} L ${W - 60} 30`)
  .attr("stroke", "#1f2937")
  .attr("stroke-width", 2)
  .attr("fill", "none")
  .attr("marker-end", "url(#arrow)");

svg.append("text")
  .attr("x", W - 50)
  .attr("y", H / 2)
  .attr("font-size", 12)
  .attr("fill", "#475569")
  .attr("transform", `rotate(90, ${W - 50}, ${H / 2})`)
  .attr("text-anchor", "middle")
  .text("价值 / 抽象度  ↑");