// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** Declare global variables */
let map;
let searchMarker;
let infoWindow;
let input;
let searchBox;
let markers = [];
let promises = [];
let placeInfo = [];
let bounds;
const TORONTO_COORDINATES = {lat:43.6532, lng:-79.3832}; 

/** Initializes Map, implements search box and marks locations of searches */
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: TORONTO_COORDINATES,
        zoom: 8
    });
    input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    // Set position of the search bar onto the map
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    getCurrentLocation(); 
    updateSearch();
}

/** Creates marker at user's current location if allowed */
function getCurrentLocation(){
    // Gets users current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
            };
            // Create draggable marker at current location
            let searchMarker = new google.maps.Marker({
                position: pos,
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true
            });
            map.setCenter(pos);
        }, 
            // Set default marker to Toronto if user does not allow current location
            function() {
            let searchMarker = new google.maps.Marker({
                position: TORONTO_COORDINATES,
                map: map,
                animation: google.maps.Animation.DROP,
            });
            map.setCenter(TORONTO_COORDINATES);
            });
    } else {
        alert('Error: Your browser doesn\'t support geolocation.'); 
        // Set default marker to Toronto
        let searchMarker = new google.maps.Marker({
            position: TORONTO_COORDINATES,
            map: map,
            animation: google.maps.Animation.DROP,
        });
        map.setCenter(TORONTO_COORDINATES);
    }
}

/** Update markers and places when new search is performed */
function updateSearch() {    
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listener for when user selects new location
    searchBox.addListener('places_changed', function() {
        let places = searchBox.getPlaces();
        if (places.length === 0) {
            return;
        }
        // Delete old markers
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        // Clear array of old markers and place information
        markers = [];
        placeInfo = [];

        bounds = new google.maps.LatLngBounds();
        addPlaceDetails(places);
        map.fitBounds(bounds);
    });

    // Add onclick function to option buttons
    document.getElementById('hotel').onclick = function() {
        document.getElementById('pac-input').value = 'hotel';
        setSearchByButton(); 
    }
    document.getElementById('food').onclick = function() {
        document.getElementById('pac-input').value = 'food';
        setSearchByButton(); 
    }
    document.getElementById('tourist').onclick = function() {
        document.getElementById('pac-input').value = 'tourist attractions';
        setSearchByButton(); 
    }
    document.getElementById('nature').onclick = function() {
        document.getElementById('pac-input').value = 'nature';
        setSearchByButton(); 
    }
}

/** Search map when option button is clicked by triggering enter key */
function setSearchByButton() {
    const input = document.getElementById('pac-input');
    // Set trigger event on search box 
    google.maps.event.trigger(input, 'focus', {});
    // Set event to trigger the enter key , allowing search to process
    google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
    google.maps.event.trigger(this, 'focus', {});
}

/** Create markers and add details to each place */
function addPlaceDetails(places) {
    // For each place, get the icon, name and location.
    places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        createMarkers(place); 
        if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }

        // Get place id
        let placeId = place['place_id']; 
        let url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + 
        '&key=AIzaSyDK36gDoYgOj4AlbCqh1IuaUuTlcpKF0ns&fields=photo,formatted_phone_number,formatted_address,opening_hours,website';        
        let placeDetails = {Name: '', Rating: '', Address: '', Photo: '',Phone: '',Hours: '',Website: ''}; 
        
        // Fetch url and add photo reference to a list
        promises = [];
        promises.push(fetch(url).then(response => response.json()).then(function(response) {
            placeDetails['Name'] = place.name; 
            // Check if place details exist
            if (place.rating != undefined) {
                placeDetails['Rating'] = place.rating;    
            }
            if (response.result.formatted_address != undefined) {
                placeDetails['Address'] = response.result.formatted_address;
            }
            if (response.result.photos != undefined) {
                placeDetails['Photo'] = response.result.photos[0].photo_reference;
            }
            if (response.result.formatted_phone_number != undefined) {
                placeDetails['Phone'] = response.result.formatted_phone_number;
            }
            if (response.result.opening_hours != undefined){
                placeDetails['Hours'] = response.result.opening_hours.weekday_text;
            }
            if (response.result.website != undefined) {
                placeDetails['Website'] = response.result.website;
            }
            placeInfo.push(placeDetails);
        }));
    });
    // Wait for promises to complete before proceeding
    Promise.all(promises).then(function() {
        listResults();
    })
}

