/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory


$(document).ready(function() {
    //Initialise app

    var margin = {top: 60, right: 20, bottom: 30, left: 60},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select('#graph')
        .append('svg')
        .attr({width: width + margin.left + margin.right,
            height: height + margin.top + margin.bottom});

    var barWidth = 20;
    var responseKey = [ 'strongly disagree', 'disagree', 'neither agree or disagree', 'agree', 'strongly agree' ];
    var data = [0, 10, 0, 0, 0];

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 10]);

    var top = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = top.selectAll('g')
        .data(data)
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
        .text(function(d) { return d; });
});