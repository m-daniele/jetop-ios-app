import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, User, AtSign, LogOut, Camera } from 'lucide-react-native';
import { useState } from 'react';

const ProfileScreen = () => {
  const { signOut, user } = useClerk();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                <TouchableOpacity style={styles.cameraButton}>
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
    padding: 20,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  initials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  infoSection: {
    gap: 12,
    marginBottom: 40,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoCardContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 100,
  },
});