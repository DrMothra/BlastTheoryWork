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
    this.margin = {top: 20, right: 0, bottom: 20, left: 20};
    this.outerWidth = 512;
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right;
    this.outerHeight = 768;
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
        var elem = $('#'+element);
        //this.containerWidth = elem.width() <= 100 ? elem.width() * 0.01 * window.innerWidth : elem.width();
        var svg = d3.select('#'+element)
            .append('svg')
            .attr({width: window.innerWidth,
                height: window.innerHeight*0.99});

        return svg;
    },

    removeSVG: function(id) {
        if(id != -1 && id != null) {
            d3.selectAll('#'+id).remove();
        }
    },

    drawLineBackground: function(element, width, height) {
        //Add line background to existing svg content
        var numLines = 9;
        var lineGap = 50;
        var startX = 0.37 * width;
        var startY = 0.15 * height;

        for(var i=0; i<numLines; ++i) {
            element.append("line")
                .attr({x1: startX,
                    y1: startY + (lineGap*i),
                    x2: width * 0.9,
                    y2: startY + (lineGap*i),
                    stroke: '#9dc56d',
                    'stroke-width': 1,
                    'stroke-dasharray': '3,3'});
        }

        //Draw scale
        element.append("text")
            .attr("x", width*0.45)
            .attr("y", startY + (lineGap*9))
            .attr('font-family', 'quicksandregular')
            .attr('font-size', '1.2em')
            .attr('font-weight', 'bold')
            .attr('stroke', 'none')
            .style('fill', '#bcebc1')
            .text("1");

        element.append("line")
            .attr({x1: width*0.5,
                y1: startY + (lineGap*8.85),
                x2: width*0.8,
                y2: startY + (lineGap*8.85),
                stroke: '#9dc56d',
                'stroke-width': 1,
                'stroke-dasharray': '3,3'});

        element.append("text")
            .attr("x", width*0.85)
            .attr("y", startY + (lineGap*9))
            .attr('font-family', 'quicksandregular')
            .attr('font-size', '1.2em')
            .attr('font-weight', 'bold')
            .attr('stroke', 'none')
            .style('fill', '#bcebc1')
            .text("5");
    },

    drawNormalDistribution: function(element, currentMean, width, height) {
        //Draw normal distribution curve
        //Draw normal curve
        var normalData = [];
        getData();

        var x = d3.scale.linear()
            .range([width * 0.3, width * 0.95]);

        var y = d3.scale.linear()
            .range([height * 0.85, height * 0.15]);

        var line = d3.svg.line()
            .x(function(d) {
                return x(d.q);
            })
            .y(function(d) {
                return y(d.p);
            });

        x.domain(d3.extent(normalData, function(d) {
            return d.q;
        }));
        y.domain(d3.extent(normalData, function(d) {
            return d.p;
        }));

        element.append("path")
            .datum(normalData)
            .style('fill', 'none')
            .style("stroke", this.colours[0])
            .style("stroke-width", "2px")
            .style("stroke-dasharray", ("3,3"))
            .attr("d", line);

        function getData() {

            // loop to populate data array with
            // probabily - quantile pairs
            var q, p, el;
            for (var i = 0; i < 10000; i++) {
                q = normal(); // calc random draw from normal dist
                p = gaussian(q); // calc prob of rand draw
                el = {
                    "q": q,
                    "p": p
                };
                normalData.push(el)
            }

            // need to sort for plotting
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            normalData.sort(function(x, y) {
                return x.q - y.q;
            });
        }

        // Sample from a normal distribution with mean 0, stddev 1.
        function normal() {
            var x = 0,
                y = 0,
                rds, c;
            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                rds = x * x + y * y;
            } while (rds == 0 || rds > 1);
            c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
            return x * c; // throw away extra sample y * c
        }

        //taken from Jason Davies science library
        // https://github.com/jasondavies/science.js/
        function gaussian(x) {
            var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
                mean = currentMean,
                sigma = 1;

            x = (x - mean) / sigma;
            return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
        }
    },

    drawQuestion: function(element, data, pageIndex) {
        //Render the required question and response
        var svg = this.createSVG(element);

        //Get relevant data
        var questions = data.questions[pageIndex];

        //Insert user questions into page
        $('#currentQuestion'+pageIndex).html(questions.question);
        var splitAnswer = questions.answer.split(" ");
        var answerHTML = '';
        for(var i=0; i<splitAnswer.length; ++i) {
            answerHTML += splitAnswer[i] + '<br>';
        }
        $('#userAnswer'+pageIndex).html(answerHTML);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var portrait = false;
        var width = window.innerWidth - this.margin.left - this.margin.right , height = window.innerHeight - this.margin.top - this.margin.bottom;
        var underlineTopPos = height * 0.13;
        var circlePosY = height * 0.45, circlePosX = width * 0.13, underlineBottomPos = height * 0.65;
        var circleRadius = height * 0.17;
        if(width < height) {
            portrait = true;
            circleRadius = width * 0.12;
            circlePosY = height * 0.41;
            circlePosX = width * 0.12;
            underlineTopPos = height * 0.24;
            underlineBottomPos = height * 0.53;
        }
        //Adjustments for mobiles
        if(window.innerWidth <= 800 && window.innerHeight <=480) {
            circlePosX = width * 0.11;
        }

        //Underline
        graph.append("line")
            .attr({x1: 0,
                y1: underlineTopPos,
                x2: width * 0.24,
                y2: underlineTopPos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //User choice
        /*
        graph.append('circle')
            .attr("cx", circlePosX)
            .attr("cy", circlePosY)
            .style("fill", '#EE4355')
            .attr("r", circleRadius);
        */

        //Underline
        graph.append("line")
            .attr({x1: 0,
                y1: underlineBottomPos,
                x2: width * 0.24,
                y2: underlineBottomPos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //Render given responses
        var circleXPos = 0.465;
        var circleYPos = [0.285, 0.475, 0.66];
        var smallRadius = height * 0.05;
        var pieRadius = height * 0.3;
        var pieHeight = height * 0.47;
        if(portrait) {
            smallRadius = height * 0.04;
            pieRadius = height * 0.15;
            circleYPos = [0.33, 0.43, 0.53];
            pieHeight = height * 0.43;
        }

        //Adjustments for mobiles
        if(window.innerWidth <= 800 && window.innerHeight <=480) {
            smallRadius = height * 0.09;

        }
        //Fill in user responses
        var responseNumber = pageIndex*3;
        var responses = data.responses;
        $('#firstResponse'+pageIndex).html(responses[responseNumber].question + '<br>');
        $('#secondResponse'+pageIndex).html(responses[responseNumber+1].question + '<br>');
        $('#thirdResponse'+pageIndex).html(responses[responseNumber+2].question + '<br>');

        $('#firstResponsePercent'+pageIndex).html(responses[responseNumber].value + '%');
        $('#secondResponsePercent'+pageIndex).html(responses[responseNumber+1].value + '%');
        $('#thirdResponsePercent'+pageIndex).html(responses[responseNumber+2].value + '%');

        svg.append("circle")
            .attr("cx", width * circleXPos)
            .attr("cy", height * circleYPos[0])
            .attr("r", smallRadius)
            .style("fill", '#EE4355');

        svg.append("circle")
            .attr("cx", width * circleXPos)
            .attr("cy", height * circleYPos[1])
            .attr("r", smallRadius)
            .style("fill", '#cee4b5');

        svg.append("circle")
            .attr("cx", width * circleXPos)
            .attr("cy", height * circleYPos[2])
            .attr("r", smallRadius)
            .style("fill", '#e7f1d9');

        //Pie chart
        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var pie = d3.layout.pie();
        //var color = d3.scale.category10();
        var color = ['#EE4355', '#cee4b5', '#e7f1d9'];

        var values = [43, 44, 13];

        var arcs = svg.selectAll("g.arc")
            .data(pie(values))
            .enter()
            .append("g")
            .attr("transform", "translate(" + width * 0.77 + "," + pieHeight + ")");

        //Draw arc paths
        arcs.append("path")
            .attr("transform", "rotate(-158)")
            .attr("fill", function(d, i) {
                return color[i];
            })
            .attr("d", arc);

        var lineXStart = width * 0.53;
        var yOffsets = [0.28, 0.475, 0.66];
        var lineWidths = [0.25, 0.2, 0.25];
        if(portrait) {
            lineXStart = width * 0.54;
            lineWidths = [0.25, 0.2, 0.25];
            yOffsets = [0.33, 0.425, 0.53];
        }
        svg.append("line")
            .attr({x1: lineXStart,
                y1: height * yOffsets[0],
                x2: lineXStart + width * lineWidths[0],
                y2: height * yOffsets[0],
                stroke: '#EE4355',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        svg.append("line")
            .attr({x1: lineXStart,
                y1: height * yOffsets[1],
                x2: lineXStart + width * lineWidths[1],
                y2: height * yOffsets[1],
                stroke: '#e7f1d9',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        svg.append("line")
            .attr({x1: lineXStart,
                y1: height * yOffsets[2],
                x2: lineXStart + width * lineWidths[2],
                y2: height * yOffsets[2],
                stroke: '#e7f1d9',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});
    },

    drawDistribution: function(element, data) {
        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var portrait = false;
        var width = window.innerWidth - this.margin.left - this.margin.right , height = window.innerHeight - this.margin.top - this.margin.bottom;

        var underlineTopPos = height * 0.1;
        var circlePosY = height * 0.43, underlineBottomPos = height * 0.62;
        var circlePosX = width * 0.12;
        var circleRadius = height * 0.17;
        if(width < height) {
            portrait = true;
            underlineTopPos = height * 0.25;
            underlineBottomPos = height * 0.53;
            circleRadius = height * 0.08;
            circlePosX = width * 0.115;
            circlePosY = height * 0.41;
        }
        //Top Underline
        graph.append("line")
            .attr({x1: 0,
                y1: underlineTopPos,
                x2: width * 0.24,
                y2: underlineTopPos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        //User choice
        graph.append('circle')
            .attr("cx", circlePosX)
            .attr("cy", circlePosY)
            .style("fill", '#EE4355')
            .attr("r", circleRadius);

        //Underline
        graph.append("line")
            .attr({x1: 0,
                y1: underlineBottomPos,
                x2: width * 0.24,
                y2: underlineBottomPos,
                stroke: '#FFBBBE',
                'stroke-width': 3});

        this.drawLineBackground(graph, width, height);
        this.colours = ['#bcebc1'];
        this.drawNormalDistribution(graph, 0, width, height);
        this.colours = ['#b7d690'];
        this.drawNormalDistribution(graph, 0.75, width, height);

        //Draw user score indication
        var yourScoreY = height * 0.43;
        if(portrait) {
            yourScoreY = height * 0.42;
        }
        graph.append("line")
            .attr({x1: width * 0.695,
                y1: this.margin.top,
                x2: width * 0.695,
                y2: height * 0.9,
                stroke: '#ef5f68',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        graph.append("circle")
            .attr("cx", width * 0.695)
            .attr("cy", yourScoreY)
            .style('fill', '#ef5f68')
            .attr('r', width *0.04);

        var topLinePos = height * 0.32;
        var bottomLinePos = height * 0.52;

        svg.append("line")
            .attr({x1: width * 0.945,
                y1: topLinePos,
                x2: width * 0.995,
                y2: topLinePos,
                stroke: '#9dc56d',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        svg.append("line")
            .attr({x1: width * 0.945,
                y1: bottomLinePos,
                x2: width * 0.995,
                y2: bottomLinePos,
                stroke: '#c0e9bd',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});
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