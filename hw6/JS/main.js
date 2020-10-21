
d3.json('../data/words.json').then(data => {

    let bblElement = d3.select('#bubbleChart');

    let bblChart = new bubbleChart(data, bblElement._groups[0][0]);

});