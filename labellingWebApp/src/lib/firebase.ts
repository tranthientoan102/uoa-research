import firebase from 'firebase/app';
import 'firebase/firestore';

import 'firebase/auth';


var firebaseConfig = {
    apiKey:             process.env.NEXT_PUBLIC_APIKEY,
    authDomain:         process.env.NEXT_PUBLIC_AUTHDOMAIN,
    projectId:          process.env.NEXT_PUBLIC_PROJECTID,
    storageBucket:      process.env.NEXT_PUBLIC_STORAGEBUCKET,
    messagingSenderId:  process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
    appId:              process.env.NEXT_PUBLIC_APPID,
    measurementId:      process.env.NEXT_PUBLIC_MEASUREMENTID
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