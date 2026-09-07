
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBk1xxNmuqY-bzGd0ZNcPn3e6EiDEZAaKA",
  authDomain: "twinix-1dd4f.firebaseapp.com",
  projectId: "twinix-1dd4f",
  storageBucket: "twinix-1dd4f.firebasestorage.app",
  messagingSenderId: "575136134586",
  appId: "1:575136134586:web:5c33fecf06a3486b799983",
  measurementId: "G-GWX9H8REX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);