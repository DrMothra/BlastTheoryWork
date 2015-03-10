/**
 * Created by DrTone on 06/03/2015.
 */
//Test the swiping functionality


$(document).ready(function() {
    //Init app

    console.log('Default =', $.mobile.defaultPageTransition);
    $.mobile.defaultPageTransition = 'slide';
    $('#pageone').on('swipeleft', function() {
        //alert('Swiped');
        window.location.href = '#pagetwo';
    });

    $('#pagetwo').on('swiperight', function() {
        //alert('Swiped');
        window.location.href = '#pageone';
    });
});
