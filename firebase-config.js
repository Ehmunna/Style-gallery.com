// Firebase Configuration for User Website
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyC2Bsd-HqfhhC8i5cQUF2ZmofUJaFIcvDs",
    authDomain: "lamim-754aa.firebaseapp.com",
    projectId: "lamim-754aa",
    storageBucket: "lamim-754aa.firebasestorage.app",
    messagingSenderId: "1087897423283",
    appId: "1:1087897423283:web:10a57c0acf8879fc1e4fc6",
    measurementId: "G-R5SNM13YMG"
};

// Initialize Firebase
try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Make globally available
    window.firebaseApp = app;
    window.firebaseDb = db;
    
    console.log('✅ Firebase initialized successfully for user website');
    
    // Dispatch event to let script.js know Firebase is ready
    window.dispatchEvent(new Event('firebaseReady'));
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Still set a flag so script.js can handle it
    window.firebaseInitialized = false;
}