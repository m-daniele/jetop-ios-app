import React, { useEffect } from "react";
import SocialLoginButton from "components/auth/SocialLoginButton";
import { StyleSheet, Text, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as WebBrowser from "expo-web-browser";
import { SignedIn, useAuth } from "@clerk/clerk-expo";
import { Sparkles } from 'lucide-react-native';
import { openURL } from "expo-linking";


export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243e']}
      style={styles.gradient}
    >
      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >

        {/* Heading Section */}
        <Animated.View 
          style={[
            styles.headingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome to JEToP</Text>
          <Text style={styles.subtitle}>
            Join thousands of JEurs{'\n'}
            around the world
          </Text>
        </Animated.View>

        {/* Social Buttons */}
        <Animated.View 
          style={[
            styles.socialButtonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.buttonsBlur}>
            <View style={styles.buttonsWrapper}>
              <SocialLoginButton strategy="google" />
              <SocialLoginButton strategy="apple" />
              <SocialLoginButton strategy="facebook" />
            </View>
          </BlurView>
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink} onPress={() => openURL('https://tinyurl.com/yrhk6ua4')}>
              Terms</Text> and{' '}
            <Text style={styles.footerLink} onPress={() => openURL('https://tinyurl.com/ypr573kz')}>
              Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    marginTop:130,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  socialButtonsContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonsBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  buttonsWrapper: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    gap: 16,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 10,
    letterSpacing:-2,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#a855f7',
    textDecorationLine: 'underline',
  },
});