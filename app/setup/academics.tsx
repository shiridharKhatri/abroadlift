import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  borderLight: "#F1F5F9",
};

export default function AcademicsSetup() {
  const { userData, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const [recentField, setRecentField] = useState(userData.recentAcademicField || "");
  const [cgpa, setCgpa] = useState(userData.cgpa || "");
  const [passoutYear, setPassoutYear] = useState(userData.passoutYear || "");
  const [cgpaError, setCgpaError] = useState("");
  const [yearError, setYearError] = useState("");

  const handleContinue = () => {
    setUserData(prev => ({
      ...prev,
      recentAcademicField: recentField,
      cgpa: cgpa,
      passoutYear: passoutYear,
    }));
    router.push("/setup/english-test");
  };

  const isFormValid = 
    recentField.trim().length > 0 && 
    cgpa.trim().length > 0 && 
    parseFloat(cgpa) <= 100.0 &&
    passoutYear.trim().length === 4 &&
    parseInt(passoutYear) >= 1950 &&
    parseInt(passoutYear) <= 2035 &&
    !cgpaError &&
    !yearError;

  const handleCgpaChange = (text: string) => {
    setCgpa(text);
    const num = parseFloat(text);
    if (text && !isNaN(num)) {
      if (num > 10.0 && num < 40.0) {
        setCgpaError("Enter out of 4.0/10.0 scale, or percentage");
      } else if (num > 100.0) {
        setCgpaError("Percentage/CGPA cannot be above 100");
      } else {
        setCgpaError("");
      }
    } else {
      setCgpaError("");
    }
  };

  const handleYearChange = (text: string) => {
    setPassoutYear(text);
    if (text.length === 4) {
      const year = parseInt(text);
      if (year < 1950 || year > 2035) {
        setYearError("Please enter a valid year (1950-2035)");
      } else {
        setYearError("");
      }
    } else {
      setYearError("");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academics</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              i === 4 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
            ]} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>Tell us about your education</Text>

        {/* Input Cards */}
        <View style={styles.form}>
          
          {/* Field of Study Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Recent Field of Study</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="book-open" size={18} color={COLORS.textGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Computer Science, High School (Science)"
                placeholderTextColor={COLORS.textGray}
                value={recentField}
                onChangeText={setRecentField}
              />
            </View>
          </View>

          {/* CGPA Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>CGPA / Percentage</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="trending-up" size={18} color={COLORS.textGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 3.8 (out of 4.0), 8.5 (out of 10), 85%"
                placeholderTextColor={COLORS.textGray}
                value={cgpa}
                onChangeText={handleCgpaChange}
                keyboardType="numeric"
              />
            </View>
            {cgpaError ? <Text style={styles.errorText}>{cgpaError}</Text> : null}
          </View>

          {/* Passout Year Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Passout Year</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="calendar" size={18} color={COLORS.textGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2024"
                placeholderTextColor={COLORS.textGray}
                value={passoutYear}
                onChangeText={handleYearChange}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
          </View>

          {/* Dynamic Suggestion/Tip Box */}
          <View style={styles.infoCard}>
            <Ionicons name="sparkles" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              A CGPA above 3.0/4.0 or 75% unlocks access to top tier schools and increases scholarship funding opportunities by up to 50%.
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton, 
            !isFormValid && { opacity: 0.5 }
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textDark,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
    fontWeight: "500",
  },
  form: {
    gap: 16,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textGray,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#065F46",
    lineHeight: 18,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  trackerSegment: {
    height: 6,
    borderRadius: 3,
    width: 32,
  },
  trackerSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  trackerSegmentInactive: {
    backgroundColor: "#E5E7EB",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
});
