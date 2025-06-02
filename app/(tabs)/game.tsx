// app/(tabs)/game.tsx
import React, { useState } from "react";
import { 
  Text, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard, 
  View, 
  Animated,
  StyleSheet,
  ScrollView
} from "react-native";
import { Shuffle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

// Store and utils
import { useDiceStore } from "../../store/dice";
import { rollDice } from "../../utils/rollDice";

export default function GameScreen() {
  const { diceCount, setDiceCount } = useDiceStore();
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleRoll = () => {
    if (diceCount === 0) return;
    
    setIsRolling(true);
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const values = rollDice(diceCount);
      setResults(values);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsRolling(false);
      });
    });
  };

  const getDiceEmoji = (value: number) => {
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[value - 1] || '🎲';
  };

  const handleInputChange = (text: string) => {
    if (text === '') {
      setDiceCount(0);
    } else {
      const num = parseInt(text);
      if (!isNaN(num) && num >= 0 && num <= 99) {
        setDiceCount(num);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeGradientView>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          <View style={styles.content}>
            {/* Header */}
            <HeaderSection
              title="Dice Roller"
              subtitle={`Roll the dice and test your luck! 🎲\nEnter how many dice to roll`}
            />

            {/* Input Section */}
            <View style={styles.inputSection}>
              <FormInput 
                label="Number of Dice" 
                required
                error={diceCount === 0 && results.length > 0 ? "Please enter at least 1 die" : undefined}
              > 
                <BlurCard style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    keyboardAppearance="dark"
                    value={diceCount === 0 ? '' : diceCount.toString()}
                    onChangeText={handleInputChange}
                    onSubmitEditing={Keyboard.dismiss}
                    maxLength={2}
                    placeholder="1"
                    placeholderTextColor={theme.colors.text.disabled}
                  />
                </BlurCard>
              </FormInput>
              
              <View style={styles.buttonContainer}>
                <ActionButton
                  title={isRolling ? 'Rolling...' : 'Roll Dice'}
                  onPress={handleRoll}
                  icon={Shuffle}
                  loading={isRolling}
                  disabled={diceCount === 0}
                  variant="primary"
                />
              </View>
            </View>

            {/* Results Section */}
            {results.length > 0 && (
              <Animated.View 
                style={[styles.resultsSection, { opacity: fadeAnim }]}
              >
                <Text style={styles.resultsTitle}>Your rolls:</Text>
                
                <View style={styles.diceGrid}>
                  {results.map((value, index) => (
                    <BlurCard key={index} style={styles.diceCard}>
                      <LinearGradient
                        colors={[...theme.colors.primary.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.diceGradient}
                      >
                        <Text style={styles.diceEmoji}>{getDiceEmoji(value)}</Text>
                        <Text style={styles.diceValue}>{value}</Text>
                      </LinearGradient>
                    </BlurCard>
                  ))}
                </View>

                {/* Total Score */}
                {results.length > 1 && (
                  <BlurCard style={styles.totalCard}>
                    <Text style={styles.totalText}>
                      Total: {results.reduce((a, b) => a + b, 0)}
                    </Text>
                  </BlurCard>
                )}
              </Animated.View>
            )}

            {/* Footer */}
            <Text style={styles.footerText}>
              May the odds be in your favor
            </Text>
          </View>
        </ScrollView>
      </SafeGradientView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
        marginLeft: theme.spacing.xxxl,
    marginRight: theme.spacing.xxxl,  
  },
  inputCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
  },
  input: {
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  resultsSection: {
    marginTop: theme.spacing.xs,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  diceCard: {
    padding: 0,
    borderRadius: theme.borderRadius.md, 
    overflow: 'hidden',
  },
  diceGradient: {
    padding: theme.spacing.sm, 
    alignItems: 'center',
    minWidth: 70,
  },
  diceEmoji: {
    fontSize: 34, 
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  diceValue: {
    fontSize: theme.typography.fontSize.md, 
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalCard: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  totalText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});