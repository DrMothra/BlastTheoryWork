/**
 * Created by atg on 11/02/2015.
 */
//Framework for implementing graphing applications

var graphApp = function() {};

graphApp.prototype = {

    constructor: graphApp,

    getData: function(url, callback) {
        //Retrieve data

    },

    visualiseData: function(data) {
        //DEBUG
        console.log('Visualising data');
    },

    displayError: function(errorMsg) {
        //Error handling
        alert(errorMsg);
    }


};