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
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#33BFFF",
  textDark: "#0F172A",
  textMuted: "#64748B",
  white: "#FFFFFF",
  borderLight: "#E2E8F0",
  divider: "rgba(0, 0, 0, 0.05)",
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useUser();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+977");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    
    if (!agreeTerms) {
      Alert.alert("Terms & Conditions", "Please agree to the Terms and Conditions to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
      
      await register({
        name,
        email,
        countryDialCode: countryCode,
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        prefersWhatsApp: true,
      });

      router.push({
        pathname: "/verify-otp",
        params: { 
            phoneE164, 
            purpose: "register" 
        }
      });
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong.",
      );
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
            {
              paddingTop: 20 + insets.top,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={() => router.back()}
            >
              <Feather
                name="chevron-left"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join AbroadLift and start your global journey.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputWrapper, { borderBottomColor: colors.border }, isNameFocused && { borderBottomColor: colors.primary }]}>
                <Feather
                  name="user"
                  size={18}
                  color={isNameFocused ? colors.primary : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { borderBottomColor: colors.border }, isEmailFocused && { borderBottomColor: colors.primary }]}>
                <Feather
                  name="mail"
                  size={18}
                  color={isEmailFocused ? colors.primary : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="example@mail.com"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text }]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
              <View style={[styles.phoneInputWrapper, { borderBottomColor: colors.border }, isPhoneFocused && { borderBottomColor: colors.primary }]}>
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
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                />
              </View>
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsCheckboxRow}>
              <TouchableOpacity 
                style={[styles.checkbox, { borderColor: colors.border }, agreeTerms && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                {agreeTerms && <Feather name="check" size={12} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={[styles.termsCheckboxText, { color: colors.textSecondary }]}>
                I agree to the{" "}
                <Text 
                  style={[styles.termsLink, { color: colors.primary }]}
                  onPress={() => router.push({ pathname: "/terms-privacy", params: { tab: "terms" } })}
                >
                  Terms of Service
                </Text>
                {" "}and{" "}
                <Text 
                  style={[styles.termsLink, { color: colors.primary }]}
                  onPress={() => router.push({ pathname: "/terms-privacy", params: { tab: "privacy" } })}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                  <Feather name="arrow-right" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Log In</Text>
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
    marginBottom: 12,
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
    marginBottom: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 4,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  termsCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  termsCheckboxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  signUpButton: {
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
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
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
