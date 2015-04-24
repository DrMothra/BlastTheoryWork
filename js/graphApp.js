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

function isInteger(x) {
    return (typeof x === 'number') && (x % 1 === 0);
}

function isFloat(x) {
    return (typeof x === 'number') && (x % 1 !== 0);
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

    readInfoFile: function(filename, callback) {
        var dataLoad = new dataLoader();
        var _this = this;
        dataLoad.load(filename, function(data) {
            callback(data);
        });
    },

    readDataFile: function(filename, callback) {
        //Read data file
        var dataLoad = new dataLoader();
        var _this = this;
        dataLoad.load(filename, function(data) {
            callback(data);
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
        //var elem = $('#'+element);
        this.containerWidth = element.width() <= 100 ? element.width() * 0.01 * window.innerWidth : element.width();
        this.containerHeight = this.renderHeight;

        var svg = d3.select(element[0])
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

    drawBackground: function(element, width, height) {
        //Set up background for graphs
        //Title text
        var textFillColour = LIGHT_GREEN;
        element.append("text")
            .attr("x", width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", textFillColour)
            .attr("class", "quicksand heavy normalSizeText")
            .text("How others responded");

        this.drawLineBackground(element, width, height);
    },

    drawLineBackground: function(element, width, height) {
        //Add line background to existing svg content
        var numLines = 5;
        var startX = 0.1 * width;
        var startY = 0.075 * height, endY = 0.8 * height;
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

    updateScores: function(index, score, max) {
        //Update common scores
        if(isInteger(score)) {
            $('.scoreNumber'+index).html(score);
        } else if(isFloat(score)) {
            $('.scoreNumber'+index).html(Math.floor(score));
            //Fractional part
            var fraction = Math.ceil((score%1)*10);
            $('.scoreFraction'+index).html("." + fraction);
        }

        //Max score
        $('.scoreOutOf'+index).html(max);
    },

    drawQuestion: function(element, choice, userData, answers) {
        //Render the required question and response
        var i;
        _this = this;
        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Title text
        var textFillColour = LIGHT_GREEN;
        graph.append("text")
            .attr("x", width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", textFillColour)
            .attr("class", "quicksand heavy normalSizeText")
            .text("How others responded");

        var values = [];
        var total=0;
        for(i=0; i<userData.length; ++i) {
            values.push(userData[i].users);
            total += values[i];
        }

        //Convert these to percentages
        for(i=0; i<values.length; ++i) {
            values[i] = Math.round((values[i]/total)*100);
        }

        for(i=0; i<userData.length; ++i) {
            if(userData[i].value === choice) {
                //DEBUG
                //console.log("You chose", answers[i].value);
                break;
            }
        }
        var userSelection = i;

        //Pie chart
        var pieRadius = height * 0.38;
        var pieXPos = pieRadius + (width*0.04), pieYPos = height * 0.46;
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
            userData[i].centroid = centroids[i];
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

        userData = sortResponses(userData, yCoords);
        //Update user selection
        for(i=0; i<userData.length; ++i) {
            if(userData[i].centroid[1] === selectedYPos) {
                userSelection = i;
                break;
            }
        }

        //Determine circle positions
        var smallCircleRadius = height * 0.06;
        var smallCircleHeight = smallCircleRadius * 2;
        var numCircles = userData.length;
        var circleHeight = pieRadius * 2;
        //Hack
        if(numCircles == 1) ++numCircles;
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
            lineXStarts.push(pieXPos + userData[i].centroid[0]);
            lineXEnds.push(smallCircleXPos - smallCircleRadius - (width*0.05));
            lineYStarts.push(pieYPos + userData[i].centroid[1]);
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
        for(i=0; i<userData.length; ++i) {
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
                .text(answers[i].label);
        }
    },

    drawDistribution: function(element, data, score, max, min, maxLabel, minLabel) {

        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(0, 0)");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Convert data to percentages
        var percentages = [];
        var total=0;
        for(i=0; i<data.distribution.length; ++i) {
            percentages.push(data.distribution[i].users);
            total += percentages[i];
        }

        //Convert these to percentages
        var processedData = [];
        var percentItem;
        for(i=0; i<percentages.length; ++i) {
            percentages[i] = percentages[i]/total;
            percentItem = {};
            percentItem.users = percentages[i];
            percentItem.value = data.distribution[i].value;
            processedData.push(percentItem);
        }

        this.drawBackground(graph, width, height);

        //Axes
        var xTicks = 10;
        var graphYPos = height*0.8, graphXPos = width*0.92;
        var xRangeMin = width * 0.1, xRangeMax = width*0.9;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax])
            .domain([min, max]);

        var yRangeMin = graphYPos, yRangeMax = height * 0.075;
        //Get max y data
        var yValues = [];
        for(var i=0; i<processedData.length; ++i) {
            yValues.push(processedData[i].users);
        }
        var maxYValue = Math.max.apply(null, yValues);
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax])
            .domain([0, maxYValue]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(xTicks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(2, "%")
            .tickValues([0, maxYValue/2, maxYValue]);

        var bottomLabel = graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")")
            .attr("class", "dist x axis")
            .call(xAxis);

        bottomLabel.append("text")
            .attr("x", xRangeMin)
            .attr("dx", "1em")
            .attr("dy", "2.75em")
            .attr("class", "quicksand smallerSizeText")
            .text(minLabel);

        bottomLabel.append("text")
            .attr("x", xRangeMax)
            .attr("dx", "-1em")
            .attr("dy", "2.75em")
            .attr("text-anchor", "end")
            .attr("class", "quicksand smallerSizeText")
            .text(maxLabel);

        graph.append("g")
            .attr("transform", "translate(" + xRangeMax + ",0)")
            .attr("class", "dist y axis")
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

        /*
        graph.append('svg:path')
            .attr('d', lineGen(data.distribution))
            .attr('stroke', LIGHT_GREEN)
            .attr('stroke-width', 2)
            .attr('fill', LIGHT_GREEN);
        */

        var area = d3.svg.area()
            .x(function(d) { return x(d.value); })
            .y0(height*0.8)
            .y1(function(d) { return y(d.users); })
            .interpolate("basis");

        graph.append("path")
            .datum(processedData)
            .attr("class", "area")
            .attr("d", area);

        //Show user on graph
        var scoreYBottom = height * 0.8, scoreYTop = height * 0.15, scoreXPos = x(score);
        graph.append("line")
            .attr({x1: scoreXPos,
                y1: scoreYTop,
                x2: scoreXPos,
                y2: scoreYBottom,
                stroke: '#ef5f68',
                'stroke-width': 3,
                'stroke-dasharray': '3,3'});

        graph.append("text")
            .attr("x", scoreXPos)
            .attr("y", scoreYTop)
            .attr("class", "quicksand normalSizeText")
            .style("fill", DARK_PINK)
            .attr("text-anchor", "middle")
            .text("You");

        //Draw user score indication
        var scoreRadius = width *0.01;

        graph.append("circle")
            .attr("cx", scoreXPos)
            .attr("cy", scoreYBottom)
            .style('fill', '#ef5f68')
            .attr('r', scoreRadius);
    },

    drawBarChart: function(element, data, score, max, min, maxLabel, minLabel) {
        //Draw graphs from data
        var _this = this;

        var svg = this.createSVG(element);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        //Convert data to percentages
        var percentages = [];
        var total=0;
        for(i=0; i<data.distribution.length; ++i) {
            percentages.push(data.distribution[i].users);
            total += percentages[i];
        }

        //Convert these to percentages
        var processedData = [];
        var percentItem;
        for(i=0; i<percentages.length; ++i) {
            percentages[i] = percentages[i]/total;
            percentItem = {};
            percentItem.users = percentages[i];
            percentItem.value = data.distribution[i].value;
            processedData.push(percentItem);
        }

        this.drawBackground(graph, width, height);

        //Axes
        var xTicks = 10, yTicks = 3;
        var graphYPos = height*0.8, graphXPos = width*0.92;
        var xRangeMin = width * 0.1, xRangeMax = width*0.9;
        var barWidth = ((xRangeMax - xRangeMin)/8)/2, shift = barWidth/2;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax])
            .domain([min, max]);

        var yRangeMin = graphYPos, yRangeMax = height * 0.05;
        //Get max y data
        var yValues = [];
        for(var i=0; i<processedData.length; ++i) {
            yValues.push(processedData[i].users);
        }
        var maxYValue = Math.max.apply(null, yValues);
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax])
            .domain([0, maxYValue]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(xTicks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(2, "%")
            .tickValues([0, maxYValue/2, maxYValue]);

        var bottomLabel = graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")")
            .attr("class", "bar x axis")
            .call(xAxis);

        bottomLabel.append("text")
            .attr("dx", xRangeMin)
            .attr("dy", "2.75em")
            .attr("class", "quicksand smallerSizeText")
            .text(minLabel);

        bottomLabel.append("text")
            .attr("dx", xRangeMax)
            .attr("dy", "2.75em")
            .attr("text-anchor", "end")
            .attr("class", "quicksand smallerSizeText")
            .text(maxLabel);

        graph.append("g")
            .attr("transform", "translate(" + graphXPos + ",0)")
            .attr("class", "bar y axis")
            .call(yAxis);

        var bar = graph.append("g")
            .attr("transform", "translate(-"+shift+",0)");

        bar.selectAll('.bar')
            .data(processedData)
            .enter().append("rect")
            .attr("y", function(d) { return y(d.users); })
            .attr("x", function(d) { return x(d.value); })
            .attr("height", function(d) {
                return graphYPos - y(d.users);
            })
            .attr("width", barWidth)
            .style("fill", function(d) {
                return d.value === score ? DARK_PINK : LIGHT_GREEN;
            });
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

    drawScatterPlot: function(element, index, data, score, max, min) {
        //Draw scatter from values
        var _this = this;

        var svg = this.createSVG(element+index);

        var graph = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var width = this.containerWidth - this.margin.left - this.margin.right , height = this.containerHeight - this.margin.top - this.margin.bottom;

        var textFillColour = LIGHT_GREEN;
        graph.append('text')
            .attr("x", width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", textFillColour)
            .attr("class", "quicksand heavy normalSizeText")
            .text("HOW OTHERS RESPONDED");

        this.drawLineBackground(graph, width, height);

        //Axes
        var xTicks = 10, yTicks = 3;
        var graphYPos = height*0.8, graphXPos = width*0.92;
        var xRangeMin = width * 0.1, xRangeMax = width*0.9;
        var barWidth = ((xRangeMax - xRangeMin)/(max-min))/2, shift = barWidth/2;
        var x = d3.scale.linear()
            .range([xRangeMin, xRangeMax])
            .domain([min, max]);

        var yRangeMin = graphYPos, yRangeMax = height * 0.05;
        //Get max y data
        var yValues = [];
        for(var i=0; i<data.distribution.length; ++i) {
            yValues.push(data.distribution[i].users);
        }
        var maxYValue = Math.max.apply(null, yValues);
        var y = d3.scale.linear()
            .range([yRangeMin, yRangeMax])
            .domain([0, maxYValue]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(xTicks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(yTicks);

        /* No axes for scatter plots yet
        graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")")
            .attr("class", "axis")
            .call(xAxis);

        graph.append("g")
            .attr("transform", "translate(" + graphXPos + ",0)")
            .attr("class", "axis")
            .call(yAxis);
        */

        var bottomLabel = graph.append("g")
            .attr("transform", "translate(0," + graphYPos + ")");

        bottomLabel.append("text")
            .attr("dx", xRangeMin)
            .attr("dy", "2em")
            .attr("class", "quicksand smallerSizeText")
            .style("fill", LIGHT_GREEN)
            .text("LESS");

        bottomLabel.append("text")
            .attr("dx", xRangeMax)
            .attr("dy", "2em")
            .attr("text-anchor", "end")
            .attr("class", "quicksand smallerSizeText")
            .style("fill", LIGHT_GREEN)
            .text("MORE");

        //Determine max circle size
        var maxCircleRadius = (width/data.distribution.length)/8;
        var scatter = graph.selectAll('.scatter')
            .data(data.distribution)
            .enter().append("circle")
            .attr("cy", height/2)
            .attr("cx", function(d) { return x(d.value); })
            .attr('r', function(d) { return (d.users/max)*maxCircleRadius; })
            .style("fill", function(d) {
                return d.value === score ? DARK_PINK : LIGHT_GREEN;
            });
    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }
};