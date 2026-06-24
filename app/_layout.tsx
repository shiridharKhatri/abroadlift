import React from "react";
import { Stack, useSegments, router } from "expo-router";
import { StatusBar } from "react-native";
import { UserProvider, useUser } from "./context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <AuthRouter />
    </UserProvider>
  );
}

function AuthRouter() {
  const { isAuthenticated, isLoading } = useUser();
  const segments = useSegments();

  React.useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inSetupGroup = segments[0] === "setup";
    const inProfileGroup = segments[0] === "profile";
    
    // List of protected top-level segments
    const isProtectedRoute = inTabsGroup || inSetupGroup || inProfileGroup;

    if (!isAuthenticated && isProtectedRoute) {
      // Redirect to landing if trying to access protected route while not logged in
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
