// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import 'firebase/storage';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkFaHuHAhkwOiwE49WN3jzHvqICDFB4-o",
  authDomain: "fridgegram-8a0e3.firebaseapp.com",
  projectId: "fridgegram-8a0e3",
  storageBucket: "fridgegram-8a0e3.firebasestorage.app",
  messagingSenderId: "846955502883",
  appId: "1:846955502883:web:4c05a0cbf4abee1bfc0096"
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
export const auth = getAuth(firebase);
export const googleProvider = new GoogleAuthProvider();