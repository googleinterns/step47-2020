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

let elementIndex = -1;

function onKeyUp(event) {
    if (event.key === 'ArrowDown') {
        focusOnNextElement();
        return;
    }
    if (event.key === 'ArrowUp') {
        focusOnPreviousElement();
        return;
    }
    if (event.key === 'Enter') {
        openProfile(document.getElementById('search-result-item-' + elementIndex));
        return;
    }
}

function getSearchResults() {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '';
    const searchInput = document.getElementById('search-input').value;
    if (searchInput === '') {
        return;
    }
    elementIndex = -1;
    database.ref('users').orderByChild('name')  // Order elements by name
    .startAt(searchInput + ' ') // Start at the users whose names start with searchInput + ' '
    .endAt(searchInput + 'z')   // End with the users whose names start with searchInput + 'z'
    .limitToFirst(5) // Get the first 5 results
    .once('value', (usersSnapshot) => {
        let counter = 0;
        usersSnapshot.forEach((childSnapshot) => {
            resultsContainer.appendChild(
                addSearchResultElement(
                    childSnapshot.val()['name'],
                    childSnapshot.val()['username'],
                    childSnapshot.val()['profilePic'],
                    'search-result-item-' + counter
                )
            );
            counter++;
        });
    })
}

function focusOnNextElement() {
    const resultsContainer = document.getElementById('search-results-container');
    // Check if there is a next element
    if (elementIndex + 1 < resultsContainer.childNodes.length) {
        if (elementIndex >= 0) {
            document.getElementById('search-result-item-' + elementIndex).style.backgroundColor = 'white';
        }
        elementIndex++;
        document.getElementById('search-result-item-' + elementIndex).style.backgroundColor = 'lightgrey';
    }
}

function focusOnPreviousElement() {
    // Check if there is a previous element
    if (elementIndex - 1 >= 0) {
        document.getElementById('search-result-item-' + elementIndex).style.backgroundColor = 'white';
        elementIndex--;
        document.getElementById('search-result-item-' + elementIndex).style.backgroundColor = 'lightgrey';
    }
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

function addSearchResultElement(name, username, pictureSrc, id) {
    const newElement = document.createElement('li');
    newElement.id = id;
    
    const nameElement = document.createElement('span');
    nameElement.innerText = name;
    nameElement.style.fontSize = 'min(1.7vw, 16px)';
    nameElement.style.paddingRight = '1%';
    nameElement.style.margin = '0';
    
    const usernameElement = document.createElement('span');
    usernameElement.innerText = '(' + username + ')';
    usernameElement.style.fontSize = 'min(1.2vw, 12px)';
    usernameElement.style.margin = '0';

    const imageElement = createProfilePicture(pictureSrc);
    
    newElement.classList.add('row', 'result-element', 'valign-wrapper');
    newElement.style.margin = '0';
    newElement.style.marginTop = '0.5%';
    newElement.setAttribute('onmouseenter', 'onMouseEnter(event)');
    newElement.setAttribute('onmouseleave', 'onMouseLeave(event)');
    newElement.setAttribute('onmousedown', 'accessProfile(event)');
    newElement.appendChild(imageElement);
    newElement.appendChild(nameElement);
    newElement.appendChild(usernameElement);
    return newElement;
}

function onMouseEnter(event) {
    event.currentTarget.style.backgroundColor = 'lightgray';
    const element =  document.getElementById('search-result-item-' + elementIndex);
    if (element) {
        element.style.backgroundColor = 'white';
    }
    // Get the element index from the id
    // The id of the 3rd elements, for instance, is search-result-item-3
    elementIndex = event.currentTarget.id[event.currentTarget.id.length - 1];
}

function onMouseLeave(event) {
    event.currentTarget.style.backgroundColor = 'white';  
}

function accessProfile(event) {
    const userElement = event.currentTarget;
    openProfile(userElement);
}

function openProfile(userElement) {
    if (userElement) {
        let username = userElement.lastElementChild.innerText;
        username = username.slice(1, username.length - 1);
        window.location.href = '/user/' + username;
    }
}

function createProfilePicture(src) {
    src = src !== undefined ? src : '/images/profile-pic.png';
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('col', 's1', 'valign-wrapper');
    imageContainer.style.margin = '0';
    imageContainer.style.padding = '0';

    const image = document.createElement('img');
    image.src = src;
    image.classList.add('center-align', 'circle', 'responsive-img');

    imageContainer.appendChild(image);
    return imageContainer;
}
