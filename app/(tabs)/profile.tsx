// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, RefreshControl, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, User, AtSign, LogOut, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

// Import common components
import {
  SafeGradientView,
  HeaderSection,
  BlurCard,
  ActionButton,
  IconButton
} from '../../components/common';

// Import theme
import { theme } from 'theme/theme';

const ProfileScreen = () => {
  const { signOut, user } = useClerk();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.log("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await user?.reload();
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error during refresh:', error);
      setRefreshing(false);
    }
  };

  const handleProfileEdit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (!asset.base64) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
          return;
        }
        
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        await user.setProfileImage({ file: base64Image });
        
        Alert.alert('Success', 'Profile image updated successfully!');
        await user.reload();
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image. Please try again.');
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <SafeGradientView>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff" 
          />
        }
      >
        <SignedIn>
          {/* Header - More compact */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Manage your account</Text>
          </View>

          {/* Profile Picture Section - Maintained size */}
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePictureContainer}>
              {user?.imageUrl ? (
                <Image 
                  source={{ uri: user.imageUrl }} 
                  style={styles.profileImage}
                />
              ) : (
                <LinearGradient
                  colors={[...theme.colors.primary.gradient]}
                  style={styles.profileImagePlaceholder}
                >
                  <Text style={styles.initials}>{getInitials()}</Text>
                </LinearGradient>
              )}
              
              {/* Camera overlay */}
              <TouchableOpacity style={styles.cameraButton} onPress={handleProfileEdit}>
                <IconButton
                  icon={Camera}
                  onPress={handleProfileEdit}
                  size={28}
                  iconSize={16}
                  blur={true}
                  style={styles.cameraIconButton}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.userUsername}>@{user?.username || 'username'}</Text>
          </View>

          {/* Info Cards - Using BlurCard */}
          <View style={styles.infoSection}>
            {/* Email Card */}
            <BlurCard style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <View style={styles.iconContainer}>
                  <Mail color={theme.colors.text.secondary} size={20} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>
                    {user?.emailAddresses[0]?.emailAddress}
                  </Text>
                </View>
              </View>
            </BlurCard>

            {/* Full Name Card */}
            <BlurCard style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <View style={styles.iconContainer}>
                  <User color={theme.colors.text.secondary} size={20} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>
                    {user?.fullName || 'Not set'}
                  </Text>
                </View>
              </View>
            </BlurCard>

            {/* Username Card */}
            <BlurCard style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <View style={styles.iconContainer}>
                  <AtSign color={theme.colors.text.secondary} size={20} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>
                    {user?.username || 'Not set'}
                  </Text>
                </View>
              </View>
            </BlurCard>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <ActionButton
              title={isLoggingOut ? 'Logging out...' : 'Logout'}
              onPress={handleLogout}
              icon={LogOut}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              variant="danger"
            />
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
          </Text>
        </SignedIn>
      </ScrollView>
    </SafeGradientView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.xxl,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.ui.border,
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.ui.border,
  },
  initials: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 1,
    right: 1,
  },
  cameraIconButton: {
    backgroundColor: theme.colors.primary.purple,
  },
  userName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  infoSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  infoCard: {
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: 0,
  },
  infoCardContent: {
    backgroundColor: theme.colors.ui.cardBg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoutSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});