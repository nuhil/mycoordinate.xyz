$(document).on( "click", "#shareLink", function() {
    $('#shareLink').css({'opacity' : '0.2', 'text-decoration' : 'none', 'color' : 'grey'});
    $('#shareLink').html('Wait! Shortening URL ...');

    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": "R_9ce0b9fbeda9fb0807740890dded98a2",
            "login": "o_2g4m22rs5c",
            "longUrl": window.location.href
        },
        function(response)
        {
            $('#shareLink').parent().html('<a href="'+response.data.url+'" target="_blank">'+response.data.url+'</a>');
        }
    );
});

// Initialise the google map just after loadin the DOM
google.maps.event.addDomListener(window, 'load', initialize);

// Some global variables to use from some specific functions
var map, latLng, marker, infoWindow;
var geocoder = new google.maps.Geocoder();

// Get coordinates from hash or render the map with default
// coordinates
function initialize() {
    var myOptions = {
        zoom: 15,
        panControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('googlemaps'),
        myOptions);

    var friendsCoordinates = window.location.hash;
    if (friendsCoordinates != "") {
        var hashlocation = friendsCoordinates.split(",");
        if (hashlocation.length == 2) {
            showMap(hashlocation[0].substr(1), hashlocation[1], true);
            return;
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationFound, defaultLocation);
    } else {
        defaultLocation();
    }
}

// Load the map with user defined physical address
function showAddress(val) {
    infoWindow.close();
    geocoder.geocode({
        'address': val
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            marker.setPosition(results[0].geometry.location);
            geocode(results[0].geometry.location);
        } else {
            alert("Google Maps could not find this location!");
        }
    });
}

function geocode(position) {
    geocoder.geocode({
        latLng: position
    }, function(responses) {
        var html = '';
        window.location.hash = '#' + marker.getPosition().lat() + "," + marker.getPosition().lng();
        if (responses && responses.length > 0) {
            html += '<strong style="color:green;">You are near! </strong>' + responses[0].formatted_address + '<br/>';
            html += '<span><a id="shareLink" href="javascript:void(0);">Share Location</a><span>';
        } else {
            html += '<strong style="color:red;">Nothing known near you! </strong><br/>';
            html += 'Better, You drag the red marker in a crowdy place!';
        }

        map.panTo(marker.getPosition());
        infoWindow.setContent("<div id='infoBox'>" + html + "</div>");
        infoWindow.open(map, marker);
    });
}

function locationFound(position) {
    showMap(position.coords.latitude, position.coords.longitude);
}

// Dhaka, Bangladesh
function defaultLocation() {
    showMap(23.761692871261147, 90.37844838320314);
}

function showMap(lat, lng, hideinfo) {
    latLng = new google.maps.LatLng(lat, lng);

    map.setCenter(latLng);

    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    infoWindow = new google.maps.InfoWindow({
        content: '<div id="infoBox"><strong style="color: green;">We think you are here!</strong> Though you can <strong>click and drag</strong> the red marker anywhere to pin point your location perfectly and then share!</div>'
    });

    if (hideinfo) {
        geocode(latLng);
    } else {
        infoWindow.open(map, marker);
    }

    google.maps.event.addListener(marker, 'dragstart', function(e) {
        infoWindow.close();
    });

    google.maps.event.addListener(marker, 'dragend', function(e) {
        var point = marker.getPosition();
        map.panTo(point);
        geocode(point);
    });
}