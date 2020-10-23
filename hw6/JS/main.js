
d3.json('../data/words.json').then(data => {

    let bblElement = d3.select('#bubbleChart');
    // let dataTableElement = ;

    let colorMap = {
        'economy/fiscal issues': "#DB93A5",
        'energy/environment': "#F18805",
        'crime/justice': "#7AC967",
        'education': "#67ADC9",
        'health care': "#881607",
        'mental health/substance abuse': "#202C59"
    };



    let dtTable = new dataTable(data, colorMap);

    let processFilter = (filter)=>{
        dtTable.drawTable(filter, dtTable)
    };

    let bblChart = new bubbleChart(data, bblElement._groups[0][0], colorMap, processFilter);


});