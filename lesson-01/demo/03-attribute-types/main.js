// Demo 3 · 属性类型 × 视觉通道
// 对应讲义 3.3 数据属性 —— 嵌入 Stevens 测量尺度 + Mackinlay 1986 视觉通道排序

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 用一份合成数据演示 4 种属性类型
const DATA = [
  { id: 1,  name: "张三", major: "软件工程", classNo: 1, age: 18 },
  { id: 11, name: "李四", major: "软件工程", classNo: 1, age: 19 },
  { id: 21, name: "王五", major: "软件工程", classNo: 2, age: 20 },
  { id: 31, name: "赵六", major: "软件工程", classNo: 2, age: 17 },
  { id: 41, name: "孙七", major: "软件工程", classNo: 3, age: 21 },
  { id: 51, name: "周八", major: "数据科学", classNo: 1, age: 18 },
  { id: 61, name: "吴九", major: "数据科学", classNo: 1, age: 22 },
  { id: 71, name: "郑十", major: "数据科学", classNo: 2, age: 19 },
];

// 3.1 类别属性 → 色相
{
  const W = 600, H = 280, M = { top: 20, right: 20, bottom: 30, left: 40 };
  const svg = d3.select("#cat-plot");
  const majors = [...new Set(DATA.map(d => d.major))];
  const color = d3.scaleOrdinal().domain(majors).range(d3.schemeTableau10);

  const x = d3.scaleBand()
    .domain(DATA.map(d => d.name))
    .range([M.left, W - M.right])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([H - M.bottom, M.top]);

  svg.attr("viewBox", `0 0 ${W} ${H}`);

  svg.selectAll("rect.bar")
    .data(DATA)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(0.5))
      .attr("width", x.bandwidth())
      .attr("height", 60)
      .attr("fill", d => color(d.major));

  svg.selectAll("text.label")
    .data(DATA)
    .join("text")
      .attr("class", "label")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", H - M.bottom + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .text(d => d.name);

  // 图例
  const legend = svg.append("g").attr("transform", `translate(${W - 130}, 10)`);
  majors.forEach((m, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
    g.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(m));
    g.append("text").attr("x", 18).attr("y", 10).attr("font-size", 12).text(m);
  });
}

// 3.2 序数属性 → 亮度
{
  const W = 600, H = 160, M = { top: 20, right: 20, bottom: 30, left: 40 };
  const svg = d3.select("#ord-plot");
  svg.attr("viewBox", `0 0 ${W} ${H}`);

  // 假设 5 个等级 1-5
  const levels = [1, 2, 3, 4, 5];
  const x = d3.scaleBand().domain(levels).range([M.left, W - M.right]).padding(0.2);
  const brightness = d3.scaleLinear().domain([1, 5]).range(["#f1f5f9", "#0f172a"]);

  svg.selectAll("rect")
    .data(levels)
    .join("rect")
      .attr("x", d => x(d))
      .attr("y", M.top)
      .attr("width", x.bandwidth())
      .attr("height", 80)
      .attr("fill", d => brightness(d));

  svg.selectAll("text.lvl")
    .data(levels)
    .join("text")
      .attr("class", "lvl")
      .attr("x", d => x(d) + x.bandwidth() / 2)
      .attr("y", H - M.bottom + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text(d => `等级 ${d}`);

  // 注：用亮度（亮度顺序可读），不用色相（顺序丢失）
}

// 3.3 数值属性（比率） → 位置（推荐）
{
  const W = 600, H = 240, M = { top: 20, right: 20, bottom: 40, left: 40 };
  const svg = d3.select("#num-plot");
  svg.attr("viewBox", `0 0 ${W} ${H}`);

  const x = d3.scaleLinear()
    .domain(d3.extent(DATA, d => d.age))
    .range([M.left, W - M.right]);

  const y = d3.scaleBand()
    .domain(DATA.map(d => d.name))
    .range([M.top, H - M.bottom])
    .padding(0.3);

  // X 轴
  svg.append("g")
    .attr("transform", `translate(0, ${H - M.bottom})`)
    .call(d3.axisBottom(x).ticks(6));

  // 散点（位置 → 年龄）
  svg.selectAll("circle")
    .data(DATA)
    .join("circle")
      .attr("cx", d => x(d.age))
      .attr("cy", d => y(d.name) + y.bandwidth() / 2)
      .attr("r", 8)
      .attr("fill", "#2563eb");

  svg.selectAll("text.ylab")
    .data(DATA)
    .join("text")
      .attr("class", "ylab")
      .attr("x", M.left - 8)
      .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .text(d => d.name);

  // X 轴标签
  svg.append("text")
    .attr("x", W / 2)
    .attr("y", H - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", "#475569")
    .text("年龄（位置编码 —— 精确可读）");
}

// 3.4 ❌ 错配：数值用色相编码
{
  const W = 600, H = 240, M = { top: 20, right: 20, bottom: 40, left: 40 };
  const svg = d3.select("#bad-plot");
  svg.attr("viewBox", `0 0 ${W} ${H}`);

  const x = d3.scaleBand()
    .domain(DATA.map(d => d.name))
    .range([M.left, W - M.right])
    .padding(0.3);

  // 用彩虹色相（错误的视觉通道）
  const hue = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.extent(DATA, d => d.age));

  svg.selectAll("rect")
    .data(DATA)
    .join("rect")
      .attr("x", d => x(d.name))
      .attr("y", M.top)
      .attr("width", x.bandwidth())
      .attr("height", 100)
      .attr("fill", d => hue(d.age));

  svg.selectAll("text.ylab")
    .data(DATA)
    .join("text")
      .attr("class", "ylab")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", H - M.bottom + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .text(d => `${d.name}（${d.age}岁）`);

  svg.append("text")
    .attr("x", W / 2)
    .attr("y", H - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", "#991b1b")
    .text("❌ 数值用色相：能区分但读不出大小关系");
}