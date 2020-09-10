/** Class representing a Tree. */
class Tree {
    /**
     * Creates a Tree Object
     * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
     * note: Node objects will have a name, parentNode, parentName, children, level, and position
     * @param {json[]} json - array of json objects with name and parent fields
     */
    constructor(json) {

        this.arr = [];
        this.mapOfArr = new Map();
        this.pos = 0;

        for (let i = 0; i < json.length; i++) {
            this.arr.push(new Node(json[i].name, json[i].parent));
            this.mapOfArr.set(json[i].name, i);
        }
    }

    /**
     * Function that builds a tree from a list of nodes with parent refs
     */
    buildTree() {
        // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
        for (let i = 0; i < this.arr.length; i++) {
            let curNode = this.arr[i];

            //if we aren't dealing with the root node
            if (curNode.parentName !== 'root') {
                //use mapOfArr to get parent's location in the node array.
                let parentNode = this.arr[this.mapOfArr.get(curNode.parentName)];
                curNode.parentNode = parentNode;

                //Add child node to parent node's list of children.
                parentNode.children.push(curNode);
            }
        }

        this.assignLevel(this.arr[0], 0);
        this.assignPosition(this.arr[0], 0);
    }

    /**
     * Recursive function that assign levels to each node
     */
    assignLevel(node, level) {
        node.level = level;

        for (const child of node.children) {
            this.assignLevel(child, level + 1);
        }
    }

    /**
     * Recursive function that assign positions to each node
     */
    assignPosition(node, position) {
        node.position = this.pos;

        node.children.forEach((child, index) => {
            this.pos = index===0?this.pos:this.pos+1;
            this.assignPosition(child, this.pos);
        })
    }

    /**
     * Function that renders the tree
     */
    renderTree() {
        let cirlceRadius = 30;
        let xoffset = cirlceRadius;
        let svg = d3.select("body").append("svg")
            .attr("width", 1200)
            .attr("height", 1200);

       let circles = svg.selectAll("circle")
            .data(this.arr)
            .enter()
            .append("circle");

        let results = circles.attr("cx", d => {return d.level*100 + xoffset})
            .attr("cy", d => {return d.position*100 + xoffset})
            .attr("r", cirlceRadius)
    }

}