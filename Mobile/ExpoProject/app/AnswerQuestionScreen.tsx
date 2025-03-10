import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ActivityIndicator, StyleSheet, Animated 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";

const AnswerQuestionScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const { classroomId: rawClassroomId, attendanceQuestionsId: rawAttendanceQuestionsId } = useLocalSearchParams();

  const classroomId = typeof rawClassroomId === "string" ? rawClassroomId : rawClassroomId?.[0];
  const attendanceQuestionsId = typeof rawAttendanceQuestionsId === "string" ? rawAttendanceQuestionsId : rawAttendanceQuestionsId?.[0];

  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        Alert.alert("❌ Error", "You must be logged in.", [{ text: "OK", onPress: () => router.replace("/home") }]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!classroomId || !attendanceQuestionsId) {
        Alert.alert("❌ Error", "Invalid classroom or question ID.", [{ text: "OK", onPress: () => router.replace("/home") }]);
        return;
      }

      try {
        const questionRef = doc(db, `classrooms/${classroomId}/attendanceQuestions/${attendanceQuestionsId}`);
        const questionSnap = await getDoc(questionRef);

        if (questionSnap.exists()) {
          setQuestion(questionSnap.data().question || "No question available.");
        } else {
          Alert.alert("❌ Error", "Invalid Question ID.", [{ text: "OK", onPress: () => router.replace("/home") }]);
        }
      } catch (error: any) {
        Alert.alert("❌ Error", "Failed to retrieve question.", [{ text: "OK", onPress: () => router.replace("/home") }]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [classroomId, attendanceQuestionsId]);

  const submitAnswer = async () => {
    if (isSubmitted) {
      Alert.alert("⚠️ Warning", "You have already submitted your answer.");
      return;
    }

    if (!answer.trim()) {
      Alert.alert("❌ Error", "Please enter an answer.");
      return;
    }

    if (!user) {
      Alert.alert("❌ Error", "You must be logged in.");
      return;
    }

    try {
      const scores = 1;
      const userId = user.uid;

      const responsesRef = collection(
        db,
        `classrooms/${classroomId}/attendanceQuestions/${attendanceQuestionsId}/attendanceResponses`
      );
      await addDoc(responsesRef, {
        userId,
        answer: answer.trim(),
        status: 1,
        scores,
        timestamp: serverTimestamp(),
      });

      const studentRef = doc(db, `classrooms/${classroomId}/students/${userId}`);
      await updateDoc(studentRef, {
        scores: increment(scores),
      });

      setIsSubmitted(true);
      Alert.alert("✅ Success", "Your answer has been submitted successfully!");
    } catch (error: any) {
      Alert.alert("❌ Error", "Failed to submit answer.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.questionText}>{question || "No question available"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your answer"
        value={answer}
        onChangeText={setAnswer}
        editable={!isSubmitted}
      />

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitted && styles.disabledButton]} 
        onPress={submitAnswer} 
        disabled={isSubmitted}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitted ? "Already Submitted" : "Submit Answer"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f8",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default AnswerQuestionScreen;
