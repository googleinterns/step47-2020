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

let userId;
let listIndex = 0;
let eventsList = [];
let listName = 'List X';

export const ProfileEventsRenderer = { 
    renderListOfEvents: async (uid) => {
        userId = uid;
        document.getElementById('events-section').innerHTML = '';
        await readListFromDatabase();
        if (eventsList.length === 0 || listName === 'currentList') {
            displayEmptyListMessage();
            return;
        }
        renderSlideButton('keyboard_arrow_left');
        renderList(eventsList, listName);
        renderSlideButton('keyboard_arrow_right');
    }
}

function displayEmptyListMessage() {
    const eventsSection = document.getElementById('events-section');
    const message = document.createElement('div');
    message.innerText = 'No saved events to display. Please try our saving feature!';
    eventsSection.appendChild(message);
}

async function readListFromDatabase() {
    const eventsSnapshot = await getEventsSnapshot();
    if (eventsSnapshot.val() === null) {
        eventsList = [];
        return;
    }
    eventsList = getListFromSnapshot(listIndex, eventsSnapshot);
}

async function getEventsSnapshot() {
    const eventsReference = database.ref('events/' + userId);
    return await eventsReference.once('value');
}

function getListFromSnapshot(index, snapshot) {
    let counter = 0;
    for (const listId in snapshot.val()) {
        if (counter === index) {
            listName = listId;
            return getListFromObject(snapshot.val()[listId]);
        }
        counter++;
    }
    return [];
}

function getListFromObject(object) {
    let list = [];
    for (const property in object) {
        object[property].id = property;
        list.push(object[property]);
    }
    return list;
}

function renderList(events, name) {
    const eventsSection = document.getElementById('events-section');
    eventsSection.style.paddingTop = '2%';
    let eventsListElement = document.getElementById('events-list');
    if (eventsListElement === null) {
        eventsListElement = document.createElement('div');
        eventsListElement.id = 'events-list';
        eventsListElement.classList.add('card');
        eventsSection.appendChild(eventsListElement);
    }
    eventsListElement.innerHTML = '';
    eventsListElement.style.display = 'table-cell';
    eventsListElement.style.width = '95%';
    const listName = document.createElement('h3');
    listName.style.textAlign = 'center';
    listName.classList.add('row');
    listName.innerHTML = name;
    eventsListElement.appendChild(listName);
    for (const event of events) {
        eventsListElement.appendChild(createEvent(event.name, event.address, event.duration, event.id));
    }
}

function createEvent(name, address, duration, eventId) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('card');
    eventElement.style.backgroundColor = 'lightcyan';

    const usersIcon = document.createElement('i');
    usersIcon.classList.add('material-icons', 'row');
    usersIcon.id = 'event-' + eventId;
    usersIcon.style.position = 'absolute';
    usersIcon.style.right = '1%';
    usersIcon.innerText = 'people';
    usersIcon.title = 'People who visited the place';
    usersIcon.addEventListener('click', function() { 
        renderVisitorsList(event.target.id);
    });
    eventElement.appendChild(usersIcon);

    const eventName = document.createElement('h4');
    eventName.classList.add('row');
    eventName.style.textAlign = 'center';
    eventName.style.paddingTop = '10px';
    eventName.innerHTML = name;
    eventElement.appendChild(eventName);

    const eventAddress = document.createElement('div');
    eventAddress.classList.add('row', 'valign-wrapper');
    eventAddress.style.width = 'fit-content';
    eventAddress.style.marginBottom = '0';

    const placeIcon = document.createElement('i');
    placeIcon.classList.add('material-icons');
    placeIcon.innerText = 'place';

    const addressText = document.createElement('p');
    addressText.innerText = address;

    eventAddress.appendChild(placeIcon);
    eventAddress.appendChild(addressText);
    eventElement.appendChild(eventAddress);

    const durationElement = document.createElement('div');
    durationElement.classList.add('row', 'valign-wrapper');
    durationElement.style.width = 'fit-content';

    const alarmIcon = document.createElement('i');
    alarmIcon.classList.add('material-icons');
    alarmIcon.innerText = 'alarm';

    const durationText = document.createElement('p');
    durationText.innerText = getDuration(duration);

    durationElement.appendChild(alarmIcon);
    durationElement.appendChild(durationText);
    eventElement.appendChild(durationElement);
    return eventElement;
}

async function renderVisitorsList(eventId) {
    const placeId = eventId.slice(6, eventId.length);
    const visitors = await getVisitors(placeId);
    const modalElement = document.getElementById('list-visitors');
    modalElement.innerHTML = '';
    if (visitors.length !== 0) {
        for (const visitorId of visitors) {
            modalElement.appendChild(createListElement(
                await getVisitorName(visitorId)
            ));
        }
    } else {
        const noVisitorsElement = document.createElement('p');
        noVisitorsElement.style.textAlign = 'center';
        noVisitorsElement.innerText = 'No one has ever visited this place! Be the first one';
        modalElement.appendChild(noVisitorsElement);
    }
    M.Modal.getInstance(modalElement).open();
}

function createListElement(text) {
    const element = document.createElement('li');
    element.style.textAlign = 'center';
    element.innerText = text;
    return element;
}

async function getVisitorName(visitorId) {
    const userSnapshot = await database.ref('users/' + visitorId).once('value');
    if (userSnapshot.val() === null) {
        alert('No visitor found with the id provided!');
    }
    return userSnapshot.val()['name'];
}

async function getVisitors(placeId) {
    let visitors = [];
    const placeSnapshot = await database.ref('places/' + placeId).once('value');
    if (placeSnapshot.val() !== null) {
        for (const userId in placeSnapshot.val().visitors) {
            visitors.push(userId);
        }
    }
    return visitors;
}

function getDuration(duration) {
    const hours = Math.floor(duration);
    const minutes = (duration - hours) * 60;
    return hours + ' hours and ' + minutes + ' minutes';
}

function renderSlideButton(icon) {
    const eventsSection = document.getElementById('events-section');
    const slideElement = document.createElement('div');
    slideElement.classList.add('valign-wrapper');
    slideElement.style.display = 'table-cell';
    if (icon === 'keyboard_arrow_left') {
        slideElement.addEventListener('click', getPreviousList);
    }
    if (icon === 'keyboard_arrow_right') {
        slideElement.addEventListener('click', getNextList);
    }
    slideElement.appendChild(createIcon(icon));
    eventsSection.appendChild(slideElement);
}

async function getNextList() {
    const eventsSnapshot = await getEventsSnapshot();
    if (eventsSnapshot.val() === null) {
        return;
    }
    listIndex++;
    eventsList = getListFromSnapshot(listIndex, eventsSnapshot);
    if (eventsList.length === 0 || listName == 'currentList') {
        listIndex--;
        return;
    }
    renderList(eventsList, listName);
}

async function getPreviousList() {
    const eventsSnapshot = await getEventsSnapshot();
    if (eventsSnapshot.val() === null) {
        return;
    }
    listIndex--;
    eventsList = getListFromSnapshot(listIndex, eventsSnapshot);
    if (eventsList.length === 0 || listName == 'currentList') {
        listIndex++;
        return;
    }
    renderList(eventsList, listName);
}

function createIcon(icon) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('slide-events', 'material-icons');
    iconElement.innerText = icon;
    return iconElement;
}
