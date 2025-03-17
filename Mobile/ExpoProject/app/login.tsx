import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, Alert } from "react-native";
import { auth } from "../constants/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

const LoginScreen = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      console.log("Login Successful!", userCredential.user);
      router.replace("/home"); // ไปหน้า home เมื่อ login สำเร็จ
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Login Failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Card style={styles.card}>
        <Card.Title
          title="Welcome to classroom"
          titleStyle={styles.title}
          left={(props) => (
            <MaterialIcons name="login" {...props} size={30} color="#6200EE" />
          )}
        />
        <Card.Content>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator animating={true} color="#6200EE" size="large" />
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Login
            </Button>
          )}

          <Text style={styles.switchText} onPress={() => router.push("/register")}>
            Don't have an account? <Text style={styles.switchTextBold}>Register</Text>
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 25,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200EE",
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
    color: "#555",
  },
  switchTextBold: {
    color: "#6200EE",
    fontWeight: "bold",
  },
});

export default LoginScreen;