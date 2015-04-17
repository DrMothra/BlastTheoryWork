/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory
//Data type id's
var COUNTRY = 0;
var countryData = [];

//DEBUG
//Sample data
var data = {
    "questions": [
        {
            "question": "WHAT DO YOU WANT TO WORK ON?",
            "answer": "LIFE GOALS"
        },
        {
            "question": "WHAT WAS YOUR FIRST PET?",
            "answer": "A TORTOISE"
        }
    ],

    "responses": [
        {
            "question": "CONTROL",
            "value": 13
        },
        {
            "question": "LIFE GOALS",
            "value": 43
        },
        {
            "question": "RELATIONSHIPS",
            "value": 44
        },
        {
            "question": "RESPONSE 2",
            "value": 10
        },
        {
            "question": "RESPONSE 2",
            "value": 20
        },
        {
            "question": "RESPONSE 2",
            "value": 30
        }
    ],

    "distributions": [
        {
            "question": "What do you value?",
            "score": 3.7
        }
    ]
};

function getFrequency(names) {
    //Get frequency of data
    var i, length=0, freq = {};

    for(i=0; i<names.length; ++i) {
        if(names[i] in freq) {
            ++(freq[names[i]]);
        } else {
            freq[names[i]] = 1;
        }
    }

    return freq;
}

$(document).ready(function() {
    //Init app
    var elem = $(".subPage");
    var paddingCss = elem.css("padding-top");
    var padding = parseInt(paddingCss);
    if(paddingCss.substr(padding.length-1) == '%') {
        padding = window.innerWidth * (padding/100);
    }

    var renderHeight = window.innerHeight - padding;
    elem.height(renderHeight);

    var visApp = new graphApp(renderHeight);

    //Get scale and distribution data
    //DEBUG
    //Use fake data for now
    /*
    var dataURL = 'https://kserver.blasttheory.com/user';
    visApp.getData(dataURL, filterData);
    */

    filterData.call(visApp, data);

    var numTimes = 0;
    //Take action when pages showing
    $(document).on("pageshow","#pagethree",function(){

    });

    //Swiping functionality
    var page1 = $('#pageone'), page2 = $('#pagetwo'), page3 = $('#pagethree'), page4 = $('#pagefour'), page5 = $('#pagefive');


    page1.on('swipeleft', function() {
        //alert('Swipe left');
        //window.location.href = '#pagetwo';
        $.mobile.pageContainer.pagecontainer("change", "#pagetwo", {transition: "slide"});
    });

    page2.on('swipeleft', function() {
        //alert('Swipe left');
        //window.location.href = '#pagethree';
        $.mobile.pageContainer.pagecontainer("change", "#pagethree", {transition: "slide"});
    });

    page2.on('swiperight', function() {
        //alert('Swipe right');
        //window.location.href = '#pageone';
        $.mobile.pageContainer.pagecontainer("change", "#pageone", {transition: "slide", reverse: true});
    });

    page3.on('swipeleft', function() {
        //alert('Swiped');
        $.mobile.pageContainer.pagecontainer("change", "#pagefour", {transition: "slide"});
    });

    page3.on('swiperight', function() {
        //alert('Swiped');
        $.mobile.pageContainer.pagecontainer("change", "#pagetwo", {transition: "slide", reverse: true});
    });

    page4.on('swiperight', function() {
        //alert('Swiped');
        $.mobile.pageContainer.pagecontainer("change", "#pagethree", {transition: "slide", reverse: true});
    });

});

function filterData(data) {
    //Filter data
    //Get geo data
    var i = 0;
    if(data.locations) {
        var latlng = [];
        for(i=0; i<data.locations.length; ++i) {
            latlng.push(data.locations[i].lat);
            latlng.push(data.locations[i].lng);
        }

        //Get location data
        //Inform main app how much data to expect
        this.setDataRequest(COUNTRY, data.locations.length, renderCountryData);

        var dataURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
        var currentURL;
        for(i=0; i<latlng.length; i+=2) {
            currentURL = dataURL + latlng[i] + ',' + latlng[i+1];
            this.getData(currentURL, filterGeoData);
        }
    }

    var meanData = [];

    //Get questions
    var numQuestions;
    if(data.questions) {
        numQuestions = data.questions.length;
        //Create additional pages
        /*
        if(numQuestions >= 2) {
            for(i=1; i<numQuestions; ++i) {
                createPage(i);
            }
        }
        */

        for(i=0; i<1; ++i) {
            this.drawQuestion("question"+i, data, i);
        }
    } else {
        this.displayError('No question data!');
        return;
    }

    if(data.responses) {
        //this.drawResponse("response", data.responses[i]);
    }

    if(data.distributions) {
        this.drawDistribution('distribution', data.distributions[i]);
    }

    //DEBUG
    /*
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
        this.drawBarChart('graph', meanData[i].name, meanData[i].values, 5, 5, true);
    }

    //Draw scatter plots
    for(i=0; i<data.scales.length; ++i) {
        this.drawScatterPlot('scatter', meanData[i].name, meanData[i].values, 5, 5);
    }

    //Draw pie chart as well
    for(i=0; i<3; ++i) {
        this.drawPieChart('pie', "Scales", meanData[i].values);
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
    this.drawBarChart('distribution', 'Distribution', distValues, 5, 10);
    */
}

function createPage(index) {
    //Clone the relevant page
    //Create other pages
    var newPage = $('#pagethree').clone();
    var newPageContents = newPage[0];
    var pageId = "pagethreePlus" + index;
    newPageContents.attributes[2].nodeValue = pageId;

    newPageContents.id = pageId;
    for(var i=newPageContents.children.length-1; i>=1; --i) {
        newPageContents.children[i].remove();
    }
    //Remove all svg nodes
    var svgs = newPageContents.getElementsByTagName("svg");
    if(svgs) {
        for(i=svgs.length; i--;) {
            svgs[i].remove();
        }
    }

    //Replace id's
    var ids = ['question0', 'currentQuestion0', 'userAnswer0', 'firstResponse0',
        'firstResponsePercent0', 'secondResponse0', 'secondResponsePercent0', 'thirdResponse0', 'thirdResponsePercent0'];
    for(i=0; i<ids.length; ++i) {
        elem = newPage.find('#'+ids[i]);
        if(elem) {
            elem[0].id = ids[i].substring(0, ids[i].length-1) + '1';
        }
    }

    newPage.addClass("mainPage");
    newPage.appendTo('body');
}

function filterGeoData(data) {
    //Get country data
    var results = data.results;
    var types;
    for(var i=0; i<results.length; ++i) {
        types = results[i].types;
        for(var key in types) {
            if(types[key] === 'country') {
                console.log('Got country');
                countryData.push(results[i].address_components[0].long_name);
            }
        }
    }

    //Inform base app we have data
    this.updateDataRequests(COUNTRY);
}

function renderCountryData() {
    //Render country data
    //Get countries and frequency
    var countryGraphData = getFrequency(countryData);

    //Get values from data
    var values = [];
    for(var val in countryGraphData) {
        values.push(countryGraphData[val]);
    }
    this.setColours(['magenta']);
    this.setRenderWidth(512+256);
    this.setMargin(40, 60, 60, 256);
    this.drawHorizontalBarChart('countries', 'Countries', Object.keys(countryGraphData), values, values.length);
}