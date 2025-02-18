// src/Dashboard.js
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import Login from "./Login";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
    if (user) {
      const fetchClassrooms = async () => {
        const querySnapshot = await getDocs(collection(db, "classrooms"));
        const classroomsData = querySnapshot.docs.map(doc => doc.data());
        setClassrooms(classroomsData);
      };
      fetchClassrooms();
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div>
      <h2>Welcome, {user.displayName}</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      <button onClick={() => navigate("/add-classroom")}>Add Classroom</button>
      <h3>Your Classrooms</h3>
      <ul>
        {classrooms.map((classroom, index) => (
          <li key={index}>
            {classroom.name} - {classroom.room}
            <button onClick={() => navigate(`/manage-classroom/${classroom.cid}`)}>Manage Classroom</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
