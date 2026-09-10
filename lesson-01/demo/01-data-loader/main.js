// Demo 1 · D3 数据加载器
// 对应讲义 3.1 数据加载 / 3.5.1 D3 数据选择器
// 重点：异步加载、字段映射、类型转换

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 1. 字段映射：中文 → 英文（避免 JS 中带中文变量）
const COLUMN_MAP = {
  "序号": "id",
  "姓名": "name",
  "性别": "gender",
  "生日": "birthday",
  "年龄": "age",
  "班级": "class",
  "籍贯": "hometown",
  "民族": "ethnicity",
};

// 2. 类型转换函数 —— 这是用户原文强调的「推荐方式」
// 把字符串类型转换为 JS 真正的数值 / Date 类型
function transformRow(d) {
  return {
    id:         +d["序号"],                       // Number
    name:       d["姓名"].trim(),
    gender:     d["性别"].trim(),
    birthday:   new Date(d["生日"]),              // Date 对象
    age:        +d["年龄"],                       // Number
    class:      d["班级"].trim(),
    hometown:   d["籍贯"].trim(),
    ethnicity:  d["民族"].trim(),
  };
}

// 3. 渲染：把对象格式化输出到 console 面板
const consoleEl = document.getElementById("console");
function log(line, cls = "") {
  const span = document.createElement("div");
  if (cls) span.className = cls;
  span.textContent = line;
  consoleEl.appendChild(span);
}

function clearLog() {
  consoleEl.innerHTML = "";
}

// 4. 渲染表格
function renderTable(rows) {
  const container = document.getElementById("table-container");
  if (!rows.length) {
    container.innerHTML = "<em>无数据</em>";
    return;
  }
  const headers = Object.keys(rows[0]);
  let html = "<table><thead><tr>";
  for (const h of headers) html += `<th>${h}</th>`;
  html += "</tr></thead><tbody>";
  for (const r of rows) {
    html += "<tr>";
    for (const h of headers) {
      const v = r[h];
      let display = v;
      if (v instanceof Date) display = v.toISOString().slice(0, 10);
      else if (typeof v === "number") display = `<span style="color:#2563eb">${v}</span>`;
      html += `<td>${display}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  container.innerHTML = html;
}

// 5. 渲染字段对照表
function renderMapping() {
  const tbody = document.querySelector("#mapping-table tbody");
  const types = {
    id:        "Number",
    name:      "String",
    gender:    "String",
    birthday:  "Date",
    age:       "Number",
    class:     "String",
    hometown:  "String",
    ethnicity: "String",
  };
  tbody.innerHTML = Object.entries(COLUMN_MAP)
    .map(([zh, en]) => `<tr><td>${zh}</td><td>${en}</td><td>${types[en]}</td></tr>`)
    .join("");
}

// 6. 主流程
async function loadAndShow() {
  clearLog();
  log("⏳ 正在异步加载 ../data/newstudent.csv ...", "str");

  // 方式 A（推荐）：先用 d3.csv 拿原始数据，再 .map() 转换
  // const raw = await d3.csv("../data/newstudent.csv");
  // const data = raw.map(transformRow);

  // 方式 B（更紧凑）：d3.csv 第二参直接传入 row 回调 —— 用户原文"代码示例 1"
  const data = await d3.csv("../data/newstudent.csv", transformRow);

  log(`✓ 加载完成，共 ${data.length} 条记录`, "str");
  log("");
  log("【转换后的前 3 条】", "key");
  log(JSON.stringify(data.slice(0, 3), null, 2), "str");
  log("");
  log("【生日字段类型验证】", "key");
  log(`typeof data[0].birthday  →  ${typeof data[0].birthday}`, "num");
  log(`data[0].birthday instanceof Date  →  ${data[0].birthday instanceof Date}`, "num");
  log(`data[0].age + 1  →  ${data[0].age + 1}   （Number 可计算）`, "num");

  document.getElementById("row-count").textContent = data.length;
  renderTable(data.slice(0, 10));
  renderMapping();
}

// 绑定按钮 + 首次加载
document.getElementById("btn-reload").addEventListener("click", loadAndShow);
renderMapping();        // 字段映射表不需要等数据
loadAndShow();