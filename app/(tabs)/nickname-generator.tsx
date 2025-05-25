import { useState } from "react";
import { TextInput, Button, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { generateNicknames } from "lib/ollama";

export default function NicknameScreen() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
      // console.log("Generating nicknames for:", prompt); // Debug log
      const names = await generateNicknames(prompt);
      //console.log("Generated names:", names); // Debug log
      setResults(names);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to generate nicknames. Check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="p-4">
      <TextInput
        placeholder="Descrivi lo stile dei nickname"
        value={prompt}
        onChangeText={setPrompt}
        className="border p-2 mb-2 rounded"
      />
      <Button 
        title={loading ? "Generating..." : "Genera"} 
        onPress={handleGenerate}
        disabled={loading}
      />
      {results.map((name, index) => (
        <Text key={index} className="mt-2 text-lg">
          {name}
        </Text>
      ))}
    </ScrollView>
  );
}
