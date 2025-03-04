import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Avatar, Card } from "@rneui/themed";
import { TextInput, Button } from "react-native-paper";
import * as BarcodeScanner from "expo-barcode-scanner";
import { DocumentData } from "firebase/firestore";

const HomeScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();

  interface User {
    photo: string;
    name: string;
    email: string;
    status: number;
  }

  const [userData, setUserData] = useState<User | null>(null);
  const [classroomId, setClassroomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data() as User);
        } else {
          Alert.alert("Error", "User data not found in Firestore.");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await BarcodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been logged out successfully.");
      router.replace("./login");
    } catch (error) {
      console.error("Logout Error: ", error);
      Alert.alert("Error", "Logout failed.");
    }
  };
  

  const handleJoinClassroom = () => {
    if (classroomId.trim() === "") {
      Alert.alert("Error", "Please enter a valid classroom ID.");
      return;
    }
    Alert.alert("Success", `You have joined classroom: ${classroomId}`);
    setClassroomId("");
  };

  const handleScanQRCode = () => {
    if (scanned) {
      setScanned(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert("QR Code Scanned", `Type: ${type}\nData: ${data}`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?classroom" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>CheckIn</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : userData ? (
          <Card containerStyle={styles.card}>
            <Card.Title>User Information</Card.Title>
            <Card.Divider />
            <View style={styles.userInfo}>
              <Avatar
                rounded
                source={{
                  uri: userData.photo || "https://example.com/default-profile.png",
                }}
                size="large"
                containerStyle={styles.avatar}
              />
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.userName}>👤 {userData.name || "No Name"}</Text>
                <Text style={styles.userEmail}>📧 {userData.email}</Text>
                <Text style={styles.userStatus}>
                  🔹 Status: {userData.status === 2 ? "Student" : "Unknown"}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Text style={styles.loadingText}>Loading users data...</Text>
        )}

        <TextInput
          label="Enter Classroom ID"
          value={classroomId}
          onChangeText={setClassroomId}
          mode="outlined"
          style={styles.input}
        />

        <Button mode="contained" onPress={handleJoinClassroom} style={styles.button}>
          Join Classroom
        </Button>

        <Button
          mode="contained"
          onPress={handleScanQRCode}
          style={styles.scanButton}
        >
          Scan QR Code
        </Button>

        {scanned && (
          <Button
            mode="contained"
            onPress={handleScanQRCode}
            style={styles.scanButton}
          >
            Scan Again
          </Button>
        )}

        <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>

        <View style={styles.scanArea}>
          <BarcodeScanner.BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  card: {
    width: "100%",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#E0E0E0",
    padding: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    color: "gray",
  },
  userStatus: {
    fontSize: 16,
    color: "blue",
  },
  loadingText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    marginTop: 15,
  },
  button: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#4CAF50",
  },
  scanButton: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#2196F3",
  },
  logoutButton: {
    width: "100%",
    marginTop: 10,
    borderColor: "#4CAF50",
  },
  scanArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
