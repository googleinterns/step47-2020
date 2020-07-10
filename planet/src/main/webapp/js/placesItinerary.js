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
export function renderPlaces() {
    const userId = firebase.auth().currentUser.uid;
    const placesRef = database.ref('places/' + userId);
    placesRef.on('value', (placesSnapshot) => {
        const placesContainer = document.getElementById('places');
        placesContainer.innerHTML = '';
        placesSnapshot.forEach((childPlace) => {
            let placeObject = childPlace.val();
            let placeElement = createPlaceElement (childPlace.key,
                                                placeObject.name, 
                                                placeObject.address);
            placesContainer.appendChild(placeElement);
        });
    });
}

function createPlaceElement(ref, name, address) {
    const placeElement = document.createElement('div');
    placeElement.setAttribute('class', 'card place yellow lighten-4');
    placeElement.setAttribute('id', ref);

    const addButton = document.createElement('a');
    addButton.setAttribute('class', ' place-button');
    addButton.innerHTML = `<i class="material-icons small">playlist_add</i>`;
    placeElement.appendChild(addButton);

    placeElement.innerHTML += 
        `<div class="card-content">
          <span class="card-title">` + name + `</span>
          <p>` + address +`</p>
        </div>`;
    return placeElement;
}
