/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory
//Data type id's
var COUNTRY = 0;
var NUM_PAGES = 15;
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
            "question": "WHAT DO YOU WANT TO WORK ON?",
            "answer": "LIFE GOALS"
        },
        {
            "question": "WHAT DO YOU WANT TO WORK ON?",
            "answer": "LIFE GOALS"
        }
    ],

    "responses":  [
     [
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
        }
    ],

    [
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
            "value": 34
        },
        {
            "question": "NONSENSE",
            "value": 10
        }
    ],
    [
        {
            "question": "CONTROL",
            "value": 13
        },
        {
            "question": "LIFE GOALS",
            "value": 37
        },
        {
            "question": "RELATIONSHIPS",
            "value": 35
        },
        {
            "question": "NONSENSE",
            "value": 15
        },
        {
            "question": "NONSENSE2",
            "value": 10
        }
    ]],

    "distributions": [
        {
            "question": "What do you value?",
            "score": 3.7
        },
        {
            "question": "What do you value?",
            "score": 3.7
        },
        {
            "question": "What do you value?",
            "score": 3.7
        }
    ]
};

function getItem(data, key, item) {
    //See if item in data
    for(var i in data) {
        if(data[i][key] === item) {
            return data[i];
        }
    }
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

function linkPages(numPages) {
    //Set up swiping between pages
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
}

function classifyType(type) {
    //Do this properly
    var labels=['LOW', 'UNSURE', 'HIGH'];
    for(var i in labels) {
        if(type === labels[i]) {
            return i;
        }
    }
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

$(document).ready(function() {
    //Init app
    var pageElem = $(".subPageTop");
    var renderHeight = $('.contentTop').height();
    if(renderHeight === 0) {
        renderHeight = 230;
    }
    pageElem.height(window.innerHeight);

    //Set up swiping between pages
    linkPages(NUM_PAGES);

    //Scrolling
    $('.readMore').on('click', function() {
        $.mobile.silentScroll(window.innerHeight);
    });

    $('.backToTop').on('click', function() {
        $.mobile.silentScroll(0);
    });

    var app = new VisApp(renderHeight);

    //Get some data
    app.readInfoFile("data/info.json", function(info) {
        app.info = info;
        app.readDataFile("data/example.json", function(data) {
            app.filterData(data);
        });
    });

    //Get scale and distribution data
    //DEBUG
    //Use fake data for now
    /*
    var dataURL = 'https://kserver.blasttheory.com/user';
    visApp.getData(dataURL, filterData);
    */

    //filterData.call(visApp, data);
});

VisApp.prototype.preProcessData = function () {
    //Interpret data to get percentages, etc.
    //Distribution percentages
    var scales = this.data.scales;
    var scaleData = this.data.aggregate["scales"];
    var scaleInfoData = this.info.scales;
    var percentages = [];
    var distribution;
    var classifications = [], classificationsPercent = [], classData;
    var i, j, x, index, currentScale, total, allValues;

    for(i in scaleData) {
        allValues = 0;
        distribution = scaleData[i].distribution;
        total = getTotalUsers(distribution);
        for(j in distribution) {
            percentages.push((distribution[j].users/total) * 100);
            allValues += (distribution[j].users * distribution[j].value);
        }
        scaleData[i].distributionPercent = percentages;
        scaleData[i].mean = allValues/total;

        //Classifications for this scale
        classData = getItem(scaleInfoData, "name", scaleData[i].name);
        classifications.length = 0;
        for(x=0; x<classData.classifications.length; ++x) classifications.push(0);
        for(j=0; j<scaleData[i].distribution.length; ++j) {
            index = classify(classData.classifications, scaleData[i].distribution[j].value);
            classifications[index] += scaleData[i].distribution[j].users;
        }
        total = 0;
        for(j in classifications) total += classifications[j];
        for(j in classifications) {
            classificationsPercent.push((classifications[j]/total)*100);
            classData.classifications[j].users = classifications[j];
            classData.classifications[j].percent = classificationsPercent[j];
        }
    }

};

VisApp.prototype.filterData = function(data) {
    //Pre process data
    //Filter data
    //Get geo data
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
    for(i=1; i<NUM_PAGES; ++i) {
        var pageAttributes = $('#page' + i +' *[data-type]');
        if(pageAttributes) {
            var dataType, data, scales, type, score, distData, ranges, classifications,
                question, userClass, comparator, classIndex;
            pageAttributes.each(function(i) {
                dataType = this.attributes.getNamedItem("data-type").value;
                switch(dataType) {
                    case 'questions':
                        //Find data item in questions
                        data = _this.data[dataType];
                        if(data) {
                            var questionText = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                            $(this).html(questionText.value);
                        }
                        break;

                    case 'questionsReplace':
                        data = _this.data['questions'];
                        question = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        data = _this.info["questins"];
                        answers = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        comparator = this.attributes.getNamedItem("data-matchType").value;
                        userClass = this.attributes.getNamedItem("data-match").value;
                        switch(comparator) {
                            case 'equals':
                                if(question.value === answers[userClass].label) {
                                    $(this).html(answers[userClass].label);
                                }
                                break;

                            case 'less':
                                if(question.value < answers[userClass].label) {
                                    $(this).html(answers[userClass].label);
                                }
                                break;

                            case 'greater':
                                if(question.value > answers[userClass].label) {
                                    $(this).html(answers[userClass].label);
                                }
                                break;

                            default :
                                break;
                        }
                        break;

                    case 'questionsConditional':
                        $(this).hide();
                        data = _this.data['questions'];
                        question = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        data = _this.info["questins"];
                        answers = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        comparator = this.attributes.getNamedItem("data-matchType").value;
                        userClass = this.attributes.getNamedItem("data-match").value;
                        switch(comparator) {
                            case 'equals':
                                if(question.value === answers[userClass].label) {
                                    $(this).show();
                                }
                                break;

                            case 'less':
                                if(question.value < answers[userClass].label) {
                                    $(this).show();
                                }
                                break;

                            case 'greater':
                                if(question.value > answers[userClass].label) {
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
                        //Render this choice from aggregate data
                        data = _this.data.aggregate.questions;
                        if(data) {
                            var answers = getItem(data, "name", userChoice.name);
                            if(answers) {
                                _this.drawQuestion($(this), userChoice.value, answers.answers);
                            }
                        }
                        break;

                    case 'scales':
                        data = _this.data[dataType];
                        scales = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        $(this).html(scales[this.attributes.getNamedItem("data-value").value]);
                        break;

                    case 'scalesInfo':
                        data = _this.info['scales'];
                        scales = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        $(this).html(scales[this.attributes.getNamedItem("data-value").value]);
                        break;

                    case 'scalesConditional':
                        $(this).hide();
                        data = _this.data['scales'];
                        score = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        data = _this.info['scales'];
                        classifications = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        userClass = classify(classifications.classifications, score.sum);
                        classIndex = classifyType(this.attributes.getNamedItem("data-match").value);
                        switch(this.attributes.getNamedItem("data-matchType").value) {
                            case 'equals':
                                if(userClass === classIndex) {
                                    $(this).show();
                                }
                                break;
                            case 'less':
                                if(userClass < classIndex) {
                                    $(this).show();
                                }
                                break;
                            case 'greater':
                                if(userClass > classIndex) {
                                    $(this).show();
                                }
                                break;
                            default:
                                break;
                        }
                        break;

                    case 'scalesReplace':
                        data = _this.data['scales'];
                        score = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        data = _this.info['scales'];
                        classifications = getItem(data, "name", this.attributes.getNamedItem("data-item").value);
                        userClass = classify(classifications.classifications, score.sum);
                        classIndex = classifyType(this.attributes.getNamedItem("data-match").value);
                        switch(this.attributes.getNamedItem("data-matchType").value) {
                            case 'equals':
                                if(userClass === classIndex) {
                                    $(this).html(classifications.classifications[classIndex][this.attributes.getNamedItem("data-display").value]);
                                }
                                break;
                            case 'less':
                                if(userClass < classIndex) {
                                    $(this).html(classifications.classifications[classIndex].this.attributes.getNamedItem("data-display").value);
                                }
                                break;
                            case 'greater':
                                if(userClass > classIndex) {
                                    $(this).html(classifications.classifications[classIndex].this.attributes.getNamedItem("data-display").value);
                                }
                                break;
                            default:
                                break;
                        }
                        break;

                    case 'distribution':
                        type = this.attributes.getNamedItem("data-item").value;
                        data = _this.data[type];
                        score = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        data = _this.data.aggregate[type];
                        distData = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        data = _this.info[type];
                        ranges = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        _this.drawDistribution($(this), distData, score.sum, ranges.max, ranges.min);
                        break;

                    case 'barChart':
                        type = this.attributes.getNamedItem("data-item").value;
                        data = _this.data[type];
                        score = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        data = _this.data.aggregate[type];
                        distData = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        data = _this.info[type];
                        ranges = getItem(data, "name", this.attributes.getNamedItem("data-value").value);
                        _this.drawBarChart($(this), distData, score.sum, ranges.max, ranges.min);
                        break;

                    default:
                        break;
                }
            });
        }
    }

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