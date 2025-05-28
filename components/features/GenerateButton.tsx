import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from 'expo-linear-gradient';

const GenerateButton = ({ onPress, loading }: { onPress: () => void, loading?: boolean }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      // Continuous rotation while loading
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

  const handleGenerate = async () => {
    if (!loading) {
      await onPress();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.buttonContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleGenerate}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={loading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={isPressed ? ['#9333ea', '#7e22ce'] : ['#a855f7', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.innerContainer}>
              {loading ? (
                <>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sync" size={24} color="white" />
                  </Animated.View>
                  <Text style={styles.buttonText}>Generating Magic...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={24} color="white" />
                  <Text style={styles.buttonText}>Generate</Text>
                </>
              )}
            </View>
            
            {/* Glow effect */}
            <View style={styles.glowEffect} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default GenerateButton;

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",   
  },
  gradient: {
    borderRadius: 30,
    position: 'relative',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  innerContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    zIndex: -1,
  },
});