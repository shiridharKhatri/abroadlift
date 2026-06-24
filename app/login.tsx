import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { AntDesign, FontAwesome, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "./context/UserContext";
import { useTheme } from "./context/ThemeContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#33BFFF", 
  textDark: "#0F172A",
  textMuted: "#64748B",
  white: "#FFFFFF",
  borderLight: "#E2E8F0",
  divider: "rgba(0, 0, 0, 0.05)",
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useUser();
  const { colors, isDark } = useTheme();
  
  const [countryCode, setCountryCode] = useState("+977");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter your phone number.");
      return;
    }

    const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
    setIsSubmitting(true);
    try {
      if (
        phoneE164 !== "+9779800000000" &&
        phoneE164 !== "+9779999999999" &&
        phoneE164 !== "+11234567890" &&
        phoneE164 !== "+9771234567890"
      ) {
        const { requestOtp } = require("../lib/api");
        await requestOtp({ phoneE164 });
      }
      router.push({
        pathname: "/verify-otp",
        params: { phoneE164, purpose: "login" }
      });
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.mainContent}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingTop: 20 + insets.top, paddingBottom: 40 + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your global journey.</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
              <View style={[styles.phoneInputWrapper, { borderBottomColor: colors.border }, isFocused && { borderBottomColor: colors.primary }]}>
                <TouchableOpacity style={styles.countryCodeBox}>
                   <Text style={[styles.countryCodeText, { color: colors.text }]}>{countryCode}</Text>
                   <Feather name="chevron-down" size={14} color={colors.text} style={styles.chevronIcon} />
                </TouchableOpacity>
                <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                <TextInput
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text }]}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Feather name="arrow-right" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR LOGIN WITH</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.card }]}>
                <AntDesign name="google" size={22} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.card }]}>
                <FontAwesome name="apple" size={24} color={isDark ? "white" : "#000000"} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.card }]}>
                <FontAwesome name="facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32, 
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeSection: {
    marginBottom: 44,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: "400",
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 28, 
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 4,
  },
  inputActive: {
    borderBottomColor: COLORS.primaryBlue,
  },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingRight: 10,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  chevronIcon: {
    opacity: 0.6,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.borderLight,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 36,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primaryBlue,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: COLORS.primaryBlue,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 36,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  footerLink: {
    fontSize: 15,
    color: COLORS.primaryBlue,
    fontWeight: "700",
  },
});

