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
        renderList([
            {name: 'Event 1'},
            {name: 'Event 2'},
            {name: 'Event 3'},
            {name: 'Event 4'},
        ], 'List 1');
    }
}

function renderList(events, name) {
    const eventsSection = document.getElementById('events-section');
    const listName = document.createElement('h3');
    listName.classList.add('row');
    listName.innerHTML = name;
    eventsSection.appendChild(listName);
    for (const event of events) {
        eventsSection.appendChild(createEvent(event.name));
    }
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
