import { useState } from "react";
import { TextInput, Button, Text, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import { generateNicknames } from "lib/ollama";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";

export default function NicknameScreen() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      const names = await generateNicknames(prompt);
      setResults(names);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to generate nicknames. Check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

   const cleanNickname = (nickname: string) => {
    return nickname.replace(/^\d+\.\s*/, '')
                   .replace(/even|&/gi, '')
                   .replace(/\s+/g, '').trim();
  };

  const handleNicknamePress = async (nickname: string) => {
    const cleanName = cleanNickname(nickname);
    
    if (!user) {
      Alert.alert("Errore", "Utente non autenticato");
      return;
    }

    try {
      await user.update({
        username: cleanName
      });
      Alert.alert("Successo", `Username impostato su: ${cleanName}`);
    } catch (error) {
      console.error("Errore nell'aggiornamento username:", error);
      Alert.alert("Errore", "Impossibile aggiornare l'username. Potrebbe essere già in uso.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView className="p-4">
      <TextInput
        placeholder="Descrivi lo stile dei nickname"
        value={prompt}
        onChangeText={setPrompt}
        className="border p-2 mb-2 rounded"
      />
      <Button 
        title={loading ? "Generating..." : "Generate"} 
        onPress={handleGenerate}
        disabled={loading}
      />
      {results.map((name, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => handleNicknamePress(name)}
          className="mt-2 p-3 bg-blue-100 rounded-lg border border-blue-200"
        >
          <Text className="text-lg text-blue-800 text-center">
            {cleanNickname(name)}
          </Text>
        </TouchableOpacity>
      ))}
      <Text className="mt-4 text-gray-500">
        AI content may not always be accurate or appropriate. Use at your own risk.
      </Text>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}