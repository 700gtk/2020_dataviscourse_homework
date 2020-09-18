/**
 * Makes the first bar chart appear as a staircase.
 *
 * Note: use only the DOM API, not D3!
 */
function staircase() {
    // ****** TODO: PART II ******
    let chartGroup = document.getElementById('aBarChart');
    let barChildren = chartGroup.getElementsByTagName("*");
    let bars = Array.prototype.slice.call(barChildren);

    let test = [100, 80, 130, 90, 170]

    bars.sort((boxA, boxB) => {
        let aBox = boxA.getBBox();
        let bBox = boxB.getBBox();

        return aBox.width - bBox.width
    });

    test.sort((a, b) => {
        return a - b;
    });

    //remove all of the current elements
    removeAllChildren(chartGroup);

    //add the sorted elements
    addAllChildrenInOrder(chartGroup, bars);
}

function addAllChildrenInOrder(parent, array) {
    for (let i = 0; i < array.length; i++) {
        let ele = array[i];
        ele.setAttribute('transform', "translate(0, " + 14 * i + ") scale(-1, 1)")
        parent.append(ele)
    }
}

function removeAllChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
    /**
     * D3 loads all CSV data as strings. While Javascript is pretty smart
     * about interpreting strings as numbers when you do things like
     * multiplication, it will still treat them as strings where it makes
     * sense (e.g. adding strings will concatenate them, not add the values
     * together, or comparing strings will do string comparison, not numeric
     * comparison).
     *
     * We need to explicitly convert values to numbers so that comparisons work
     * when we call d3.max()
     **/

    for (let d of data) {
        d.cases = +d.cases; //unary operator converts string to number
        d.deaths = +d.deaths; //unary operator converts string to number
    }

    // Set up the scales
    let barChart_width = 345;
    let areaChart_width = 295;
    let maxBar_width = 240;
    let data_length = 15;
    let aScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.cases)])
        .range([0, maxBar_width]);
    let bScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.deaths)])
        .range([0, maxBar_width]);
    let iScale_line = d3
        .scaleLinear()
        .domain([0, data.length])
        .range([10, 500]);
    let iScale_area = d3
        .scaleLinear()
        .domain([0, data_length])
        .range([0, 260]);

    // Draw axis for Bar Charts, Line Charts and Area Charts (You don't need to change this part.)
    d3.select("#aBarChart-axis").attr("transform", "translate(0,210)").call(d3.axisBottom(d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([barChart_width, barChart_width - maxBar_width])).ticks(5));
    d3.select("#aAreaChart-axis").attr("transform", "translate(0,245)").call(d3.axisBottom(d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([areaChart_width, areaChart_width - maxBar_width])).ticks(5));
    d3.select("#bBarChart-axis").attr("transform", "translate(5,210)").call(d3.axisBottom(bScale).ticks(5));
    d3.select("#bAreaChart-axis").attr("transform", "translate(5,245)").call(d3.axisBottom(bScale).ticks(5));
    let aAxis_line = d3.axisLeft(aScale).ticks(5);
    d3.select("#aLineChart-axis").attr("transform", "translate(50,15)").call(aAxis_line);
    d3.select("#aLineChart-axis").append("text").text("New Cases").attr("transform", "translate(50, -3)")
    let bAxis_line = d3.axisRight(bScale).ticks(5);
    d3.select("#bLineChart-axis").attr("transform", "translate(550,15)").call(bAxis_line);
    d3.select("#bLineChart-axis").append("text").text("New Deaths").attr("transform", "translate(-50, -3)")

    // ****** TODO: PART III (you will also edit in PART V) ******
    let xOffseta = -1;

    // TODO: Select and update the 'a' bar chart bars
    let aChart = d3.select('#aBarChart')
        .selectAll('rect')
        .data(data);

    aChart
        .attr("height", 12)
        .attr("transform", ()=>{
            xOffseta += 1;
            return "translate(0,"+ 14 * xOffseta +") scale(-1, 1)"; })
        .attr("width", d => {return aScale(d.cases)});

    aChart.enter()
        .append('rect')
        .attr("width", d => {return aScale(d.cases)})
        .attr("height", 12)
        .attr("transform", ()=>{
            xOffseta += 1;
            return "translate(0,"+ 14 * xOffseta +") scale(-1, 1)"; });

    aChart.exit().remove();

    // TODO: Select and update the 'b' bar chart bars
    let xOffset = -1;
    let bChart = d3.select('#bBarChart')
        .selectAll('rect')
        .data(data);

    bChart.attr("width", d => {return bScale(d.deaths)})
        .attr("height", 12)
        .attr("transform", ()=>{
            xOffset += 1;
            return "translate(0,"+ 14 * xOffset +")"; });

    bChart.enter()
        .append('rect')
        .attr("width", d => {return bScale(d.deaths)})
        .attr("height", 12)
        .attr("transform", ()=>{
            xOffset += 1;
            return "translate(0,"+ 14 * xOffset +")"; });

    bChart.exit()
        .remove();

    // TODO: Select and update the 'a' line chart path using this line generator
    let aLineGenerator = d3
        .line()
        .x((d, i) => iScale_line(i))
        .y(d => aScale(d.cases));

    d3.select("#aLineChart")
        .datum(data)
        .attr("d", aLineGenerator);
    // TODO: Select and update the 'b' line chart path (create your own generator)

    let bLineGenerator = d3
        .line()
        .x((d, i) => iScale_line(i))
        .y(d => bScale(d.deaths));

    let blineChart = d3.select("#bLineChart")
        .datum(data)
        .attr("d", bLineGenerator);



    // TODO: Select and update the 'a' area chart path using this area generator
    let aAreaGenerator = d3
        .area()
        .x((d, i) => iScale_area(i))
        .y0(0)
        .y1(d => aScale(d.cases));

    d3.select('#aAreaChart')
        .datum(data)
        .attr("d", aAreaGenerator)

    // TODO: Select and update the 'b' area chart path (create your own generator)
    let bAreaGenerator = d3
        .area()
        .x((d, i) => iScale_area(i))
        .y0(0)
        .y1(d => bScale(d.deaths));

    d3.select('#bAreaChart')
        .datum(data)
        .attr("d", bAreaGenerator)

    // TODO: Select and update the scatterplot points
    // d3.select("#x-axis").attr("transform", "translate(0,210)").call(d3.axisBottom(d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([barChart_width, barChart_width - maxBar_width])).ticks(6));
    let y_axis = d3.axisLeft(bScale).ticks(5);
    d3.select("#y-axis").attr("transform", "translate(0,0)").call(y_axis);
    let x_axis = d3.axisBottom(aScale).ticks(5);
    d3.select("#x-axis").attr("transform", "translate(0,240)").call(x_axis);

    let scatter = d3.select('#scatterplot')
        .selectAll('circle')
        .data(data);

    scatter.attr("cy", d => {return bScale(d.deaths)})
        .attr("cx", d => {return aScale(d.cases)})
        .attr('r', 5);

    scatter.enter()
        .append('circle')
        .attr("cy", d => {return bScale(d.deaths)})
        .attr("cx", d => {return aScale(d.cases)})
        .attr('r', 5)
        .on('click', ele=> {
            console.log('x:' + ele.x + ' y:' + ele.y)
        });

    scatter.exit()
        .remove();

    // ****** TODO: PART IV ******

    let aBars = document.getElementById("aBarChart").getElementsByTagName("*");
    let bBars = document.getElementById("bBarChart").getElementsByTagName("*");
    for(let i = 0; i < aBars.length; i++){
        aBars[i].addEventListener("mouseenter", ele => {ele.toElement.style.fill = "ea4a88"});
        bBars[i].addEventListener("mouseover", ele => {ele.toElement.style.fill = "004f6d"});

        aBars[i].addEventListener("mouseleave", ele => {ele.toElement.style.fill = "rgb(241,151,0)"});
        bBars[i].addEventListener("mouseout", ele => {ele.toElement.style.fill = "rgb(79,175,0)"});
    };


}

/**
 * Update the data according to document settings
 */
async function changeData() {
    //  Load the file indicated by the select menu
    let dataFile = document.getElementById("dataset").value;
    try {
        const data = await d3.csv("data/" + dataFile + ".csv");
        if (document.getElementById("random").checked) {
            // if random
            update(randomSubset(data)); // update w/ random subset of data
        } else {
            // else
            update(data); // update w/ full data
        }
    } catch (error) {
        console.log(error)
        alert("Could not load the dataset!");
    }
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
    return data.filter(d => Math.random() > 0.5);
}

document.onload = changeData();