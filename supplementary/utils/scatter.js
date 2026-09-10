
function setupChart(cfg) {
    // const margin = { top: 40, right: 100, bottom: 60, left: 200 };
    // const width = 800 - margin.left - margin.right;
    // const height = 600 - margin.top - margin.bottom;
    // 创建SVG元素
    cfg.svg = d3.select(cfg.chartid)
        .append("svg")
        .attr("width", cfg.width)
        .attr("height", cfg.height)
        .append("g")
        .attr("transform", `translate(${cfg.margin.left},${cfg.margin.top})`);
    cfg.width -= (cfg.margin.left + cfg.margin.right);
    cfg.height -= (cfg.margin.top + cfg.margin.bottom);
}

function setupScale(data, cfg) {
    // 创建比例尺
    cfg.x = d3.scaleLinear()// 线性变换
        .domain([d3.min(data, d => d[cfg.key_col]) - 0.1,
        d3.max(data, d => d[cfg.key_col]) + 0.1])
        .range([0, cfg.width]);

    cfg.y = d3.scaleBand()// 类别型映射
        .domain(data.map(d => d[cfg.index_col]))
        .range([0, cfg.height])
        .padding(0.2);

    // 添加X轴
    cfg.svg.append("g")
        .attr("transform", `translate(0,${cfg.height})`)
        .call(d3.axisBottom(cfg.x).ticks(10))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", cfg.width / 2)
        .attr("y", 40)
        .attr("fill", "#000")
        .text(cfg.x_title);

    // 添加Y轴
    cfg.svg.append("g")
        .call(d3.axisLeft(cfg.y))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -cfg.height / 2)
        .attr("fill", "#000")
        .text(cfg.y_title);
}

function createScatter(data, cfg) {
    // 添加散点
    const scatter = cfg.svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => cfg.x(d[cfg.key_col]))
        .attr("cy", d => cfg.y(d[cfg.index_col]) + cfg.y.bandwidth() / 2)
        .attr("r", 8)
        .attr("fill", d => d[cfg.key_col] >= 0 ? "#1f77b4" : "#ff7f0e");
    return scatter;
}
function tooltip(scatter) {
    // 创建工具提示
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    scatter.on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`<strong>${cfg.y_title} : ${d[cfg.index_col]}</strong><br/>
                    ${cfg.x_title} : ${(d[cfg.key_col] * 100).toFixed(1)}%<br/>`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function curveRegression(data, cfg) {
    // 计算曲线拟合点（使用局部加权回归）
    const xValues = data.map((d, i) => i);
    const yValues = data.map(d => d[cfg.key_col]);


    // 使用二次多项式拟合
    const Xs = interceptX(xValues, yValues);
    const fitPoints = d3.zip(
        Xs.map(x => cfg.x(x)),
        data.map(d => cfg.y(d[cfg.index_col]) + cfg.y.bandwidth() / 2)
    );

    // 绘制曲线拟合线
    cfg.svg.append("path")
        .attr("class", "fit-line")
        .attr("d", d3.line().curve(d3.curveCatmullRom.alpha(0.5))(fitPoints));

    // 添加拟合线说明
    cfg.svg.append("text")
        .attr("x", cfg.width - 150)
        .attr("y", 40)
        .attr("fill", "#ff7f0e")
        .text("局部加权回归拟合");
}
function interceptX(xValues, yValues) {
    const Xs = [];
    const bandwidth = 2; // 控制曲线平滑度的参数

    for (let i = 0; i < xValues.length; i++) {
        const weights = xValues.map((x) => Math.exp(-Math.pow((x - i) / bandwidth, 2) / 2));
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumW = 0;

        for (let j = 0; j < xValues.length; j++) {
            const w = weights[j];
            sumX += w * xValues[j];
            sumY += w * yValues[j];
            sumXY += w * xValues[j] * yValues[j];
            sumX2 += w * xValues[j] * xValues[j];
            sumW += w;
        }

        const slope = (sumW * sumXY - sumX * sumY) / (sumW * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / sumW;

        // fitPoints.push([cfg.x(slope * i + intercept), cfg.y(data[i][cfg.index_col]) + cfg.y.bandwidth() / 2]);
        Xs.push(slope * i + intercept);
    }
    return Xs;
}

async function renderScatter(data) {
    cfg = await d3.json("utils/scatterConfig.json");
    // 设置图表尺寸和边距
    setupChart(cfg);
    setupScale(data, cfg);
    const scatter = createScatter(data, cfg);
    tooltip(scatter);
    curveRegression(data, cfg);
}