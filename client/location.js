var x = document.getElementById("mapView");
var lat = null;
var lon = null;
var marker = null;
var gotLocation = true;

window.onload = function() 
{    // functions in here will run once the page is full loaded
    $("#img1").hide();
    onSearch();
    getLocation();

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(mapPosition, showError);
        } else { 
            alert("Geolocation is not supported by this browser.");
        }
    }

    function showError(error) {
        // if geocode is somehow not usable, this function runs and show error and runs mapposition in manual mode 
        gotLocation = false;
        mapPosition();
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert( "User denied the request for Geolocation.\n Please Type Your Location");
                break;
            case error.POSITION_UNAVAILABLE:
                alert( "Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert( "An unknown error occurred.");
                break;
        }
    }
}   


function mapPosition(position) {
    // Displays the map and the initialize latitude, longitude, and marker
    if (gotLocation == true){
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        callFindEvents();

    }else{
        // this is just random default coordinate i made
        lat = 43.7;
        lon = -79.383;
    }
    var latlon = new google.maps.LatLng(lat, lon)
    var mapholder = document.getElementById('mapholder')

    mapholder.style.height = '250px';
    mapholder.style.width = '100%';
    var myOptions = {
    center:latlon,zoom:14,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
    marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"});
    var geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', function() {geocodeAddress(geocoder, map);});
}




function geocodeAddress(geocoder, resultsMap) {
     // use the text value from address textbox and geocode it using google maps api and move marker location
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
    lat = results[0].geometry.location.lat();
    lon = results[0].geometry.location.lng();
    callFindEvents();
      if (status === 'OK') 
{        resultsMap.setCenter(results[0].geometry.location);
        moveMarker(marker);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}


function callFindEvents(){
    // return the latitude and longitude of the found location use this function to transfer location data to other function such as vertical list
    console.log("CURRENT LOCATION:",lat.toFixed(4),lon.toFixed(4));
    var latlon = ''+lat.toFixed(4)+' '+lon.toFixed(4);

    getEvents('20','10',latlon);
}

function moveMarker(marker) {
    // instead of creating multiple markers, this function simply relocate existing marker
    var latlng = new google.maps.LatLng(lat, lon);
    marker.setPosition(latlng);
}

function addMarker(information,map) {
    // instead of creating multiple markers, this function simply relocate existing marker
    var latlng = new google.maps.LatLng(lat, lon);
    marker.setPosition(latlng);
}