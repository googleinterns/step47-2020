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


import TimeRange from './TimeRange.js';
// Declare global functions
window.openAddEventForm = openAddEventForm;
window.closeAddEventForm = closeAddEventForm;
window.openSaveEventsForm = openSaveEventsForm;
window.closeSaveEventsForm = closeSaveEventsForm;
window.handleStartingLocationChange = handleStartingLocationChange;
window.renderStartingLocation = renderStartingLocation;
window.handleListOptionChange = handleListOptionChange;
window.addEvent = addEvent;
window.saveEvents = saveEvents;
window.generateItinerary = generateItinerary;


function openAddEventForm() {
    document.getElementById('add-event').style.display = 'block';
}

// Clear input values and close the form
function closeAddEventForm() {
    document.getElementById('add-event-name').value = '';
    document.getElementById('add-event-address').value = '';
    document.getElementById('add-event-duration').value = '';
    document.getElementById('add-event').style.display = 'none';
}

function openSaveEventsForm() {
    document.getElementById('save-events-form').style.display = 'block';
    document.getElementById('save-events-button').style.display = 'none';
}

function closeSaveEventsForm() {
    document.getElementById('save-events-button').style.display = 'inline-block';
    document.getElementById('save-events-form').style.display = 'none';
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

function renderListOptions() {
    const userId = firebase.auth().currentUser.uid;
    const eventListRef = database.ref('events/' + userId);
    const selectListElement = document.getElementById('list-options');
    // Show the option "current list" regardless of what's stored in the database
    selectListElement.innerHTML = '<option value="currentList">Current List </option>';
    eventListRef.once('value', function(snap) {
        snap.forEach(function(childSnap) {
            let childKey = childSnap.key;
            if (childKey !== 'currentList') {
                let optionElement = document.createElement('option');
                optionElement.value = childKey;
                optionElement.innerText = childKey;
                selectListElement.add(optionElement);
                // Update the selected value
                if (childKey === sessionStorage.getItem('listName')) {        
                    optionElement.selected = true;
                }
            }
        });
        // Initialize the select tag again since options are dynamically loaded
        M.FormSelect.init(selectListElement, {});
    });
}

function handleListOptionChange() {
    const listName = document.getElementById ('list-options').value;
    sessionStorage.setItem('listName', listName);
    if (listName !== 'currentList') {
        document.getElementById('save-events-button').style.display = 'none';
    }else{
        document.getElementById('save-events-button').style.display = 'inline-block';
    }
    renderEvents(listName);
}

// Add an event to the firebase realtime database
// Todo: input validation, success/failure callbacks
async function addEvent() {
    const eventName = document.getElementById('add-event-name').value;
    const eventAddress = document.getElementById('add-event-address').value;
    const eventDuration = document.getElementById('add-event-duration').value;
    const userId = firebase.auth().currentUser.uid; 
    const listName = document.getElementById('list-options').value;

    // Validate the input fields
    if ((!eventDuration) || (!eventAddress) || (!eventDuration)) {
        alert('Please make sure to fill out all fields correctly');
        return;
    }
    if (eventDuration < 0 || eventDuration > 9) {
        alert('Please make sure duration is between 0 to 9 hours (inclusive)');
        return;
    }
    
    // Set every event's opening hours to 8am - 5pm for now
    const openingTime = TimeRange.getTimeInMinutes(8,0);
    const closingTime = TimeRange.getTimeInMinutes(17,0);

    const eventListRef = database.ref('events/' + userId + '/' + listName);
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
    closeAddEventForm();
}

// Check authentication status and render the list of events if the user has
// sign in.
// Todo: discuss with teammates to decide what to show if user is not signed in.
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        renderListOptions();
        renderEvents(document.getElementById('list-options').value);
    } else {
        console.log('Please sign in');
    }
});

function renderEvents(listName) {
    const userId = firebase.auth().currentUser.uid;
    const eventListRef = database.ref('events/' + userId + '/' + listName);
    eventListRef.orderByChild('order').on('value', (snap) => {
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = '';
        snap.forEach(function(child) {
            let eventObject = child.val();
            let eventElement = createEventElement (listName,
                                                child.key,
                                                eventObject.name, 
                                                eventObject.address, 
                                                eventObject.duration);
            eventsContainer.appendChild(eventElement);
        });
    });
}

function createEventElement(listName, ref, name, address, duration) {
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
        deleteEvent(listName, ref);
    });
    eventElement.appendChild(deleteButton);
    return eventElement;
}

function deleteEvent(listName, ref) {
    const userId = firebase.auth().currentUser.uid;
    const eventListRef = database.ref('events/' + userId + '/' + listName);
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

async function saveEvents() {
    const listName = document.getElementById('save-events-name').value;
    if (!listName) {
        alert('Please input a list name!');
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    const currentListRef = database.ref('events/' + userId + '/currentList');
    const newListRef = database.ref('events/' + userId + '/' + listName);
    const snap = await currentListRef.once('value');
    if (!snap){
        alert('Cannot save an empty list');
        return;
    }
    newListRef.set(snap.val());
    // Clear current list
    currentListRef.remove();
    // Update the select tag options and close save events form
    renderListOptions();
    closeSaveEventsForm();
}

async function generateItinerary() {
    if (!sessionStorage.getItem('start')) {
        alert('Please input a valid starting address');
        return;
    }
    
    const requestBody = [];
    // Add the starting point as the first event
    const startingPoint = {name: "Start", 
                        address: sessionStorage.getItem('start'), 
                        duration: 0,
                        openingTime: TimeRange.getStartOfDay(),
                        closingTime: TimeRange.getEndOfDay(),
                        order: 0};
    requestBody.push(startingPoint);
    
    // Add the rest of the events
    const userId = firebase.auth().currentUser.uid;
    const listName = document.getElementById('list-options').value;
    const eventListRef = database.ref('events/' + userId + '/' + listName);
    const snap = await eventListRef.once('value');
    snap.forEach(function(child) {
        requestBody.push(child.val());
    });
    const itineraryResponse = await fetch('/generate-itinerary', 
                        {method: 'POST', 
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(requestBody) });
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

// Initialize the select tags
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
        const listName = document.getElementById('list-options').value;
        const eventRef = database.ref('events/' + userId +'/' + listName + '/' + this.id);
        eventRef.update({
            order: i+1
        });
    });
} 
