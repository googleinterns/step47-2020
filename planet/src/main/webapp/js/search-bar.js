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

function onKeyUp() {
    const resultsContainer = document.getElementById('search-results-container');
    const searchInput = document.getElementById('search-input').value;
    database.ref('users').orderByChild('name').
    startAt(searchInput + 'A')
    .endAt(searchInput + 'z')
    .limitToFirst(5)
    .once('value', (usersSnapshot) => {
        resultsContainer.innerHTML = '';
        usersSnapshot.forEach((childSnapshot) => {
            resultsContainer.appendChild(addSearchResultElement(childSnapshot.val()['name']));
        });
    })
}

function displayContainer() {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.style.display = 'block';
    resultsContainer.style.opacity = '1';
}

function hideContainer() {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.style.display = 'none';
    resultsContainer.style.opacity = '0';
}

function addSearchResultElement(userName) {
    const newElement = document.createElement('li');
    newElement.classList.add('row', 'result-element');
    newElement.style.margin = '0';
    newElement.innerText = userName;
    return newElement;
}
