import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { Avatar, Card } from "@rneui/themed";
import { TextInput, Button } from "react-native-paper";

const HomeScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const fadeAnim = new Animated.Value(0);

  const [user, setUser] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classroomId, setClassroomId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchClassrooms(user.id);
    }
  }, [user]);

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser({ id: currentUser.uid, ...userSnap.data() });
      } else {
        Alert.alert("Error", "User data not found in Firestore.");
      }
    }
    setLoading(false);
  };

  const fetchClassrooms = async (userId: string) => {
    try {
      const classRef = collection(db, "users", userId, "classroom");
      const classSnap = await getDocs(classRef);

      const classData = await Promise.all(
        classSnap.docs.map(async (docSnap) => {
          const classDoc = await getDoc(doc(db, "classrooms", docSnap.id));
          return classDoc.exists()
            ? { id: classDoc.id, ...classDoc.data() }
            : null;
        })
      );

      setClassrooms(classData.filter(Boolean));
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handleJoinClassroom = async () => {
    if (!classroomId.trim()) {
      Alert.alert("Error", "Please enter a valid classroom ID.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not logged in.");

      const classRef = doc(db, "classrooms", classroomId);
      const classSnap = await getDoc(classRef);

      if (!classSnap.exists()) {
        Alert.alert("Error", "Classroom does not exist.");
        return;
      }

      await setDoc(
        doc(db, "users", currentUser.uid, "classroom", classroomId),
        { joinedAt: new Date() }
      );
      await setDoc(
        doc(db, "classrooms", classroomId, "students", currentUser.uid),
        {
          userId: currentUser.uid,
          name: user?.name || "Unknown",
          email: user?.email || "Unknown",
          photo: user?.photo || "Unknown",
        }
      );

      setClassroomId("");
      fetchUserData();
      Alert.alert("Success", "You have joined the classroom successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to join the classroom.");
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>เช็คชื่อ</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        user && (
          <Card containerStyle={styles.card}>
            <Card.Title>ข้อมูลผู้ใช้</Card.Title>
            <Card.Divider />
            <View style={styles.userInfo}>
              <Avatar
                rounded
                source={{
                  uri: user.photo || "https://example.com/default-profile.png",
                }}
                size="large"
              />
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.userName}>👤 {user.name || "No Name"}</Text>
                <Text style={styles.userEmail}>📧 {user.email}</Text>
              </View>
            </View>
          </Card>
        )
      )}

      <Text style={styles.sectionTitle}>📚 My Classrooms</Text>
      {classrooms.length > 0 ? (
        <FlatList
          data={classrooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card containerStyle={styles.classroomCard}>
              <Card.Image
                source={{
                  uri: item.image || "https://example.com/default-image.png",
                }}
                style={styles.classroomImage}
              />
              <Card.Title>{item.name}</Card.Title>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Go to Classroom</Text>
              </TouchableOpacity>
            </Card>
          )}/>
      ) : (
        <Text style={styles.noClassroomsText}>No classrooms joined yet.</Text>
      )}

      <TextInput
        label="Enter Classroom ID"
        value={classroomId}
        onChangeText={setClassroomId}
        mode="outlined"
        style={styles.input}/>
      <Button
        mode="contained"
        onPress={handleJoinClassroom}
        style={styles.button}>
        Join Classroom
      </Button>
      <Button
        mode="contained"
        onPress={() => router.push("/ScanQRScreen")}
        style={styles.button}>
        Scan QR Code
      </Button>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}>
        Logout
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F4F4",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 20,
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
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    alignSelf: "flex-start",
  },
  classroomCard: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  classroomImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  noClassroomsText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  input: {
    width: "100%",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  logoutButton: {
    width: "100%",
    marginTop: 10,
    borderColor: "#6200EE",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;
