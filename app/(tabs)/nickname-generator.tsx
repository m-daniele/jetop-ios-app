// app/(tabs)/nickname-generator.tsx
import React, { useState } from "react";
import { 
  Text, 
  TextInput, 
  ScrollView, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard, 
  TouchableOpacity, 
  View, 
  Animated,
  StyleSheet 
} from "react-native";
import { generateNicknames } from "lib/ollama";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

// Import common components
import {
  SafeGradientView,
  HeaderSection,
  BlurCard,
  ActionButton,
  FormInput
} from '../../components/common';

// Import theme
import { theme } from 'theme/theme';

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
      Alert.alert("Error", "User not authenticated");
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
      <SafeGradientView>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <HeaderSection
            title="Username Generator"
            subtitle={`Hello ${user?.firstName}! ✨\nCreate your unique AI-powered identity`}
          />

          {/* Input Section */}
          <View style={styles.inputSection}>
            <FormInput 
              label="Describe your perfect username"
              required
            >
              <BlurCard style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., tech lover, gamer, creative..."
                  placeholderTextColor={theme.colors.text.disabled}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={prompt}
                  onChangeText={setPrompt}
                  keyboardAppearance="dark"
                  textAlignVertical="top"
                />
              </BlurCard>
            </FormInput>
            
            <View style={styles.buttonContainer}>
              <ActionButton
                title={loading ? 'Generating...' : 'Generate'}
                onPress={handleGenerate}
                icon={Sparkles}
                loading={loading}
                disabled={loading || !prompt.trim()}
                variant="primary"
              />
            </View>
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
                          : [...theme.colors.primary.gradient]
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
      </SafeGradientView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  inputCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
  },
  input: {
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 100,
    maxHeight: 150,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  resultsSection: {
    marginTop: theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  nicknamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  nicknameCard: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius['2xl'],
    ...theme.shadows.md,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    ...theme.shadows.lg,
  },
  nicknameText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  warningText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginTop: theme.spacing.xxxl,
    marginBottom: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});