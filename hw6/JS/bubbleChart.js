class bubbleChart {

    constructor(data, container) {
        this.data = data;
        this.container = container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.svg = d3.select(container).append("svg")
            .attr('width', this.width)
            .attr('height', this.height);


        //get our scales together
        this.sourceXArr = [];
        this.sourceYArr = [];
        this.sourceTotal = [];

        for (let datum of data) {
            this.sourceXArr.push(datum.sourceX);
            this.sourceYArr.push(datum.moveY);
            this.sourceTotal.push(datum.total);
        }


        let maxEle = d3.max(this.sourceXArr);
        let maxYEle = d3.max(this.sourceYArr);
        this.scale = d3.scaleLinear()
            .domain([0, maxEle])
            .range([10, this.width - 10]);

        this.scaleY = d3.scaleLinear()
            .domain([0, maxYEle])
            .range([10, this.height - 250]);

        this.circScale = d3.scaleLinear()
            .domain([0, d3.max(this.sourceTotal)])
            .range([2, 3.25]);


        //Make our Axis
        let tickVals = [50, 40, 30, 20, 10, 0, 10, 20, 30, 40, 50];
        let tickLoc = [];
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((ele, idx) => {
            let val = ele / (tickVals.length - 1) * maxEle;
            tickLoc.push(val)
        });
        this.xAxis = d3.axisBottom()
            .scale(this.scale)
            .tickValues(tickLoc)
            .tickFormat((d, i) => {
                return tickVals[i]
            });

        let yOfXaxis = 1 / 5 * this.height;
        this.svg.append('g').attr('transform', 'translate(0, 20)')
            .call(this.xAxis)
            .append("line") //append vertical line.
            .attr("x1", this.scale(maxEle / 2))
            .attr("y1", 0)
            .attr("x2", this.scale(maxEle / 2))
            .attr("y2", this.height)
            .attr("stroke-width", 1)
            .attr("stroke", "black");


        //Append the Text
        this.svg.append('g').append('text')
            .attr("x", () => this.scale(maxEle))
            .attr("y", () => 15)
            .text('Republican Leaning')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "red")
            .attr('text-anchor', 'end');

        this.svg.append('g').append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => 15)
            .text('Democratic Leaning')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "blue");


        let colorMap = {
            'economy/fiscal issues': "green",
            'energy/environment': "blue",
            'crime/justice': "red",
            'education': "yellow",
            'health care': "orange",
            'mental health/substance abuse': "silver"
        };

        let opacity = 0;
        this.subHeaders = this.svg.append('g');
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(-25) + yOfXaxis)
            .text('economy/fiscal issues')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['economy/fiscal issues']);
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(100) + yOfXaxis)
            .text('energy/environment')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['energy/environment']);
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(225) + yOfXaxis)
            .text('crime/justice')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['crime/justice']);
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(350) + yOfXaxis)
            .text('education')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['education']);
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(475) + yOfXaxis)
            .text('health care')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['health care']);
        this.subHeaders.append('text')
            .attr("x", () => this.scale(0))
            .attr("y", () => this.scaleY(625) + yOfXaxis)
            .text('mental health/substance abuse')
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill-opacity", opacity)
            .attr("fill", colorMap['mental health/substance abuse']);


        //Tooltip
        // Define the div for the tooltip
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        //Append the circles
        this.transition = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);

        this.circles = this.svg.append('g')
            .attr('transform', 'translate(0,' + (yOfXaxis) + ')').selectAll('circle').data(this.data)
            .enter()
            .append('circle')
            .attr('cx', d => this.scale(d.sourceX))
            .attr('cy', d => this.scaleY(d.sourceY))
            .attr('r', d => this.circScale(d.total))
            .style('fill', d => colorMap[d.category])
            .style('stroke', "black")
            .style('stroke-width', '1')
            .on("mouseover", (d, el) => {this.circleMouseOver(d)})
            .on("mouseout", el => {this.circleMouseOut(el)});


        //Toggle Button
        this.toggle = false;
        this.toggleButton = d3.select('#toggle')
            .on('click', () => {
                    this.toggle = !this.toggle;
                    this.breakOut(this.toggle)
                }
            )
    }

    circleMouseOver(data) {
        d3.select(d3.event.currentTarget).style('stroke-width', '2');
        this.tooltip.transition().duration(250)
            .style('opacity', 1);
        this.tooltip.html('<h2>'+data.phrase+'</h2>' + '<h4>R '+data.position.toFixed(2)+'</h4>' + '<h4>In '+((data.total/50)*100).toFixed(2)+'% of speeches</h4>')
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    circleMouseOut(circle) {
        d3.select(d3.event.currentTarget).style('stroke-width', '1');
        this.tooltip.transition(this.transition)
            .style('opacity', 0);
    }

    breakOut(toggle) {

        if (toggle) {
            this.circles
                .transition(this.transition)
                .attr('cx', d => this.scale(d.moveX))
                .attr('cy', d => this.scaleY(d.moveY))
                .attr('r', d => this.circScale(d.total));

            this.subHeaders.selectAll('text')
                .transition(this.transition)
                .attr("fill-opacity", 1)

        } else {
            this.circles
                .transition(this.transition)
                .attr('cx', d => this.scale(d.sourceX))
                .attr('cy', d => this.scaleY(d.sourceY))
                .attr('r', d => this.circScale(d.total));

            this.subHeaders.selectAll('text')
                .transition(this.transition)
                .attr("fill-opacity", 0)
        }
    }
}