import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, StatusBar } from "react-native";
import { Text, Card, Avatar, Surface, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBcU6xE0qaj_Cm2CQrPsMvyDSEg8zsWX_c",
  authDomain: "sc362202project2024.firebaseapp.com",
  projectId: "sc362202project2024"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const isWeb = typeof window !== "undefined";
const auth = isWeb ? getAuth(app) : initializeAuth(app, { persistence: browserLocalPersistence });

const HomeScreen = () => {
  const router = useRouter();
  const db = getFirestore();
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || user.email?.split("@")[0] || "User");
            setUserPhoto(userData.photo || "");
          } else {
            setUserName(user.email?.split("@")[0] || "User");
            setUserPhoto("");
          }
        } catch (error) {
          setUserName(user.email?.split("@")[0] || "User");
          setUserPhoto("");
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();  // ✅ ต้อง return ให้ถูกต้อง
  }, []);  // ✅ ต้องปิด useEffect() ที่นี่

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5700cc" />
      <LinearGradient colors={["#6200EE", "#5700cc", "#4600aa"]} style={styles.header}>
        <View style={styles.profileSection}>
          <Avatar.Image size={80} source={userPhoto ? { uri: userPhoto } : require("../assets/avatar.png")} style={styles.avatar} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome to Classroom</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
        </View>
      </LinearGradient>

      <Button
        mode="contained"
        onPress={() => router.push("/ScanQRScreen")}
        style={styles.scanButton}
        icon="qrcode-scan"
      >
        Scan QR Code
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    height: 180,
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F4F4",
  },
  avatar: {
    marginRight: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: "rgba(0, 0, 0, 0.8)",
    fontSize: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    elevation: 4,
    width: "47%",
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  statLabel: {
    color: "#666",
    fontSize: 14,
  },
  scanButton:{
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#6200EE",
  }
});

export default HomeScreen;
