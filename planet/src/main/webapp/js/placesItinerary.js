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

// This file contains functions related to the places part of the itinerary page

import TimeRange from './TimeRange.js';

// Declare global functions.
window.openAddPlaceForm = openAddPlaceForm;
window.closeAddPlaceForm = closeAddPlaceForm;
window.initAutocomplete = initAutocomplete; 
window.makePlaceRequests = makePlaceRequests;

// Declare global variables/constants.
const database = firebase.database();
let map;
let displayedPlaces = {};  // Object that contains all the places information that are rendered
let toBeProcessedPlaces = []; // Array that contains all the placeIds to be used in Google Maps API call

// Declare global variables 
let autocompleteStart;
let autocompleteEvent;
 
/** Adds autocomplete to input boxes */
function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('empty-map'));
    let startAddress = document.getElementById('starting-address');
    let eventAddress = document.getElementById('add-event-address');
    let options = {
        types: ['geocode']
    };
    autocompleteStart = new google.maps.places.Autocomplete(startAddress,options);
    autocompleteStart.setFields(['address_component']);
    autocompleteStart.addListener('place_changed', updateStartingAddress);

    autocompleteEvent = new google.maps.places.Autocomplete(eventAddress,options);
}

function updateStartingAddress() {
    const startAddress = document.getElementById('starting-address');
    sessionStorage.setItem('start', startAddress.value);
}

export function renderPlaces() {
    displayedPlaces = {};
    toBeProcessedPlaces = [];
    const userId = firebase.auth().currentUser.uid;
    const placesRef = database.ref('users/' + userId + '/places');
    placesRef.orderByValue().once('value', (placesSnapshot) => {
        const placesContainer = document.getElementById('places');
        placesContainer.innerHTML = '';
        placesSnapshot.forEach(function(childPlace) {
            const placeId = childPlace.key;
            toBeProcessedPlaces.push(placeId);
        });
        makePlaceRequests();
    });
}

function makePlaceRequests() {
    hideLoadMoreButton();
    let service = new google.maps.places.PlacesService(map);
    const maxNumOfRequests = 10;
    for (let i = 0; i < Math.min(maxNumOfRequests, toBeProcessedPlaces.length); i++) {
        let placeId = toBeProcessedPlaces[i];
        // Make request with fields
        let placeRequest = {
            placeId: placeId,
            fields: ['place_id','name','rating','formatted_address',
                'opening_hours','photos','url']
        };
        service.getDetails(placeRequest, renderPlaceDetailsCallback);
    } 
    // Google Maps API can only process 10 place details requests at a time,
    // and once the session is full, new requests are refilled at a rate of 2 per second.
    // Therefore, we need to wait 5 seconds here to process another group of 10 requests.
    setTimeout(showLoadMoreButton, 5000);
}

function renderPlaceDetailsCallback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        const placesContainer = document.getElementById('places');
        const placeElement = createPlaceElement(place);
        placesContainer.appendChild(placeElement);

        const indexOfProcessedPlace = toBeProcessedPlaces.indexOf(place.place_id);
        if (indexOfProcessedPlace > -1) {
            toBeProcessedPlaces.splice(indexOfProcessedPlace, 1);
        }
    } 
}

function hideLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more-button');
    loadMoreButton.style.display = 'none';
}

function showLoadMoreButton() {
    if (toBeProcessedPlaces.length > 0) {
        const loadMoreButton = document.getElementById('load-more-button');
        loadMoreButton.style.display = 'block';
    }
}

