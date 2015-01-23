/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory


$(document).ready(function() {
    //Initialise app

    var width = 960,
        height = 600,
        svg = d3.select('#graph')
            .append('svg')
            .attr({width: width,
                   height: height});

    var barHeight = 20;

    var y = d3.scale.linear()
        .range([height, 0]);

    d3.tsv("data/data.tsv", type, function(error, data) {
        //DEBUG
        console.log('Loaded data');

        y.domain([0, d3.max(data, function (d) {
            return d.value;
        })]);

        var barWidth = width / data.length;

        var bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(" + i * barWidth + ",0)";
            });

        bar.append("rect")
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("width", barWidth - 1)
            .attr("height", function (d) {
                height - y(d.value)
            });

        bar.append("text")
            .attr("x", barWidth / 2)
            .attr("y", function (d) {
                return y(d.value) + 3;
            })
            .attr("dy", ".75em")
            .text(function (d) {
                return d.value;
            });

    });

    function type(d) {
        d.value = +d.value;
        return d;
    }

    function error() {
        console.log('Error in loading data');
    }
});