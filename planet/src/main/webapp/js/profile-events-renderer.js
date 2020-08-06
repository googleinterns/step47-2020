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
let listDate = '08-07-2020';

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
        renderList(eventsList, listName, listDate);
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
        if (property !== 'date') {
            object[property].id = property;
            list.push(object[property]);
        } else {
            listDate = object[property];
        }
    }
    return list;
}

function renderList(events, name, date) {
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
    
    eventsListElement.appendChild(createListNameElement(name));
    eventsListElement.appendChild(createListDateElement(date));
    for (const event of events) {
        eventsListElement.appendChild(createEvent(event.name, event.address, event.duration, event.id));
    }
}

function createListNameElement(name) {
    const listName = document.createElement('h3');
    listName.style.textAlign = 'center';
    listName.style.marginBottom = '0';
    listName.classList.add('row');
    listName.innerHTML = name;
    return listName;
}

function createListDateElement(date) {
    const listDate = document.createElement('div');
    listDate.id = 'current-list-date';
    listDate.style.textAlign = 'center';
    listDate.style.width = 'fit-content';
    listDate.classList.add('row', 'valign-wrapper');
    listDate.innerHTML = 
        '<i class="col small material-icons" style="padding: 0">date_range</i>' +
        '<p>' + date + '</p>';
    return listDate;
}

function createEvent(name, address, duration, eventId) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('card');
    eventElement.style.backgroundColor = 'lightcyan';

    const visitorsIcon = createPeopleIcon();
    eventElement.appendChild(visitorsIcon);

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

function createPeopleIcon() {
    const visitorsIcon = document.createElement('i');
    visitorsIcon.classList.add('material-icons', 'row');
    visitorsIcon.id = 'event-' + eventId;
    visitorsIcon.style.position = 'absolute';
    visitorsIcon.style.right = '1%';
    visitorsIcon.innerText = 'people';
    visitorsIcon.title = 'People who visited the place';
    visitorsIcon.addEventListener('click', function() {
        const modalElement = document.getElementById('list-visitors');
        renderDateInput(event.target.id, listDate);
        renderVisitorsList(event.target.id, listDate);
        M.Modal.getInstance(modalElement).open();
    });
    return visitorsIcon;
}

function renderDateInput(eventId, date) {
    const dateContainer = document.getElementById('date-container');
    dateContainer.innerHTML = '';
    dateContainer.appendChild(createDateInput(event.target.id, listDate));
}

async function renderVisitorsList(eventId, date) {
    const placeId = eventId.slice(6, eventId.length);
    const visitors = await getVisitors(placeId, date);
    const listElement = document.getElementById('list-visitors-container');
    listElement.innerHTML = '';
    if (visitors.length !== 0) {
        for (const visitorId of visitors) {
            const dividerElement = document.createElement('div');
            dividerElement.classList.add('divider');
            listElement.appendChild(dividerElement);
            listElement.appendChild(createListElement(
                await getVisitorInfo(visitorId)
            ));
        }
    } else {
        const noVisitorsElement = document.createElement('p');
        noVisitorsElement.style.textAlign = 'center';
        noVisitorsElement.innerText = 'No one has ever visited this place! Be the first one';
        listElement.appendChild(noVisitorsElement);
    }
}

function createDateInput(eventId, initialValue) {
    const dateElement = document.createElement('input');
    dateElement.value = initialValue;
    dateElement.type = 'date';
    dateElement.style.width = 'auto';
    dateElement.style.margin = '0';
    dateElement.style.borderBottom = 'white';
    dateElement.addEventListener('change', () => {
        renderVisitorsList(eventId, dateElement.value);
    });
    return dateElement;
}

function createListElement(user) {
    const newElement = document.createElement('li');
    newElement.classList.add('row', 'result-element', 'valign-wrapper');
    newElement.style.margin = '0';
    newElement.style.marginTop = '0.5%';

    const nameContainer = document.createElement('div');
    nameContainer.classList.add('col', 's5');
    nameContainer.style.margin = '0';

    const nameElement = document.createElement('span');
    nameElement.classList.add('row');
    nameElement.innerText = user['name'];
    nameElement.style.fontSize = 'min(1.7vw, 16px)';
    nameElement.style.paddingRight = '1%';
    nameElement.style.margin = '0';
    
    const usernameElement = document.createElement('span');
    usernameElement.classList.add('row');
    usernameElement.innerText = '(' + user['username'] + ')';
    usernameElement.style.fontSize = 'min(1.2vw, 12px)';
    usernameElement.style.margin = '0';

    nameContainer.appendChild(nameElement);
    nameContainer.appendChild(usernameElement);

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('col', 's2', 'valign-wrapper');
    imageContainer.style.margin = '0';
    imageContainer.style.padding = '0';
    const image = document.createElement('img');
    image.src = user['profilePic'] !== undefined ? user['profilePic'] : '/images/profile-pic.png';
    image.classList.add('center-align', 'circle', 'responsive-img');
    imageContainer.appendChild(image);

    newElement.appendChild(imageContainer);
    newElement.appendChild(nameContainer);

    return newElement;
}

async function getVisitorInfo(visitorId) {
    const userSnapshot = await database.ref('users/' + visitorId).once('value');
    if (userSnapshot.val() === null) {
        alert('No visitor found with the id provided!');
    }
    return userSnapshot.val();
}

async function getVisitors(placeId, date) {
    let visitors = [];
    if (date === '') {
        return visitors;
    }
    const visitorsSnapshot = await database.ref('places/' + placeId + '/' + date).once('value');
    if (visitorsSnapshot.val() !== null) {
        visitorsSnapshot.forEach((userSnapshot) => {
            visitors.push(userSnapshot.key);
        });
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
    renderList(eventsList, listName, listDate);
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
    renderList(eventsList, listName, listDate);
}

function createIcon(icon) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('slide-events', 'material-icons');
    iconElement.innerText = icon;
    return iconElement;
}
