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
import {AboutSectionRenderer} from './about-section-renderer.js';

window.loadUserInformation = loadUserInformation;
window.switchSection = switchSection;

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
    HeaderRenderer.init();
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
    HeaderRenderer.init(
        userId,
        user['name'],
        user['location'],
        user['bio']
    );
    AboutSectionRenderer.init(
        'Google',
        'Polytechnique Montreal',
        'August 27, 1998',
        '4383407515',
        'nbl.dabouz@gmail.com',
        'Algeria'
    );
}
