// src/EditProfile.js
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";

const EditProfile = ({ user, setUser }) => {
  const [name, setName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [photoURL, setPhotoURL] = useState(user.photoURL);

  const handleSave = async () => {
    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL,
      });

      await updateDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        photoURL: photoURL,
      });

      setUser({ ...user, displayName: name, photoURL: photoURL });
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="text"
        value={photoURL}
        onChange={(e) => setPhotoURL(e.target.value)}
        placeholder="Profile Image URL"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditProfile;
