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
let listIndex = 1;
let eventsList = [];
let listName = 'List X';

export const ProfileEventsRenderer = { 
    init: async (uid) => {
        userId = uid;
        await readListFromDatabase();
        renderSlideButton('keyboard_arrow_left');
        renderList(eventsList, listName);
        renderSlideButton('keyboard_arrow_right');
    }
}

async function readListFromDatabase() {
    const eventsReference = database.ref('events/' + userId);
    const eventsSnapshot = await eventsReference.once('value');
    if (eventsSnapshot.val() === null) {
        eventsList = [];
        return;
    }
    let counter = 0;
    for (const listId in eventsSnapshot.val()) {
        if (counter === listIndex) {
            listName = listId;
            eventsList = getListFromObject(eventsSnapshot.val()[listId]);
            return;
        }
        counter++;
    }
    eventsList = [];
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
    const eventsListElement = document.createElement('div');
    eventsListElement.style.display = 'table-cell';
    eventsListElement.style.width = '95%';
    const listName = document.createElement('h3');
    listName.style.textAlign = 'center';
    listName.classList.add('row');
    listName.innerHTML = name;
    eventsListElement.appendChild(listName);
    for (const event of events) {
        eventsListElement.appendChild(createEvent(event.name));
    }
    eventsSection.appendChild(eventsListElement);
}

function createEvent(name) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('card');
    const eventName = document.createElement('h4');
    eventName.classList.add('row');
    eventName.innerHTML = name;
    eventElement.appendChild(eventName);
    return eventElement;
}

function renderSlideButton(icon) {
    const eventsSection = document.getElementById('events-section');
    const slideElement = document.createElement('div');
    slideElement.classList.add('slide-events', 'valign-wrapper');
    slideElement.appendChild(createIcon(icon));
    eventsSection.appendChild(slideElement);
}

function createIcon(icon) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('material-icons');
    iconElement.innerText = icon;
    return iconElement;
}
