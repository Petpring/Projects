import React, { useEffect, useState } from "react";
// import { View, StyleSheet } from "react-native";
// import { Text, Button } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const AnswerQuestionScreen = () => {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const db = getFirestore();
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", questionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion(docSnap.data().question);
      } else {
        setQuestion("ไม่พบคำถาม");
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  return (
    <View style={styles.container}>
      <Text>{question}</Text>
      <Text>Question ID: {questionId}</Text>
      <Button mode="contained" onPress={() => alert("ตอบคำถาม")}>ตอบคำถาม</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AnswerQuestionScreen;