/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications

var graphApp = function() {};

graphApp.prototype = {

    constructor: graphApp,

    getData: function(url, callback) {
        //Retrieve data
        if(!url) {
            this.displayError("No data URL specified!");
            return;
        }

        //Retrieve data
        var _this = this;
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4 && xhr.status === 200) {

                // turn the JSON string into a JS object
                var data = JSON.parse(xhr.responseText);
                _this.visualiseData(data);
            }
        };

        xhr.open('POST', url, true);
        // must set content type for POST
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        // urlencoded email and password hash
        xhr.send('hash=hashValue&email=user%40domain.com');
    },

    visualiseData: function(data) {

        //Visualise the received data
        //Get scales and means from data
        var i = 0;
        var userInfo = [];

        if (data.scales) {
            for (i = 0; i < data.scales.length; ++i) {
                var userMeanInfo = {};
                userMeanInfo.name = data.scales[i].name;
                userMeanInfo.userMean = data.scales[i].mean;
                userInfo.push(userMeanInfo);
            }
        } else {
            console.log('No scale data!');
            return;
        }

        var aggScales = data.aggregate.scales ? data.aggregate.scales : null;
        if (aggScales) {
            for (i = 0; i < aggScales.length; ++i) {
                //Assumes arrays in same order - check for this
                userInfo[i].generalMean = aggScales[i].mean;
            }
        } else {
            this.displayError('No aggregate scale data!');
            return;
        }

        //Draw graphs with this data
        var xStart = 0, yStart = 0, numColumns = 2, numRows = userInfo.length/numColumns;

        for(i=0; i<data.scales.length; ++i) {
            this.drawGraph(xStart, yStart, userInfo[i]);
        }
    },

    drawGraph: function(xPos, yPos, data) {
        //Draw graphs from data
        var svg = d3.select('#graph')
            .append('svg')
            .attr({width: outerWidth,
                height: outerHeight})
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var barWidth = 30;
        var interGap = 5;
        var meanData = [data.userMean, data.generalMean];

        var x = d3.scale.linear()
            .range([0, 150]);

        var y = d3.scale.linear()
            .range([innerHeight, 0])
            .domain([0, maxMeanValue]);

        svg.append('text')
            .attr("x", innerWidth/6)
            .text(data.name);

        svg.append("line")
            .attr({x1: 0,
                y1: innerHeight,
                x2: innerWidth/2,
                y2: innerHeight,
                stroke: 'black',
                'stroke-width': 1});

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);

        var bar = svg.selectAll('.bar')
            .data(meanData)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                i+=1.25;
                return "translate(" + i * barWidth + ", 0)";
            })
            .style("fill", function(d, i) {
                if(i%2) {
                    return "steelblue";
                } else {
                    return "red";
                }
            });

        bar.append("rect")
            .attr("y", function(d) { return y(d); })
            .attr("height", function(d) { return innerHeight - y(d); })
            .attr("width", barWidth - interGap);

        bar.append("text")
            .attr("class", "barText")
            .attr("x", barWidth/2)
            .attr("y", function(d) { return y(d)+15; })
            .text(function(d) { return d > 0 ? d : null; });
    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }
};