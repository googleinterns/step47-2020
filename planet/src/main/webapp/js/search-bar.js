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
    resultsContainer.innerHTML = '';
    const searchInput = document.getElementById('search-input').value;
    if (searchInput === '') {
        return;
    }
    database.ref('users').orderByChild('name')  // Order elements by name
    .startAt(searchInput + 'A') // Start at the users whose names start with searchInput + 'A'
    .endAt(searchInput + 'z')   // End with the users whose names start with searchInput + 'z'
    .limitToFirst(5) // Get the first 5 results
    .once('value', (usersSnapshot) => {
        usersSnapshot.forEach((childSnapshot) => {
            resultsContainer.appendChild(
                addSearchResultElement(
                    childSnapshot.val()['name'],
                    childSnapshot.val()['username']
                )
            );
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

function addSearchResultElement(name, username) {
    const newElement = document.createElement('li');
    
    const nameElement = document.createElement('span');
    nameElement.innerText = name;
    nameElement.style.fontSize = 'min(1.7vw, 16px)';
    nameElement.style.paddingRight = '1%';
    nameElement.style.margin = '0';
    
    const usernameElement = document.createElement('span');
    usernameElement.innerText = '(' + username + ')';
    usernameElement.style.fontSize = 'min(1.2vw, 12px)';
    usernameElement.style.margin = '0';
    
    
    newElement.classList.add('row', 'result-element');
    newElement.style.margin = '0';
    newElement.appendChild(nameElement);
    newElement.appendChild(usernameElement);
    return newElement;
}
