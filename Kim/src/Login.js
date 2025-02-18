import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcU6xE0qaj_Cm2CQrPsMvyDSEg8zsWX_c",
  authDomain: "sc362202project2024.firebaseapp.com",
  projectId: "sc362202project2024",
  storageBucket: "sc362202project2024.firebasestorage.app",
  messagingSenderId: "1073660061425",
  appId: "1:1073660061425:web:de231b427a0c34a6d16b50"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User Info:", result.user);
      alert("เข้าสู่ระบบสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error.message);
      alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
};

export default Login;
