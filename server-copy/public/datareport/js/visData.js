/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory
//Data type id's
var COUNTRY = 0;
var DEFAULT_RENDER_HEIGHT = 230;
var countryData = [];

function getItem(data, key, item) {
    //See if item in data
    for(var i in data) {
        if(data[i][key] === item) {
            return data[i];
        }
    }

    return null;
}

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

function linkPages() {
    //Set up swiping between pages
    var numPages = $('*[data-role="page"]').length;

    //First page only has swipeleft functionality
    $('#page1').on('swipeleft', function() {
        $.mobile.pageContainer.pagecontainer("change", $('#page2'), {transition: "slide"});
    });
    for(var page=2; page<numPages; ++page) {
        (function() {
            var elem, next, previous;
            elem = $('#page'+page);
            next = page+1;
            previous = page-1;
            elem.on('swipeleft', function() {
                $.mobile.pageContainer.pagecontainer("change", $('#page'+next), {transition: "slide"});
            });
            elem.on('swiperight', function() {
                $.mobile.pageContainer.pagecontainer("change", $('#page'+previous), {transition: "slide", reverse: true});
            });
        })();

    }
    //Last page only has swiperight functionality
    var last = $('#page'+numPages);
    var penul = numPages-1;
    last.on('swiperight', function() {
        $.mobile.pageContainer.pagecontainer("change", $('#page'+penul), {transition: "slide", reverse: true});
    });
}

function getTotalUsers(data) {
    var total = 0;
    for(var i in data) {
        total += data[i].users;
    }

    return total;
}

function classify(data, value) {
    for(var i in data) {
        if(value <= data[i].max) {
            return i;
        }
    }

    return null;
}

function getClassification(value, classifications, compare) {
    //Get the classifiction of this value according to given data
    for(var i in classifications) {
        if(value <= classifications[i].max) {

        }
    }
}

function VisApp(renderHeight) {
    graphApp.call(this, renderHeight);
}

VisApp.prototype = new graphApp();

VisApp.prototype.getAggregateQuestion = function(questionName) {
    //Find this question in aggregates
    var aggregateQuestions = this.data.aggregate.questions;
    for(var i=0; i<aggregateQuestions.length; ++i) {
        if(questionName === aggregateQuestions[i].name) {
            return aggregateQuestions[i];
        }
    }

    return null;
};

VisApp.prototype.getAggregateScale = function(name) {
    var scales = this.data.aggregate.scales;
    for(var i=0; i<scales.length; ++i) {
        if(scales[i].name === name) {
            return scales[i];
        }
    }

    return null;
};

VisApp.prototype.getInfoScale = function(name) {
    var scales = this.info.scales;
    for(var i=0; i<scales.length; ++i) {
        if(scales[i].name === name) {
            return scales[i];
        }
    }

    return null;
};

var app = null;
var intervalId;

function filterData(data) {
    //Render the data
    //Uber hack!!!!!!
    intervalId = setInterval(function(){
        if(app != null) {
            clearInterval(intervalId);
            data = injectedData;
            app.filterData(data);
        }
    }, 500);
}

$(document).ready(function() {
    //Init app
    //Set up swiping between pages
    linkPages();

    var renderHeight = $('.vis').height();
    if(renderHeight === 0) {
        renderHeight = DEFAULT_RENDER_HEIGHT;
    }
    $('.contentTop').height(window.innerHeight - 90);

    app = new VisApp(renderHeight);

    //Scrolling
    $('.readMore').on('click', function() {
        $.mobile.silentScroll(window.innerHeight);
    });

    $('.backToTop').on('click', function() {
        $.mobile.silentScroll(0);
    });
});

VisApp.prototype.preProcessData = function () {
    //Interpret data to get percentages, etc.
    //Distribution percentages
    var scales = this.data.scales;
    var scaleAggData = this.data.aggregate["scales"];
    var questionAggData = this.data.aggregate["questions"];
    var scaleInfoData = this.info.scales;
    var percentages = [];
    var distribution;
    var classifications = [], classificationsPercent = [], classData;
    var i, j, k, index, answers, total, allValues;

    for(i in scaleAggData) {
        allValues = 0;
        percentages.length = 0;
        distribution = scaleAggData[i].distribution;
        total = getTotalUsers(distribution);
        for(j in distribution) {
            percentages.push(Math.round((distribution[j].users/total) * 100));
            allValues += (distribution[j].users * distribution[j].value);
        }
        //Copy percent array
        scaleAggData[i].distributionPercent = [];
        for(k in percentages) {
            scaleAggData[i].distributionPercent.push(percentages[k]);
        }
        scaleAggData[i].mean = Math.round(allValues/total);

        //Classifications for this scale
        classData = getItem(scaleInfoData, "name", scaleAggData[i].name);
        if(!classData) {
            console.log("No scale data");
            continue;
        }
        classifications.length = 0;
        for(k=0; k<classData.classifications.length; ++k) classifications.push(0);
        for(j=0; j<scaleAggData[i].distribution.length; ++j) {
            index = classify(classData.classifications, scaleAggData[i].distribution[j].value);
            if(!index) continue;
            classifications[index] += scaleAggData[i].distribution[j].users;
        }
        total = 0;
        classificationsPercent.length = 0;
        for(j in classifications) total += classifications[j];
        for(j in classifications) {
            classificationsPercent.push(Math.round((classifications[j]/total)*100));
            classData.classifications[j].users = classifications[j];
            classData.classifications[j].percent = classificationsPercent[j];
            classData.classifications[j].total = total;
        }
    }

    for(i in questionAggData) {
        total = 0;
        answers = questionAggData[i].distribution;
        for(j in answers) {
            total += answers[j].users;
        }
        for(j in answers) {
            answers[j].percent = Math.round((answers[j].users/total)*100);
        }
        questionAggData[i].total = total;
    }

};

