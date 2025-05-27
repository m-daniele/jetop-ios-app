import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { Button, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";

const ProfileScreen = () => {
  const { signOut, user } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Naviga alla pagina di login dopo il logout
      router.replace("/(auth)");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
        <SignedIn>
        <Text>Email: {user?.emailAddresses[0]?.emailAddress}</Text>
        <Text>Full Name: {user?.fullName}</Text>
        <Text>username: {user?.username || "N/A"}</Text>
        <Button title="Logout" onPress={handleLogout} />
      </SignedIn>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
});