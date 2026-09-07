/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   FIREBASE PROJECT CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBvtYNg7zqX5pM5MblHzwo0Vv9wdp6IoP4",

    authDomain:
        "travelbuddy-9d70c.firebaseapp.com",

    projectId:
        "travelbuddy-9d70c",

    storageBucket:
        "travelbuddy-9d70c.firebasestorage.app",

    messagingSenderId:
        "680763115677",

    appId:
        "1:680763115677:web:92e3267b108db231ceec74",

    measurementId:
        "G-EM0X84HGJJ"

};


/* =========================================================
   INITIALIZE
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );


const analytics =
    getAnalytics(
        app
    );


const auth =
    getAuth(
        app
    );


const db =
    getFirestore(
        app
    );


export {
    app,
    analytics,
    auth,
    db
};