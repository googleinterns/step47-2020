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


// Declare global constantes and variables
const firebaseConfig = {
    apiKey: 'AIzaSyCAZ83Nbjr6HIgz7BHM2cAG7ktLyPp2mVk',
    authDomain: 'ndabouz-step-2020-2.firebaseapp.com',
    databaseURL: 'https://ndabouz-step-2020-2.firebaseio.com',
    projectId: 'ndabouz-step-2020-2',
    storageBucket: 'ndabouz-step-2020-2.appspot.com',
    messagingSenderId: '966794754966',
    appId: '1:966794754966:web:e2f42bafdd3c5ec2c77bb7',
    measurementId: 'G-9W48MVBXLE'
};
let database;
let currentUser;

// Initialize the Firebase Application
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.modal');
    M.Modal.init(elements, {
        opacity: 0.7
    });
    loadElement('signin.html', 'sign-in-modal');
    loadElement('signup.html', 'sign-up-modal');
    database = firebase.database();
    currentUser = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(checkUserSignIn);
});

function checkUserSignIn() {
    currentUser = firebase.auth().currentUser;
    if (currentUser !== null) {
        document.getElementById('profile-button').innerText = currentUser.displayName;
        document.getElementById('profile-button').style.display = 'block';
        document.getElementById('sign-out-button').style.display = 'block';
        document.getElementById('sign-in-button').style.display = 'none';
    } else {
        document.getElementById('profile-button').style.display = 'none';
        document.getElementById('sign-out-button').style.display = 'none';
        document.getElementById('sign-in-button').style.display = 'block';
    }
}

// This function is for demos purposes
function updateListOfUsers(listOfUsers) {
    const listElement = document.getElementById('users-list');
    if (listElement === null) {
        return;
    }
    listElement.innerHTML = '';
    for (const user in listOfUsers) {
        const newElement = document.createElement('li');
        newElement.innerText = listOfUsers[user].name;
        listElement.appendChild(newElement);
    }
}

function resetForm(elementsClass) {
    const myFormInputs = document.getElementsByClassName(elementsClass);
    if (myFormInputs === null) {
        return;
    }
    for (let input of myFormInputs) {
        input.value = '';
    }
}

function signUp() {
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('repeat-password').value;
    const email = document.getElementById('email').value;
    const displayName = document.getElementById('first_name').value 
    + ' ' + document.getElementById('last_name').value;
    const phoneNumber = document.getElementById('phone').value;
    resetForm('input-sign-up');
    if (password !== passwordConfirmation) {
        alert('Passwords do not match')
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function() {
        // An example of how to add the user's data into the database (demos puposes)
        const user = firebase.auth().currentUser;
        database.ref('users/' + user.uid).set({
            name: displayName,
            email: email,
            phoneNumber: phoneNumber,
        });
        user.updateProfile({
            displayName: displayName,
        }).then(function() {
            closeModal('sign-up-modal');
            checkUserSignIn();
        });
    }).catch(function(error) {
        // Handle Errors here.
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {
            alert('Email already in use');
        } else if (errorCode === 'auth/invalid-email') {
            alert('Invalid email');
        } else if (errorCode === 'auth/operation-not-allowed') {
            alert('Operation not allowed');
        } else if (errorCode === 'auth/weak-password') {
            alert('Weak password, choose another one');
        } else {
            alert(errorMessage);
        }
    });
}

function signIn() {
    const password = document.getElementById('password-in').value;
    const email = document.getElementById('email-in').value;
    resetForm('input-sign-in');
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function() {
        closeModal('sign-in-modal');
        checkUserSignIn(); 
    }).catch(function(error) {
        // Handle Errors here.
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
        } else if (errorCode === 'auth/invalid-email') {
            alert('Invalid email');
        } else if (errorCode === 'auth/user-disabled') {
            alert('User disabled');
        } else if (errorCode === 'auth/user-not-found') {
            alert('User not found');
        } else {
            alert(errorMessage);
        }
    });
}

function signOut() {
    firebase.auth().signOut().then(checkUserSignIn);
}

function signInWithGoogle() {
    signInWithProvider(new firebase.auth.GoogleAuthProvider());
}

function signInWithFacebook() {
    signInWithProvider(new firebase.auth.FacebookAuthProvider());
}

function signInWithGithub() {
    signInWithProvider(new firebase.auth.GithubAuthProvider());
}

function signInWithProvider(provider) {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        closeModal('sign-in-modal');
        checkUserSignIn();
        const refrence = database.ref('users' + currentUser.uid);
        refrence.once('value').then(function(snapshot) {
            if (!snapshot.exists()) {
                database.ref('users/' + currentUser.uid).set({
                    name: currentUser.displayName,
                    email: currentUser.email,
                    phoneNumber: currentUser.phoneNumber,
                });
            }
        })
    }).catch(function(error) {
        console.log(error);
        // TODO: We will be handling errors here
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('Account exists with different credential');
        } else if (errorCode === 'auth/auth-domain-config-required') {
            alert('Authentication domain config required');
        } else if (errorCode === 'auth/cancelled-popup-request') {
            alert('Only one popup request is allowed at one time');
        } else if (errorCode === 'auth/operation-not-allowed') {
            alert('Operation not allowed');
        } else if (errorCode === 'auth/operation-not-supported-in-this-environment') {
            alert('Operation not supported in this environment');
        } else if (errorCode === 'auth/popup-blocked') {
            alert('Pop-up has been blocked by the browser');
        } else if (errorCode === 'auth/popup-closed-by-user') {
            alert('Pop-up has been closed by the user');
        } else if (errorCode === 'auth/unauthorized-domain') {
            alert('Unauthorized domain');
        } else {
            alert(errorMessage);
        }
    });
}

function closeModal(modalElement) {
    const modal = document.getElementById(modalElement);
    if (modal === null) {
        return;
    }
    M.Modal.getInstance(modal).close();
}

function openModal(modalElement) {
    const modal = document.getElementById(modalElement);
    if (modal === null) {
        return;
    }
    M.Modal.getInstance(modal).open();
}

function loadElement(href, elementId) {
    const element = document.getElementById(elementId);
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    element.innerHTML = xmlhttp.responseText;
}

function openProfile() {
    if (currentUser === null) {
        return;
    }
    database.ref('users/' + currentUser.uid).once('value').then(function(snapshot) {
        const params = new URLSearchParams();
        params.append('email', snapshot.val().email);
        params.append('name', snapshot.val().name);
        params.append('phone', snapshot.val().phoneNumber);
        fetch('user', {method: 'POST', body: params}).then(() => {
            window.location.href = '/user';
        });
    });
}
