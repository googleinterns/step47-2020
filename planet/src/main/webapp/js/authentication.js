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

import {firebaseConfig} from './firebase-config.js';

window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.signInWithGoogle = signInWithGoogle;
window.signInWithFacebook = signInWithFacebook;
window.signInWithGithub = signInWithGithub;
window.onForgotPassword = onForgotPassword;
window.resetPassword = resetPassword;
window.openProfile = openProfile;
window.closeModal = closeModal;
window.openModal = openModal;

// Initialize the Firebase Application
firebase.initializeApp(firebaseConfig);
// Declare global constantes and variables
const database = firebase.database();
let currentUser = firebase.auth().currentUser;

document.addEventListener('DOMContentLoaded', function() {
    loadElement('/navbar.html', 'nav-bar', () => {
        firebase.auth().onAuthStateChanged(checkUserSignIn);
    });
    loadElement('/signin.html', 'sign-in-modal');
    loadElement('/signup.html', 'sign-up-modal');
    loadElement('/resetpwd.html', 'reset-pwd-modal');
    loadElement('/uploadpic.html', 'upload-picture-modal');
    const elements = document.querySelectorAll('.modal');
    M.Modal.init(elements, {
        opacity: 0.7
    });
});

function checkUserSignIn() {
    currentUser = firebase.auth().currentUser;
    if (currentUser !== null && currentUser.emailVerified) {
        document.getElementById('profile-button').innerText = currentUser.displayName;
        setStylingElement('display', 'block', 'profile-button');
        setStylingElement('display', 'block', 'sign-out-button');
        setStylingElement('display', 'block', 'search-bar-container');
        setStylingElement('display', 'none', 'sign-in-button');
        // Set the emailVerified property to true
        database.ref('users/' + currentUser.uid).once('value', (userSnapshot) => {
            if (userSnapshot.exists()) {
                database.ref('users/' + currentUser.uid).update({
                    emailVerified: true
                });
            }
        });

    } else {
        setStylingElement('display', 'none', 'profile-button');
        setStylingElement('display', 'none', 'sign-out-button');
        setStylingElement('display', 'none', 'search-bar-container');
        setStylingElement('display', 'block', 'sign-in-button');
    }
}

function setStylingElement(property, value, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style[property] = value;
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

async function generateUsername(displayName) {
    const names = displayName.split(' ');
    const existingUsernames = [];
    let username = names[0].toLowerCase() + '.' + names[1].toLowerCase();
    // Get all the existing username that start with "username"
    const usersRef = database.ref('users').orderByChild('username')
        .startAt(username).endAt(username + 'uf8ff');
    const usersSnapshot = await usersRef.once('value'); 
    // Save the usernames in the array
    for (const object in usersSnapshot.val()) {
        existingUsernames.push(usersSnapshot.val()[object]['username']);
    }
    // Generate a username that doesn't exist in the array
    while(existingUsernames.includes(username)) {
        let counter = parseInt((Math.random() * 9).toFixed());
        username += counter;
    }
    return username;
}

function addUserToDatabase(uid, name, phoneNumber, email, username, emailVerified) {
    // We need to be signed in to be able to add the user to the database
    // even if the user hasn't verified their email yet
    database.ref('users/' + uid).set({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        username: username,
        emailVerified: emailVerified,
    }).then(() => {
        // Once the user has been added, if the email is not verified, we sign out
        if (!emailVerified) {
            signOut();
        }
    });
}

function sendEmailVerification(user, displayName, email, phoneNumber, username) {
    user.sendEmailVerification().then(function() {
        const modalElement = document.getElementById('account-created-modal');
        const line1 = document.createElement('p');
        line1.style.textAlign = 'center';
        line1.style.marginBottom = '0';
        line1.innerText = 'Your account has been successfully created and a verification\
        email has been sent to you.';
        const line2 = document.createElement('p');
        line2.style.textAlign = 'center';
        line2.style.marginTop = '0';
        line2.innerText = 'Please verify your email and log in again!';
        modalElement.innerHTML = '';
        modalElement.appendChild(line1);
        modalElement.appendChild(line2);
        closeModal('sign-up-modal');
        openModal('account-created-modal');
        addUserToDatabase(user.uid, displayName, phoneNumber, email, 
            username, user.emailVerified);
    })
    .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/missing-android-pkg-name') {
            console.log('Android package name is missing');
        } else if (errorCode === 'auth/missing-continue-uri') {
            console.log('Continue URL is missing');
        } else if (errorCode === 'missing-ios-bundle-id') {
            console.log('IOS bundle id is missing');
        } else if (errorCode === 'auth/invalid-continue-uri') {
            console.log('Continue URL is invalid');
        } else if (errorCode === 'auth/unauthorized-continue-uri') {
            console.log('The domain of the continue URL is not whitelisted');
        } else {
            console.log(errorMessage);
        }
    });
}

