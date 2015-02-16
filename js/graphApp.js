/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications

var graphApp = function() {
    //Default values

    //Data requests
    this.dataRequests = [];

    //Graph area
    this.margin = {top: 40, right: 60, bottom: 60, left: 80};
    this.outerWidth = 512;
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right;
    this.outerHeight = 512;
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom;

    //Bar charts
    this.barWidth = 30;
    this.barGap = 5;

    //Colours
    this.colours = ['red'];
};

graphApp.prototype = {

    constructor: graphApp,

    setRenderWidth: function(width) {
        this.outerWidth = width;
    },

    setMargin: function(top, right, bottom, left) {
        this.margin = {top: top, right: right, bottom: bottom, left: left};
    },

    setColours: function(colours) {
        if(!colours || colours.length === 0) {
            this.displayError("Colour array not defined!");
            return;
        } else {
            this.colours = colours.slice();
        }
    },

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

    setDataRequest: function(id, numRequests, callback) {
        //Set data requests for this id
        var requestItem = {};
        requestItem.id = id;
        requestItem.numRequests = numRequests;
        requestItem.received = 0;
        requestItem.callback = callback;
        this.dataRequests.push(requestItem);
    },

    updateDataRequests: function(id) {
        //Add to data requests
        var requests = this.dataRequests;
        for(var i=0; i<requests.length; ++i) {
            if(requests[i].id === id) {
                //Found id for request
                requests[i].received++;
                if(requests[i].received === requests[i].numRequests) {
                    //Call the appropriate callback
                    requests[i].callback.call(this);
                }
                return;
            }
        }
        //Couldn't find id
        console.log("Couldn't find request id");
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
                height: this.outerHeight});

        svg.append('text')
            .attr("x", this.outerWidth/4)
            .attr("y", this.margin.top/2)
            .text(title);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var x = d3.scale.linear()
            .range([0, maxX]);

        var y = d3.scale.linear()
            .range([this.innerHeight, 0])
            .domain([0, maxY]);

        graph.append("line")
            .attr({x1: 0,
                y1: this.innerHeight,
                x2: this.innerWidth,
                y2: this.innerHeight,
                stroke: 'black',
                'stroke-width': 1});

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        graph.append("g")
            .attr("class", "axis")
            .call(yAxis);

        var bar = graph.selectAll('.bar')
            .data(values)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                i+=1.25;
                return "translate(" + i * _this.barWidth + ", 0)";
            })
            .style("fill", function(d, i) {
                return _this.colours[i%_this.colours.length];
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

    drawHorizontalBarChart: function(element, title, keys, values, maxX, maxY) {
        //Draw graph from data
        var _this = this;
        var svg = d3.select('#' + element)
            .append('svg')
            .attr({
                width: this.outerWidth,
                height: this.outerHeight
            });

        var x = d3.scale.linear()
            .range([0, this.innerWidth])
            .domain([0, maxX]);

        var y = d3.scale.linear()
            .range([0, this.innerHeight])
            .domain([0, maxY]);

        svg.append('text')
            .attr("x", this.outerWidth / 4)
            .attr("y", this.margin.top / 2)
            .text(title);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


        var bar = graph.selectAll('.bar')
            .data(values)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * _this.barWidth + ")";
            })
            .style("fill", function(d, i) {
                return _this.colours[i%_this.colours.length];
            });

        bar.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", this.barWidth - this.barGap)
            .attr("width", function(d) {
                return x(d);
            });

        bar.append("text")
            .attr("x", function(d) {
                return x(d) + 5;
            })
            .attr("y", this.barWidth/2)
            .text(function(d) {
                return d;
            });

        bar.append("text")
            .attr("x", -this.margin.left/2)
            .attr("y", this.barWidth/2)
            .text(function(d, i) {
                return keys[i];
            });

    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }
};