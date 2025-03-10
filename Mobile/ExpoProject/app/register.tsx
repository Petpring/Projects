import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, Alert } from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const auth = getAuth();
  const db = getFirestore();
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

  const handleRegister = async () => {
    try {
      setLoading(true);
      const sanitizedEmail = email.trim();
      const sanitizedPassword = password.trim();

      if (!sanitizedEmail.match(/.+@.+\..+/)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        setLoading(false);
        return;
      }
      if (sanitizedPassword.length < 6) {
        Alert.alert(
          "Weak Password",
          "Password should be at least 6 characters."
        );
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedEmail,
        sanitizedPassword
      );
      const user = userCredential.user;
      const userEmail = user.email ?? "unknown@example.com";

      await setDoc(doc(db, "users", user.uid), {
        email: userEmail,
        name: userEmail.split("@")[0],
        photo: "https://example.com/default-profile.png",
        status: 2,
      });

      Alert.alert("Success", "Registration successful! You can now log in.");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Card style={styles.card}>
        <Card.Title
          title="Register"
          titleStyle={styles.title}
          left={(props) => (
            <MaterialIcons name="person-add" {...props} size={30} color="#6200EE" />
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
            <Button mode="contained" onPress={handleRegister} style={styles.button}>
              Register
            </Button>
          )}
          <Text
            style={styles.switchText}
            onPress={() => router.replace("/login")}
          >
            Already have an account? Login
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
    backgroundColor: "#F4F4F4",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200EE",
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6200EE",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
