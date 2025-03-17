import React, { useEffect, useState } from "react";
import { 
  View, 
  StyleSheet, 
  Animated, 
  StatusBar, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  Card, 
  Button, 
  Text, 
  Divider, 
  Surface, 
  ActivityIndicator,
  IconButton
} from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";

const { width } = Dimensions.get('window');

const QRCodeResult = () => {
  const router = useRouter();
  const { qrData } = useLocalSearchParams();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isJson, setIsJson] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Try to parse the QR data as JSON
    if (qrData) {
      try {
        const parsed = JSON.parse(qrData as string);
        setParsedData(parsed);
        setIsJson(true);
      } catch (error) {
        // Not valid JSON, use as is
        setParsedData(qrData);
        setIsJson(false);
      }
    }
  }, [qrData]);

  const handleAttendance = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to check in");
      return;
    }

    if (!isJson || !parsedData?.classroomId) {
      setError("Invalid QR code data");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = auth.currentUser.uid;
      const classroomId = parsedData.classroomId;
      const timestamp = serverTimestamp();
      
      // Add attendance record
      await setDoc(doc(db, `classrooms/${classroomId}/attendance/${userId}_${Date.now()}`), {
        userId,
        timestamp,
        status: "present",
        method: "qr_scan"
      });
      
      // Update student record with points
      const points = parsedData.points || 1;
      await updateDoc(doc(db, `classrooms/${classroomId}/students/${userId}`), {
        scores: increment(points),
        attendanceCount: increment(1),
        lastAttendance: timestamp
      });
      
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Attendance check-in error:", error);
      setError("Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#6200EE', '#5700cc', '#4600aa']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push("/home")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scan Result</Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[
          styles.contentContainer, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Status Icon */}
          <View style={styles.statusIconContainer}>
            <Surface style={styles.statusIconBg}>
              <MaterialCommunityIcons 
                name="qrcode-scan" 
                size={40} 
                color="#6200EE" 
              />
            </Surface>
          </View>

          {/* Content Card */}
          <Surface style={styles.card}>
            <Text style={styles.cardTitle}>
              {isJson ? "QR Code Information" : "Code Scanned Successfully"}
            </Text>
            
            {isJson ? (
              <View style={styles.jsonContainer}>
                {parsedData.type && (
                  <View style={styles.typeContainer}>
                    <Text style={styles.typeLabel}>
                      {parsedData.type === "attendance" ? "Attendance Check-in" : 
                       parsedData.type === "question" ? "Classroom Question" : 
                       parsedData.type}
                    </Text>
                  </View>
                )}
                
                <Divider style={styles.divider} />
                
                {Object.entries(parsedData).map(([key, value]) => (
                  key !== "type" && (
                    <View key={key} style={styles.dataRow}>
                      <Text style={styles.dataLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                      </Text>
                      <Text style={styles.dataValue}>{String(value)}</Text>
                    </View>
                  )
                ))}
              </View>
            ) : (
              <View style={styles.rawDataContainer}>
                <Text style={styles.rawDataLabel}>Scanned Data:</Text>
                <Surface style={styles.rawDataValue}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text selectable>{qrData || "No data found"}</Text>
                  </ScrollView>
                </Surface>
              </View>
            )}
            
            {/* Success Message */}
            {success && (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                <Text style={styles.successText}>Check-in successful!</Text>
              </View>
            )}
            
            {/* Error Message */}
            {error !== "" && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {isJson && parsedData?.type === "attendance" && (
                <Button 
                  mode="contained" 
                  onPress={handleAttendance} 
                  style={styles.checkInButton}
                  loading={loading}
                  disabled={loading || success}
                  icon="login"
                >
                  {success ? "Checked In" : "Check In"}
                </Button>
              )}
              
              {isJson && parsedData?.type === "question" && parsedData?.classroomId && parsedData?.attendanceQuestionsId && (
                <Button 
                  mode="contained" 
                  onPress={() => router.push({
                    pathname: "/Answer-question",
                    params: { 
                      classroomId: parsedData.classroomId, 
                      attendanceQuestionsId: parsedData.attendanceQuestionsId 
                    }
                  })}
                  style={styles.primaryButton}
                  icon="help-circle"
                >
                  Answer Question
                </Button>
              )}
              
              <Button 
                mode="contained" 
                onPress={() => router.push("/ScanQRScreen")} 
                style={[styles.button, success ? styles.primaryButton : {}]}
                icon="qrcode-scan"
              >
                Scan Again
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => router.push("/home")} 
                style={styles.outlineButton}
                icon="home"
              >
                Back to Home
              </Button>
            </View>
          </Surface>
          
          {/* Help Text */}
          <Text style={styles.helpText}>
            Having problems with check-in? Contact your instructor.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 20,
  },
  statusIconContainer: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: 10,
  },
  statusIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  jsonContainer: {
    paddingVertical: 5,
  },
  typeContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200EE",
    backgroundColor: "rgba(98, 0, 238, 0.1)",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  divider: {
    marginVertical: 10,
    height: 1,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dataLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  dataValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  rawDataContainer: {
    marginVertical: 15,
  },
  rawDataLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 8,
  },
  rawDataValue: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginTop: 5,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 5,
  },
  successText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    color: "#F44336",
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: "#6200EE",
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: "#4CAF50",
  },
  checkInButton: {
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: "#4CAF50",
  },
  outlineButton: {
    marginTop: 10,
    borderRadius: 8,
    borderColor: "#6200EE",
  },
  helpText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 14,
  },
});

export default QRCodeResult;