VisApp.prototype.filterData = function(data) {
    //Pre process data
    //Filter data
    //Get geo data
    this.info = info;

    if(!data || !this.info) {
        console.log("No data!");
        return;
    }
    var i = 0;
    this.data = data;
    var _this = this;

    this.preProcessData();

    //DEBUG
    //Ignore locations for now
    /*
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
    */

    //Parse data attributes on each page
    var attributes = $('*[data-type]');

    attributes.each(function() {
        var data, aggData, questionData, infoData, dataType, dataItem, conditional, attribute, match;
        var classification;

        dataType = this.attributes.getNamedItem("data-type").value;
        switch (dataType) {
            case 'questions':
                //Find data item in questions
                data = _this.data[dataType];
                if (data) {
                    dataItem = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                    $(this).html(dataItem[this.attributes.getNamedItem("data-value").value]);
                }
                break;

            case 'questionsReplace':
                aggData = _this.data.aggregate["questions"];
                dataItem = getItem(aggData, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - questionReplace");
                    break;
                }
                //Conditional
                conditional = this.attributes.getNamedItem("data-match");
                if (conditional) {
                    //Matched value is relevant to info file
                    infoData = _this.info["questions"];
                    attribute = getItem(infoData, "name", this.attributes.getNamedItem("data-item").value);
                    var value = attribute.answers[conditional.value];
                    //Find this value in distribution
                    attribute = this.attributes.getNamedItem("data-display").value;
                    for(var j in dataItem.distribution) {
                        if(dataItem.distribution[j].value === value.value) {
                            $(this).html(dataItem.distribution[j][attribute]);
                        }
                    }
                } else {
                    $(this).html(dataItem[this.attributes.getNamedItem("data-display").value]);
                }
                break;

            case 'questionsConditional':
                $(this).hide();
                questionData = _this.data['questions'];
                dataItem = getItem(questionData, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - questionsConditional");
                    break;
                }
                infoData = _this.info["questions"];
                attribute = getItem(infoData, "name", this.attributes.getNamedItem("data-item").value);
                if (!attribute) {
                    console.log("Error - questionsConditional");
                    break;
                }
                match = this.attributes.getNamedItem("data-matchType").value;
                classification = this.attributes.getNamedItem("data-match").value;
                switch (match) {
                    case 'equals':
                        if (dataItem.value === attribute.answers[classification].value) {
                            $(this).show();
                        }
                        break;

                    case 'less':
                        if (dataItem.value < attribute.answers[classification].value) {
                            $(this).show();
                        }
                        break;

                    case 'greater':
                        if (dataItem.value > attribute.answers[classification].value) {
                            $(this).show();
                        }
                        break;

                    default :
                        break;
                }
                break;

            case 'pieChart':
                //See what to represent
                data = _this.data[this.attributes.getNamedItem("data-item").value];
                var userChoice = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!userChoice) {
                    console.log("Error - pieChart");
                    break;
                }
                //Render this choice from info data
                aggData = _this.data.aggregate.questions;
                dataItem = getItem(aggData, "name", this.attributes.getNamedItem("data-value").value);
                if (!dataItem) {
                    console.log("Error - pieChart");
                    break;
                }
                infoData = _this.info.questions;
                if (infoData) {
                    var answers = getItem(infoData, "name", userChoice.name);
                    if (answers) {
                        _this.drawQuestion($(this), userChoice.value, dataItem.distribution, answers.answers);
                    } else {
                        console.log("Error - pieChart");
                        break;
                    }
                }
                break;

            case 'scales':
                data = _this.data[dataType];
                dataItem = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - scales");
                    break;
                }
                $(this).html(dataItem[this.attributes.getNamedItem("data-value").value]);
                break;

            case 'scalesInfo':
                data = _this.info['scales'];
                dataItem = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - scalesInfo");
                    break;
                }
                $(this).html(dataItem[this.attributes.getNamedItem("data-value").value]);
                break;

            case 'scalesConditional':
                $(this).hide();
                data = _this.data['scales'];
                dataItem = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - scalesConditional");
                    break;
                }
                infoData = _this.info['scales'];
                var classifications = getItem(infoData, "name", this.attributes.getNamedItem("data-item").value);
                if (!classifications) {
                    console.log("Error - scalesConditional");
                    break;
                }
                var value = this.attributes.getNamedItem("data-display").value;
                classification = classify(classifications.classifications, dataItem[this.attributes.getNamedItem("data-display").value]);
                match = this.attributes.getNamedItem("data-match").value;
                switch (this.attributes.getNamedItem("data-matchType").value) {
                    case 'equals':
                        if (classification === match) {
                            $(this).show();
                        }
                        break;
                    case 'less':
                        if (classification < match) {
                            $(this).show();
                        }
                        break;
                    case 'greater':
                        if (classification > match) {
                            $(this).show();
                        }
                        break;
                    default:
                        break;
                }
                break;

            case 'scalesReplace':
                data = _this.data['scales'];
                dataItem = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                if (!dataItem) {
                    console.log("Error - scalesReplace");
                    break;
                }

                var dataValue = this.attributes.getNamedItem("data-value");
                if (dataValue) {
                    //Conditional replace
                    infoData = _this.info['scales'];
                    classifications = getItem(infoData, "name", this.attributes.getNamedItem("data-item").value);
                    if (!classifications) {
                        console.log("Error - scalesReplace");
                        break;
                    }
                    dataItem = classifications.classifications[this.attributes.getNamedItem("data-match").value];
                    var userClass = dataItem[this.attributes.getNamedItem("data-display").value];
                    $(this).html(userClass);
                } else {
                    aggData = _this.data.aggregate.scales;
                    dataItem = getItem(aggData, "name", this.attributes.getNamedItem("data-item").value);
                    if (!dataItem) {
                        console.log("Error - scalesReplace");
                        break;
                    }
                    $(this).html(dataItem[this.attributes.getNamedItem("data-display").value]);
                }

                break;

            case 'distribution':
                var type = this.attributes.getNamedItem("data-item").value;
                data = _this.data[type];
                var score = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!score) {
                    console.log("Error - distribution");
                    break;
                }
                data = _this.data.aggregate[type];
                var distData = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!distData) {
                    console.log("Error - distribution");
                    break;
                }
                data = _this.info[type];
                var ranges = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!ranges) {
                    console.log("Error - distribution");
                    break;
                }
                _this.drawDistribution($(this), distData, score.sum, ranges.max, ranges.min, ranges['max-label'], ranges['min-label']);
                break;

            case 'barChart':
                type = this.attributes.getNamedItem("data-item").value;
                data = _this.data[type];
                score = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!score) {
                    console.log("Error - barChart");
                    break;
                }
                data = _this.data.aggregate[type];
                distData = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!distData) {
                    console.log("Error - barChart");
                    break;
                }
                data = _this.info[type];
                ranges = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                if (!ranges) {
                    console.log("Error - barChart");
                    break;
                }
                _this.drawBarChart($(this), distData, score.sum, ranges.max, ranges.min, ranges['max-label'], ranges['min-label']);
                break;

            default:
                console.log("Not a valid data type");
                break;
        }
    });
    /*
    var questions = this.data.questions;
    var aggQuestions = this.data.aggregate.questions;
    if(questions && aggQuestions) {
        var questionName, aggQuestionName;
        for(var question=0; question<this.data.questions.length; ++question) {
            questionName = this.data.questions[question].name;
            //Find this question in aggregates
            aggQuestionName = this.getAggregateQuestion(questionName);
            if(aggQuestionName != null) {
                this.drawQuestion('pieChart', question, this.data.questions[question], aggQuestionName.answers);
            }
        }
    } else {
        this.displayError('No question data!');
        return;
    }

    var scales = this.data.scales;
    var aggScales = this.data.aggregate.scales;
    var infoScales = this.info.scales;
    if(scales && aggScales && infoScales) {
        var currentScale, aggScale, infoScale;
        for(i=0; i<scales.length; ++i) {
            currentScale = scales[i].name;
            //Get this scale in aggregates
            aggScale = this.getAggregateScale(scales[i].name);
            if(aggScale != null) {
                infoScale = this.getInfoScale(scales[i].name);
                if(infoScale != null) {
                    this.updateScores(i, scales[i].sum, infoScale.max);
                    this.drawDistribution('distribution', i, aggScale, scales[i].sum, infoScale.max, infoScale.min);
                    this.drawBarChart("bar", i, aggScales[i], scales[i].sum, infoScale.max, infoScale.min);
                    this.drawScatterPlot("scatter", i, aggScales[i], scales[i].sum, infoScale.max, infoScale.min);
                }
            }
        }
    } else {
        this.displayError('No scale data!');
        return;
    }
    */

    /*
    if(data.distributions) {
        for(i=0; i<data.distributions.length; ++i) {
            this.drawDistribution('distribution'+i, data.distributions[i]);
        }
    }
    */

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
};

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