function createPlaceElement(place) {
    const placeElement = document.createElement('div');
    placeElement.setAttribute('class', 'card place yellow lighten-4');
    placeElement.setAttribute('id', 'place-' + place.place_id);

    // Get the openingTime and closingTime in minutes
    let openingTime = 0;
    let closingTime = 0;
    if (place.opening_hours) {
        // for MVP purposes, use Monday's hours. 
        if (!place.opening_hours.periods[0].close) {
            // Google Maps will not return closing time if the place opens 24 hours,
            // So we need to manually add it.
            openingTime = TimeRange.getTimeInMinutes(0, 0);
            closingTime = TimeRange.getTimeInMinutes(23, 59);
        } else {
            const openHours = place.opening_hours.periods[1].open.hours;
            const openMinutes = place.opening_hours.periods[1].open.minutes;
            const closeHours = place.opening_hours.periods[1].close.hours;
            const closeMinutes = place.opening_hours.periods[1].close.minutes;
            openingTime = TimeRange.getTimeInMinutes(openHours, openMinutes);
            closingTime = TimeRange.getTimeInMinutes(closeHours, closeMinutes);
        }
    } else { 
        // Set the event's opening hours to 8am - 5pm otherwise. 
        openingTime = TimeRange.getTimeInMinutes(8, 0);
        closingTime = TimeRange.getTimeInMinutes(17, 0);
    }
    // Add the place to the places object
    displayedPlaces[place.place_id] = { name: place.name,
                                    address: place.formatted_address,
                                    openingTime: openingTime,
                                    closingTime: closingTime };

    // Create the add button
    const addButton = document.createElement('div');
    addButton.setAttribute('class', 'place-button');
    addButton.setAttribute('id', 'place-button-' + place.place_id);
    
    const eventFromThisPlace = document.getElementById(place.place_id);
    if (eventFromThisPlace) {
        addButton.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
    }else {
        addButton.setAttribute('onclick', 'openAddPlaceForm(event, "' + place.place_id + '")');
        addButton.innerHTML = `<i class="material-icons small">playlist_add</i>`;
    }
    placeElement.appendChild(addButton);

    // Create place name as the card title
    const placeElementContent = document.createElement('div');
    placeElementContent.setAttribute('class', 'card-content');
    placeElementContent.innerHTML += `<span class="card-title">` + place.name + `</span>`;

    // Add the rest of information if they exist
    if (place.rating) {
        placeElementContent.appendChild(createParagraphElement(place.rating));    
    }
    if (place.photos) {
        const placePhotoSrc = place.photos[0].getUrl({maxWidth:400, maxHeight:200});
        const placePhotoElement = document.createElement('img');
        placePhotoElement.src = placePhotoSrc;
        placeElementContent.appendChild(placePhotoElement);    
    }
    if (place.formatted_address) {
        placeElementContent.appendChild(createParagraphElement(place.formatted_address));    
    }
    if (place.opening_hours) {
        place.opening_hours.weekday_text.forEach((day) => {
            placeElementContent.appendChild(createParagraphElement(day));
        }); 
    } else {
        placeElementContent.appendChild(createParagraphElement("Opening hours not available"));
    }
    if (place.url) {
        const placeUrlElement = document.createElement('a');
        placeUrlElement.href = place.url;
        placeUrlElement.target = '_blank';
        placeUrlElement.innerText = 'More';
        placeElementContent.appendChild(placeUrlElement);    
    }

    placeElement.appendChild(placeElementContent);
    return placeElement;
}

function createParagraphElement(text){
    const p = document.createElement('p');
    p.innerText = text;
    return p;
}

function openAddPlaceForm(event, placeId) {
    const addPlaceForm = document.getElementById('add-place-to-event-form');

    // Clone node to remove old event listeners
    const addPlaceFormClone = addPlaceForm.cloneNode(true);
    addPlaceForm.parentNode.replaceChild(addPlaceFormClone, addPlaceForm);

    addPlaceFormClone.style.display = 'block';
    addPlaceFormClone.style.left = event.clientX + 'px';
    addPlaceFormClone.style.top = event.clientY + 'px';
    document.getElementById('submit-place').addEventListener('click', () => {
        submitPlace(placeId);
    });
}

function closeAddPlaceForm() {
    const addPlaceForm = document.getElementById('add-place-to-event-form');
    addPlaceForm.style.display = 'none';
}

async function submitPlace(placeId) {
    const eventDuration = document.getElementById('add-place-duration').value;

    // Validate the input duration
    if (!validatePlaceDuration(eventDuration)){
        return;
    }

    const userId = firebase.auth().currentUser.uid;
    const listName = document.getElementById('list-options').value;
    const eventListRef = database.ref('events/' + userId + '/' + listName);
    // Get the order number by counting existing events
    const eventListSnapshot = await eventListRef.once('value');
    const order = eventListSnapshot.numChildren() + 1;

    const place = displayedPlaces[placeId];
    if (!place) {
        console.log ('Place object cannot be found :(');
        return;
    }
    const newEventRef = eventListRef.child(placeId);
    newEventRef.set({
        name: place.name,
        address: place.address,
        duration: eventDuration,
        openingTime: place.openingTime,
        closingTime: place.closingTime,
        order: order,
    });

    closeAddPlaceForm();
    disablePlaceButton(placeId);
}

function validatePlaceDuration(duration) {
    if (!duration) {
        alert('Please make sure to fill out the duration (0~9 hours inclusive)');
        return false;
    }
    if (duration < 0 || duration > 9) {
        alert('Please make sure duration is between 0 to 9 hours (inclusive)');
        return false;
    }
    return true;
}

export function renderPlaceButtons() {
    if (firebase.auth().currentUser === null) {
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    const placeListRef = database.ref('users/' + userId + '/places');
    placeListRef.once('value', (placeListSnapshot) => {
        placeListSnapshot.forEach(function(childPlace) {
            let placeId = childPlace.key;
            const eventExists = document.getElementById(placeId) !== null;
            if (eventExists) {
                disablePlaceButton(placeId);
            } else {
                enablePlaceButton(placeId);
            }
        });
    });
} 

export function enablePlaceButton(placeId) {
    const placeButton = document.getElementById('place-button-' + placeId);
    if (placeButton) {
        placeButton.setAttribute('onclick', 'openAddPlaceForm(event, "' + placeId + '")');
        placeButton.innerHTML = `<i class="material-icons small">playlist_add</i>`;
    }
}

export function disablePlaceButton(placeId) {
    const placeButton = document.getElementById('place-button-' + placeId);
    if (placeButton) {
        placeButton.onclick = null;
        placeButton.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
    }
}
