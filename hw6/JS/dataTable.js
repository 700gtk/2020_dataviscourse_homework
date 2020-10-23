class dataTable {
    constructor(data, colorMap) {
        this.data = data;
        // this.container = container;
        // this.width = this.container.clientWidth;
        // this.height = this.container.clientHeight;

        this.scaleWidth = d3.select('#percentageScale')._groups[0][0].clientWidth;
        this.scaleHeight = d3.select('#percentageScale')._groups[0][0].clientHeight;

        this.colorMap = colorMap;


        //scales
        //frequency scales
        this.frequencyScale = d3.scaleLinear()
            .domain([0, 100])
            .range([5, this.scaleWidth - 15]);

        this.frequencyAxis = d3.axisBottom()
            .scale(this.frequencyScale)
            .ticks(3);

        d3.select('#frequencyScale')
            .append('svg')
            .attr('height', this.scaleHeight)
            .attr('scaleWidth', this.scaleWidth)
            .call(this.frequencyAxis);


        //percentage scale
        let tickVals = [-100, -50, 0, 50, 100];

        this.percentageScale = d3.scaleLinear()
            .domain([-100, 100])
            .range([10, this.scaleWidth - 10]);

        this.percentageAxis = d3.axisBottom()
            .scale(this.percentageScale)
            .tickValues(tickVals)
            .tickFormat((d, i) => {
                return Math.abs(d)
            });

        d3.select('#percentageScale')
            .append('svg')
            .attr('height', this.scaleHeight)
            .attr('scaleWidth', this.scaleWidth)
            .call(this.percentageAxis);

        this.drawTable(this.data);


        //Make rows sortable
        this.isPhraseSorted = false;
        this.isFrequencySorted = false;
        this.isPercentagesSorted = false;
        this.isTotalSorted = false;

        this.phrase = d3.select('#Phrase').on('click', d => {
            if (!this.isPhraseSorted) {
                this.drawTable(this.data.sort((a, b) => a.phrase > b.phrase ? 1 : -1));
                this.isPhraseSorted = true;
                this.isFrequencySorted = false;
                this.isPercentagesSorted = false;
                this.isTotalSorted = false;
            } else {
                this.drawTable(this.data.reverse())
            }
        });

        this.phrase = d3.select('#Frequency').on('click', d => {
            if (!this.isFrequencySorted) {
                this.drawTable(this.data.sort((a, b) => parseFloat(a.total) > parseFloat(b.total) ? 1 : -1));
                this.isFrequencySorted = true;
                this.isPhraseSorted = false;
                this.isPercentagesSorted = false;
                this.isTotalSorted = false;
            } else {
                this.drawTable(this.data.reverse());
            }
        });

        this.phrase = d3.select('#Percentages').on('click', d => {
            if (!this.isPercentagesSorted) {
                this.drawTable(this.data.sort((a, b) => parseFloat(a.percent_of_r_speeches) > parseFloat(b.percent_of_r_speeches) ? 1 : -1));
                this.isPercentagesSorted = true;
                this.isPhraseSorted = false;
                this.isFrequencySorted = false;
                this.isTotalSorted = false;
            } else {
                this.drawTable(this.data.reverse())
            }
        });

        this.phrase = d3.select('#Total').on('click', d => {
            if (!this.isTotalSorted) {
                this.drawTable(this.data.sort((a, b) => parseFloat(a.total) > parseFloat(b.total) ? 1 : -1));
                this.isTotalSorted = true;
                this.isPhraseSorted = false;
                this.isFrequencySorted = false;
                this.isPercentagesSorted = false;
            } else {
                this.drawTable(this.data.reverse())
            }
        });
    }

    drawTable(data, that) {
        this.data = data;
        d3.select('#dataTableBody').selectAll('*').remove();

        //Rows
        this.rows = d3.select('#dataTableBody')
            .selectAll('div')
            .data(data)
            .join('div')
            .attr('class', 'tableRow');

        //phrase
        this.rows.append('div').text(d => d.phrase);

        //Frequency
        this.rows.append('div')
            .append('svg')
            .attr('height', this.scaleHeight)
            .attr('width', this.scaleWidth)
            .attr('transform', 'translate(0, 2)')
            .append('rect')
            .attr('height', this.scaleHeight - 4)
            .attr('width', d => this.frequencyScale((d.total / 50) * 100).toFixed(2))
            .attr('fill', d => this.colorMap[d.category]);

        //Percentage
        let percentSvg = this.rows.append('div')
            .append('svg')
            .attr('height', this.scaleHeight)
            .attr('width', this.scaleWidth)
            .attr('transform', 'translate(0, 2)');

        percentSvg.append('rect')
            .attr('height', this.scaleHeight - 4)
            .attr('x', d => this.scaleWidth / 2 - (this.percentageScale(d.percent_of_d_speeches) / 2 + .05))
            .attr('width', d => this.percentageScale(d.percent_of_d_speeches) / 2)
            .attr('text-anchor', 'end')
            .attr('fill', d => '#202C59');

        percentSvg.append('rect')
            .attr('height', this.scaleHeight - 4)
            .attr('x', this.scaleWidth / 2 + .05)
            .attr('width', d => this.percentageScale(d.percent_of_r_speeches) / 2)
            .attr('fill', d => '#881607');

        //Total
        this.rows.append('div').text(d => d.total)
            .attr('class', 'centerText');
    }

}