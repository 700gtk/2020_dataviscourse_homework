/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.curPoll = "";
        this.tableData = [...forecastData];
        // add useful attributes
        for (let forecast of this.tableData) {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'margin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winstate_inc',
                alterFunc: d => +d
            },
        ];

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 // 
        ////////////
        /**
         * Draw the legend for the bar chart.
         */

        let MarginAxis = d3.select('#marginAxis');
        let height = 50;
        let width = 300;
        MarginAxis.attr("height", height)
            .attr("width", width);
        MarginAxis.append('line')
            .attr('x1', width / 2)
            .attr('x2', width / 2)
            .attr('y1', 0)
            .attr('y2', height)
            .style("stroke", "black");

        let textFeatures = [75, 50, 25, 25, 50, 75];
        MarginAxis.selectAll('text')
            .data(textFeatures)
            .enter()
            .append('text')
            .attr('x', (d, i) => i > 2 ? this.scaleX(d)-15:this.scaleX(-d)-15)
            .attr('fill', (d, i) => i > 2 ? "steelblue" : "firebrick")
            .attr('font-size', "1em")
            .attr('y', height-10)
            .text(d => "+" + d);

    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => {
            if (d.isForecast) {
                this.toggleRow(d, this.tableData.indexOf(d));
            }
        });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);


        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */
        let textSelection = forecastSelection.filter(d => d.type === 'text');
        textSelection.text(d => d.value);

        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        this.addGridlines(grouperSelect.filter((d, i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d, i) => i === 1));
        this.addCircles(grouperSelect.filter((d, i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: +d.margin_lo,
                margin: +d.margin,
                marginHigh: +d.margin_hi,
            }
        };
        let winChance;
        if (d.isForecast) {
            const trumpWinChance = +d.winstate_inc;
            const bidenWinChance = +d.winstate_chal;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100) {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        } else {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList) {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */

    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */
        let scale = 1.85;
        containerSelect.selectAll('line')
            .data(ticks)
            .enter()
            .append('line')
            .style("stroke", (d, i) => i === 3 ? "black" : "gray")
            .attr('x1', d => this.scaleX(d))
            .attr('x2', d => this.scaleX(d))
            .attr('y1', 0)
            .attr('y2', 100)
    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */
        let iter = -1;
        let fillIter = -1;
        containerSelect.selectAll('defs').remove();
        containerSelect.selectAll('rect').remove();
        containerSelect.append('rect')
            .attr('x', d => this.scaleX(d.value.marginLow))
            .attr('width', d => this.scaleX(d.value.marginHigh) - this.scaleX(d.value.marginLow))
            .attr('height', 30)
            .attr('style', "opacity:.75")
            .attr('fill', d => {
                fillIter++;
                return 'url(#fillGradient' + (fillIter) + ')'
            })
            .attr('class', d => {
                iter++;
                if (d.value.marginLow > 0) {
                    return "trump";
                } else if (d.value.marginHigh > 0) {
                    let result = this.makeNewGradient(d.value.marginLow / (d.value.marginHigh - d.value.marginLow), iter);
                    containerSelect._groups[iter][0].innerHTML += result;
                    return "";
                }
                return "biden";
            })
    }

    makeNewGradient(changePoint, iteration) {
        changePoint = Math.abs(Math.floor(changePoint * 100))
        let percents = 'x1="' + ((changePoint - 1)) + '%" y1="' + changePoint + '%" x2="' + changePoint + '%" y2="' + changePoint + '%"';
        let gradient = '<defs><linearGradient id="fillGradient' + iteration + '" ' + percents + ' ><stop offset="0%" style="stop-color:rgb(70,130,180);"></stop><stop offset="100%" style="stop-color:rgb(178,34,34);"></stop></linearGradient></defs>'
        return gradient
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */

        containerSelect.selectAll('circle').remove();
        containerSelect.append('circle')
            .attr("r", d => {
                if (!isNaN(d.value.marginHigh))
                    return 5;
                return 4;
            })
            .attr("cx", d => {
                if (!isNaN(d.value.marginHigh))
                    return this.scaleX((d.value.marginHigh - d.value.marginLow) / 2 + d.value.marginLow);
                return 150 + d.value.margin
            })
            .attr("cy", d => {
                if (!isNaN(d.value.marginHigh))
                    return 15;
                return 10
            })
            .attr("stroke", "black")
            .attr("fill", d => {
                if (!isNaN(d.value.marginHigh)) {
                    if (d.value.marginLow > 0) {
                        return "firebrick";
                    } else if (d.value.marginHigh > 0) {
                        if ((d.value.marginHigh + d.value.marginLow) > 0) {
                            return "firebrick";
                        }
                    }
                    return "steelblue";
                } else {
                    if (d.value.margin > 0) {
                        return "firebrick";
                    }
                    return "steelblue";
                }
            });
    }

    attachSortHandlers() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */
        let columnHeaders = d3.selectAll('.sortable');
        columnHeaders.on('click', d => {
            this.collapseAll();

            let allThreeColumns = d.currentTarget.parentNode.children;
            for (let child of allThreeColumns) {
                child.classList.remove("sorting")
                child.children[0].classList.add("no-display")
            }
            d.currentTarget.classList.add("sorting");
            let icon = d.currentTarget.children[0];
            icon.classList.remove("no-display");
            icon.classList.remove("fa-sort-up");
            icon.classList.remove("fa-sort-down");

            let columnName = d.currentTarget.innerText;
            let sortKey = "winstate_inc";
            let sortNum = 2;
            if (columnName.includes('State')) {
                sortKey = 'state';
                sortNum = 0;
            } else if (columnName.includes("Margin of Victory")) {
                sortKey = 'margin';
                sortNum = 1;
            }
            this.headerData[0].sorted = false;
            this.headerData[1].sorted = false;
            this.headerData[2].sorted = false;

            this.tableData.sort((a, b) => {
                if (sortKey === 'state') {
                    if (a[sortKey] < b[sortKey])
                        return -1;
                    if (a[sortKey] > b[sortKey])
                        return 1;
                    return 0;
                }
                return a[sortKey] - b[sortKey]
            });
            if (!this.headerData[sortNum].ascending) { //descending
                icon.classList.add("fa-sort-down");
                this.tableData.reverse();
            } else {
                icon.classList.add("fa-sort-up");
            }

            this.headerData[sortNum].sorted = true;
            this.headerData[sortNum].ascending = !this.headerData[sortNum].ascending;
            this.drawTable()
        })
    }

    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
        this.collapseAll();

        if(this.curPoll === rowData.state){
            this.drawTable();
            this.curPoll = "";
            return
        }
        this.curPoll = rowData.state;
        let pollInfo = this.pollData.get(rowData.state);
        this.tableData.splice(index + 1, 0, ...pollInfo);

        this.drawTable()
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
