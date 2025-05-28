import { useState } from "react";
import { TextInput, Text, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity, View, Animated } from "react-native";
import { generateNicknames } from "lib/ollama";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import GenerateButton from "~/components/features/GenerateButton";
import { styles } from 'styles/Nickname.styles'; // Assuming you have a styles file

export default function NicknameScreen() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { user } = useUser();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }
    setLoading(true);
    setSelectedIndex(null);
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const names = await generateNicknames(prompt);
        setResults(names);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Failed to generate nicknames. Check if the server is running.");
      } finally {
        setLoading(false);
      }
    });
  };

  const cleanNickname = (nickname: string) => {
    return nickname.replace(/^\d+\.\s*/, '')
                   .replace(/even|&/gi, '')
                   .replace(/\s+/g, '').trim();
  };

  const handleNicknamePress = async (nickname: string, index: number) => {
    const cleanName = cleanNickname(nickname);
    setSelectedIndex(index);
    
    if (!user) {
      Alert.alert("Errore", "Utente non autenticato");
      return;
    }

    try {
      await user.update({
        username: cleanName
      });
      Alert.alert("Success", `Username set to: ${cleanName}`);
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "Unable to update username. It may already be in use.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Username Generator</Text>
              <Text style={styles.subtitle}>
                Hello {user?.firstName}! ✨{'\n'}
                Create your unique AI-powered identity
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Describe your perfect username..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={prompt}
                  onChangeText={setPrompt}
                />
              </BlurView>
              
              <GenerateButton onPress={handleGenerate} loading={loading} />
            </View>

            {/* Results Section */}
            {results.length > 0 && (
              <Animated.View 
                style={[styles.resultsSection, { opacity: fadeAnim }]}
              >
                <Text style={styles.resultsTitle}>Choose your identity:</Text>
                
                <View style={styles.nicknamesGrid}>
                  {results.map((name, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNicknamePress(name, index)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          selectedIndex === index 
                            ? ['#667eea', '#764ba2'] 
                            : ['#2193b0', '#6dd5ed']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.nicknameCard,
                          selectedIndex === index && styles.selectedCard
                        ]}
                      >
                        <Text style={styles.nicknameText}>
                          {cleanNickname(name)}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Footer */}
            <Text style={styles.warningText}>
              AI-generated content • Use responsibly
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}