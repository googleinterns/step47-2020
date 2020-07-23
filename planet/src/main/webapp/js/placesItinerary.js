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
window.initEmptyMap = initEmptyMap;

// Declare global variables/constants.
const database = firebase.database();
let map;
let startingAddressAutocomplete;
let eventAddressAutocomplete;

function initEmptyMap() {
    map = new google.maps.Map(document.getElementById('empty-map'));
    let startAddress = document.getElementById('starting-address');
    let eventAddress = document.getElementById('add-event-address');

    let options = {
        types: ['geocode']
    };
    startingAddressAutocomplete = new google.maps.places.Autocomplete(startAddress, options); 
    startingAddressAutocomplete.setFields(['address_component']);
    startingAddressAutocomplete.addListener('place_changed', fillStartingAddress);

    eventAddressAutocomplete = new google.maps.places.Autocomplete(eventAddress, options);
    eventAddressAutocomplete.setFields(['address_component']);
}

function fillStartingAddress() {
    const startAddress = document.getElementById('starting-address');
    sessionStorage.setItem('start', startAddress.value);
}

export function renderPlaces() {
    const userId = firebase.auth().currentUser.uid;
    const placesRef = database.ref('users/' + userId + '/places');
    placesRef.once('value', (placesSnapshot) => {
        const placesContainer = document.getElementById('places');
        placesContainer.innerHTML = '';
        const savedPlaces = placesSnapshot.val();
        for (const placeId in savedPlaces) {
            // Make request with fields
            let placeRequest = {
                placeId: placeId,
                fields: ['place_id','name','rating','formatted_address',
                    'opening_hours','photos','url']
            };
            let service = new google.maps.places.PlacesService(map);
            service.getDetails(placeRequest, renderPlaceDetailsCallback); 
        }
    });
}

function renderPlaceDetailsCallback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        const placesContainer = document.getElementById('places');
        const placeElement = createPlaceElement(place);
        placesContainer.appendChild(placeElement);
    }    
}

function createPlaceElement(place) {
    const placeElement = document.createElement('div');
    placeElement.setAttribute('class', 'card place yellow lighten-4');
    placeElement.setAttribute('id', 'place-' + place.place_id);

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

function openAddPlaceForm(event, ref) {
    const addPlaceForm = document.getElementById('add-place-to-event-form');

    // Clone node to remove old event listeners
    const addPlaceFormClone = addPlaceForm.cloneNode(true);
    addPlaceForm.parentNode.replaceChild(addPlaceFormClone, addPlaceForm);

    addPlaceFormClone.style.display = 'block';
    addPlaceFormClone.style.left = event.clientX + 'px';
    addPlaceFormClone.style.top = event.clientY + 'px';
    document.getElementById('submit-place').addEventListener('click', () => {
        submitPlace(ref);
    });
}

function closeAddPlaceForm() {
    const addPlaceForm = document.getElementById('add-place-to-event-form');
    addPlaceForm.style.display = 'none';
}

async function submitPlace(ref) {
    const eventDuration = document.getElementById('add-place-duration').value;

    // Validate the input duration
    if (!validatePlaceDuration(eventDuration)){
        return;
    }

    // Create a new event based on the place details
    let placeRequest = {
        placeId: ref,
        fields: ['place_id','name','formatted_address','opening_hours']
    };
    let service = new google.maps.places.PlacesService(map);
    service.getDetails(placeRequest, submitPlaceCallback); 
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

async function submitPlaceCallback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let openingTime = 0;
        let closingTime = 0;
        if (place.opening_hours) {
            // for MVP purposes, use Monday's hours. 
            const openHours = place.opening_hours.periods[1].open.hours;
            const openMinutes = place.opening_hours.periods[1].open.minutes;
            const closeHours = place.opening_hours.periods[1].close.hours;
            const closeMinutes = place.opening_hours.periods[1].close.minutes;
            openingTime = TimeRange.getTimeInMinutes(openHours, openMinutes);
            closingTime = TimeRange.getTimeInMinutes(closeHours, closeMinutes);
        } else { 
            // Set the event's opening hours to 8am - 5pm otherwise. 
            openingTime = TimeRange.getTimeInMinutes(8, 0);
            closingTime = TimeRange.getTimeInMinutes(17, 0);
        }

        const userId = firebase.auth().currentUser.uid;
        const listName = document.getElementById('list-options').value;
        const eventDuration = document.getElementById('add-place-duration').value;
        const eventListRef = database.ref('events/' + userId + '/' + listName);
        // Get the order number by counting existing events
        const eventListSnapshot = await eventListRef.once('value');
        const order = eventListSnapshot.numChildren() + 1;

        const newEventRef = eventListRef.child(place.place_id);
        newEventRef.set({
            name: place.name,
            address: place.formatted_address,
            duration: eventDuration,
            openingTime: openingTime,
            closingTime: closingTime,
            order: order,
        });

        // Update the place's visitors
        // This will add the user id to the visitors list, along with the most recent timestamp 
        // In the future, the timestamp should be modified to when the users indicate they will visit 
        // the place, rather than when they add the place as an event
        const date = new Date();
        const timestamp = date.getTime();
        database.ref('places/' + place.place_id + '/visitors').update({
            [userId]: timestamp
        });

        closeAddPlaceForm();
        renderPlaceIcons(place.place_id, false);
    } 
}

export function renderPlaceIcons(placeId, enableAdd) {
    if (placeId) {
        const placeIcon = document.getElementById('place-button-' + placeId);
        if (placeIcon) {
            if (enableAdd) {
                placeIcon.setAttribute('onclick', 'openAddPlaceForm(event, "' + placeId + '")');
                placeIcon.innerHTML = `<i class="material-icons small">playlist_add</i>`;
            } else {
                placeIcon.onclick = null;
                placeIcon.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
            }
        }
    } else {
        const userId = firebase.auth().currentUser.uid;
        const placeListRef = database.ref('users/' + userId + '/places');
        placeListRef.once('value', (placeListSnapshot) => {
            placeListSnapshot.forEach(function(childPlace) {
                let placeId = childPlace.key;
                const event = document.getElementById(placeId);
                const placeIcon = document.getElementById('place-button-' + placeId);
                if (placeIcon){
                    if (event) {
                        placeIcon.onclick = null;
                        placeIcon.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
                    } else {
                        placeIcon.setAttribute('onclick', 'openAddPlaceForm(event, "' + placeId + '")');
                        placeIcon.innerHTML = `<i class="material-icons small">playlist_add</i>`;
                    }
                }
            });
        });
    }
}
