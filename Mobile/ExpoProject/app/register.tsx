import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Dimensions } from "react-native";
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
  Avatar,
  HelperText,
} from "react-native-paper";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const RegisterScreen = () => {
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "", fullName: "", phoneNumber: "" });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const validateInputs = () => {
    const newErrors = { email: "", password: "", confirmPassword: "", fullName: "", phoneNumber: "" };
    let isValid = true;
    
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }
    
    if (!email.trim() || !email.match(/.+@.+\..+/)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    if (password.length < 6) {
      newErrors.password = "Password should be at least 6 characters";
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }
    
    if (!phoneNumber.trim() || !phoneNumber.match(/^\d{10}$/)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    if (!validateInputs()) {
      return;
    }
    
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
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        photo: "https://example.com/default-profile.png",
        status: 2,
      });

      Alert.alert("Success", "Registration successful! You can now log in.");
      router.replace("/login");
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("email-already-in-use")) {
        Alert.alert("Error", "This email is already registered. Please use a different email or try logging in.");
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#7c4dff', '#6200EE', '#5700cc']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View style={[
              styles.logoContainer,
              { 
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}>
              <Avatar.Icon 
                size={90} 
                icon="account-plus" 
                color="#fff"
                style={styles.avatar}
              />
              <Text style={styles.appTitle}>ClassCheck</Text>
              <Text style={styles.appSubtitle}>Create your account</Text>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.formContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Full Name"
                      value={fullName}
                      onChangeText={setFullName}
                      mode="outlined"
                      left={<TextInput.Icon icon="account" color="#6200EE" />}
                      style={styles.input}
                      outlineColor="#ddd"
                      activeOutlineColor="#6200EE"
                      error={!!errors.fullName}
                    />
                    {!!errors.fullName && <HelperText type="error">{errors.fullName}</HelperText>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Email"
                      value={email}
                      onChangeText={setEmail}
                      mode="outlined"
                      left={<TextInput.Icon icon="email" color="#6200EE" />}
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      outlineColor="#ddd"
                      activeOutlineColor="#6200EE"
                      error={!!errors.email}
                    />
                    {!!errors.email && <HelperText type="error">{errors.email}</HelperText>}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Phone Number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      mode="outlined"
                      left={<TextInput.Icon icon="phone" color="#6200EE" />}
                      style={styles.input}
                      keyboardType="phone-pad"
                      outlineColor="#ddd"
                      activeOutlineColor="#6200EE"
                      error={!!errors.phoneNumber}
                    />
                    {!!errors.phoneNumber && <HelperText type="error">{errors.phoneNumber}</HelperText>}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!passwordVisible}
                      mode="outlined"
                      left={<TextInput.Icon icon="lock" color="#6200EE" />}
                      right={
                        <TextInput.Icon 
                          icon={passwordVisible ? "eye-off" : "eye"} 
                          onPress={() => setPasswordVisible(!passwordVisible)}
                          color="#6200EE"
                        />
                      }
                      style={styles.input}
                      outlineColor="#ddd"
                      activeOutlineColor="#6200EE"
                      error={!!errors.password}
                    />
                    {!!errors.password && <HelperText type="error">{errors.password}</HelperText>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!confirmPasswordVisible}
                      mode="outlined"
                      left={<TextInput.Icon icon="lock-check" color="#6200EE" />}
                      right={
                        <TextInput.Icon 
                          icon={confirmPasswordVisible ? "eye-off" : "eye"} 
                          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                          color="#6200EE"
                        />
                      }
                      style={styles.input}
                      outlineColor="#ddd"
                      activeOutlineColor="#6200EE"
                      error={!!errors.confirmPassword}
                    />
                    {!!errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
                  </View>

                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator animating={true} color="#6200EE" size="large" />
                      <Text style={styles.loadingText}>Creating your account...</Text>
                    </View>
                  ) : (
                    <Button 
                      mode="contained" 
                      onPress={handleRegister} 
                      style={styles.button}
                      labelStyle={styles.buttonLabel}
                      contentStyle={styles.buttonContent}
                    >
                      Register Now
                    </Button>
                  )}
                  
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <View style={styles.socialContainer}>
                    <Button 
                      mode="outlined" 
                      icon={() => <FontAwesome5 name="google" size={16} color="#DB4437" />}
                      style={styles.socialButton}
                      labelStyle={{ color: "#DB4437" }}
                    >
                      Google
                    </Button>
                    <Button 
                      mode="outlined" 
                      icon={() => <FontAwesome5 name="facebook" size={16} color="#4267B2" />}
                      style={styles.socialButton}
                      labelStyle={{ color: "#4267B2" }}
                    >
                      Facebook
                    </Button>
                  </View>
                  
                  <Text
                    style={styles.switchText}
                    onPress={() => router.replace("/login")}
                  >
                    Already have an account? <Text style={styles.switchTextBold}>Log in</Text>
                  </Text>
                </Card.Content>
              </Card>
              
              <Text style={styles.termsText}>
                By registering, you agree to our Terms of Service and Privacy Policy
              </Text>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  appTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  appSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 15,
    elevation: 4,
    backgroundColor: "#fff",
  },
  cardContent: {
    paddingVertical: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#6200EE",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#6200EE",
    borderRadius: 30,
    elevation: 4,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#999",
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialButton: {
    width: "48%",
    borderRadius: 30,
    borderWidth: 1,
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
    color: "#666",
    fontSize: 15,
  },
  switchTextBold: {
    color: "#6200EE",
    fontWeight: "bold",
  },
  termsText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 20,
  },
});

export default RegisterScreen;
