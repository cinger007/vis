const fieldConfig = {
  '姓名': 'name',
  '性别': 'gender',
  '班级': 'cls',
  '生源省份': 'province',
  '政治面貌': 'pol_status',
  '民族': 'ethnicity',
  '年龄': 'age',
  '序号': 'id',
  '生日': 'birthday',
  '班号': 'clsNum',
  '专业': 'major'
};
const fieldChinese = {
  'name': '姓名',
  'gender': '性别',
  'cls': '班级',
  'province': '生源省份',
  'pol_status': '政治面貌',
  'ethnicity': '民族',
  'age': '年龄',
  'id': '序号',
  'birthday': '生日',
  'clsNum': '班号',
  'major': '专业'
};
async function loadCSV() {
  try {
    const newstudent = await d3.csv("./newstudent.csv", function (d) {//本质上是在定义一个函数,d为参数
      return {
        id: +d.序号,
        name: d.姓名,
        gender: d.性别,
        age: +d.年龄,// 使用 "+" 运算符将字符串转换为数字
        cls: d.班级,
        province: d.生源省份,
        pol_status: d.政治面貌,
        ethnicity: d.民族,
        // 如果需要转换日期，可以使用 d3.timeParse
        birthday: d3.timeParse("%Y-%m-%d")(d.生日)
      };
    });
    return newstudent;
  } catch (error) {
    console.error("加载CSV文件失败:", error);
  }
}

function addSplitColumns(students) {
  students.forEach(student => {
    if (student.cls) {
      // 添加新列
      const parts = student.cls.split(/(\d+班)/).filter(Boolean);
      if (parts.length >= 2) {
        student.major = parts[0];
        student.clsNum = parts[1]; // 使用不同列名避免冲突
      } else {
        student.major = student.cls;
        student.clsNum = '';
      }
    }
  });
  return students;
}

function filterArray(data, term, searchFields = null) {
  if (!term) {
    return data; // 如果搜索词为空，直接返回原数据
  }
  const searchTerm = String(term).toLowerCase();
  
  const filteredData = data.filter(row => {
    // 如果未指定 searchFields，则搜索所有字段（保持原逻辑）
    const fieldsToSearch = searchFields || Object.keys(row);

    return fieldsToSearch.some(field => {
      const value = row[field];
      return String(value).toLowerCase().includes(searchTerm);
    });
  });

  return filteredData;
}

function groupOnMajorCls(data) {
  try {
    const countByGroup = d3.rollup(data,
      v => v.length,
      d => d.major,
      d => d.clsNum // 使用拆分后的clsNum而不是原始cls
    );

    console.log("分组结果:", countByGroup);
    return countByGroup;
  } catch (error) {
    console.error("分组失败:", error);
    return new Map();
  }
}

function mapToTreeStructure(mapData, rootName = "青岛软件学院") {
  const root = { name: rootName, children: [] };

  for (const [major, classes] of mapData) {
    const majorNode = { name: major, children: [] };

    for (const [className, count] of classes) {
      majorNode.children.push({
        name: className,
        value: count
      });
    }

    root.children.push(majorNode);
  }

  return root;
}

async function load() {
  try {
    const students = await loadCSV();
    console.log("数据加载完成:", students);

    // 后续处理
    return groupOnMajorCls(addSplitColumns(students));
  } catch (error) {
    console.error("处理失败:", error);
  }
}