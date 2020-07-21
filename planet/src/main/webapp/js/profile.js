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
        default:
            console.log('Unhandled section id:' + sectionId);
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
        default:
            console.log('Unhandled link id:' + linkId);
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
    // The userSnapshot.val() contains one property (user)
    for (const property in userSnapshot.val()) {
        userId = object;
        user = userSnapshot.val()[property];
    }
    updateProfileHeader(
        userId,
        user['name'],
        user['location'],
        user['bio']
    );
}

function updateProfileHeader(userId, displayName, location, bio) {
    document.getElementById('display-name').innerText = displayName;
    renderLocation(location, userId);
    renderBio(bio, userId);
}

function renderLocation(location, userId) {
    if (location !== undefined) {
        document.getElementById('location').innerHTML =
            '<i class="tiny material-icons col" style="padding: 0;">place</i>\
            <p class="col" style="padding-left: 0; margin: 0">' + location + '</p>';
        return;
    } 
    if (userId !== currentUser.uid) {
        document.getElementById('location').innerHTML =
            '<i class="tiny material-icons col" style="padding: 0;">place</i>\
            <p class="col" style="padding-left: 0; margin: 0">Somewhere, World</p>';
        return;
    }
    const addLocationLink = document.createElement('a');
    addLocationLink.innerText = 'Add Location';
    // This is an example, later the user will be selecting the city
    addLocationLink.addEventListener('click', addLocationToDatabse);
    document.getElementById('location').innerHTML = '';
    document.getElementById('location').appendChild(addLocationLink);
}

function renderBio(bio, userId) {
    if (bio !== undefined) {
        document.getElementById('bio').innerText = bio;
        return;
    } 
    if (userId !== currentUser.uid) {
        document.getElementById('bio').innerText = 'No Bio';
        return;
    }
    const addBioLink = document.createElement('a');
    // This is an example, later the user will be writing the bio
    addBioLink.addEventListener('click', addBioToDatabse);
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
