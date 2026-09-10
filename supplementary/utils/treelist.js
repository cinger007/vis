// 当前选中的节点
let selectedNode = null;

function nodeDisplay(node) {
    // 根据节点深度显示不同的统计信息
    let displayText = node.data.name;

    if (node.depth === 0) {
        // 根节点（学院）：显示专业数量
        displayText += ` (${node.data.children.length}个专业)`;
    } else if (node.depth === 1) {
        // 专业节点：显示班级数量
        displayText += ` (${node.data.children.length}个班)`;
    } else if (node.data.value) {
        // 班级节点（叶子节点）：显示学生人数
        const majorName = node.parent.data.name; // 获取父节点（专业）的名称
        displayText = `${majorName}${node.data.name}`;
        if (node.data.value) {
            displayText += ` (${node.data.value}人)`;
        }
    }
    return displayText;
}
// 递归渲染节点
function renderNode(parentElement, node, nodeDisplay = node => node.data.name) {
    const nodeElement = parentElement.append("div")
        .attr("class", "node")
        .classed("node--internal", node.children)
        .classed("node--leaf", !node.children);

    const nodeContent = nodeElement.append("div")
        .attr("class", "node-content");

    // 添加切换按钮（非叶子节点）
    if (node.children) {
        nodeContent.append("div")
            .attr("class", "toggle toggle--down")
            .on("click", function (event) {
                event.stopPropagation();
                const element = d3.select(this.parentElement.parentElement);
                element.classed("collapsed", !element.classed("collapsed"));

            });
    } else {
        // 为叶子节点添加空白占位符以保持对齐
        nodeContent.append("div")
            .style("width", "4px")
            .style("height", "16px")
            .style("display", "inline-block")
            .style("margin-right", "4px");
    }

    let displayText = nodeDisplay(node);
    nodeContent.append("span")
        .text(displayText);

    // 如果有子节点，递归渲染
    if (node.children) {
        const childrenContainer = nodeElement.append("div")
            .attr("class", "children");

        node.children.forEach(child => {
            renderNode(childrenContainer, child, nodeDisplay);
        });

        // 默认展开所有节点
        nodeElement.classed("collapsed", false);
    }
}
function renderTree(data, nodeDisplay = node => node.data.name) {
    // 创建树布局
    const treeLayout = d3.tree()
        .size([200, 100]); // 高度决定层级间距

    // 创建层级结构
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);
    // console.log(treeData);

    // 创建容器
    const container = d3.select("#tree-container");
    // 初始渲染
    renderNode(container, treeData, nodeDisplay);
}
// 展开全部
function expandAll(expand) {
    d3.selectAll(".node").classed("collapsed", !expand);
}


