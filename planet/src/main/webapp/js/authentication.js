
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
    console.log(firebase.auth().currentUser);
}
