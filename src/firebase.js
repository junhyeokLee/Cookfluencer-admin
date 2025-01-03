// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1csIIyIRxXGY5q0T9zt7QF1SS1T9Cqmk",
  authDomain: "cookfluencer.firebaseapp.com",
  projectId: "cookfluencer",
  storageBucket: "cookfluencer.appspot.com",
  messagingSenderId: "359202154414",
  appId: "1:359202154414:web:1f33a3c5385fbe25754a3f",
  measurementId: "G-YYZLQXR19Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Optional: Initialize Analytics (if needed)
const analytics = getAnalytics(app);

export { db };