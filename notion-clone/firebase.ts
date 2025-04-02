// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDB7WeOVXgCBq-jHRW0V73F8lTAe-UyeK0",
  authDomain: "finalproject-a6681.firebaseapp.com",
  projectId: "finalproject-a6681",
  storageBucket: "finalproject-a6681.firebasestorage.app",
  messagingSenderId: "379325945042",
  appId: "1:379325945042:web:70a29d60054ef12b92090b",
  measurementId: "G-VVDFZNQXBR"
};

// Initialize Firebase
const app = getApps().length == 0? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {db}