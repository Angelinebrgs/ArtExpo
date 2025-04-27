import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAOIxBTJAyHIb3A5APTbUsKCdoxhzU0Tw0",
    authDomain: "artexpo-f240f.firebaseapp.com",
    projectId: "artexpo-f240f",
    storageBucket: "artexpo-f240f.firebasestorage.app",
    messagingSenderId: "177743774499",
    appId: "1:177743774499:web:473c6241ff65d87b15c296",
    measurementId: "G-6MNJZFXLYK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };