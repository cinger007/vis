# Doc-01 数据 · Demo 工程

对应讲义：可视化导论 Ch2 数据基础 + Ch3 数据变换。

## 0 依赖运行（无 npm install）

```
cd docs/doc-01-数据/demo
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

或用 VSCode Live Server 插件一键启动。

## 文件结构

```
demo/
├── index.html              # 导航页（5 个 demo 总览）
├── styles.css              # 共享样式（浅色主题）
├── data/
│   └── newstudent.csv      # 中国石油大学（华东）2025 级新生数据样本（80 行）
└── NN-{主题}/              # 每个 demo 一个独立子目录
    ├── index.html
    └── main.js
```

## 5 个 Demo 一览

| # | 主题 | 对应讲义 | 嵌入理论 |
|---|---|---|---|
| 1 | D3 数据加载器 | 3.1 / 3.5.1 | 数据质量、类型转换 |
| 2 | DIKW 金字塔 | 3.2 | Rowley 2007 DIKW 批评 |
| 3 | 属性 × 视觉通道 | 3.3 | Stevens 测量尺度 + Mackinlay 1986 |
| 4 | D3 8 个数组函数 | 3.4 | 函数式数据流 |
| 5 | Selection 三态 | 3.5.1 | Data-Join / enter-update-exit |

## 技术栈

- **D3.js v7**：通过 CDN 加载（jsdelivr）
- **ES Modules**：原生 `<script type="module">`，无打包
- **静态服务器**：任意 HTTP 服务器即可
- **数据**：CSV 内嵌到 `data/`，浏览器 fetch 加载

## 数据样本

新生数据 `data/newstudent.csv`（80 行）：
- 字段：序号、姓名、性别、生日、年龄、班级、籍贯、民族
- 班级编号："软件工程1班" / "软件工程2班" / "数据科学1班"
- 民族覆盖：汉、回、满、蒙古、维吾尔、藏、白、壮