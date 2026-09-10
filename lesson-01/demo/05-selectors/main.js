// Demo 5 · D3 Selection 三态模型
// 对应讲义 3.5.1 D3 数据选择器

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select("#states");
const W = 700, H = 160;
svg.attr("viewBox", `0 0 ${W} ${H}`);

let currentData = [1, 2, 3];

function render() {
  // 关键：用 .join() 三态 API（Bostock 推荐）
  // join(enter, update, exit) 三个回调
  const circles = svg.selectAll("circle")
    .data(currentData, d => d)            // 第二个参数是 key 函数，用于稳定身份
    .join(
      enter => enter.append("circle")
        .attr("cx", d => d * 70 + 60)
        .attr("cy", H / 2)
        .attr("r", 0)
        .attr("fill", "#10b981")         // 绿色 enter
        .call(s => s.transition().duration(400).attr("r", 28)),
      update => update
        .attr("fill", "#0ea5e9")          // 蓝色 update
        .call(s => s.transition().duration(400)
          .attr("cx", d => d * 70 + 60)
          .attr("r", 28)),
      exit => exit
        .attr("fill", "#ef4444")           // 红色 exit
        .call(s => s.transition().duration(400)
          .attr("r", 0)
          .remove())
    );

  // 更新顶部状态文本
  document.getElementById("data-state").textContent =
    "[" + currentData.join(", ") + "]";
  document.getElementById("el-state").textContent = currentData.length;
}

// 按钮绑定
document.getElementById("btn-add").addEventListener("click", () => {
  const next = currentData.length + 1;
  currentData = [...currentData, next];
  render();
});

document.getElementById("btn-update").addEventListener("click", () => {
  currentData = currentData.map(d => d + 0.5);  // 微调位置 → trigger update
  render();
});

document.getElementById("btn-remove").addEventListener("click", () => {
  currentData = currentData.slice(0, -1);
  render();
});

document.getElementById("btn-reset").addEventListener("click", () => {
  currentData = [1, 2, 3];
  render();
});

render();