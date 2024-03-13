"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var item_edge = /** @class */ (function () {
    function item_edge(from, to, amount, item_id, require) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.item_id = item_id;
        this.require = require;
    }
    return item_edge;
}());
var item_io = /** @class */ (function () {
    function item_io(node, item_id, amount) {
        this.node = node;
        this.item_id = item_id;
        this.amount = amount;
    }
    return item_io;
}());
function parse_edge(json, from, production_time) {
    var res_edge = new item_edge(from, json.node_id, json.amount / production_time, json.item_id, json.require / production_time);
    return res_edge;
}
function parse_graph(json) {
    var res = new production_line_graph();
    for (var _i = 0, _a = json.node_list; _i < _a.length; _i++) {
        var node = _a[_i];
        var node_id = node.node_id;
        var production_time = node.production_time;
        for (var _b = 0, _c = node.output_list; _b < _c.length; _b++) {
            var edge = _c[_b];
            res.add_edge(parse_edge(edge, node_id, production_time));
        }
    }
    for (var _d = 0, _e = json.input_list; _d < _e.length; _d++) {
        var input = _e[_d];
        res.inputs.push(new item_io(input.node_id, input.item_id, input.require));
    }
    return res;
}
var production_line_graph = /** @class */ (function () {
    function production_line_graph() {
        this.edge = new Map();
        this.inputs = new Array();
        this.outputs = new Array();
        this.removed_edges = new Array();
    }
    production_line_graph.prototype.add_edge_raw = function (from, to, item, amount, require) {
        var temp_edge = new item_edge(from, to, amount, item, require);
        if (!this.edge.has(from)) {
            this.edge.set(from, new Array());
        }
        this.edge.get(from).push(temp_edge);
        if (to == "output") {
            this.outputs.push(new item_io(from, item, amount));
            return;
        }
        // if(!this.prev.has(to)) {
        //     this.prev.set(to, new Array<string>());
        // }
        // this.prev.get(to).push(from);
    };
    production_line_graph.prototype.add_edge = function (edge) {
        this.add_edge_raw(edge.from, edge.to, edge.item_id, edge.amount, edge.require);
    };
    production_line_graph.prototype.eliminate_circle = function () {
        var _this = this;
        var visited;
        visited = new Map();
        var deg = new Map();
        this.edge.forEach(function (_, node) {
            deg.set(node, 0);
            visited.set(node, false);
        });
        this.edge.forEach(function (edges) {
            edges.forEach(function (edge) {
                if (edge.to == "output")
                    return;
                deg.set(edge.to, deg.get(edge.to) + 1);
            });
        });
        console.log(deg);
        var dfs = function (graph, now) {
            // console.log("dfs:" + now);
            visited[now] = true;
            var edges = graph.edge.get(now);
            for (var id = 0; id < edges.length; id++) {
                if (edges[id].to == "output")
                    continue;
                if (visited[edges[id].to]) {
                    graph.inputs.push(new item_io(edges[id].to, edges[id].item_id, edges[id].require));
                    graph.outputs.push(new item_io(edges[id].to, edges[id].item_id, edges[id].amount));
                    graph.removed_edges.push([graph.inputs.length - 1, graph.outputs.length - 1]);
                    edges.splice(id, 1);
                    id--;
                }
                else
                    dfs(graph, edges[id].to);
            }
        };
        deg.forEach(function (cnt, node) {
            if (cnt != 0)
                return;
            dfs(_this, node);
        });
    };
    production_line_graph.prototype.debug = function () {
        console.log(this.edge.size);
        this.edge.forEach(function (edges, id) {
            console.log(id);
            edges.forEach(function (edge) {
                console.log("  " + edge.to + " " + edge.item_id + " " + edge.amount + " " + edge.require);
            });
        });
        console.log("inputs:");
        this.inputs.forEach(function (item) {
            console.log("  " + item.item_id + " " + item.amount + " " + item.node);
        });
        console.log("outputs:");
        this.outputs.forEach(function (item) {
            console.log("  " + item.item_id + " " + item.amount + " " + item.node);
        });
        console.log("removed edges:");
        this.removed_edges.forEach(function (edge) {
            console.log("  " + edge[0] + " " + edge[1]);
        });
    };
    return production_line_graph;
}());
var test_input = fs.readFileSync('./test_case.json', 'utf8');
var graph = parse_graph(JSON.parse(test_input));
// console.log(graph);
graph.debug();
graph.eliminate_circle();
graph.debug();
