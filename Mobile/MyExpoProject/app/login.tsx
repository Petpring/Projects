import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { TextInput, Button, ActivityIndicator, Title } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const sanitizedEmail = email.trim();
      const sanitizedPassword = password.trim();

      if (!sanitizedEmail.match(/.+@.+\..+/)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }
      if (sanitizedPassword.length < 6) {
        Alert.alert("Weak Password", "Password should be at least 6 characters.");
        return;
      }

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        const users = userCredential.user;

        const userRef = doc(db, "users", users.uid);
        await setDoc(userRef, {
          email: users.email,
          name: sanitizedEmail.split("@")[0],
          photo: "https://example.com/default-profile.png",
          status: 2,
        });

        Alert.alert("Success", "Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        router.push("./home");
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f5f5f5" }}>
      <Title style={{ textAlign: "center", marginBottom: 20 }}>
        {isRegister ? "Register" : "Login"}
      </Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={{ marginBottom: 10 }}
      />
      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      ) : (
        <Button mode="contained" onPress={handleAuth}>
          {isRegister ? "Register" : "Login"}
        </Button>
      )}
      <Text
        style={{ marginTop: 15, textAlign: "center", color: "#6200ee" }}
        onPress={() => setIsRegister(!isRegister)}
      >
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </Text>
    </View>
  );
};

export default LoginScreen;
