/** Data structure for the data associated with an individual country. */
class InfoBoxData {
    /**
     *
     * @param country name of the active country
     * @param region region of the active country
     * @param indicator_name the label name from the data category
     * @param value the number value from the active year
     */
    constructor(country, region, indicator_name, value) {
        this.country = country;
        this.region = region;
        this.indicator_name = indicator_name;
        this.value = value;
    }
}

/** Class representing the highlighting and selection interactivity. */
class InfoBox {
    /**
     * Creates a InfoBox Object
     * @param data the full data array
     */
    constructor(data, popMap) {
        this.data = data;
        this.popMap = popMap;
        this.infoBoxData;
        this.location = d3.select('#country-detail');
        this.title = this.location.append('h2');
        this.population = this.location.append('div');
        this.gdp = this.location.append('div');
        this.childMortality = this.location.append('div');
        this.lifeExpectancy = this.location.append('div');
        this.totalFatality = this.location.append('div');
    }

    /**
     * Renders the country description
     * @param activeCountry the IDs for the active country
     * @param activeYear the year to render the data for
     */
    updateTextDescription(activeCountry, activeYear) {
        // ******* TODO: PART 4 *******
        // Update the text elements in the infoBox to reflect:
        // Selected country, region, population and stats associated with the country.
        /*
         * You will need to get an array of the values for each category in your data object
         * hint: you can do this by using Object.values(this.data)
         * you will then need to filter just the activeCountry data from each array
         * you will then pass the data as paramters to make an InfoBoxData object for each category
         *
         */
        //TODO - your code goes here -
        this.location.classed('select-hide', false); //un-hids the whole box

        let popNum = this.popMap.get(activeCountry);

        let country = this.data.population[popNum.loc].country;
        let region = this.data.population[popNum.loc].region;
        let indicator_name = this.data.population[popNum.loc].indicator_name;
        let value = this.data.population[popNum.loc][activeYear];
        this.infoBoxData = new InfoBoxData(country, region, indicator_name, value);

        let countryInd = this.findCountry(activeCountry);
        this.title.text(country);
        this.population.text('Population: ' + this.data.population[popNum.loc][activeYear]);
        this.gdp.text('GDP per capita: ' + this.data.gdp[countryInd][activeYear]);
        this.childMortality.text('Child mortality (under the age of 5): ' + this.data['child-mortality'][countryInd][activeYear]);
        this.lifeExpectancy.text('Life expectancy: ' + this.data['life-expectancy'][countryInd][activeYear]);
        this.totalFatality.text('Total fertility rate: ' + this.data['fertility-rate'][countryInd][activeYear]);
    }

    /**
     * Removes or makes invisible the info box
     */
    clearHighlight() {
        //TODO - your code goes here -
        this.location.classed('select-hide', true)
    }

    findCountry(countryName) {
        let toRet;
        this.data.gdp.forEach((el, ind) => {
            if (el.geo === countryName) {
                toRet = ind;
            }
        });
        return toRet;
    }

}