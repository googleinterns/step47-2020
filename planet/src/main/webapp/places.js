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

/** Initializes Map, implements search box and marks locations of searches */
function initMap() {
    const TORONTO_COORDINATES = {lat:43.6532, lng:-79.3832}; 
    map = new google.maps.Map(document.getElementById("map"), {
        center: TORONTO_COORDINATES,
        zoom: 8
    });

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
        }, function() {
            let searchMarker = new google.maps.Marker({
                position: TORONTO_COORDINATES,
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true
            });
            map.setCenter(TORONTO_COORDINATES);
            });
    } else {
        alert('Error: Your browser doesn\'t support geolocation.'); 
    }

    let input = document.getElementById('pac-input');
    let searchBox = new google.maps.places.SearchBox(input);

    // Set position of the search bar onto the map
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    updateSearch();
}

/** Create new markers and display new search */
function updateSearch() {    
    input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];
    let placeInfo = [];

    // Listener for when user selects new location
    searchBox.addListener('places_changed', function() {
        let places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // Delete old markers
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
        placeInfo = [];

        // For each place, get the icon, name and location.
        let bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            // Add search results to a list
            placeInfo.push(place.name + "\n" + "Rating: " + place.rating + "\n"); 

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

            // Create an info window for each place
            infoWindow = new google.maps.InfoWindow({
                    content: ""
            });

            // Add markers to array
            markers.push(marker);

            // Display info window with name marker is clicked
            google.maps.event.addDomListener(marker,'click', function() {
                    infoWindow.setContent(place.name);
                    infoWindow.open(map, this); 
            });

            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        listResults(placeInfo);
    });
}

/** List results of nearby search on page*/
function listResults(results) {
    const places = document.getElementById('places');
    let element = document.getElementById('results');
    // Clear results 
    element.innerHTML = ""; 

    // Displays search results on page
    for (let i = 0; i < results.length; i++) {
        // Create materialize card for each result by creating dom element in HTML
        let div1 = document.createElement('div');
        div1.classList.add('card'); 
        div1.classList.add('horizontal'); 

        let div2 = document.createElement('div');
        div2.classList.add('card-stacked');

        let div3 = document.createElement('div');
        div3.classList.add('card-content'); 

        let p = document.createElement('p');
        let content = document.createTextNode(results[i]); 
        p.appendChild(content); 
        div3.appendChild(p);
        div2.appendChild(div3);
        div1.appendChild(div2); 
        element.appendChild(div1);
    }
    // Add search keyword to header
    document.getElementById('greeting').innerHTML = "Find a place: " + document.getElementById('pac-input').value;
}
