/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory


$(document).ready(function() {
    //Retrieve data

    var xhr = new XMLHttpRequest(),
        url = 'https://kserver.blasttheory.com/user';

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
        var margin = {top: 20, right: 60, bottom: 60, left: 80},
            width = 512 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var maxMeanValue = 5;

        var svg = d3.select('#graph')
            .append('svg')
            .attr({width: width + margin.left + margin.right,
                height: height + margin.top + margin.bottom})
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var barWidth = 30;
        var interGap = 5;

        if(data.scales) {
            var meanData = [data.scales[0].mean, 2.5];
        }

        var x = d3.scale.linear()
            .range([0, 150]);

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, maxMeanValue]);

        /*
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        */

        svg.append('text')
            .attr("x", width/6)
            .text(data.scales[0].name);

        svg.append("line")
            .attr({x1: 0,
                y1: height,
                x2: width/2,
                y2: height,
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
            });

        bar.append("rect")
            .attr("class", "bar")
            .attr("y", function(d) { return y(d); })
            .attr("height", function(d) { return height - y(d); })
            .attr("width", barWidth - interGap);

        bar.append("text")
            .attr("x", barWidth/2)
            .attr("y", function(d) { return y(d)+15; })
            .text(function(d) { return d > 0 ? d : null; });
    }

});