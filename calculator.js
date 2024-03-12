"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var item_edge = /** @class */ (function () {
    // from : string;
    // to : string;
    // amount : number;
    // item_id : string;
    function item_edge(from, to, amount, item_id) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.item_id = item_id;
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
    var res_edge = new item_edge(from, json.node_id, json.amount / production_time, json.item_id);
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
        res.inputs.push(new item_io(input.node_id, input.item_id, input.amount));
    }
    return res;
}
var production_line_graph = /** @class */ (function () {
    function production_line_graph() {
        this.edge = new Map();
        this.inputs = new Array();
        this.outputs = new Array();
    }
    production_line_graph.prototype.add_edge_raw = function (from, to, item, amount) {
        var temp_edge = new item_edge(from, to, amount, item);
        if (!this.edge.has(from)) {
            this.edge.set(from, new Array());
        }
        this.edge.get(from).push(temp_edge);
        if (to == "output") {
            this.outputs.push(new item_io(from, item, amount));
        }
    };
    production_line_graph.prototype.add_edge = function (edge) {
        this.add_edge_raw(edge.from, edge.to, edge.item_id, edge.amount);
    };
    production_line_graph.prototype.debug = function () {
        console.log(this.edge.size);
    };
    return production_line_graph;
}());
var test_input = fs.readFileSync('./test_case.json', 'utf8');
// console.log(test_input);
var graph = parse_graph(JSON.parse(test_input));
graph.debug();
function calculate_production_line(recipes) {
}
