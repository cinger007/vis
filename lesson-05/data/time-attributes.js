/* 5 个时间属性的"含义卡片"用数据 */
window.TIME_ATTRIBUTES = [
  {
    key: "ordered",
    name: "有序性",
    icon: "↗",
    desc: "时间是有序的。两个事件发生的时间有先后次序，与因果关系紧密相连。",
    example: "火车时刻表、事件日志（log）、git commit history",
    color: "#3b82f6"
  },
  {
    key: "continuous",
    name: "连续性",
    icon: "∞",
    desc: "时间是连续的。两个时间点之间总存在另一个时间点。",
    example: "实时传感器数据（温度、心率）、流式数据流",
    color: "#10b981"
  },
  {
    key: "periodic",
    name: "周期性",
    icon: "🔁",
    desc: "许多自然过程有循环规律（季节、昼夜）。可采用循环时间域表示。",
    example: "24h 体温、12 个月气温、年周期销售",
    color: "#f59e0b"
  },
  {
    key: "spatial_independent",
    name: "独立于空间",
    icon: "✂️",
    desc: "时间与空间紧相关，但科学过程中大多将它们独立处理。",
    example: "折线图 x 轴只用时间、y 轴只用度量；时序不混用空间",
    color: "#8b5cf6"
  },
  {
    key: "structured",
    name: "结构性",
    icon: "📐",
    desc: "时间尺度分年/月/日/时/分/秒，分割既有自然反映（昼夜）也有人为定义（60 秒）。",
    example: "日历/周排列、闰年调整、工作日 vs 周末",
    color: "#ec4899"
  }
];
