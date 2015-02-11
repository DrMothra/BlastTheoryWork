/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory
var margin = {top: 20, right: 60, bottom: 60, left: 80},
    outerWidth = 512,
    innerWidth = outerWidth - margin.left - margin.right,
    outerHeight = 512,
    innerHeight = outerHeight - margin.top - margin.bottom;

var maxMeanValue = 5;

$(document).ready(function() {
    //Init app
    var visApp = new graphApp();
    var dataURL = 'https://kserver.blasttheory.com/user';
    visApp.getData(dataURL);

    //Retrieve data

    var xhr = new XMLHttpRequest(),
        url =

    xhr.onreadystatechange = function () {

        if (xhr.readyState === 4 && xhr.status === 200) {

            // turn the JSON string into a JS object
            var data = JSON.parse(xhr.responseText);
            visualiseData(data);
        }
    };
    xhr.open('POST', url, true);
    // must set content type for POST
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // urlencoded email and password hash
    xhr.send('hash=hashValue&email=user%40domain.com');


    //Visualise the received data
    function visualiseData(data) {
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
            console.log('No aggregate scale data!');
            return;
        }

        //Draw graphs with this data
        var xStart = 0, yStart = 0, numColumns = 2, numRows = userInfo.length/numColumns;

        /*
        for(var row=0; row<numRows; ++row) {
            for (var col = 0; col < numColumns; ++col) {
                drawGraph(xStart, yStart, userInfo[col+(row*2)]);
                xStart += outerWidth;
            }
            xStart = 0;
            yStart += outerHeight;
        }
        */

        for(i=0; i<data.scales.length; ++i) {
            drawGraph(xStart, yStart, userInfo[i]);
        }
    }

    function drawGraph(xPos, yPos, data) {

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
    }

});