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

firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.modal');
    M.Modal.init(elements, {
        opacity: 0.7
    });
});

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
    resetForm('input-sign-up');
    if (password !== passwordConfirmation) {
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function() {
        return firebase.auth().currentUser.updateProfile({
            displayName: displayName,
        })
    }).catch(function(error) {
        // Handle Errors here.
        console.log(error);
        // ...
    });
}

function signIn() {
    const password = document.getElementById('password-in').value;
    const email = document.getElementById('email-in').value;
    resetForm('input-sign-in');
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        console.log(error);
        // ...
    });
}

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    signInWithProvider(provider);
}

function signInWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    signInWithProvider(provider);
}

function signInWithGithub() {
    const provider = new firebase.auth.GithubAuthProvider();
    signInWithProvider(provider);
}

function signInWithProvider(provider) {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        // TODO: We will be adding more actions here 
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
