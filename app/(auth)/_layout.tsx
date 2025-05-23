import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack, usePathname } from "expo-router";

export default function AuthLayout() {
  const { user } = useUser();
  const pathName = usePathname();
  const { isSignedIn } = useAuth();

  console.log("[AuthLayout] isSignedIn:", isSignedIn);
  console.log("[AuthLayout] user:", JSON.stringify(user));
  console.log("[AuthLayout] user onboarding_completed:", user?.unsafeMetadata?.onboarding_completed);
  console.log("[AuthLayout] pathName:", pathName);

  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    if (pathName !== "/complete-your-account") {
      console.log("[AuthLayout] Redirecting to complete-your-account");
      return <Redirect href="/(auth)/complete-your-account" />;
    }
    console.log("[AuthLayout] Already on complete-your-account, not redirecting");
  }

  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed === true) {
    console.log("[AuthLayout] Redirecting to /(tabs)");
    return <Redirect href="/(tabs)" />;
  }

  console.log("[AuthLayout] Rendering Auth Stack (index or complete-your-account)");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="complete-your-account" options={{ headerShown: false }} />
    </Stack>
  );
}