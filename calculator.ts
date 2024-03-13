import * as fs from 'fs';



/* 
{
    "node_list": [
        {
            "node_id": <string>,
            "output_list": [
                {
                    // id of the node that outputed to
                    // use "output" for not connected to any node(as the product of the production line)
                    "node_id": <string>,

                    "item_id": <string>,
                    "amount": <number>,

                    // when node_id is "output", require will be ignored
                    "require": <number>
                },
                ...
            ],
            "production_time": <number>
        },
        ...
    ],
    "input_list": [
        {
            "node_id": <string>,
            "item_id": <string>,
            "amount": 0,
            "require": <number>
        },
        ...
    ]
}
*/

interface item_list_entry {
    node_id: string;
    item_id: string;
    amount: number;
    require: number;
}

interface node_list_entry {
    node_id: string;
    output_list: Array<item_list_entry>;
    production_time: number;
}

interface graph_input_json {
    node_list: Array<node_list_entry>;
    input_list: Array<item_list_entry>;
}

class item_edge {

    constructor(public from: string, public to: string, public amount: number, public item_id: string, public require: number) { }
}

class item_io {
    // store the calculated in/out speed rate
    result: number;
    constructor(public node: string, public item_id: string, public amount: number) { }
}

function parse_edge(json: item_list_entry, from: string, production_time: number): item_edge {
    let res_edge: item_edge = new item_edge(from, json.node_id, json.amount / production_time, json.item_id, json.require / production_time);
    return res_edge;
}

function parse_graph(json: graph_input_json): production_line_graph {
    let res: production_line_graph = new production_line_graph();
    for (let node of json.node_list) {

        let node_id: string = node.node_id;
        let production_time: number = node.production_time;

        for (let edge of node.output_list) {
            res.add_edge(parse_edge(edge, node_id, production_time));
        }
    }

    for (let input of json.input_list) {
        res.inputs.push(new item_io(input.node_id, input.item_id, input.require));
    }

    return res;
}

class production_line_graph {

    edge: Map<string, Array<item_edge>>;
    prev: Map<string, Array<string>>;
    inputs: Array<item_io>;
    outputs: Array<item_io>;

    // index of inputs and outputs
    removed_edges: Array<[number, number]>;

    constructor() {
        this.edge = new Map<string, Array<item_edge>>();
        this.inputs = new Array<item_io>();
        this.outputs = new Array<item_io>();
        this.removed_edges = new Array<[number, number]>();
    }

    add_edge_raw(from: string, to: string, item: string, amount: number, require: number): void {
        let temp_edge: item_edge = new item_edge(from, to, amount, item, require);
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
    }

    add_edge(edge: item_edge): void {
        this.add_edge_raw(edge.from, edge.to, edge.item_id, edge.amount, edge.require);
    }

    eliminate_circle(): void {
        let visited: Map<string, boolean>;
        visited = new Map<string, boolean>();
        let deg: Map<string, number> = new Map<string, number>();

        this.edge.forEach((_, node) => {
            deg.set(node, 0);
            visited.set(node, false);
        });

        this.edge.forEach((edges) => {
            edges.forEach((edge) => {
                if (edge.to == "output") return;
                deg.set(edge.to, deg.get(edge.to) + 1);
            })
        });

        // console.log(deg);

        let dfs =
            function (graph: production_line_graph, now: string): void {
                // console.log("dfs:" + now);
                visited[now] = true;
                let edges: item_edge[] = graph.edge.get(now);
                for (let id = 0; id < edges.length; id++) {
                    if (edges[id].to == "output") continue;
                    if (visited[edges[id].to]) {
                        graph.inputs.push(new item_io(edges[id].to, edges[id].item_id, edges[id].require));
                        graph.outputs.push(new item_io(edges[id].to, edges[id].item_id, edges[id].amount));
                        graph.removed_edges.push([graph.inputs.length - 1, graph.outputs.length - 1]);
                        edges.splice(id, 1);
                        id--;
                    } else dfs(graph, edges[id].to);
                }
            }
        deg.forEach((cnt, node) => {
            if (cnt != 0) return;
            dfs(this, node);
        })
    }

    debug(): void {
        console.log(this.edge.size);
        this.edge.forEach((edges, id) => {
            console.log(id);
            edges.forEach((edge) => {
                console.log("  " + edge.to + " " + edge.item_id + " " + edge.amount + " " + edge.require);
            })
        })

        console.log("inputs:");
        this.inputs.forEach((item) => {
            console.log("  " + item.item_id + " " + item.amount + " " + item.node);
        });

        console.log("outputs:");
        this.outputs.forEach((item) => {
            console.log("  " + item.item_id + " " + item.amount + " " + item.node);
        });

        console.log("removed edges:");
        this.removed_edges.forEach((edge) => {
            console.log("  " + edge[0] + " " + edge[1]);
        });
    }
}

const test_input: string = fs.readFileSync('./test_case.json', 'utf8');

let graph: production_line_graph = parse_graph(JSON.parse(test_input));

// console.log(graph);

graph.debug();

graph.eliminate_circle();

graph.debug();

