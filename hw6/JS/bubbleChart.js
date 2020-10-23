class bubbleChart {

    constructor(data, container, colorMap, filteredData) {
        this.data = data;
        this.container = container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.colorMap = colorMap;
        // this.filteredData =filteredData;
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


        //
        this.scrubberGroup = this.svg.append('g');

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
            .on("mouseover", (d, el) => {
                this.circleMouseOver(d)
            })
            .on("mouseout", el => {
                this.circleMouseOut(el)
            });


        //Toggle Button
        this.toggle = false;
        this.toggleButton = d3.select('#toggle')
            .on('click', () => {
                    this.toggle = !this.toggle;
                    this.breakOut(this.toggle, filteredData)
                }
            );

        //CommonTopics
        this.toggleTopics = false;
        this.blurDiv = d3.select('body').append('div')._groups[0][0];
        this.blurDiv.classList.add('bigGrayDiv');
        this.blurDiv.classList.add('opacityNone');
        this.lines = this.svg.append('g').attr('transform', 'translate(0,147.20000000000002)')

        this.CommonTopicsButton = d3.select('#CommonTopics')
            .on('click', () => {
                this.toggleTopics = !this.toggleTopics;
                if (this.toggleTopics) {
                    this.blurDiv.classList.remove('opacityNone');
                    //moveX:
                    // moveY:
                    let x1a = 429.16134539586085;
                    let y1a = -43.95257087393707;

                    if (this.toggle) {
                        x1a = 438.3202065709778;
                        y1a = 393.9854527500382;
                    }
                    this.lines.append('line')
                        .attr("x1", this.scale(x1a))
                        .attr("y1", this.scaleY(y1a))
                        .attr("x2", 50)
                        .attr("y2", -100)
                        .attr("stroke-width", 2)
                        .attr("stroke", "black");

                    let qq = this.svg.node().getBoundingClientRect();


                    let x1 = 432.87332146144996;
                    let y1 = -12.473638918503358;

                    if (this.toggle) {
                        x1 = 434.73420314227167;
                        y1 = -30.07117322798513;
                    }

                    d3.select('#bubbleChart').append('div')
                        .style('left', qq.x + 'px')
                        .style('top', qq.y + 'px')
                        .attr('class', 'infoDiv')
                        .text('School is a common topic in the debates since it applies to all americans.');


                    this.lines.append('line')
                        .attr("x1", this.scale(x1))
                        .attr("y1", this.scaleY(y1))
                        .attr("x2", 70)
                        .attr("y2", 100)
                        .attr("stroke-width", 2)
                        .attr("stroke", "black");

                    d3.select('#bubbleChart').append('div')
                        .style('left', qq.x + 'px')
                        .style('top', (qq.y + 225) + 'px')
                        .attr('class', 'infoDiv')
                        .text('Working managed to make it into 100% of speeches.');

                } else {
                    this.blurDiv.classList.add('opacityNone');
                    this.lines.selectAll('line').remove();
                    d3.select('#bubbleChart').selectAll('.infoDiv').remove();
                }
            });

    }

    circleMouseOver(data) {
        d3.select(d3.event.currentTarget).style('stroke-width', '2');
        this.tooltip.transition().duration(250)
            .style('opacity', 1);
        this.tooltip.html('<h2>' + data.phrase + '</h2>' + '<h4>R ' + data.position.toFixed(2) + '</h4>' + '<h4>In ' + ((data.total / 50) * 100).toFixed(2) + '% of speeches</h4>')
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    circleMouseOut(circle) {
        d3.select(d3.event.currentTarget).style('stroke-width', '1');
        this.tooltip.transition(this.transition)
            .style('opacity', 0);
    }

    breakOut(toggle, filteredData) {

        if (toggle) {

            this.generateBrushes(filteredData);


            //change circles
            this.circles
                .transition(this.transition)
                .attr('cx', d => this.scale(d.moveX))
                .attr('cy', d => this.scaleY(d.moveY))
                .attr('r', d => this.circScale(d.total));

            this.subHeaders.selectAll('text')
                .transition(this.transition)
                .attr("fill-opacity", 1);

        } else {
            this.circles
                .transition(this.transition)
                .attr('cx', d => this.scale(d.sourceX))
                .attr('cy', d => this.scaleY(d.sourceY))
                .attr('r', d => this.circScale(d.total));


            this.subHeaders.selectAll('text')
                .transition(this.transition)
                .attr("fill-opacity", 0)

            this.clearBrushes(filteredData, 10, false);
            this.circles.style('fill', d => this.colorMap[d.category]);
        }
    }

    onBrush(selection, brush, filteredData) {
        let categoryMap = [
            'economy/fiscal issues',
            'energy/environment',
            'crime/justice',
            'education',
            'health care',
            'mental health/substance abuse'
        ];
        let chosenCircles = [];
        this.circles.style('fill', d => {
            if (this.scale(d.sourceX) > selection[0] && this.scale(d.sourceX) < selection[1]) {
                if (d.category === categoryMap[brush]) {
                    chosenCircles.push(d);
                    return this.colorMap[d.category];
                }
                return 'gray';
            } else {
                return 'gray';
            }
        });
        filteredData(chosenCircles);
    }

    generateBrushes(filteredData) {
        const brushHeight = 100;
        const econBrush = 105;
        const energyBrush = 220;
        const crimeBrush = 305;
        const educationBrush = 405;
        const healthCare = 505;
        const mentalHealth = 605;


        this.economyBrush = d3.brushX()
            .extent([[0, econBrush], [this.width - 10, econBrush + brushHeight]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 0, true);
                this.onBrush(d3.event.selection, 0, filteredData);
            });

        //energy
        this.energyBrush = d3.brushX()
            .extent([[0, energyBrush], [this.width - 10, energyBrush + brushHeight - 30]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 1, true);
                this.onBrush(d3.event.selection, 1, filteredData);
            });

        //crime
        this.crimeBrush = d3.brushX().extent([[0, crimeBrush], [this.width - 10, crimeBrush + brushHeight - 30]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 2, true);
                this.onBrush(d3.event.selection, 2, filteredData);
            });

        //education
        this.educationBrush = d3.brushX()
            .extent([[0, educationBrush], [this.width - 10, educationBrush + brushHeight - 30]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 3, true);
                this.onBrush(d3.event.selection, 3, filteredData);
            });

        //healthCare
        this.healthCareBrush = d3.brushX().extent([[0, healthCare], [this.width - 10, healthCare + brushHeight - 30]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 4, true);
                this.onBrush(d3.event.selection, 4, filteredData);
            });

        //mentalHealth
        this.healthBrush = d3.brushX().extent([[0, mentalHealth], [this.width - 10, mentalHealth + brushHeight - 30]])
            .on('brush', () => {
                this.clearBrushes(filteredData, 5, true);
                this.onBrush(d3.event.selection, 5, filteredData);
            });
        this.assignBrushes(10);
    }

    clearBrushes(filteredData, currentBrush, reassign) {
        for(let i = 0; i < 6; i ++){
            if(i !== currentBrush){
                this.scrubberGroup.selectAll('.brush'+i)
                    .remove()
            }
        }
        if(reassign){
            this.assignBrushes(currentBrush)
        }
    }

    assignBrushes(currentBrush) {
        if (currentBrush !== 0)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush0")
                .call(this.economyBrush);

        if (currentBrush !== 1)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush1")
                .call(this.energyBrush);

        if (currentBrush !== 2)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush2")
                .call(this.crimeBrush);

        if (currentBrush !== 3)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush3")
                .call(this.educationBrush);

        if (currentBrush !== 4)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush4")
                .call(this.healthCareBrush);

        if (currentBrush !== 5)
            this.scrubberGroup.append('g')
                .attr('class', "brush")
                .attr('class', "brush5")
                .call(this.healthBrush);
    }
}