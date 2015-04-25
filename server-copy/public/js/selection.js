/**
 * Created by DrTone on 23/03/2015.
 */

$(document).ready(function() {
    //Detect swipes and navigate accordingly
    //Enable swiping...

    $("#container").swipe( {
        //Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
            if(direction === "left") {
                location.href = "responses.html";
            } else if(direction === "right") {
                location.href = "karen.html";
            }
        }

    });
});