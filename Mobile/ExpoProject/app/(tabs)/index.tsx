import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Animated } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../constants/firebaseConfig";
import { useRouter } from "expo-router";

const IndexScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/register");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f4f4f8",
          opacity: fadeAnim,
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
      </Animated.View>
    );
  }

  return null;
};

export default IndexScreen;
