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
    renderName(displayName, userId);
    renderLocation(location, userId);
    renderBio(bio, userId);
}

function renderName(displayName, userId) {
    document.getElementById('display-name').innerText = displayName;
    if (userId === currentUser.uid) {
        addEditIcon('name-container', 'edit-name');
    }
}

function renderLocation(location, userId) {
    if (location !== undefined) {
        addLocation(location);
        if (userId === currentUser.uid) {
            addEditIcon('location-container', 'edit-location');
        }
        return;
    } 
    if (userId !== currentUser.uid) {
        addLocation('Somewhere, World');
        removeEditIcon ('edit-location');
        return;
    }
    const addLocationLink = document.createElement('a');
    addLocationLink.innerText = 'Add Location';
    addLocationLink.addEventListener('click', addLocationToDatabse);
    removeEditIcon('edit-location');
    document.getElementById('location').innerHTML = '';
    document.getElementById('location').appendChild(addLocationLink);
}

function renderBio(bio, userId) {
    if (bio !== undefined) {
        document.getElementById('bio').innerText = bio;
        if (userId === currentUser.uid) {
            addEditIcon('bio-container', 'edit-bio');
        }
        return;
    } 
    if (userId !== currentUser.uid) {
        document.getElementById('bio').innerText = 'No Bio';
        removeEditIcon ('edit-bio');
        return;
    }
    const addBioLink = document.createElement('a');
    addBioLink.addEventListener('click', addBioToDatabse);
    removeEditIcon ('edit-bio');
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

function addBioToDatabse() {
    const userReference = database.ref('users/' + currentUser.uid);
    userReference.update({
        bio: 'This is my bio'
    }).then(() => {
        renderBio('This is my bio', currentUser.uid);
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

function addEditIcon(elementId, iconId) {
    const element = document.getElementById(elementId);
    if (element === null) {
        return;
    }
    const editIcon = document.createElement('i');
    editIcon.classList.add('tiny', 'material-icons', 'col');
    editIcon.style.padding = '0';
    editIcon.title = 'Edit';
    editIcon.classList.add('edit-icon');
    editIcon.innerHTML = 'edit';
    const iconContainer = document.createElement('span');
    iconContainer.classList.add('col', 's1');
    iconContainer.id = iconId;
    iconContainer.appendChild(editIcon);
    element.appendChild(iconContainer);
}

function removeEditIcon(iconId) {
    const icon = document.getElementById(iconId);
    if (icon !== null) {
        icon.remove();
    }
}
