// Demo 4 · D3 8 个数组函数
// 对应讲义 3.4 数据变换

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 8 个函数的演示数据
const SPECS = {
  map: {
    desc: "map(iterable, mapper) — 类似 Array.map，对每个元素应用 mapper，返回新数组。",
    input: '[1, 2, 3, 4]',
    output: 'd3.map([1, 2, 3, 4], x => x * x)\n→ [1, 4, 9, 16]',
    realtime: "新生数据：把年龄 × 12 得到月份数。",
    run: () => ({
      input: [1, 2, 3, 4],
      output: d3.map([1, 2, 3, 4], x => x * x),
      example: "[17, 18, 19, 20].map(age => age * 12) → [204, 216, 228, 240]",
    }),
  },
  reduce: {
    desc: "reduce(iterable, reducer, init) — 类似 Array.reduce，用 reducer 累计值。",
    input: '[1, 2, 3, 4]',
    output: 'd3.reduce([1, 2, 3, 4], (a, b) => a + b, 0)\n→ 10',
    realtime: "新生数据：合计所有学生的年龄。",
    run: () => ({
      input: [1, 2, 3, 4],
      output: d3.reduce([1, 2, 3, 4], (a, b) => a + b, 0),
      example: "ages.reduce((sum, a) => sum + a, 0) → 1443",
    }),
  },
  cross: {
    desc: "cross(...iterables, reducer) — 笛卡尔积。",
    input: "['A', 'B'] × [1, 2]",
    output: "d3.cross(['A','B'], [1,2])\n→ [['A',1], ['A',2], ['B',1], ['B',2]]",
    realtime: "新生数据：男生 × 专业 的笛卡尔积。",
    run: () => ({
      input: [['A', 'B'], [1, 2]],
      output: d3.cross(['A', 'B'], [1, 2]),
      example: "d3.cross(['男','女'], ['软件工程','数据科学']) → 4 种",
    }),
  },
  merge: {
    desc: "merge(iterables) — 合并多个可迭代对象成一个扁平数组。",
    input: "[[1, 2], [3, 4], [5]]",
    output: "d3.merge([[1,2], [3,4], [5]])\n→ [1, 2, 3, 4, 5]",
    realtime: "新生数据：把多个班级数组合并。",
    run: () => ({
      input: [[1, 2], [3, 4], [5]],
      output: d3.merge([[1, 2], [3, 4], [5]]),
      example: "d3.merge([软件1班, 软件2班, 数据1班]) → 全年级 80 人",
    }),
  },
  pairs: {
    desc: "pairs(iterable, reducer) — 相邻元素对。",
    input: '[1, 2, 3, 4]',
    output: "d3.pairs([1, 2, 3, 4])\n→ [[1,2], [2,3], [3,4]]",
    realtime: "新生数据：相邻学号配对。",
    run: () => ({
      input: [1, 2, 3, 4],
      output: d3.pairs([1, 2, 3, 4]),
      example: "d3.pairs(ages) → 相邻年龄差（衍生分析）",
    }),
  },
  transpose: {
    desc: "transpose(matrix) — 矩阵转置。",
    input: "[[1, 2, 3], [4, 5, 6]]",
    output: "d3.transpose([[1,2,3],[4,5,6]])\n→ [[1,4], [2,5], [3,6]]",
    realtime: "新生数据：行列互换（宽格式 ↔ 长格式）。",
    run: () => ({
      input: [[1, 2, 3], [4, 5, 6]],
      output: d3.transpose([[1, 2, 3], [4, 5, 6]]),
      example: "宽表（按字段） → 长表（按观测）",
    }),
  },
  zip: {
    desc: "zip(...arrays) — 把多个数组合并为元组数组。",
    input: "['A','B','C'], [1,2,3]",
    output: "d3.zip(['A','B','C'], [1,2,3])\n→ [['A',1], ['B',2], ['C',3]]",
    realtime: "新生数据：把姓名列与年龄列 zip 起来。",
    run: () => ({
      input: [['A', 'B', 'C'], [1, 2, 3]],
      output: d3.zip(['A', 'B', 'C'], [1, 2, 3]),
      example: "d3.zip(names, ages) → [['张三',18], ['李四',19], …]",
    }),
  },
  filter: {
    desc: "filter(iterable, test) — 类似 Array.filter。",
    input: '[1, 2, 3, 4, 5]',
    output: "d3.filter([1,2,3,4,5], x => x > 2)\n→ [3, 4, 5]",
    realtime: "新生数据：筛选男生。",
    run: () => ({
      input: [1, 2, 3, 4, 5],
      output: d3.filter([1, 2, 3, 4, 5], x => x > 2),
      example: "students.filter(s => s.gender === '男') → 男生列表",
    }),
  },
};

function render(name) {
  const spec = SPECS[name];
  document.getElementById("fn-desc").innerHTML = `
    <p style="font-size:14px; color:#334155;">${spec.desc}</p>
  `;
  const r = spec.run();
  document.getElementById("fn-input").textContent = JSON.stringify(r.input, null, 2);
  document.getElementById("fn-output").textContent = JSON.stringify(r.output, null, 2);
  document.getElementById("fn-realtime").innerHTML = `
    <p><strong>场景：</strong>${spec.realtime}</p>
    <p style="color:#2563eb; font-family:monospace; font-size:13px;">${r.example}</p>
  `;
}

// 初始化 + 绑定
document.getElementById("fn-select").addEventListener("change", e => render(e.target.value));
render("map");