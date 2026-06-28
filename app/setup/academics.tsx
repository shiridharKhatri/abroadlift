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
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

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
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
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
    if (edit === "true") {
      router.back();
    } else {
      router.push("/setup/english-test");
    }
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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Academics</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              { backgroundColor: colors.border },
              i === 4 && { backgroundColor: colors.primary }
            ]} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.questionText, { color: colors.textSecondary }]}>Tell us about your education</Text>

        {/* Input Cards */}
        <View style={styles.form}>
          
          {/* Field of Study Card */}
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Recent Field of Study</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="book-open" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. Computer Science, High School (Science)"
                placeholderTextColor={colors.textSecondary}
                value={recentField}
                onChangeText={setRecentField}
              />
            </View>
          </View>

          {/* CGPA Card */}
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>CGPA / Percentage</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="trending-up" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. 3.8 (out of 4.0), 8.5 (out of 10), 85%"
                placeholderTextColor={colors.textSecondary}
                value={cgpa}
                onChangeText={handleCgpaChange}
                keyboardType="numeric"
              />
            </View>
            {cgpaError ? <Text style={styles.errorText}>{cgpaError}</Text> : null}
          </View>

          {/* Passout Year Card */}
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Passout Year</Text>
            <View style={styles.textInputWrapper}>
              <Feather name="calendar" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. 2024"
                placeholderTextColor={colors.textSecondary}
                value={passoutYear}
                onChangeText={handleYearChange}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
          </View>

          {/* Dynamic Suggestion/Tip Box */}
          <View style={[styles.infoCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
            <Ionicons name="sparkles" size={20} color={isDark ? colors.primary : "#10B981"} />
            <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : "#065F46" }]}>
              A CGPA above 3.0/4.0 or 75% unlocks access to top tier schools and increases scholarship funding opportunities by up to 50%.
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton, 
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            !isFormValid && { opacity: 0.5 }
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={styles.continueButtonText}>{edit === "true" ? "Save Changes" : "Continue"}</Text>
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
