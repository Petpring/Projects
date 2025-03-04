import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../constants/firebaseConfig"; // นำเข้า Firebase auth

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert("Registration successful", `Welcome, ${user.email}!`);
    } catch (error) {
      if (error instanceof Error) {
        // ตอนนี้ TypeScript จะรู้จัก error เป็นชนิด Error
        Alert.alert("Registration failed", error.message);
      } else {
        Alert.alert("Registration failed", "An unknown error occurred.");
      }
    }
  };
  

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 10 }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
