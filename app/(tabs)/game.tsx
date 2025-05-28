import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableWithoutFeedback, Keyboard, View, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useDiceStore } from "store/dice";
import { rollDice } from "utils/rollDice";
import { Shuffle } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { styles } from "styles/GameScreen.styles"; 
import React from "react";

export default function GameScreen() {
  const { diceCount, setDiceCount } = useDiceStore();
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleRoll = () => {
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
            bounces={true}
            scrollEnabled={true}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Dice Roller</Text>
              <Text style={styles.subtitle}>
                Roll the dice and test your luck! 🎲{'\n'}
                Enter how many dice to roll
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <BlurView intensity={20} tint="dark" style={styles.inputBlurContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={diceCount === 0 ? '' : diceCount.toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                      setDiceCount(0);
                    } else {
                      const num = parseInt(text);
                      if (!isNaN(num) && num >= 0 && num <= 99) {
                        setDiceCount(num);
                      }
                    }
                  }}
                  onSubmitEditing={Keyboard.dismiss}
                  maxLength={2}
                  placeholder="1"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </BlurView>
              
              <RollButton onPress={handleRoll} loading={isRolling} />
            </View>

            {/* Results Section */}
            {results.length > 0 && (
              <Animated.View 
                style={[styles.resultsSection, { opacity: fadeAnim }]}
              >
                <Text style={styles.resultsTitle}>Your rolls:</Text>
                
                <View style={styles.diceGrid}>
                  {results.map((value, index) => (
                    <View key={index} style={styles.diceCard}>
                      <LinearGradient
                        colors={['#2193b0', '#6dd5ed']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.diceGradient}
                      >
                        <Text style={styles.diceEmoji}>{getDiceEmoji(value)}</Text>
                        <Text style={styles.diceValue}>{value}</Text>
                      </LinearGradient>
                    </View>
                  ))}
                </View>

                {/* Total Score */}
                {results.length > 1 && (
                  <View style={styles.totalSection}>
                    <Text style={styles.totalText}>
                      Total: {results.reduce((a, b) => a + b, 0)}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Footer */}
            <Text style={styles.footerText}>
              May the odds be in your favor
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

// Roll Button Component
const RollButton = ({ onPress, loading }: { onPress: () => void; loading: boolean }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isPressed ? ['#9333ea', '#7e22ce'] : ['#a855f7', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rollButton}
        >
          <Animated.View style={{ transform: [{ rotate: loading ? spin : '0deg' }] }}>
            <Shuffle color="white" size={24} />
          </Animated.View>
          <Text style={styles.buttonText}>
            {loading ? 'Rolling...' : 'Roll Dice'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

