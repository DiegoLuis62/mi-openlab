import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBa3CIYoLZHp81l1Yrg6lCgcaXKGza9akQ",
  authDomain: "mi-openlab-6f6f6.firebaseapp.com",
  projectId: "mi-openlab-6f6f6",
  storageBucket: "mi-openlab-6f6f6.firebasestorage.app",
  messagingSenderId: "227685722047",
  appId: "1:227685722047:web:2354515f9d0283b45fe30a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);