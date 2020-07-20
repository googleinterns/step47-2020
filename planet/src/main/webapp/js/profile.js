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

function diplaySection(sectionId) {
    switch(sectionId) {
        case 'about-section':
            document.getElementById('about-section').style.display = 'block';
            document.getElementById('posts-section').style.display = 'none';
            document.getElementById('events-section').style.display = 'none';
            break;
        case 'posts-section':
            document.getElementById('about-section').style.display = 'none';
            document.getElementById('posts-section').style.display = 'block';
            document.getElementById('events-section').style.display = 'none';
            break;
        case 'events-section':
            document.getElementById('about-section').style.display = 'none';
            document.getElementById('posts-section').style.display = 'none';
            document.getElementById('events-section').style.display = 'block';
            break;
    }
}

function activateLink(tabId) {
    switch(tabId) {
        case 'about-link':
            document.getElementById('about-link').classList.add('active');
            document.getElementById('posts-link').classList.remove('active');
            document.getElementById('events-link').classList.remove('active');
            break;
        case 'posts-link':
            document.getElementById('about-link').classList.remove('active');
            document.getElementById('posts-link').classList.add('active');
            document.getElementById('events-link').classList.remove('active');
            break;
        case 'events-link':
            document.getElementById('about-link').classList.remove('active');
            document.getElementById('posts-link').classList.remove('active');
            document.getElementById('events-link').classList.add('active');
            break;
    }
}

function switchSection(linkId, sectionId) {
    activateLink(linkId);
    diplaySection(sectionId);
}

async function loadUserInformation(username) {
    const usersReference = database.ref('/users');
    const userSnapshot = await usersReference.orderByChild('username').equalTo(username).once('value');
    if (userSnapshot.val() === null) {
        document.getElementById('profile-page').remove();
        document.getElementById('not-found-message').style.display = 'block';
        return;
    }
    document.getElementById('not-found-message').remove();
    document.getElementById('profile-page').style.display = 'block';
    let user;
    let userId;
    for (const object in userSnapshot.val()) {
        userId = object;
        user = userSnapshot.val()[object];
    }
    updateProfileHeader(
        userId,
        user['name'],
        user['location'],
        user['bio']
    );
}

function updateProfileHeader(userId, displayName, location, bio) {
    renderName(displayName);
    renderLocation(location, userId);
    renderBio(bio, userId);
    if (userId === currentUser.uid) {
        addEditButton();
    }
}

function renderName(displayName) {
    document.getElementById('display-name').innerText = displayName;
}

function renderLocation(location, userId) {
    if (location !== undefined) {
        addLocation(location);
        return;
    } 
    if (userId !== currentUser.uid) {
        addLocation('Somewhere, World');
        return;
    }
    const addLocationLink = document.createElement('a');
    addLocationLink.innerText = 'Add Location';
    addLocationLink.addEventListener('click', addLocationToDatabse);
    document.getElementById('location').innerHTML = '';
    document.getElementById('location').appendChild(addLocationLink);
}

function renderBio(bio, userId) {
    document.getElementById('bio').innerHTML = '';
    if (bio !== undefined) {
        document.getElementById('bio').innerText = bio;
        return;
    } 
    if (userId !== currentUser.uid) {
        document.getElementById('bio').innerText = 'No Bio';
        return;
    }
    const addBioLink = document.createElement('a');
    addBioLink.addEventListener('click', addNewBio);
    addBioLink.innerText = 'Add Bio';
    document.getElementById('bio').appendChild(addBioLink);
}

function addLocationToDatabse() {
    const userReference = database.ref('users/' + currentUser.uid);
    userReference.update({
        location: 'Waterloo, Canada'
    }).then(() => {
        renderLocation('Waterloo, Canada', currentUser.uid);
    });
}

function addNewBio() {
    // Create the text area
    const textArea = document.createElement('textarea');
    textArea.placeholder = 'Describe yourself ...';
    textArea.style.borderRadius = '5px';
    textArea.style.fontFamily = 'cursive';
    textArea.style.backgroundColor = 'white';
    textArea.id = 'bio-textarea';
    // Create the save button
    const saveButton = document.createElement('button');
    saveButton.classList.add('col', 'header-buttons');
    saveButton.innerText = 'Save';
    saveButton.addEventListener('click', saveBio);
    // Create the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('header-buttons', 'col');
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener('click', cancelBioEditing);
    // Create a button container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('row');
    buttonsContainer.style.margin = '0';
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(cancelButton);
    // Render the text area and the buttons
    document.getElementById('bio').innerHTML = '';
    document.getElementById('bio').appendChild(textArea);
    document.getElementById('bio').appendChild(buttonsContainer);
}

function saveBio() {
    const textArea = document.getElementById('bio-textarea');
    if (textArea !== null && textArea.value !== '') {
        addBioToDatabse(textArea.value);
        return;
    }
    cancelBioEditing();
}

function cancelBioEditing() {
    renderBio(undefined, currentUser.uid);
}

function addBioToDatabse(bio) {
    const userReference = database.ref('users/' + currentUser.uid);
    userReference.update({
        bio: bio
    }).then(() => {
        renderBio(bio, currentUser.uid);
    });
}

function addLocation(location) {
    const locationElement = document.getElementById('location');
    const placeIcon = document.createElement('i');
    placeIcon.classList.add('tiny', 'material-icons', 'col');
    placeIcon.style.padding = '0';
    placeIcon.innerHTML = 'place'; 
    const text = document.createElement('p');
    text.style.paddingLeft = '0';
    text.style.margin = '0';
    text.classList.add('col');
    text.innerText = location;
    locationElement.innerHTML = '';
    locationElement.appendChild(placeIcon);
    locationElement.appendChild(text);
}

function addEditButton() {
    const element = document.getElementById('profile-header');
    if (element === null) {
        return;
    }
    const editIcon = document.createElement('i');
    editIcon.classList.add('tiny', 'material-icons', 'col');
    editIcon.style.padding = '0';
    editIcon.innerHTML = 'edit';

    const button = document.createElement('button');
    button.id = 'edit-button';
    button.classList.add('header-buttons');
    button.appendChild(editIcon);
    
    const buttonText = document.createElement('span');
    buttonText.innerText = 'Edit Profile';
    button.appendChild(buttonText);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('col', 's3');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = '75%';
    buttonContainer.appendChild(button);
    element.appendChild(buttonContainer);
}
