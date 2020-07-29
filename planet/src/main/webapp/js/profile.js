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

async function loadUserInformation(username) {
    const usersReference = database.ref('/users');
    const userSnapshot = await usersReference.orderByChild('username').equalTo(username).once('value');
    if (userSnapshot.val() === null) {
        document.getElementById('profile-page').remove();
        document.getElementById('not-found-message').style.display = 'block';
        return;
    }
    if (userSnapshot.val() !== null) {
        // The userSnapshot.val() contains one property (user)
        for (const property in userSnapshot.val()) {
            userId = property;
            user = userSnapshot.val()[property];
        }
    
        if (user['emailVerified']) {
            document.getElementById('not-found-message').remove();
            document.getElementById('profile-page').style.display = 'block';
            HeaderRenderer.init(
                userId,
                user['name'],
                user['location'],
                user['bio'],
                user['profilePic']
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
