/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory

$(document).ready(function() {
    //Init app
    var visApp = new graphApp();

    //Get scale and distribution data
    var dataURL = 'https://kserver.blasttheory.com/user';
    visApp.getData(dataURL, filterData);

    //Get geolocation data
    dataURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=50.829858,-0.21051';
    visApp.getData(dataURL, filterGeoData);
});

function filterData(data) {
    //Filter data
    var i = 0;
    var meanData = [];

    if (data.scales) {
        for (i = 0; i < data.scales.length; ++i) {
            var meanDataItem = {};
            var meanValues = [];
            meanDataItem.name = data.scales[i].name;
            meanValues.push(data.scales[i].mean);
            meanDataItem.values = meanValues;
            meanData.push(meanDataItem);
        }
    } else {
        this.displayError("No scale data!");
        return;
    }

    var aggScales = data.aggregate.scales ? data.aggregate.scales : null;
    if (aggScales) {
        for (i = 0; i < aggScales.length; ++i) {
            //Assumes arrays in same order - check for this
            meanData[i].values.push(aggScales[i].mean);
        }
    } else {
        this.displayError('No aggregate scale data!');
        return;
    }

    //Draw graphs with this data
    //Set up drawing environment
    var colours = ['red', 'steelblue'];
    this.setColours(colours);
    for(i=0; i<data.scales.length; ++i) {
        this.drawBarChart('graph', meanData[i].name, meanData[i].values, 100, 5);
    }

    //Get distribution
    var distValues = [];
    if(aggScales[0].distribution) {
        for(i=0; i<aggScales[0].distribution.length; ++i) {
            distValues.push(aggScales[0].distribution[i].users);
        }
    } else {
        this.displayError("No distribution in data!");
        return;
    }
    //Alter colours
    colours = ['green'];
    this.setColours(colours);
    this.drawBarChart('distribution', 'Distribution', distValues, 150, 10);
}

function filterGeoData(data) {
    console.log("Data =", data);
}