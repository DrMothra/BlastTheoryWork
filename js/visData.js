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
        var margin = {top: 10, right: 60, bottom: 60, left: 60},
            width = 512,
            height = 400;

        var maxMeanValue = 5;

        var svg = d3.select('#graph')
            .append('svg')
            .attr({width: width,
                height: height});

        var barWidth = 20;

        if(data.scales) {
            var meanData = [0, data.scales[0].mean, 0];
        }

        var x = d3.scale.linear()
            .range([0, 150]);

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, maxMeanValue]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var top = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var axis = svg.append("g")
            .attr("transform", "translate("+ margin.left + "," + height + ")")
            .call(xAxis);


        var bar = top.selectAll('g')
            .data(meanData)
            .enter()
            .append("g")
            .attr("transform", function(d, i) { return "translate(" + i*barWidth + ", 0)"; });

        bar.append("rect")
            .attr("y", function(d) { return y(d); })
            .attr("height", function(d) { return height - y(d); })
            .attr("width", barWidth - 1);

        bar.append("text")
            .attr("x", barWidth/2)
            .attr("y", function(d) { return y(d)+15; })
            .text(function(d) { return d > 0 ? d : null; });
    }

});