// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBPCYdnKIOR9Wxhbl4FmQAAkN3bm-fCT8",
  authDomain: "notion-clone-3c64b.firebaseapp.com",
  projectId: "notion-clone-3c64b",
  storageBucket: "notion-clone-3c64b.firebasestorage.app",
  messagingSenderId: "420760386619",
  appId: "1:420760386619:web:9abe7f08e2024ef6c3701e",
  measurementId: "G-V4B9KDQ744"
};

// Initialize Firebase
const app = getApps().length == 0? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {db}