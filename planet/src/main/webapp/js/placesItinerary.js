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
window.openAddPlaceForm = openAddPlaceForm;
window.closeAddPlaceForm = closeAddPlaceForm;

export function renderPlaces() {
    const userId = firebase.auth().currentUser.uid;
    const placesRef = database.ref('users/' + userId + '/places');
    placesRef.on('value', (placesSnapshot) => {
        const placesContainer = document.getElementById('places');
        placesContainer.innerHTML = '';
        placesSnapshot.forEach((childPlace) => {
            let placeDetailsRef = database.ref('places/' + childPlace.val());
            placeDetailsRef.once('value', (placeDetailsSnapshot) => {
                let placeObject = placeDetailsSnapshot.val();
                let placeElement = createPlaceElement (placeDetailsSnapshot.key,
                                                placeObject.name, 
                                                placeObject.address);
                placesContainer.appendChild(placeElement);
            });
        });
    });
}

function createPlaceElement(ref, name, address) {
    const placeElement = document.createElement('div');
    placeElement.setAttribute('class', 'card place yellow lighten-4');
    placeElement.setAttribute('id', 'place-' + ref);

    const addButton = document.createElement('div');
    addButton.setAttribute('class', 'place-button');
    
    const eventFromThisPlace = document.getElementById(ref);
    if (eventFromThisPlace) {
        addButton.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
    }else {
        addButton.setAttribute('onclick', 'openAddPlaceForm(event, "' + ref + '")');
        addButton.innerHTML = `<i class="material-icons small">playlist_add</i>`;
    }
    placeElement.appendChild(addButton);

    placeElement.innerHTML += 
        `<div class="card-content">
          <span class="card-title">` + name + `</span>
          <p>` + address +`</p>
        </div>`;
    return placeElement;
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

    const userId = firebase.auth().currentUser.uid;
    const listName = document.getElementById('list-options').value;
    const eventListRef = database.ref('events/' + userId + '/' + listName);
    // Get the order number by counting existing events
    const eventListSnapshot = await eventListRef.once('value');
    const order = eventListSnapshot.numChildren() + 1;

    //Create a new event based on the place
    const placeRef = database.ref('places/' + ref); 
    const placeSnapshot = await placeRef.once('value');
    const placeDetails = placeSnapshot.val();

    const newEventRef = eventListRef.child(ref);
    newEventRef.set({
        name: placeDetails.name,
        address: placeDetails.address,
        duration: eventDuration,
        openingTime: placeDetails.openingTime,
        closingTime: placeDetails.closingTime,
        order: order,
    });
    closeAddPlaceForm();
}

function validatePlaceDuration(duration) {
    let isValid = true;
    if (!duration) {
        alert('Please make sure to fill out the duration (0~9 hours inclusive)');
        isValid = false;
        return isValid;
    }
    if (duration < 0 || duration > 9) {
        alert('Please make sure duration is between 0 to 9 hours (inclusive)');
        isValid = false;
        return isValid;
    }
    return isValid;
}
