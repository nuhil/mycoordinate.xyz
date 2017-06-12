$(document).on( "click", "#shareLink", function() {
    $('#shareLink').css({'text-decoration' : 'none', 'color' : 'grey'});
    $('#shareLink').html('Please Wait! Shortening URL ...');

    $.getJSON(
        "https://api-ssl.bitly.com/v3/shorten?", 
        { 
            "access_token": "9a144eb484900047224f28a3bfac092a0a73d27c",
            "longUrl": window.location.href+"@shared"
        },
        function(response)
        {
            $('#shareLink').parent().html('<input size="25" id="copy" type="text" value="'+response.data.url+'"/>');
        }
    );
});

$(document).on("click", "#copy", function() {
            $(this).select();
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
        disableDefaultUI: true,
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
            var lat = hashlocation[0].substr(1);
            if(hashlocation[1].indexOf('@') === -1) {
                var lng = hashlocation[1];
                var shared = false;   
            } else {
               var getLng = hashlocation[1].split("@");
               var lng = getLng[0]
               var shared = true;
            }

            showMap(lat, lng, true, shared);
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

function geocode(position, shared) {
    geocoder.geocode({
        latLng: position
    }, function(responses) {
        var html = '';
        window.location.hash = '#' + marker.getPosition().lat() + "," + marker.getPosition().lng();
        if (responses && responses.length > 0) {
            var title = (shared == true) ? "Someone shared this point with you, which is near " : "Your pointed location is near ";
            html += '<strong style="color:green;">'+title+'</strong>' + responses[0].formatted_address + '<br/>';
            html += '<span><a id="shareLink" href="javascript:void(0);">Share Location</a><span>';
        } else {
            html += '<strong style="color:red;">Nothing known near you! </strong><br/>';
            html += 'Better, You drag the red marker in a crowdy place!';
        }

        map.panTo(marker.getPosition());
        var infoWindowHeight = ($( window ).width() > 400)? 'style="min-height:60px"': 'style="min-height:80px"';
        infoWindow.setContent("<div id='infoBox' "+infoWindowHeight+">" + html + "</div>");

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

function showMap(lat, lng, hideinfo, shared) {
    var windowWidth = $( window ).width();

    latLng = new google.maps.LatLng(lat, lng);

    map.setCenter(latLng);

    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    infoWindow = new google.maps.InfoWindow({
        content: '<div id="infoBox"><strong style="color: green;">We think you are here!</strong> Though you can <strong>click and drag</strong> the red marker anywhere to pin point your location perfectly and then share! <br/><strong style="color:red;">Please Move the Red Pointer to have a Share Link</strong></div>',
        maxWidth: windowWidth-100
    });

    if (hideinfo) {
        geocode(latLng, shared);
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
