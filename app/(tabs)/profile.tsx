import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, RefreshControl } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, User, AtSign, LogOut, Camera } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { Alert } from 'react-native';

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
      // Ricarica i dati dell'utente da Clerk
      await user?.reload();
      
      // Piccola pausa per mostrare l'animazione di refresh
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Errore durante il refresh:', error);
      setRefreshing(false);
    }
  };

  const handleProfileEdit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      // Launch image picker with base64 enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
        base64: true, // Enable base64 encoding
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (!asset.base64) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
          return;
        }
        
        // Create base64 data URL with proper format
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        
        // Update user profile image via Clerk with base64
        await user.setProfileImage({ file: base64Image });
        
        Alert.alert('Success', 'Profile image updated successfully!');
        
        // Ricarica automaticamente i dati dopo l'aggiornamento dell'immagine
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
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243e']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
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
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Manage your account</Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <View style={styles.profilePictureContainer}>
                {user?.imageUrl ? (
                  <Image 
                    source={{ uri: user.imageUrl }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <LinearGradient
                    colors={['#a855f7', '#9333ea']}
                    style={styles.profileImagePlaceholder}
                  >
                    <Text style={styles.initials}>{getInitials()}</Text>
                  </LinearGradient>
                )}
                
                {/* Camera overlay for changing picture */}
                <TouchableOpacity style={styles.cameraButton} onPress={handleProfileEdit}>
                  <BlurView intensity={50} tint="dark" style={styles.cameraBlur}>
                    <Camera color="white" size={20} />
                  </BlurView>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
              <Text style={styles.userUsername}>@{user?.username || 'username'}</Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
              {/* Email Card */}
              <BlurView intensity={20} tint="dark" style={styles.infoCard}>
                <View style={styles.infoCardContent}>
                  <View style={styles.iconContainer}>
                    <Mail color="rgba(255,255,255,0.8)" size={20} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>
                      {user?.emailAddresses[0]?.emailAddress}
                    </Text>
                  </View>
                </View>
              </BlurView>

              {/* Full Name Card */}
              <BlurView intensity={20} tint="dark" style={styles.infoCard}>
                <View style={styles.infoCardContent}>
                  <View style={styles.iconContainer}>
                    <User color="rgba(255,255,255,0.8)" size={20} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Full Name</Text>
                    <Text style={styles.infoValue}>
                      {user?.fullName || 'Not set'}
                    </Text>
                  </View>
                </View>
              </BlurView>

              {/* Username Card */}
              <BlurView intensity={20} tint="dark" style={styles.infoCard}>
                <View style={styles.infoCardContent}>
                  <View style={styles.iconContainer}>
                    <AtSign color="rgba(255,255,255,0.8)" size={20} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>
                      {user?.username || 'Not set'}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                onPress={handleLogout}
                disabled={isLoggingOut}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#dc2626', '#b91c1c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoutButton}
                >
                  <LogOut color="white" size={20} />
                  <Text style={styles.logoutText}>
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </Text>
          </SignedIn>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    marginTop: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cameraBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  infoSection: {
    gap: 14,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginLeft:20,
    marginRight:20,
  },
  infoCardContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  logoutSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
});