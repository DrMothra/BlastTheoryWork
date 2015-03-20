/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications

var graphApp = function() {
    //Default values

    //Data requests
    this.dataRequests = [];

    //Container width
    this.containerWidth = 512;

    //Graph area
    this.margin = {top: 40, right: 60, bottom: 60, left: 80};
    this.outerWidth = 512;
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right;
    this.outerHeight = 760;
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom;

    //Bar charts
    this.barWidth = 30;
    this.barGap = 5;
    this.blankAxis = true;

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

    createSVG: function(element) {
        //Create SVG
        //Use default height but container's width
        this.containerWidth = $('#'+element).width() * 0.01 * window.innerWidth;
        var svg = d3.select('#'+element)
            .append('svg')
            .attr({width: this.containerWidth,
                height: this.outerHeight});

        return svg;
    },

    drawQuestion: function(element, question) {
        //Render the required question and response
        var svg = this.createSVG(element);

        var textPos = this.outerHeight * 0.05;
        var underlinePos = this.outerHeight * 0.08;
        var choicePos = this.outerHeight * 0.18;
        var circlePos = this.outerHeight * 0.5, underline2Pos = this.outerHeight * 0.85, analysisText = this.outerHeight * 0.9;
        if(window.innerHeight < 780) {
            circlePos = this.outerHeight * 0.4;
            underline2Pos = this.outerHeight * 0.6;
            analysisText = this.outerHeight * 0.65;
        }
        var textOffset = 15;

        //Question text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + textPos)
            .attr('font-family', 'verdana')
            .attr('font-size', '16px')
            .attr('stroke', 'none')
            .style('fill', '#FFBBBE')
            .attr('text-anchor', 'middle')
            .text("WHAT DO YOU WANT TO WORK ON?");

        //Underline
        svg.append("line")
            .attr({x1: 0,
                y1: this.margin.top + underlinePos,
                x2: this.containerWidth,
                y2: this.margin.top + underlinePos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //Choice text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + choicePos)
            .attr('font-size', '60px')
            .style('fill', '#EE4355')
            .attr('text-anchor', 'middle')
            .text("CHOICE");

        //User choice
        svg.append('circle')
            .attr("cx", this.containerWidth/2)
            .attr("cy", this.margin.top + circlePos)
            .style("fill", '#EE4355')
            .attr("r", this.containerWidth/2 * 0.8);

        //User text
        svg.append("text")
            .attr("x", this.containerWidth/2)
            .attr("y", this.margin.top + circlePos - textOffset)
            .style("fill", '#FFBBBE')
            .attr('text-anchor', 'middle')
            .attr("font-size", "30px")
            .text("LIFE");

        svg.append("text")
            .attr("x", this.containerWidth/2)
            .attr("y", this.margin.top + circlePos + textOffset)
            .style("fill", '#FFBBBE')
            .attr('text-anchor', 'middle')
            .attr("font-size", "30px")
            .text("GOALS");

        //Underline
        svg.append("line")
            .attr({x1: 0,
                y1: this.margin.top + underline2Pos,
                x2: this.containerWidth,
                y2: this.margin.top + underline2Pos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //Analysis text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + analysisText)
            .attr('font-size', '16px')
            .style('fill', '#FFBBBE')
            .attr('text-anchor', 'middle')
            .text("ANALYSIS");
    },

    drawResponse: function(element, response) {
        //Render given responses
        var svg = this.createSVG(element);

        //Render responses
        var circleXPos = 0.2;
        var circleYPos = [0.275, 0.45, 0.625];
        var smallRadius = 55, largeRadius = 200;
        svg.append("circle")
            .attr("cx", this.outerWidth * circleXPos)
            .attr("cy", this.outerHeight * circleYPos[0])
            .attr("r", smallRadius)
            .style("fill", '#EE4355');

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[0]-5)
            .style("fill", '#FFBBBE')
            .attr('text-anchor', 'middle')
            .attr("font-size", "15px")
            .text("LIFE GOALS");

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[0]+20)
            .style("fill", '#FFBBBE')
            .attr('text-anchor', 'middle')
            .attr("font-size", "22px")
            .text("43%");

        svg.append("circle")
            .attr("cx", this.outerWidth * circleXPos)
            .attr("cy", this.outerHeight * circleYPos[1])
            .attr("r", smallRadius)
            .style("fill", '#cee4b5');

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[1]-5)
            .style("fill", '#9dc56d')
            .attr('text-anchor', 'middle')
            .attr("font-size", "12px")
            .text("RELATIONSHIPS");

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[1]+20)
            .style("fill", '#9dc56d')
            .attr('text-anchor', 'middle')
            .attr("font-size", "22px")
            .text("44%");

        svg.append("circle")
            .attr("cx", this.outerWidth * circleXPos)
            .attr("cy", this.outerHeight * circleYPos[2])
            .attr("r", smallRadius)
            .style("fill", '#e7f1d9');

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[2]-5)
            .style("fill", '#9dc56d')
            .attr('text-anchor', 'middle')
            .attr("font-size", "15px")
            .text("CONTROL");

        svg.append("text")
            .attr("x", this.outerWidth * circleXPos)
            .attr("y", this.outerHeight * circleYPos[2]+20)
            .style("fill", '#9dc56d')
            .attr('text-anchor', 'middle')
            .attr("font-size", "22px")
            .text("13%");

        //Pie chart
        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(this.containerWidth/2 * 0.675);

        var pie = d3.layout.pie();
        //var color = d3.scale.category10();
        var color = ['#EE4355', '#cee4b5', '#e7f1d9'];
        //DEBUG
        console.log("Colour =", color);

        var values = [43, 44, 13];

        var arcs = svg.selectAll("g.arc")
            .data(pie(values))
            .enter()
            .append("g")
            .attr("transform", "translate(" + this.containerWidth/1.55 + "," + this.innerHeight/1.9 + ")");

        //Draw arc paths
        arcs.append("path")
            .attr("transform", "rotate(-158)")
            .attr("fill", function(d, i) {
                return color[i];
            })
            .attr("d", arc);
    },

    drawDistributionQuestion: function(element, data) {
        var svg = this.createSVG(element);

        var textPos = this.outerHeight * 0.05;
        var underlinePos = this.outerHeight * 0.08;
        var choicePos = this.outerHeight * 0.18;
        var circlePos = this.outerHeight * 0.5, underline2Pos = this.outerHeight * 0.85, analysisText = this.outerHeight * 0.9;
        if(window.innerHeight < 780) {
            circlePos = this.outerHeight * 0.4;
            underline2Pos = this.outerHeight * 0.6;
            analysisText = this.outerHeight * 0.65;
        }
        var textOffset = 15;

        //Question text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + textPos)
            .attr('font-family', 'verdana')
            .attr('font-size', '16px')
            .attr('stroke', 'none')
            .style('fill', '#FFBBBE')
            .attr('text-anchor', 'middle')
            .text("WHAT DO YOU VALUE?");

        //Underline
        svg.append("line")
            .attr({x1: 0,
                y1: this.margin.top + underlinePos,
                x2: this.containerWidth,
                y2: this.margin.top + underlinePos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //Choice text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + choicePos)
            .attr('font-size', '60px')
            .style('fill', '#EE4355')
            .attr('text-anchor', 'middle')
            .text("SCORE");

        //User choice
        svg.append('circle')
            .attr("cx", this.containerWidth/2)
            .attr("cy", this.margin.top + circlePos)
            .style("fill", '#EE4355')
            .attr("r", this.containerWidth/2 * 0.8);

        //User text
        svg.append("text")
            .attr("x", this.containerWidth/2)
            .attr("y", this.margin.top + circlePos - textOffset)
            .style("fill", '#FFBBBE')
            .attr('text-anchor', 'middle')
            .attr("font-size", "30px")
            .text(3.7);

        //Underline
        svg.append("line")
            .attr({x1: 0,
                y1: this.margin.top + underline2Pos,
                x2: this.containerWidth,
                y2: this.margin.top + underline2Pos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //Analysis text
        svg.append('text')
            .attr('x', this.containerWidth/2)
            .attr('y', this.margin.top + analysisText)
            .attr('font-size', '16px')
            .style('fill', '#FFBBBE')
            .attr('text-anchor', 'middle')
            .text("ANALYSIS");
    },

    drawBarChart: function(element, title, values, maxX, maxY, showxAxis, showyAxis) {
        //Draw graphs from data
        var _this = this;

        var svg = this.createSVG(element);

        svg.append('text')
            .attr("x", this.outerWidth/4)
            .attr("y", this.margin.top/2)
            .text(title);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var x = d3.scale.linear()
            .range([0, this.innerWidth])
            .domain([0, maxX]);

        var y = d3.scale.linear()
            .range([this.innerHeight, 0])
            .domain([0, maxY]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(maxX);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(maxY);

        if(showxAxis) {
            graph.append("g")
                .attr("transform", "translate(0," + this.innerHeight + ")")
                .attr("class", "axis")
                .call(xAxis);
        } else if(this.blankAxis) {
            graph.append("line")
                .attr({x1: 0,
                    y1: this.innerHeight,
                    x2: this.innerWidth,
                    y2: this.innerHeight,
                    stroke: 'black',
                    'stroke-width': 1});
        }
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

        var transit = bar.append("rect")
            .attr("y", function(d) { return y(d); })
            .attr("height", 0)
            .attr("width", this.barWidth - this.barGap);

        transit.transition()
            .duration(3000)
            .attr("height", function(d) {
                return _this.innerHeight - y(d);
            });

        bar.append("text")
            .attr("class", "barText")
            .attr("x", this.barWidth/2)
            .attr("y", function(d) { return y(d)+15; })
            .text(function(d) { return d > 0 ? d : null; });
    },

    drawHorizontalBarChart: function(element, title, keys, values, maxY) {
        //Draw graph from data
        var maxX = d3.max(values);
        var _this = this;
        var svg = this.createSVG(element);

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

    drawPieChart: function(element, title, values) {
        //Draw pie chart at given element
        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(this.innerWidth/2);

        var pie = d3.layout.pie();

        //Easy colors accessible via a 10-step ordinal scale
        var color = d3.scale.category10();

        var arcs = graph.selectAll("g.arc")
            .data(pie(values))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + this.innerWidth/2 + "," + this.innerWidth/2 + ")");

        //Draw arc paths
        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

        arcs.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.value;
            });
    },

    drawScatterPlot: function(element, title, values, maxX, maxY) {
        //Draw scatter from values
        var _this = this;

        var svg = this.createSVG(element);

        svg.append('text')
            .attr("x", this.outerWidth/4)
            .attr("y", this.margin.top/2)
            .text(title);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var x = d3.scale.linear()
            .range([0, this.innerWidth])
            .domain([0, maxX]);

        var y = d3.scale.linear()
            .range([this.innerHeight, 0])
            .domain([0, maxY]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(maxX);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(maxY);

        graph.append("g")
            .attr("transform", "translate(0," + this.innerHeight + ")")
            .attr("class", "axis")
            .call(xAxis);

        graph.append("g")
            .attr("class", "axis")
            .call(yAxis);

        var scatter = graph.selectAll('.scatter')
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

        var transit = scatter.append("circle")
            .attr("cy", function(d) {
                return y(d);
            })
            .attr('r', 0);

        transit.transition()
            .duration(3000)
            .attr('r', 7);
    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }
};