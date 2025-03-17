import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { FAB, Text } from "react-native-paper";

const ScanQRScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert("Camera Permission", "You need to allow camera access to scan QR codes.");
        }
      }
    })();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [permission]);

  // Parse the QR data to handle attendance check-in or questions
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // Try to parse the QR data as JSON
      const qrData = JSON.parse(data);
      
      if (qrData.type === "question" && qrData.classroomId && qrData.attendanceQuestionsId) {
        // Navigate to answer question screen
        router.push({
          pathname: "/Answer-question",
          params: { 
            classroomId: qrData.classroomId, 
            attendanceQuestionsId: qrData.attendanceQuestionsId 
          }
        });
      } else if (qrData.type === "attendance" && qrData.classroomId) {
        // Navigate to QR code result screen for attendance
        router.push({
          pathname: "/QRCodeResult",
          params: { qrData: JSON.stringify(qrData) }
        });
      } else {
        // Unknown QR format, just show the data
        router.push({
          pathname: "/QRCodeResult",
          params: { qrData: data }
        });
      }
    } catch (error) {
      // If parsing failed, treat as simple string data
      Alert.alert("QR Code Scanned", `Data: ${data}`, [
        {
          text: "View Details",
          onPress: () => {
            router.push({
              pathname: "/QRCodeResult",
              params: { qrData: data }
            });
          },
        },
        {
          text: "Scan Again",
          onPress: () => setScanned(false),
        }
      ]);
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>Camera access denied</Text>
        <FAB
          style={styles.permissionButton}
          icon="camera"
          label="Request Camera Permission"
          onPress={() => requestPermission()}
        />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay Guide */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}/>
          <Text style={styles.scanText}>Position QR code inside the square</Text>
        </View>
      </CameraView>

      {scanned && (
        <FAB
          style={styles.fab}
          icon="refresh"
          label="Scan Again"
          onPress={() => setScanned(false)}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  permissionText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#6200EE",
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#FFF",
    borderRadius: 10,
    opacity: 0.6,
  },
  scanText: {
    color: "#FFF",
    marginTop: 20,
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#6200EE",
  },
});

export default ScanQRScreen;
