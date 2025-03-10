import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const QRCodeResult = () => {
  const router = useRouter();
  const { qrData } = useLocalSearchParams();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Card style={styles.card}>
        <Card.Title
          title="QR Code Result"
          titleStyle={styles.title}
          left={(props) => <MaterialCommunityIcons name="qrcode-scan" {...props} size={30} color="#6200EE" />}
        />
        <Card.Content>
          <Text style={styles.data}>{qrData || "No data found"}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => router.replace("/ScanQRScreen")} style={styles.button}>
            Scan Again
          </Button>
        </Card.Actions>
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
    padding: 15,
    borderRadius: 10,
    elevation: 5, // เพิ่มเงา
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6200EE",
  },
  data: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginVertical: 15,
  },
  button: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#6200EE",
  },
});

export default QRCodeResult;
