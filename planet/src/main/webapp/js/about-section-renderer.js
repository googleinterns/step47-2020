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

export const AboutSectionRenderer = {
    init: (work, school, dateOfBirth, phone, email, origin) => {
        addSection('Overview');
        renderOverview(work, school, dateOfBirth, phone, email, origin); 
    }
}

function addSection(title) {
    const titlesContainer = document.getElementById('titles-container');
    if (titlesContainer === null) {
        return;
    }
    const sectionTitle = document.createElement('p');
    sectionTitle.style.color = 'black';
    sectionTitle.style.textDecoration = 'bold';
    sectionTitle.innerText = title;
    titlesContainer.appendChild(sectionTitle);
}

function renderOverview(work, school, dateOfBirth, phone, email, origin) {
    const overview = document.getElementById('details-container');
    overview.innerHTML = '';
    overview.appendChild(createElement('work', 
        work !== undefined ? 
        'Works at ' + work :
        'No information about workplace'
    ));
    overview.appendChild(createElement('school', 
        school !== undefined ? 
        'Studies at ' + school :
        'No information about education'
    ));
    overview.appendChild(createElement('date_range', 
        dateOfBirth !== undefined ? 
        'Date of birth: ' + dateOfBirth :
        'No information about date of birth'
    ));
    overview.appendChild(createElement('phone', 
        dateOfBirth !== undefined ? 
        'Phone number: ' + phone :
        'No phone number'
    ));
    overview.appendChild(createElement('email', 
        email !== undefined ? 
        'Email: ' + email :
        'No email address'
    ));
    overview.appendChild(createElement('place', 
        origin !== undefined ? 
        'From ' + origin :
        'No information about origin'
    ));
}

function createElement(icon, text) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('material-icons', 'col', 's2');
    iconElement.innerHTML = icon;
    const textElement = document.createElement('p');
    textElement.innerText = text;
    const element = document.createElement('div');
    element.classList.add('row');
    element.appendChild(iconElement);
    element.appendChild(textElement);
    return element;
}
