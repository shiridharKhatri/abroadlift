import { router, Stack } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "./context/UserContext";

import { useIsFocused } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primaryTeal: "#33BFFF", // Vibrant, modern light blue
  textBlue: "#33BFFF",
  white: "#FFFFFF",
  glassWhite: "rgba(255, 255, 255, 0.75)",
  divider: "rgba(0, 0, 0, 0.05)",
};

export default function Index() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, userData } = useUser();
  const isFocused = useIsFocused();

  const player = useVideoPlayer(require("../assets/homescreen.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.05;
    p.playbackRate = 4.0;
    p.play();
  });

  React.useEffect(() => {
    const subscription = player.addListener("timeUpdate", (event) => {
      // If the currentTime is between 0 and 2.0 seconds, play at 4x speed.
      // After 2.0 seconds, drop speed to a smooth 1.2x.
      if (event.currentTime < 2.0) {
        if (player.playbackRate !== 4.0) {
          player.playbackRate = 4.0;
        }
      } else {
        if (player.playbackRate !== 1.2) {
          player.playbackRate = 1.2;
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && isFocused) {
      if (userData?.onboardingComplete || (userData?.country && userData?.studyLevel)) {
        router.replace("/(tabs)/explore");
      } else {
        router.replace("/setup/country");
      }
    }
  }, [isAuthenticated, isLoading, userData?.onboardingComplete, userData?.country, userData?.studyLevel, isFocused]);

  if (isLoading || isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FBFF' }}>
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Video Background */}
      <VideoView
        style={styles.backgroundVideo}
        player={player}
        allowsFullscreen={false}
        nativeControls={false}
        contentFit="cover"
      />

      <View style={[styles.mainContent, { paddingTop: insets.top, paddingBottom: 40 + insets.bottom }]}>
        {/* Full empty top half to display the video completely clean */}
        <View style={{ flex: 1 }} />

        {/* Minimal Buttons directly over the video background */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  mainContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    paddingHorizontal: 32,
    gap: 16,
  },
  createButton: {
    backgroundColor: COLORS.primaryTeal,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  loginButton: {
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primaryTeal,
  },
  loginButtonText: {
    color: COLORS.primaryTeal,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});
