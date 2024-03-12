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
                    "amount": <number>
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
            "amount": <number>
        },
        ...
    ]
}
*/

interface item_list_entry {
    node_id: string;
    item_id: string;
    amount: number;
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

    constructor(public from: string, public to: string, public amount: number, public item_id: string) { }
}

class item_io {
    // store the calculated in/out speed rate
    result: number;
    constructor(public node: string, public item_id: string, public amount: number) { }
}

function parse_edge(json: item_list_entry, from: string, production_time: number): item_edge {
    let res_edge: item_edge = new item_edge(from, json.node_id, json.amount / production_time, json.item_id);
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
        res.inputs.push(new item_io(input.node_id, input.item_id, input.amount));
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

    add_edge_raw(from: string, to: string, item: string, amount: number): void {
        let temp_edge: item_edge = new item_edge(from, to, amount, item);
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
        this.add_edge_raw(edge.from, edge.to, edge.item_id, edge.amount);
    }

    eliminate_circle(): void {

    }

    debug(): void {
        console.log(this.edge.size);

    }
}

const test_input: string = fs.readFileSync('./test_case.json', 'utf8');

// console.log(test_input);

let graph: production_line_graph = parse_graph(JSON.parse(test_input));

graph.debug();

