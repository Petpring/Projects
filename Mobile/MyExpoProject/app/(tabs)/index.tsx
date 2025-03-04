import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
// Import authInstance here
import { authInstance } from '../../constants/firebaseConfig';

console.log(authInstance);

const IndexScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {  // Use authInstance here
      if (user) {
        router.replace("./home");
      } else {
        router.replace("./login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null;
};

export default IndexScreen;
