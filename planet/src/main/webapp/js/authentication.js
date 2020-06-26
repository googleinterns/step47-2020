// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
/*var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");*/

const firebaseConfig = {
    apiKey: "AIzaSyCAZ83Nbjr6HIgz7BHM2cAG7ktLyPp2mVk",
    authDomain: "ndabouz-step-2020-2.firebaseapp.com",
    databaseURL: "https://ndabouz-step-2020-2.firebaseio.com",
    projectId: "ndabouz-step-2020-2",
    storageBucket: "ndabouz-step-2020-2.appspot.com",
    messagingSenderId: "966794754966",
    appId: "1:966794754966:web:e2f42bafdd3c5ec2c77bb7",
    measurementId: "G-9W48MVBXLE"
};

firebase.initializeApp(firebaseConfig);
