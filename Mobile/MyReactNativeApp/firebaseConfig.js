// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcU6xE0qaj_Cm2CQrPsMvyDSEg8zsWX_c",
  authDomain: "sc362202project2024.firebaseapp.com",
  projectId: "sc362202project2024",
  storageBucket: "sc362202project2024.firebasestorage.app",
  messagingSenderId: "1073660061425",
  appId: "1:1073660061425:web:de231b427a0c34a6d16b50",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
