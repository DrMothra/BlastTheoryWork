/**
 * Created by DrTone on 04/12/2014.
 */
//Karen app with Blast Theory
var margin = {top: 20, right: 60, bottom: 60, left: 80},
    outerWidth = 512,
    innerWidth = outerWidth - margin.left - margin.right,
    outerHeight = 512,
    innerHeight = outerHeight - margin.top - margin.bottom;

var maxMeanValue = 5;

$(document).ready(function() {
    //Init app
    var visApp = new graphApp();
    var dataURL = 'https://kserver.blasttheory.com/user';
    visApp.getData(dataURL);

});