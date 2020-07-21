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

export const ProfileEventsRenderer = {
    init: () => {
        renderSlideButton('keyboard_arrow_left');
        renderList([
            {name: 'Event 1'},
            {name: 'Event 2'},
            {name: 'Event 3'},
            {name: 'Event 4'},
        ], 'List 1');
        renderSlideButton('keyboard_arrow_right');
    }
}

function renderList(events, name) {
    const eventsSection = document.getElementById('events-section');
    const eventsList = document.createElement('div');
    eventsList.style.display = 'table-cell';
    eventsList.style.width = '95%';
    const listName = document.createElement('h3');
    listName.style.textAlign = 'center';
    listName.classList.add('row');
    listName.innerHTML = name;
    eventsList.appendChild(listName);
    for (const event of events) {
        eventsList.appendChild(createEvent(event.name));
    }
    eventsSection.appendChild(eventsList);
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