async function signUp() {
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('repeat-password').value;
    const email = document.getElementById('email').value;
    const displayName = document.getElementById('first_name').value 
    + ' ' + document.getElementById('last_name').value;
    const phoneNumber = document.getElementById('phone').value;
    const username = await generateUsername(displayName);
    resetForm('input-sign-up');
    if (password !== passwordConfirmation) {
        alert('Passwords do not match')
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function() {
        const user = firebase.auth().currentUser;
        sendEmailVerification(user, displayName, email, phoneNumber, username);
        user.updateProfile({
            displayName: displayName,
        });
    }).catch(function(error) {
        // Handle Errors here.
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
        checkUserSignIn(); 
        if (!currentUser.emailVerified) {
            signOut();
            alert('Email not verified!');
            return;
        };
        closeModal('sign-in-modal');
        window.location.reload();
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
    window.location.reload();
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
    firebase.auth().signInWithPopup(provider).then(async function() {
        // The signed-in user info.
        currentUser = firebase.auth().currentUser;
        const username = await generateUsername(currentUser.displayName);
        const refrence = database.ref('users/' + currentUser.uid);
        refrence.once('value').then(function(snapshot) {
            if (!snapshot.exists()) {
                addUserToDatabase(currentUser.uid,
                    currentUser.displayName,
                    currentUser.phoneNumber,
                    currentUser.email,
                    username,
                    currentUser.emailVerified);
            }
            closeModal('sign-in-modal');
            window.location.reload();
        });
    }).catch(function(error) {
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

function onForgotPassword() {
    closeModal('sign-in-modal'); 
    openModal('reset-pwd-modal');
    document.getElementById('submit-message').innerHTML = '';
    document.getElementById('email-reset-pwd').value = '';
}

function resetPassword() {
    const email = document.getElementById('email-reset-pwd');
    if (email === null) {
        console.log('Email element not found');
        return;
    }
    const message = document.getElementById('submit-message');
    message.style.textAlign = 'center';
    message.style.width = '100%';
    message.style.height = 'auto';
    message.style.marginBottom = '2%';
    message.style.backgroundColor = 'lightgreen';
    firebase.auth().sendPasswordResetEmail(email.value)
    .then(function() {
        message.innerText = 'If the account was found, an email was sent to' + 
            email.value + 'to reset your password!';
        email.value = '';
    })
    .catch(function(error) {
        console.log(error.message);
        message.innerText = 'If the account was found, an email was sent to' + 
            email.value + 'to reset your password!';
        email.value = '';
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

function loadElement(href, elementId, hanlder = () => {return;}) {
    const element = document.getElementById(elementId);
    if (element === null) {
        hanlder();
        return;
    }
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          element.innerHTML = xmlhttp.responseText;
          hanlder();
        }
    };
    xmlhttp.open("GET", href, true);
    xmlhttp.send();
}

function openProfile() {
    if (currentUser === null) {
        return;
    }
    database.ref('users/' + currentUser.uid).once('value').then(function(snapshot) {
        window.location.href = '/user/' + snapshot.val().username;
    });
}