/** Get URL for Place Photo Request  */
function getPhotoURL(photo_reference) {
    let baseURL = 'https://maps.googleapis.com/maps/api/place/photo?';
    let maxWidth = '400';
    let maxHeight = '200';
    let photoURL = baseURL + 'maxwidth=' + maxWidth + '&maxheight=' + maxHeight 
    + '&photoreference=' + photo_reference + '&key=AIzaSyDK36gDoYgOj4AlbCqh1IuaUuTlcpKF0ns'; 

    return photoURL; 
}

/** Create marker and add info window to place */
function createMarkers(place) {
    // Set icon properties
    let icon = { 
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
    };

    // Create a marker for each place
    let marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
    });        
        
    // Add markers to array
    markers.push(marker);

    // Create an info window for each place
    infoWindow = new google.maps.InfoWindow({
        content: ""
    });

    // Display info window with name when marker is clicked
    google.maps.event.addDomListener(marker,'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this); 
    });
}

/** List results of nearby search on page*/
function listResults() {
    let element = document.getElementById('results');
    // Clear results 
    element.innerHTML = ""; 

    // Displays search results on page
    for (let i = 0; i < placeInfo.length; i++) {
        // Create materialize card for each result by creating dom element in HTML
        let div1 = document.createElement('div');
        div1.classList.add('card'); 
        div1.classList.add('horizontal'); 
        let div2 = document.createElement('div');
        div2.classList.add('card-stacked');
        let div3 = document.createElement('div');
        div3.classList.add('card-content'); 

        // Create elements to add to HTML
        let p = document.createElement('p');
        let p1 = document.createElement('p');
        let p2 = document.createElement('p');
        let p3 = document.createElement('p');
        let p4 = document.createElement('p');
        let a = document.createElement('a');

        // Set variables for place details
        let name = document.createTextNode(placeInfo[i]['Name']);
        let rating = document.createTextNode('Rating: ' + placeInfo[i]['Rating']);
        let address = document.createTextNode(placeInfo[i]['Address']);
        let phoneNumber = document.createTextNode('Phone Number: ' + placeInfo[i]['Phone']);
        let openingHours = document.createTextNode('Opening Hours: ' + placeInfo[i]['Hours']);
        let img = document.createElement('img');
        
        // Create and add save icon 
        let icon = document.createElement('i');
        icon.innerHTML = 'favorite_border';
        icon.classList.add('material-icons');
        icon.classList.add('small');
        icon.setAttribute('onclick','savePlace(this);');
        div3.append(icon);

        // Check for missing details, otherwise display through HTML
        p.appendChild(name);        
        p.setAttribute('id','place-name');
        div3.appendChild(p);
        if (placeInfo[i]['Rating'] != '') {
            p1.appendChild(rating);
           div3.appendChild(p1);
        }     
         if (placeInfo[i]['Photo'] != '') {
            img.src = getPhotoURL(placeInfo[i]['Photo']);
            div3.appendChild(img); 
        }      
        if (address != '') {
            p2.appendChild(address);
            div3.appendChild(p2);
        }
        if (placeInfo[i]['Phone'] != '') {
            p3.appendChild(phoneNumber);
            div3.appendChild(p3);         
        }
        if (placeInfo[i]['Hours'] != '') {
            p4.appendChild(openingHours);    
            div3.appendChild(p4);      
        }
        if (placeInfo[i]['Website'] != '') {
            a.appendChild(document.createTextNode('Website'));
            a.href = placeInfo[i]['Website'];
            a.title = 'Website'; 
            div3.appendChild(a);
        }
        div2.appendChild(div3);
        div1.appendChild(div2); 
        element.appendChild(div1);
    }
    // Add search keyword to header
    document.getElementById('greeting').innerHTML = 'Find a place: ' + document.getElementById('pac-input').value;
}

/** Toggle save icon on click */
function savePlace(x) {
    if(x.innerHTML === "favorite_border") {
        // Set as saved
        x.innerHTML = "favorite";
    }
    else {
        // Set as unsaved
        x.innerHTML = "favorite_border";
    }
}
