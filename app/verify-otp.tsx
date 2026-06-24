import React, { useState, useEffect, useRef } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "./context/UserContext";
import { verifySignupOtp, requestOtp } from "../lib/api";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#33BFFF", 
  textDark: "#0F172A",
  white: "#FFFFFF",
  glassBlue: "rgba(51, 191, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.5)",
  successGreen: "#10B981",
};

export default function VerifyOtpScreen() {
  const insets = useSafeAreaInsets();
  const { phoneE164, purpose } = useLocalSearchParams<{ phoneE164: string; purpose: string }>();
  const { login } = useUser();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (purpose === 'register') {
        await verifySignupOtp({ phoneE164, otp: otpCode });
        Alert.alert("Success", "Phone verified! You can now log in.", [
            { text: "OK", onPress: () => router.push("/login") }
        ]);
      } else {
        // purpose is login
        const user = await login(phoneE164, otpCode);
        // Navigate based on profile completeness
        if (!user.country) router.push("/setup/country");
        else if (!user.studyLevel) router.push("/setup/study-level");
        else if (!user.fieldOfStudy) router.push("/setup/field-of-study");
        else if (!user.cgpa || !user.recentAcademicField) router.push("/setup/academics");
        else if (!user.score && !user.englishLevel) router.push("/setup/english-test");
        else if (!user.intake) router.push("/setup/target");
        else router.push("/(tabs)/explore");
      }
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await requestOtp({ phoneE164 });
      setTimer(60);
      Alert.alert("OTP Sent", "A new code has been sent to your phone.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.mainContent, { paddingTop: 20 + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.phoneNumber}>{phoneE164}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref as TextInput; }}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleVerify}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text style={[styles.resendLink, timer > 0 && { color: "#CBD5E1" }]}>
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  phoneNumber: {
    color: COLORS.textDark,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  otpInput: {
    width: (width - 48 - 50) / 6,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  verifyButton: {
    backgroundColor: COLORS.primaryBlue,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
    marginBottom: 32,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  resendLink: {
    fontSize: 15,
    color: COLORS.primaryBlue,
    fontWeight: "800",
  },
});
