import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config for twinix-1dd4f
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

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
