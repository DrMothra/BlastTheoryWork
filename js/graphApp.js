/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications

var graphApp = function() {
    //Default values
    //Graph area
    this.margin = {top: 20, right: 60, bottom: 60, left: 80};
    this.outerWidth = 512;
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right;
    this.outerHeight = 512;
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom;

    //Bar charts
    this.barWidth = 30;
    this.barGap = 5;
};

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
                callback ? callback.call(_this, data) : _this.visualiseData(data);
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

    },

    drawBarChart: function(element, title, values, maxX, maxY) {
        //Draw graphs from data
        var _this = this;
        var svg = d3.select('#'+element)
            .append('svg')
            .attr({width: this.outerWidth,
                height: this.outerHeight})
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var x = d3.scale.linear()
            .range([0, maxX]);

        var y = d3.scale.linear()
            .range([this.innerHeight, 0])
            .domain([0, maxY]);

        svg.append('text')
            .attr("x", this.innerWidth/6)
            .text(title);

        svg.append("line")
            .attr({x1: 0,
                y1: this.innerHeight,
                x2: this.innerWidth/2,
                y2: this.innerHeight,
                stroke: 'black',
                'stroke-width': 1});

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);

        var bar = svg.selectAll('.bar')
            .data(values)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                i+=1.25;
                return "translate(" + i * _this.barWidth + ", 0)";
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
            .attr("height", function(d) { return _this.innerHeight - y(d); })
            .attr("width", this.barWidth - this.barGap);

        bar.append("text")
            .attr("class", "barText")
            .attr("x", this.barWidth/2)
            .attr("y", function(d) { return y(d)+15; })
            .text(function(d) { return d > 0 ? d : null; });
    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }
};