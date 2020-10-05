loadData().then(data => {

    // no country selected by default
    this.activeCountry = null;
    // deafult activeYear is 2000
    this.activeYear = '2000';
    let that = this;

    console.log(data);

    // ******* TODO: PART 3 *******
    /**
     * Calls the functions of the views that need to react to a newly selected/highlighted country
     *
     * @param countryID the ID object for the newly selected country
     */
    function updateCountry(countryID) {
        if (countryID === null) {
            return
        }
        // TODO - your code goes here
        worldMap.updateHighlightClick(countryID, this.activeCountry);
        this.activeCountry = countryID;


        //update the circles
        let circles = d3.selectAll('circle');
        circles.classed("selected-country", false);

        let activeDot = d3.select("#circ-"+countryID);
        activeDot.classed("selected-country", true);


        let popRegion = popmap.get(countryID);
        let regions = ['europe', 'africa', 'asia', 'americas'];

        circles.classed('hidden', false);

        if(popRegion !== undefined) {
            regions.forEach(el => {
                if(el !== popRegion.region) {
                    let localFilter = circles.filter('.' + el);
                    localFilter.classed( "hidden", true)
                }
                infoBox.updateTextDescription(this.activeCountry, that.activeYear)

            });
        }

    }

    // ******* TODO: PART 3 *******

    /**
     *  Takes the specified activeYear from the range slider in the GapPlot view.
     *  It takes the value for the activeYear as the parameter. When the range slider is dragged, we have to update the
     *  gap plot and the info box.
     *  @param year the new year we need to set to the other views
     */
    function updateYear(year, x, y, circ) {

        //TODO - your code goes here -
        this.activeYear = year;
        gapPlot.updatePlot(this.activeYear, x, y, circ);
        infoBox.updateTextDescription(this.activeCountry, this.activeYear)

    }

    // Creates the view objects
    const popmap = popMap(data.population);
    const infoBox = new InfoBox(data, popmap);
    const worldMap = new WorldMap(data, updateCountry, popmap);
    const gapPlot = new GapPlot(data, updateCountry, updateYear, this.activeYear, popmap);

    // Initialize gapPlot here.
    //TODO - your code goes here -

    // here we load the map data
    d3.json('data/world.json').then(mapData => {

        // ******* TODO: PART I *******
        // You need to pass the world topo data to the drawMap() function as a parameter, along with the starting activeYear.
        //TODO - your code goes here -
        worldMap.drawMap(mapData);
        gapPlot.drawPlot();
        gapPlot.updatePlot(this.activeYear, "life-expectancy", "gdp", "gdp");
        gapPlot.drawYearBar();
    });

    // This clears a selection by listening for a click
    document.addEventListener("click", function (e) {
        updateCountry(null);
    }, true);
});

// ******* DATA LOADING *******
// We took care of that for you

/**
 * A file loading function or CSVs
 * @param file
 * @returns {Promise<T>}
 */
async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData() {
    let pop = await loadFile('data/pop.csv');
    let gdp = await loadFile('data/gdppc.csv');
    let tfr = await loadFile('data/tfr.csv');
    let cmu = await loadFile('data/cmu5.csv');
    let life = await loadFile('data/life_expect.csv');


    return {
        'population': pop,
        'gdp': gdp,
        'child-mortality': cmu,
        'life-expectancy': life,
        'fertility-rate': tfr,
    };
}

function popMap(population) {
    let popuMap = new Map();
    for (let i = 0; i < population.length; i++) {
        popuMap.set(population[i].geo, {loc: i, region: population[i].region});
        popuMap.set(population[i].country, {geo: population[i].geo})
    }
    return popuMap;
}