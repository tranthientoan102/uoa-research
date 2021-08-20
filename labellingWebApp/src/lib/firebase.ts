import firebase from 'firebase/app';
import 'firebase/firestore';

import 'firebase/auth';


var firebaseConfig = {
    apiKey: "AIzaSyCS-zq-GplMiNF_bvbgrauBa9mkAiBFKMo",
    authDomain: "cobalt-entropy-272613.firebaseapp.com",
    projectId: "cobalt-entropy-272613",
    storageBucket: "cobalt-entropy-272613.appspot.com",
    messagingSenderId: "78394616721",
    appId: "1:78394616721:web:d6db54396d5128695dc830",
    measurementId: "G-ZR2WBCRFWG"
};
// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('init firebase successfully')
} catch (err) {
    if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack);
    }
}

export default firebase;