/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications
function radiansToDegrees(rads) {
    return 180/Math.PI * rads;
}
function getAngle(vec0, vec1) {
    //Dot
    var dot = vec0.dot(vec1);
    var cos0 = dot/(vec0.length() * vec1.length());
    return Math.acos(cos0);
}
var graphApp = function(renderHeight) {
    //Default values
    this.renderHeight = renderHeight;
    //Data requests
    this.dataRequests = [];

    //Container width
    this.containerWidth = 512;

    //Graph area
    this.margin = {top: 0, right: 0, bottom: 0, left: 0};
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
        //Use element dimensions
        var elem = $('#'+element);
        this.containerWidth = elem.width() <= 100 ? elem.width() * 0.01 * window.innerWidth : elem.width();
        this.containerHeight = this.renderHeight;

        var svg = d3.select('#'+element)
            .append('svg')
            .attr({width: this.containerWidth,
                height: this.containerHeight});

        return svg;
    },

    removeSVG: function(id) {
        if(id != -1 && id != null) {
            d3.selectAll('#'+id).remove();
        }
    },

    drawLineBackground: function(element, width, height) {
        //Add line background to existing svg content
        var numLines = 6;
        var startX = 0.1 * width;
        var startY = 0.1 * height, endY = 0.7 * height;
        var lineGap = (endY - startY)/numLines;

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
    },

    drawNormalDistribution: function(element, currentMean, width, height) {
        //Draw normal distribution curve
        //Draw normal curve
        var normalData = [];
        getData();

        var xRangeMin = width * 0.1, xRangeMax = width * 0.9;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax]);

        var yRangeMin = height * 0.55, yRangeMax = height * 0.05;
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax]);

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
        var i;
        var svg = this.createSVG(element);

        //Get relevant data
        var questions = data.questions[pageIndex];

        //Insert user questions into page
        $('#currentQuestion'+pageIndex).html(questions.question);
        var splitAnswer = questions.answer.split(" ");
        var answerHTML = '';
        for(i=0; i<splitAnswer.length; ++i) {
            answerHTML += splitAnswer[i] + '<br>';
        }
        $('#userAnswer'+pageIndex).html(answerHTML);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Render given responses
        //DEBUG
        var values = [43, 44, 13];
        var responseNumber = pageIndex*3;
        var responses = data.responses;
        for(i=0; i<responses.length; ++i) {
            if(responses[i].question === questions.answer) {
                //DEBUG
                console.log("You chose", questions.answer);
                break;
            }
        }
        //DEBUG
        console.log("Answer number =", i);

        $('#firstResponse'+pageIndex).html(responses[responseNumber].question);
        $('#secondResponse'+pageIndex).html(responses[responseNumber+1].question);
        $('#thirdResponse'+pageIndex).html(responses[responseNumber+2].question);

        $('#firstResponsePercent'+pageIndex).html(responses[responseNumber].value + '%');
        $('#secondResponsePercent'+pageIndex).html(responses[responseNumber+1].value + '%');
        $('#thirdResponsePercent'+pageIndex).html(responses[responseNumber+2].value + '%');


        var smallCircleXPos = width * 0.9;
        var smallCircleYPos = [0.2 * height, 0.46 * height, 0.7 * height];
        var smallRadius = height * 0.06;

        svg.append("circle")
            .attr("cx", smallCircleXPos)
            .attr("cy", smallCircleYPos[0])
            .attr("r", smallRadius)
            .style("fill", '#e7f1d9');

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[0])
            .style("text-anchor", "middle")
            .style("fill", "#b7d690")
            .attr("class", "quicksand heavy normalSizeText")
            .text("13%");

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[0] + smallRadius)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#b7d690")
            .attr("class", "quicksand heavy normalSizeText")
            .text("CONTROL");

        svg.append("circle")
            .attr("cx", smallCircleXPos)
            .attr("cy", smallCircleYPos[1])
            .attr("r", smallRadius)
            .style("fill", '#EE4355');

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[1])
            .style("text-anchor", "middle")
            .style("fill", "#FFBBBE")
            .attr("class", "quicksand heavy normalSizeText")
            .text("43%");

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[1] + smallRadius)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#FFBBBE")
            .attr("class", "quicksand heavy normalSizeText")
            .text("LIFE GOALS");

        svg.append("circle")
            .attr("cx", smallCircleXPos)
            .attr("cy", smallCircleYPos[2])
            .attr("r", smallRadius)
            .style("fill", '#e7f1d9');

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[2])
            .style("text-anchor", "middle")
            .style("fill", "#b7d690")
            .attr("class", "quicksand heavy normalSizeText")
            .text("44%");

        svg.append('text')
            .attr("x", smallCircleXPos)
            .attr("y", smallCircleYPos[2] + smallRadius)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#b7d690")
            .attr("class", "quicksand heavy normalSizeText")
            .text("RELATIONSHIPS");

        //Pie chart
        var pieRadius = height * 0.38;
        var pieXPos = width * 0.4, pieYPos = height * 0.44;
        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var pie = d3.layout.pie();
        pie.sort(null);
        var color = ['#EE4355', '#cee4b5', '#e7f1d9'];

        var arcs = svg.selectAll("g.arc")
            .data(pie(values))
            .enter()
            .append("g")
            .attr("transform", "translate(" + pieXPos + "," + pieYPos + ")");

        //Draw arc paths
        //Determine amount to rotate
        //Dummy rotation to get centroids - bit of a hack!
        var centroids = [];
        arcs.append("path")
            .attr("transform", function(d) {
                //Get centroids for later
                centroids.push(arc.centroid(d));
                return "rotate(0)";
            });

        //Form vectors
        var wedgeCentre = new THREE.Vector2(centroids[0][0], centroids[0][1]);
        var dest = new THREE.Vector2(-10, 0);
        var angle = getAngle(dest, wedgeCentre);
        angle = radiansToDegrees(angle);
        angle *= -1;

        arcs.append("path")
            .attr("transform", "rotate("+angle+")")
            .attr("fill", function(d, i) {
                return color[i];
            })
            .attr("d", arc);

        var lineXStarts = [width * 0.5, width * 0.4, width * 0.45];
        var lineYStarts = [height * 0.2, height * 0.45, height * 0.7];
        var lineWidths = [width * 0.33, width * 0.43, width * 0.37];

        svg.append("line")
            .attr({x1: lineXStarts[0],
                y1: lineYStarts[0],
                x2: lineXStarts[0] + lineWidths[0],
                y2: lineYStarts[0],
                stroke: '#476327',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        svg.append("line")
            .attr({x1: lineXStarts[1],
                y1: lineYStarts[1],
                x2: lineXStarts[1] + lineWidths[1],
                y2: lineYStarts[1],
                stroke: '#EE4355',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        svg.append("line")
            .attr({x1: lineXStarts[2],
                y1: lineYStarts[2],
                x2: lineXStarts[2] + lineWidths[2],
                y2: lineYStarts[2],
                stroke: '#476327',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        //Add elbow
        /*
        svg.append("line")
            .attr({x1: width * 0.675,
                y1: height * 0.55,
                x2: lineXStarts[2],
                y2: height * yOffsets[2],
                stroke: '#476327',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});
        */
    },

    drawDistribution: function(element, data) {
        var elem = $('#ref');
        var height = elem.height();
        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(0, 0)");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        this.drawLineBackground(graph, width, height);
        this.colours = ['#bcebc1'];
        this.drawNormalDistribution(graph, 0, width, height);
        this.colours = ['#b7d690'];

        //Axes
        var xTicks = 10, yTicks = 3;
        var graphYPos = height*0.56, graphXPos = width*0.92;
        var xRangeMin = width * 0.1, xRangeMax = width*0.9;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax])
            .domain([2, 10]);

        var yRangeMin = height * 0.55, yRangeMax = height * 0.05;
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax])
            .domain([0, 10]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(xTicks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(yTicks);

        graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")")
            .attr("class", "axis")
            .call(xAxis);

        graph.append("g")
            .attr("transform", "translate(" + graphXPos + ",0)")
            .attr("class", "axis")
            .call(yAxis);

        //Connect user score to graph
        var scoreYPos = height * 0.35, scoreXPos = width * 0.35;
        graph.append("line")
            .attr({x1: 0,
                y1: scoreYPos,
                x2: scoreXPos,
                y2: scoreYPos,
                stroke: '#ef5f68',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        //Elbow
        var elbowXPos = width * 0.65, elbowYPos = height * 0.56;
        graph.append("line")
            .attr({x1: scoreXPos,
                y1: scoreYPos,
                x2: elbowXPos,
                y2: elbowYPos,
                stroke: '#ef5f68',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        //Draw user score indication
        var scoreRadius = width *0.01;

        graph.append("circle")
            .attr("cx", elbowXPos)
            .attr("cy", elbowYPos)
            .style('fill', '#ef5f68')
            .attr('r', scoreRadius);
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