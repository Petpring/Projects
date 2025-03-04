// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// กำหนด Firebase configuration ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyBcU6xE0qaj_Cm2CQrPsMvyDSEg8zsWX_c",
  authDomain: "sc362202project2024.firebaseapp.com",
  projectId: "sc362202project2024",
  storageBucket: "sc362202project2024.firebasestorage.app",
  messagingSenderId: "1073660061425",
  appId: "1:1073660061425:web:de231b427a0c34a6d16b50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// สร้าง authInstance
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth, authInstance และ db
export { auth, auth as authInstance, db }; // รวมการ export ของ auth และ authInstance
export default app;
