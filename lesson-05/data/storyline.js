/* 侏罗纪公园 Storyline 数据（自建抽取 5 个主要角色） */
window.STORYLINE_DATA = {
  title: "侏罗纪公园 (Jurassic Park, 1993)",
  duration_min: 127,        // 电影总时长（分钟）
  characters: [
    {
      name: "Alan Grant & Kids",
      color: "#1976d2",
      width: 4,
      points: [
        { time:  5, y:  80 },
        { time: 18, y: 130 },     // 到达公园
        { time: 38, y: 180 },     // 公园内探索
        { time: 65, y: 150 },     // 第一次逃生
        { time: 78, y:  80 },     // T-REX 攻击（聚拢）
        { time: 88, y: 110 },     // 攻击结束
        { time:105, y:  60 },     // 分离
        { time:125, y:  40 }      // 结尾
      ],
      events: [
        { time: 78, name: "T-REX 攻击", desc: "Alan Grant 与 Kids 在车中被 T-REX 攻击" }
      ]
    },
    {
      name: "T-REX",
      color: "#d32f2f",
      width: 6,
      points: [
        { time: 75, y: 280 },     // 入场
        { time: 78, y: 130 },     // 攻击（聚拢）
        { time: 88, y: 200 },
        { time:100, y: 250 },
        { time:120, y: 290 }
      ],
      events: [
        { time: 78, name: "T-REX 攻击", desc: "T-REX 冲出围栏，攻击 Alan & Kids 的车" }
      ]
    },
    {
      name: "Raptors",
      color: "#f57c00",
      width: 4,
      points: [
        { time: 50, y: 320 },
        { time: 80, y: 290 },
        { time: 95, y: 230 },     // 追逐 Alan
        { time:108, y: 180 },
        { time:118, y: 100 }
      ],
      events: [
        { time: 95, name: "Raptor 追逐", desc: "Raptors 追逐 Alan & Kids 进入厨房" }
      ]
    },
    {
      name: "Malcolm",
      color: "#7b1fa2",
      width: 3,
      points: [
        { time: 22, y:  40 },
        { time: 45, y:  90 },
        { time: 70, y: 120 },
        { time: 82, y: 130 },     // 攻击现场
        { time: 95, y: 200 },
        { time:120, y: 240 }
      ]
    },
    {
      name: "Dilophosaurus",
      color: "#388e3c",
      width: 3,
      points: [
        { time: 38, y: 350 },
        { time: 48, y: 320 },     // 攻击 Nedry
        { time: 58, y: 340 }
      ],
      events: [
        { time: 48, name: "Nedry 事件", desc: "Dilophosaurus 攻击 Nedry" }
      ]
    }
  ]
};
