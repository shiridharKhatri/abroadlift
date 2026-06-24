import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { Stack, router } from "expo-router";
import { AntDesign, FontAwesome, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "./context/UserContext";

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
  const { isAuthenticated, isLoading } = useUser();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/explore");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FBFF' }}>
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require("../assets/images/onboarding-bg-4k.png")}
        style={styles.background}
        imageStyle={{ top: -140, height: height + 140 }}
        resizeMode="cover"
      >
        <View style={[styles.mainContent, { paddingTop: insets.top }]}>
          {/* Top Heading with native BlurView */}
          <View style={styles.headerGlassWrapper}>
            <BlurView intensity={60} tint="light" style={styles.headerBlur}>
              {/* Logo Added Here */}
              <Image 
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              
              <Text style={styles.title}>
                Discover the best{"\n"}College for you !
              </Text>
            </BlurView>
          </View>

          {/* Bottom Card with native BlurView for edge-to-edge perfection */}
          <View style={styles.bottomCardWrapper}>
            <BlurView 
              intensity={80} 
              tint="light" 
              style={[
                styles.bottomBlurCard, 
                { paddingBottom: 40 + insets.bottom }
              ]}
            >
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.primaryButtonText}>Create new account</Text>
                <View style={styles.arrowIconContainer}>
                  <Feather name="arrow-right" size={20} color={COLORS.primaryTeal} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>I already have an account</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Logins */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialIcon}>
                  <AntDesign name="google" size={24} color="#EA4335" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <FontAwesome name="apple" size={26} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <FontAwesome name="facebook" size={26} color="#1877F2" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  mainContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerGlassWrapper: {
    marginTop: 20,
    marginHorizontal: 32,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
  },
  headerBlur: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textBlue,
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  bottomCardWrapper: {
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    overflow: "hidden",
    width: width,
  },
  bottomBlurCard: {
    paddingHorizontal: 30,
    paddingTop: 50,
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  primaryButton: {
    backgroundColor: COLORS.primaryTeal,
    height: 70,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 35,
    paddingRight: 10,
    shadowColor: COLORS.primaryTeal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  arrowIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton: {
    alignSelf: "center",
    marginBottom: 35,
  },
  linkText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    opacity: 0.8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.4,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
