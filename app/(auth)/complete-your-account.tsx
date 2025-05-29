import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { UserCircle, Sparkles } from 'lucide-react-native';

import TextInput from "components/forms/TextInput";
import RadioButtonInput from "components/forms/RadioButtonInput";

const CompleteYourAccountScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  const { control, handleSubmit, setError, setValue } = useForm({
    defaultValues: {
      full_name: "",
      gender: "",
    },
  });

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = async (data: any) => {
    const { full_name, gender } = data;

    try {
      setIsLoading(true);
      await user?.update({
        firstName: full_name.split(" ")[0],
        lastName: full_name.split(" ")[1] || "",
        unsafeMetadata: {
          gender,
          onboarding_completed: true,
        },
      });

      await user?.reload();
      return router.push("/(tabs)");
    } catch (error: any) {
      return setError("full_name", { message: "An error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    setValue("full_name", user?.fullName || "");
    setValue("gender", String(user?.unsafeMetadata?.gender) || "");
  }, [isLoaded, user]);

  return (
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243e']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
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
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Just a few more details to start{'\n'}
                your JEurs journey worldwide!
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <BlurView intensity={20} tint="dark" style={styles.formBlur}>
                <View style={styles.formWrapper}>
                  <TextInput
                    control={control}
                    placeholder="Enter your full name"
                    label="Full Name"
                    required
                    name="full_name"            
                     />

                  <RadioButtonInput
                    control={control}
                    placeholder="Select your gender below."
                    label="Gender"
                    required
                    name="gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </View>
              </BlurView>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.submitButtonContainer}
              >
                <LinearGradient
                  colors={isLoading ? ['#6b7280', '#4b5563'] : ['#a855f7', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Sparkles color="white" size={18} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Completing...' : 'Complete Profile'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Progress Indicator */}
            <Animated.View 
              style={[
                styles.progressContainer,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#a855f7', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              </View>
              <Text style={styles.progressText}>Almost there!</Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default CompleteYourAccountScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
    marginTop:25,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  formBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formWrapper: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 24,
    gap: 20,
  },
  submitButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});