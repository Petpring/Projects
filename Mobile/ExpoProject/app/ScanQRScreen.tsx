import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Button, FAB, Text } from "react-native-paper";

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

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    Alert.alert("QR Code Scanned", `Data: ${data}`, [
      { text: "OK", onPress: () => router.replace({ pathname: "/QRCodeResult", params: { qrData: data } }) },
    ]);
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
        <Text>No access to camera</Text>
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
          <View style={styles.scanArea} />
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
  fab: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#6200EE",
  },
});

export default ScanQRScreen;
