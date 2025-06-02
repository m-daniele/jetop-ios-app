// app/(auth)/index.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { openURL } from "expo-linking";

// Import common components
import {
  SafeGradientView,
  HeaderSection,
  BlurCard
} from '../../components/common';

// Import custom auth component
import SocialLoginButton from "../../components/auth/SocialLoginButton";

// Import theme
import { theme } from 'theme/theme';

// Warm up browser for OAuth
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
    <SafeGradientView edges={['bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <HeaderSection
            title="Welcome to JEToP"
            subtitle={`Join thousands of JEurs\naround the world`}
          />
        </Animated.View>

        {/* Social Login Buttons */}
        <Animated.View 
          style={[
            styles.socialButtonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurCard style={styles.buttonsCard}>
            <View style={styles.buttonsWrapper}>
              <SocialLoginButton strategy="google" />
              <SocialLoginButton strategy="apple" />
              <SocialLoginButton strategy="facebook" />
            </View>
          </BlurCard>
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
            <Text 
              style={styles.footerLink} 
              onPress={() => openURL('https://tinyurl.com/yrhk6ua4')}
            >
              Terms
            </Text>
            {' '}and{' '}
            <Text 
              style={styles.footerLink} 
              onPress={() => openURL('https://tinyurl.com/ypr573kz')}
            >
              Privacy Policy
            </Text>
          </Text>
        </Animated.View>
      </View>
    </SafeGradientView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    marginTop: theme.spacing.xxxl,
  },
  socialButtonsContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  buttonsCard: {
    borderRadius: theme.borderRadius.xl,
  },
  buttonsWrapper: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: theme.colors.primary.purple,
    textDecorationLine: 'underline',
  },
});