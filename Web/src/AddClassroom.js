// src/AddClassroom.js
import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const AddClassroom = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [loading, setLoading] = useState(false); // เพิ่ม state สำหรับ loading

  const handleAddClassroom = async () => {
    if (!code || !name || !room) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    setLoading(true); // เริ่มโหลด

    try {
      const docRef = await addDoc(collection(db, "classrooms"), {
        code,
        name,
        room,
        imageLink: imageLink || "https://via.placeholder.com/150", // ค่าเริ่มต้นหากไม่มีรูป
      });
      console.log("Classroom added with ID: ", docRef.id);

      // ล้างค่า input หลังจากบันทึกสำเร็จ
      setCode("");
      setName("");
      setRoom("");
      setImageLink("");

      alert("เพิ่มห้องเรียนสำเร็จ!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มห้องเรียน!");
    }

    setLoading(false); // หยุดโหลด
  };

  return (
    <div>
      <h2>เพิ่มห้องเรียน</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="รหัสห้องเรียน"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อห้องเรียน"
      />
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="ห้องเรียน"
      />
      <input
        type="text"
        value={imageLink}
        onChange={(e) => setImageLink(e.target.value)}
        placeholder="ลิงก์รูปภาพ"
      />
      <button onClick={handleAddClassroom} disabled={loading}>
        {loading ? "กำลังบันทึก..." : "เพิ่มห้องเรียน"}
      </button>
    </div>
  );
};

export default AddClassroom;
