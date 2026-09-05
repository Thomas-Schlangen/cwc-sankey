/** @type {any} */
const w = window;

const controlInit = {
    methods: {},
    events: ['NodeClicked'],
    properties: {
        Title: "",
        Nodes: "[]",
        Links: "[]"
    }
};
w.controlInit = controlInit;

let svg = null;
let titleEl = null;
let container = null;

let state = {
    title: "",
    /** @type {{Name: string, RGB: string}[]} */
    nodes: [],
    /** @type {{Source: string, Target: string, Value: number, RGB: string}[]} */
    links: []
};

function rgbString(rgb) {
    if (!rgb) return "rgb(128, 128, 128)";
    return "rgb(" + rgb + ")";
}

function onNodeClicked(name) {
    WebCC.Events.fire("NodeClicked", name);
    console.log("[CWC] NodeClicked: " + name);
}

function render() {
    if (!svg) return;

    svg.selectAll("*").remove();
    titleEl.textContent = state.title || "";

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    if (!width || !height || state.nodes.length === 0) return;

    const nodeNames = new Set(state.nodes.map(function(n) { return n.Name; }));
    const validLinks = state.links.filter(function(l) {
        return nodeNames.has(l.Source) && nodeNames.has(l.Target) && l.Source !== l.Target;
    });

    if (validLinks.length === 0) return;

    const sankeyGenerator = d3.sankey()
        .nodeId(function(d) { return d.name; })
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 5], [width - 1, height - 5]]);

    let graph;
    try {
        graph = sankeyGenerator({
            nodes: state.nodes.map(function(n) {
                return { name: n.Name, color: n.RGB };
            }),
            links: validLinks.map(function(l) {
                return { source: l.Source, target: l.Target, value: l.Value, color: l.RGB };
            })
        });
    } catch (error) {
        console.log("[CWC] Fehler beim Sankey-Layout: " + error);
        return;
    }

    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .join("path")
        .attr("class", "sankey-link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", function(d) { return rgbString(d.color); })
        .attr("stroke-width", function(d) { return Math.max(1, d.width); });

    const node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .join("g")
        .attr("class", "sankey-node")
        .style("cursor", "pointer")
        .on("click", function(event, d) { onNodeClicked(d.name); });

    node.append("rect")
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("fill", function(d) { return rgbString(d.color); });

    node.append("text")
        .attr("x", function(d) { return d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6; })
        .attr("y", function(d) { return (d.y0 + d.y1) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", function(d) { return d.x0 < width / 2 ? "start" : "end"; })
        .text(function(d) { return d.name; });
}

function parseJsonArray(value) {
    if (!value) return [];
    try {
        var parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log("[CWC] Fehler beim Parsen von JSON: " + error);
        return [];
    }
}

function setPropertySankey(data) {
    switch (data.key) {
        case "Title":
            state.title = data.value;
            render();
            break;
        case "Nodes":
            state.nodes = parseJsonArray(data.value);
            render();
            break;
        case "Links":
            state.links = parseJsonArray(data.value);
            render();
            break;
    }
}

function initSankey() {
    container = document.getElementById("sankey-container");
    titleEl = document.getElementById("sankey-title");
    svg = d3.select("#sankey-svg");
    if (!container) return;

    setProperty({ key: "Title", value: WebCC.Properties.Title });
    setProperty({ key: "Nodes", value: WebCC.Properties.Nodes });
    setProperty({ key: "Links", value: WebCC.Properties.Links });

    window.addEventListener("resize", function() { render(); });
}
