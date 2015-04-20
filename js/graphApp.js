/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications
function radiansToDegrees(rads) {
    return 180/Math.PI * rads;
}
function degreesToRadians(degress) {
    return (Math.PI/180) * degress;
}
function getAngle(vec0, vec1) {
    //Dot
    var dot = vec0.dot(vec1);
    var cos0 = dot/(vec0.length() * vec1.length());
    return Math.acos(cos0);
}
function rotateVector2D(vec, rot) {
    //Assumes rotation around origin
    var cos = Math.cos(degreesToRadians(rot));
    var sin = Math.sin(degreesToRadians(rot));
    var rotX = (cos * vec[0]) - (sin * vec[1]);
    var rotY = (sin * vec[0]) + (cos * vec[1]);

    vec[0] = rotX;
    vec[1] = rotY;

    return vec;
}
function sortResponses(responses, sortCoords) {
    //Sort responses by sortCoords
    var sorted = [];
    for(var i=0; i<sortCoords.length; ++i) {
        for(var j=0; j<responses.length; ++j) {
            if(sortCoords[i] === responses[j].centroid[1]) {
                sorted.push(responses[j]);
                break;
            }
        }
    }

    return sorted;
}

//Colours
var DARK_PINK = '#ee4355', LIGHT_GREEN = '#c0e9bd', OFF_WHITE = '#e7f1d9', GREEN = '#b7d690', DARK_GREEN = '#476327', PINK = '#ffbbbe', GREY = '#939393',
    LIGHT_BLUE = '#38A6CF';

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
    this.colours = [DARK_PINK, LIGHT_GREEN, OFF_WHITE, LIGHT_BLUE, GREY];
    this.selectionColour = 0;
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

    readDataFile: function(filename, callback) {
        //Read data file
        var dataLoad = new dataLoader();
        var _this = this;
        dataLoad.load(filename, function(data) {
            callback.call(_this, data);
        });
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
        var startY = 0.05 * height, endY = 0.7 * height;
        var lineGap = (endY - startY)/(numLines-1);

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

        var yRangeMin = height * 0.7, yRangeMax = height * 0.05;
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

    drawQuestion: function(element, index, questions, answers) {
        //Render the required question and response
        var i;
        _this = this;
        var svg = this.createSVG(element+index);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Render given responses
        //Substitute text
        $('#question'+index).html(questions.text);
        $('#choice'+index).html(questions.value);

        var values = [];
        var total=0;
        for(i=0; i<answers.length; ++i) {
            values.push(answers[i].users);
            total += values[i];
        }

        //Convert these to percentages
        for(i=0; i<values.length; ++i) {
            values[i] = Math.round((values[i]/total)*100);
        }

        for(i=0; i<answers.length; ++i) {
            if(answers[i].value === questions.value) {
                //DEBUG
                console.log("You chose", answers[i].value);
                break;
            }
        }
        var userSelection = i;

        //Pie chart
        var pieRadius = height * 0.38;
        var pieXPos = width * 0.4, pieYPos = height * 0.44;
        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var pie = d3.layout.pie();
        pie.sort(null);

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
        var wedgeCentre = new THREE.Vector2(centroids[userSelection][0], centroids[userSelection][1]);
        var rotateToPoint = new THREE.Vector2(-10, 0);
        var angle = getAngle(rotateToPoint, wedgeCentre);
        angle = radiansToDegrees(angle);
        angle = centroids[userSelection][1] < 0 ? angle *= -1 : angle;

        //Set selected wedge to selection colour
        var swapColour = this.colours[userSelection];
        this.colours[userSelection] = DARK_PINK;
        this.colours[this.selectionColour] = swapColour;
        this.selectionColour = userSelection;

        arcs.append("path")
            .attr("transform", "rotate("+angle+")")
            .attr("fill", function(d, i) {
                return _this.colours[i];
            })
            .attr("d", arc);

        //Need to rotate the centroids
        //Add rotated y pos to responses
        for(i=0; i<centroids.length; ++i) {
            centroids[i] = rotateVector2D(centroids[i], angle);
            answers[i].centroid = centroids[i];
        }

        //Sort rotated data
        var yCoords = [];
        for(i=0; i<centroids.length; ++i) {
            yCoords.push(centroids[i][1]);
        }
        var selectedYPos = yCoords[userSelection];
        yCoords.sort(function(a,b) {
            return a-b;
        });

        //Sort responses by position on screen

        answers = sortResponses(answers, yCoords);
        //Update user selection
        for(i=0; i<answers.length; ++i) {
            if(answers[i].centroid[1] === selectedYPos) {
                userSelection = i;
                break;
            }
        }
        //Ensure user selection is in middle of responses
        if(answers.length === 5 && answers[2].centroid[1] !== selectedYPos) {
            var temp = answers[2];
            answers[2] = answers[1];
            answers[1] = temp;
            userSelection = 2;
        }

        //Determine circle positions
        var smallCircleRadius = height * 0.06;
        var smallCircleHeight = smallCircleRadius * 2;
        var numCircles = answers.length;
        var circleHeight = pieRadius * 2;
        var circlePadding = (circleHeight - (smallCircleHeight * numCircles))/(numCircles-1);
        var smallCircleXPos = width * 0.9;
        var startCircleYPos = pieYPos - pieRadius + smallCircleRadius;
        var smallCircleYPos = [];
        var yOffset = (2*smallCircleRadius) + circlePadding;
        for(i=0; i<numCircles; ++i) {
            smallCircleYPos.push(startCircleYPos + (i*yOffset));
        }


        var lineXStarts = [], lineXEnds = [];
        var lineYStarts = [];
        for(i=0; i<centroids.length; ++i) {
            lineXStarts.push(pieXPos + answers[i].centroid[0]);
            lineXEnds.push(smallCircleXPos - smallCircleRadius - (width*0.05));
            lineYStarts.push(pieYPos + answers[i].centroid[1]);
        }

        var lineFill;
        for(i=0; i<centroids.length; ++i) {
            lineFill = DARK_GREEN;
            if(i === userSelection) {
                lineFill = DARK_PINK;
            }
            svg.append("line")
                .attr({x1: lineXStarts[i],
                    y1: lineYStarts[i],
                    x2: lineXEnds[i],
                    y2: smallCircleYPos[i],
                    stroke: lineFill,
                    'stroke-width': 3,
                    'stroke-dasharray': '3,3'});
            //Elbow
            svg.append("line")
                .attr({x1: lineXEnds[i],
                    y1: smallCircleYPos[i],
                    x2: lineXEnds[i] + width * 0.04,
                    y2: smallCircleYPos[i],
                    stroke: lineFill,
                    'stroke-width': 3,
                    'stroke-dasharray': '3,3'});
        }

        var circleFillColour, textFillColour;
        for(i=0; i<answers.length; ++i) {
            circleFillColour = OFF_WHITE;
            textFillColour = GREEN;
            if(i === userSelection) {
                circleFillColour = DARK_PINK;
                textFillColour = PINK;
            }
            svg.append("circle")
                .attr("cx", smallCircleXPos)
                .attr("cy", smallCircleYPos[i])
                .attr("r", smallCircleRadius)
                .style("fill", circleFillColour);

            svg.append('text')
                .attr("x", smallCircleXPos)
                .attr("y", smallCircleYPos[i])
                .style("text-anchor", "middle")
                .style("fill", textFillColour)
                .attr("class", "quicksand heavy normalSizeText")
                .text(values[i] + "%");

            svg.append('text')
                .attr("x", smallCircleXPos)
                .attr("y", smallCircleYPos[i] + smallCircleRadius)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill", textFillColour)
                .attr("class", "quicksand heavy normalSizeText")
                .text(answers[i].value);
        }
    },

    drawDistribution: function(element, index, data) {

        var svg = this.createSVG(element+index);

        var graph = svg.append("g")
            .attr("transform", "translate(0, 0)");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Title text
        var textFillColour = LIGHT_GREEN;
        graph.append("text")
            .attr("x", width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", textFillColour)
            .attr("class", "quicksand heavy normalSizeText")
            .text("HOW OTHERS RESPONDED");

        this.drawLineBackground(graph, width, height);
        this.colours = ['#bcebc1'];
        //this.drawNormalDistribution(graph, 0, width, height);
        this.colours = ['#b7d690'];

        //Axes
        var xTicks = 10, yTicks = 3;
        var graphYPos = height*0.7, graphXPos = width*0.92;
        var xRangeMin = width * 0.1, xRangeMax = width*0.9;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax])
            .domain([2, 10]);

        var yRangeMin = graphYPos, yRangeMax = height * 0.05;
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax])
            .domain([0, 22]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(xTicks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(yTicks)
            .tickFormat(".0%");

        graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")")
            .attr("class", "axis")
            .call(xAxis);

        graph.append("g")
            .attr("transform", "translate(" + graphXPos + ",0)")
            .attr("class", "axis")
            .call(yAxis);

        //Render data
        var lineGen = d3.svg.line()
            .x(function(d) {
                return x(d.value);
            })
            .y(function(d) {
                return y(d.users);
            })
            .interpolate("basis");

        graph.append('svg:path')
            .attr('d', lineGen(data.distribution))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        //Connect user score to graph
        var scoreYPos = height * 0.45, scoreXPos = width * 0.35;
        graph.append("line")
            .attr({x1: 0,
                y1: scoreYPos,
                x2: scoreXPos,
                y2: scoreYPos,
                stroke: '#ef5f68',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        //Elbow
        var elbowXPos = width * 0.65, elbowYPos = height * 0.7;
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