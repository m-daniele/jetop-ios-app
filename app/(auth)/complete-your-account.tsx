// app/(auth)/complete-your-account.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

// Import common components
import {
  GradientBackground,
  HeaderSection,
  BlurCard,
  ActionButton,
  ProgressBar
} from '../../components/common';

// Import form components
import TextInput from "../../components/forms/TextInput";
import RadioButtonInput from "../../components/forms/RadioButtonInput";

// Import theme
import { theme } from 'theme/theme';

const CompleteYourAccountScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    <GradientBackground>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
   
        >
          <View style={styles.container}>
            
            {/* Header */}
            <Animated.View 
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <HeaderSection
                title="Complete Your Profile"
                subtitle={`Just a few more details to start\nyour JEurs journey worldwide!`}
              />
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
              <BlurCard style={styles.formCard}>
                <View style={styles.formWrapper}>
                  <TextInput
                    control={control}
                    placeholder="Enter your full name"
                    label="Full Name"
                    name="full_name"
                    required={true}
                    keyboardAppearance="dark"
                  />

                  <RadioButtonInput
                    control={control}
                    placeholder="Select your gender below."
                    label="Gender"
                    name="gender"
                    required
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </View>
              </BlurCard>

              {/* Submit Button */}
              <View style={styles.submitButtonContainer}>
                <ActionButton
                  title={isLoading ? 'Completing...' : 'Complete Profile'}
                  onPress={handleSubmit(onSubmit)}
                  icon={Sparkles}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                />
              </View>
            </Animated.View>

            {/* Progress Indicator */}
            <Animated.View 
              style={[
                styles.progressContainer,
                { opacity: fadeAnim },
              ]}
            >
              <ProgressBar 
                percentage={75} 
                colors={[...theme.colors.primary.gradient]}
              />
              <Text style={styles.progressText}>Almost there!</Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default CompleteYourAccountScreen;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
    marginTop: theme.spacing.lg,
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  formWrapper: {
    padding: theme.spacing.lg, 
    gap: theme.spacing.sm, 
  },
  submitButtonContainer: {
    marginTop: theme.spacing.lg, 
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: theme.spacing.xxl, 
    alignItems: 'center',
    gap: theme.spacing.xs, 
    paddingHorizontal: theme.spacing.xxxl,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.muted,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});