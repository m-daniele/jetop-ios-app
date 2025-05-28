import { useState } from "react";
import { ScrollView, Text, Button, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDiceStore } from "store/dice";
import { rollDice } from "utils/rollDice";

export default function GameScreen() {
  const { diceCount, setDiceCount } = useDiceStore();
  const [results, setResults] = useState<number[]>([]);

  const handleRoll = () => {
    const values = rollDice(diceCount);
    setResults(values);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="p-4 flex-1">
        <Text className="text-xl mb-2">Numero di dadi:</Text>
        <TextInput
          keyboardType="numeric"
          value={diceCount.toString()}
          onChangeText={(text) => setDiceCount(Number(text))}
          className="border px-2 py-1 mb-4 rounded"
          onSubmitEditing={Keyboard.dismiss}
        />

        <Button title="Lancia i dadi!" onPress={handleRoll} />

        <ScrollView className="mt-2o mb-4">
          <Text className="text-lg font-semibold">Risultati:</Text>
          {results.map((val, i) => (
            <Text key={i}>
              🎲 Dado {i + 1}: {val}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}