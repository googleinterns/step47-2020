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


function openForm() {
    document.getElementById('add-event').style.display = 'block';
}

// Clear input values and close the form
function closeForm() {
    document.getElementById('add-event-name').value = '';
    document.getElementById('add-event-address').value = '';
    document.getElementById('add-event-duration').value = '';
    document.getElementById('add-event').style.display = 'none';
}

function handleStartingLocationChange() {
    if (typeof(Storage) !== 'undefined') {
        sessionStorage.setItem('start', document.getElementById('starting-address').value);
    } else {
        alert ('Please update your browser'); 
    }
}

function renderStartingLocation() {
    if (sessionStorage.getItem('start')) {
        document.getElementById('starting-address').value = sessionStorage.getItem('start');
    }
}

// Add an event to the firebase realtime database
// Todo: input validation, order, success/failure callbacks
async function addEvent() {
    const eventName = document.getElementById('add-event-name').value;
    const eventAddress = document.getElementById('add-event-address').value;
    const eventDuration = document.getElementById('add-event-duration').value;
    const userId = firebase.auth().currentUser.uid; 
    
    // Set every event's opening hours to 8am - 5pm for now
    const openingTime = TimeRange.getTimeInMinutes(8,0);
    const closingTime = TimeRange.getTimeInMinutes(17,0);

    const eventListRef = database.ref('users/' + userId + '/currentList');
    // Get the order number by counting existing events
    const snap = await eventListRef.once('value');
    const order = snap.numChildren() + 1;

    //Create a new event
    const newEventRef = eventListRef.push();
    newEventRef.set({
        name: eventName,
        address: eventAddress,
        duration: eventDuration,
        openingTime: openingTime,
        closingTime: closingTime,
        order: order,
    });
    closeForm();
}

// Check authentication status and render the list of events if the user has
// sign in.
// Todo: discuss with teammates to decide what to show if user is not signed in.
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    renderEvents('currentList');
  } else {
     console.log('Please sign in');
  }
});

function renderEvents(listName) {
    const userId = firebase.auth().currentUser.uid;
    const eventListRef = database.ref('users/' + userId + '/' + listName);
    eventListRef.orderByChild('order').on('value', (snap) => {
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = '';
        snap.forEach(function(child) {
            let eventObject = child.val();
            let eventElement = createEventElement (child.key,
                                                eventObject.name, 
                                                eventObject.address, 
                                                eventObject.duration);
            eventsContainer.appendChild(eventElement);
        });
    });
}

function createEventElement(ref, name, address, duration) {
    const eventElement = document.createElement('div');
    eventElement.setAttribute('class', 'card event');
    eventElement.setAttribute('id', ref);
    eventElement.innerHTML = 
        `<div class="card-content">
          <span class="card-title">` + name + `</span>
          <p>` + address +`</p>
        </div>
        <div class="card-action">
          <a>` + duration + ` hours </a>
        </div>`;
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
        deleteEvent(ref);
    });
    eventElement.appendChild(deleteButton);
    return eventElement;
}

function deleteEvent(ref) {
    const userId = firebase.auth().currentUser.uid;
    const eventListRef = database.ref('users/' + userId + '/currentList');
    const toBeDeletedEventRef = eventListRef.child(ref);
    toBeDeletedEventRef.remove();

    // Fix order after deleting the event
    eventListRef.orderByChild('order').once('value', (snap) => {
        const events = snap.val();
        let count = 1;
        for (let eventKey in events){
            if (events[eventKey].order !== count){
                eventListRef.child(eventKey).update({
                    order: count
                });
            }
            count += 1;
        }
    });
}

async function generateItinerary() {
    if (!sessionStorage.getItem('start')) {
        alert('Please input a valid starting address');
        return;
    }
    const params = new URLSearchParams();
    params.append('starting-address', sessionStorage.getItem('start'));
    const itineraryResponse = await fetch('/generate-itinerary', {method: 'POST', body: params});
    const itinerary = await itineraryResponse.json();
    createItinerary(itinerary);
}

function timeToString(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hoursString = hours < 10 ? ('0' + hours) : hours;
    const minutesString = minutes < 10 ? ('0' + minutes) : minutes;
    return hoursString + ':' + minutesString;
}

function createItinerary(items) {
    const itineraryContainer = document.getElementById('itinerary');
    itineraryContainer.innerHTML = '';

    items.forEach((item) => {
        // Only show one time stamp for 0 length events.
        if (item.when.start === item.when.end) {
            itineraryContainer.innerHTML += '<li>' + item.name + ', ' + item.address + ', ' + 
                                timeToString(item.when.start) + '</li>';
        }else {
            itineraryContainer.innerHTML += '<li>' + item.name + ', ' + item.address + ', ' + 
                timeToString(item.when.start) + ' - ' + timeToString(item.when.end) + '</li>';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('select');
    let instances = M.FormSelect.init(elems, {});
});

// jQuery function that reorders the events on the front end
$(function() { 
    $( "#events" ).sortable({
        update: function() { 
            reorderEvents(); 
        }       
    }); 
}); 

// Reorder in firebase
function reorderEvents() { 
    $('.event').each(function (i) {
        const userId = firebase.auth().currentUser.uid;
        const eventRef = database.ref('users/' + userId +'/currentList/' + this.id);
        eventRef.update({
            order: i+1
        });
    });
} 

// This is a class representing a time range, it mirrors the TimeRange class in the server
class TimeRange {
    constructor(start, duration) {
        this.start = start;
        this.duration = duration;
        this.end = start + duration;
    }
    getStartTime() {
        return this.start;
    }
    getEndTime() {
        return this.end;
    }
    static getTimeInMinutes(hours, minutes) {
        if (hours < 8 || hours > 19) {
            throw new Error("Hours can only be 8 through 19 (inclusive).");
        }
        if (minutes < 0 || minutes > 59) {
            throw new Error("Minutes can only be 0 through 59 (inclusive).");
        }
        return (hours * 60) + minutes;
    }
}


