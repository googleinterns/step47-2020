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

// Declare global functions.
window.openAddPlaceForm = openAddPlaceForm;
window.closeAddPlaceForm = closeAddPlaceForm;

// Declare global variables/constants.
const database = firebase.database();
let map = new google.maps.Map(document.getElementById('empty-map'));

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
                fields: ['name','rating','formatted_phone_number','formatted_address',
                'opening_hours','photos','url']
            };
            let service = new google.maps.places.PlacesService(map);
            service.getDetails(placeRequest, renderPlaceDetailsCallback); 
        }
    });
}

function renderPlaceDetailsCallback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        // Add place details to dictionary
        // let placeDetails = {Name: '', Rating: '', Address: '', Photo: '',Phone: '',Hours: '',
        // Website: '',Opening: '',Closing: ''}; 

        // placeDetails['Name'] = place.name; 
        // // Check if place details exist
        // if (place.rating) {
        //     placeDetails['Rating'] = place.rating;    
        // }
        // if (place.formatted_address) {
        //     placeDetails['Address'] = place.formatted_address;
        // }
        // if (place.formatted_phone_number) {
        //     placeDetails['Phone'] = place.formatted_phone_number;
        // }
        // if (place.opening_hours) {
        //     placeDetails['Hours'] = place.opening_hours.weekday_text;
        //     // Open and closing time for Monday (MVP purposes)
        //     if (place.opening_hours.periods[1]) {
        //         placeDetails['Opening'] = place.opening_hours.periods[1].open.time;
        //         if (place.opening_hours.periods[1].close) {
        //             placeDetails['Closing'] = place.opening_hours.periods[1].close.time;
        //         }
        //     }
        // }
        // if (place.photos) {
        //     placeDetails['Photo'] = place.photos[0].getUrl({maxWidth:400, maxHeight:200});
        // }
        // if (place.url) {
        //     placeDetails['Website'] = place.url;
        // }
        console.log(place);
        const placesContainer = document.getElementById('places');
        const placeElement = createPlaceElement(place);
        placesContainer.appendChild(placeElement);
    }    
}



// function listResults() {
//     // Displays search results on page
//     for (let i = 0; i < placeInfo.length; i++) {
//         // Create materialize card for each result by creating dom element in HTML
//         let div1 = document.createElement('div');
//         div1.classList.add('card'); 
//         div1.classList.add('horizontal'); 
//         let div2 = document.createElement('div');
//         div2.classList.add('card-stacked');
//         let div3 = document.createElement('div');
//         div3.classList.add('card-content'); 

//         // Create elements to add to HTML
//         let p = document.createElement('p');
//         let p1 = document.createElement('p');
//         let p2 = document.createElement('p');
//         let p3 = document.createElement('p');
//         let p4 = document.createElement('p');
//         let p5 = document.createElement('p');
//         let p6 = document.createElement('p');
//         let a = document.createElement('a');

//         // Set variables for place details
//         let name = document.createTextNode(placeInfo[i]['Name']);
//         let rating = document.createTextNode('Rating: ' + placeInfo[i]['Rating']);
//         let address = document.createTextNode(placeInfo[i]['Address']);
//         let phoneNumber = document.createTextNode('Phone Number: ' + placeInfo[i]['Phone']);
//         let openingHours = document.createTextNode('Opening Hours: ' + placeInfo[i]['Hours']);
//         let open = document.createTextNode(placeInfo[i]['Opening']);
//         let close = document.createTextNode(placeInfo[i]['Closing']);
//         let img = document.createElement('img');


//         // Check for missing details, otherwise display through HTML
//         p.appendChild(name);        
//         p.setAttribute('id','place-name');
//         div3.appendChild(p);
//         if (placeInfo[i]['Rating'] != '') {
//             p1.appendChild(rating);
//             p1.setAttribute('id','place-rating');
//             div3.appendChild(p1);
//         }     
//          if (placeInfo[i]['Photo'] != '') {
//             img.src = placeInfo[i]['Photo'];
//             div3.appendChild(img); 
//         }      
//         if (address != '') {
//             p2.appendChild(address);
//             p2.setAttribute('id','place-address');
//             div3.appendChild(p2);
//         }
//         if (placeInfo[i]['Phone'] != '') {
//             p3.appendChild(phoneNumber);
//             p3.setAttribute('id','phone-number');
//             div3.appendChild(p3);         
//         }
//         if (placeInfo[i]['Hours'] != '') {
//             p4.appendChild(openingHours); 
//             p4.setAttribute('id','opening-hours');   
//             div3.appendChild(p4);      
//         }
//         if (placeInfo[i]['Opening'] != '') {
//             p5.appendChild(open);
//             p5.setAttribute('id','openingTime');
//             div3.appendChild(p5);
//         }
//         if (placeInfo[i]['Closing'] != '') {
//             p6.appendChild(close);
//             p6.setAttribute('id','closingTime');
//             div3.appendChild(p6); 
//         }
//         if (placeInfo[i]['Website'] != '') {
//             a.appendChild(document.createTextNode('Website'));
//             a.href = placeInfo[i]['Website'];
//             a.title = 'More'; 
//             div3.appendChild(a);
//         }
//         div2.appendChild(div3);
//         div1.appendChild(div2); 
//         element.appendChild(div1);
//     }
//     // Add search keyword to header
//     document.getElementById('greeting').innerHTML = 'Find a place: ' + document.getElementById('pac-input').value;
// }


function createPlaceElement(place) {
    const placeElement = document.createElement('div');
    placeElement.setAttribute('class', 'card place yellow lighten-4');
    placeElement.setAttribute('id', 'place-' + place.place_id);

    const addButton = document.createElement('div');
    addButton.setAttribute('class', 'place-button');
    
    const eventFromThisPlace = document.getElementById(place.place_id);
    if (eventFromThisPlace) {
        addButton.innerHTML = `<i class="material-icons small">playlist_add_check</i>`;
    }else {
        addButton.setAttribute('onclick', 'openAddPlaceForm(event, "' + place.place_id + '")');
        addButton.innerHTML = `<i class="material-icons small">playlist_add</i>`;
    }
    placeElement.appendChild(addButton);

    // placeElement.innerHTML += 
    //     `<div class="card-content">
    //       <span class="card-title">` + name + `</span>
    //       <p>` + address +`</p>
    //     </div>`;
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

    // Create a new event based on the place
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

    // Update the place's visitors
    // This will add the user id to the visitors list, along with the most recent timestamp 
    // In the future, the timestamp should be modified to when the users indicate they will visit 
    // the place, rather than when they add the place as an event
    const date = new Date();
    const timestamp = date.getTime();
    placeRef.child('visitors').update({
        [userId]: timestamp
    });

    closeAddPlaceForm();
    renderPlaces();
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
