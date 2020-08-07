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

import {HeaderRenderer} from './headerRenderer.js';
import {ProfileEventsRenderer} from './profile-events-renderer.js';
import {AboutSectionRenderer} from './about-section-renderer.js';

window.loadUserInformation = loadUserInformation;
window.switchSection = switchSection;
window.updateImage = updateImage;
window.resetProfilePicture = resetProfilePicture;
window.updateProfilePicture = updateProfilePicture;

const VALID_FILE_TYPES = [
    "image/apng",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    "image/x-icon"
];

// Declare global constantes and variables
const database = firebase.database();
let user;
let userId;

function diplaySection(sectionId) {
    switch(sectionId) {
        case 'about-section':
            document.getElementById('about-section').style.display = 'block';
            AboutSectionRenderer.init(
                user['work'],
                user['school'],
                user['dateOfBirth'],
                user['phoneNumber'],
                user['email'],
                user['origin'] 
            );
            hideSection('posts-section');
            hideSection('events-section');
            break;
        case 'posts-section':
            hideSection('about-section');
            document.getElementById('posts-section').style.display = 'block';
            hideSection('events-section');
            break;
        case 'events-section':
            hideSection('about-section');
            hideSection('posts-section');
            document.getElementById('events-section').style.display = 'block';
            ProfileEventsRenderer.renderListOfEvents(userId);
            break;
        default:
            console.log('Unhandled section id:' + sectionId);
    }
}

function hideSection(sectionId) {
    document.getElementById(sectionId).innerHTML = '';
    document.getElementById(sectionId).style.display = 'none';
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

async function loadUserInformation(username, blobKey) {
    const usersReference = database.ref('/users');
    const userSnapshot = await usersReference.orderByChild('username').equalTo(username).once('value');
    if (userSnapshot.val() !== null) {
        // The userSnapshot.val() contains one property (user)
        for (const property in userSnapshot.val()) {
            userId = property;
            user = userSnapshot.val()[property];
        }
        // If the blobkey exists, get the image url and store in the database
        if (blobKey !== 'null') {
            let picture = await fetch('/serve-file?blob-key=' + blobKey);
            database.ref('/users/' + userId).update({
                profilePic: picture.url
            }).then(() => {
                window.location.href = '/user/' + username;
            });
            return;
        } else if (user['emailVerified']) {
            document.getElementById('not-found-message').remove();
            document.getElementById('profile-page').style.display = 'block';
            HeaderRenderer.init(
                userId,
                user['name'],
                user['location'],
                user['bio'],
                user['profilePic'],
                user['username']
            );
            AboutSectionRenderer.init(
                user['work'],
                user['school'],
                user['dateOfBirth'],
                user['phoneNumber'],
                user['email'],
                user['origin']
            );
            return;
        }
    }
    document.getElementById('profile-page').remove();
    document.getElementById('not-found-message').style.display = 'block';
}

function updateImage() {
    const fileInput = document.getElementById('image-upload');
    const imageElement = document.getElementById('image-display');
    if (fileInput && imageElement) {
        if (fileInput.files.length !== 0 // At least one file is selected
            && VALID_FILE_TYPES.includes(fileInput.files[0].type) // The type must be valid
            ) {
            imageElement.src = URL.createObjectURL(fileInput.files[0]);
        }
    }
}

function resetProfilePicture() {
    const fileInput = document.getElementById('image-upload');
    fileInput.value = '';
    document.getElementById('image-display').src = 
        user['profilePic'] !== undefined ?
        user['profilePic'] : 
        '/images/profile-pic.png';
}

function updateProfilePicture() {
    document.getElementById('upload-pic-form').submit();
}
