function formatShow(value) {
    if (value instanceof Date)
        return d3.timeFormat("%Y年%m月%d日")(value);
    else
        return value;
}
// 渲染表格函数
function renderTable(data, containerID) {
    const table = d3.select(containerID);

    // 清空现有表格内容
    table.html("");
    const headers = Object.keys(data[0]);
    // 添加表头
    table.append("thead").append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d => fieldChinese[d] )
        .on("click", function (_, column) {
            sortTable(data, column);
        });
    // 添加表格主体
    const tbody = table.append("tbody");
    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");
    // 添加单元格
    rows.selectAll("td")
        //.data(row => headers.map(column => formatShow(row[column])))
        .data(row => Object.values(row).map(v => formatShow(v)))
        .enter()
        .append("td")
        .text(d => d);
    // 更新统计信息
    updateStats(data.length);
}
// 当前排序状态
let sortState = {
    column: null,
    direction: 'asc'
};
// 排序函数
function sortTable(data, column) {
    if (sortState.column === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.column = column;
        sortState.direction = 'asc';
    }

    data.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // 处理数字排序
        if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        }

        if (valueA < valueB) return sortState.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable(data, "#data-table");
    updateSortIndicator(column);
}

// 更新排序指示器
function updateSortIndicator(column) {
    d3.selectAll("th").each(function () {
        const th = d3.select(this);
        const thColumn = th.datum();
        th.select(".sort-icon").remove();

        if (thColumn === column) {
            th.append("span")
                .attr("class", "sort-icon")
                .text(sortState.direction === 'asc' ? ' ↑' : ' ↓');
        }
    });
}
// 更新统计信息（可选）
function updateStats(count) {
    d3.select(".stats").text(`显示 ${count} 条记录，共 ${count} 条记录`);
}
