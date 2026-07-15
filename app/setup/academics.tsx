import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
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

const EDUCATION_LEVELS = [
  { id: "Bachelors", label: "BACHELOR'S DEGREE", icon: "ribbon-outline", provider: "Ionicons" },
  { id: "Masters", label: "MASTER'S DEGREE", icon: "ribbon-outline", provider: "Ionicons" },
  { id: "Integrated", label: "INTEGRATED MASTER'S", icon: "sparkles-outline", provider: "Ionicons" },
];

const STATUS_OPTIONS = [
  { id: "Pursuing", label: "PURSUING", desc: "Currently enrolled", icon: "time-outline" },
  { id: "Completed", label: "COMPLETED", desc: "Already graduated", icon: "checkmark-circle-outline" },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012];

export default function AcademicsSetup() {
  const { userData, setUserData } = useUser();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [highestLevel, setHighestLevel] = useState(userData.highestEducationLevel || "");
  const [status, setStatus] = useState(userData.educationStatus || "");
  const [cgpa, setCgpa] = useState(userData.cgpa || "");
  const [passoutYear, setPassoutYear] = useState(userData.passoutYear ? parseInt(userData.passoutYear) : null);
  const [cgpaError, setCgpaError] = useState("");

  const handleContinue = () => {
    setUserData(prev => ({
      ...prev,
      highestEducationLevel: highestLevel,
      educationStatus: status,
      cgpa: cgpa,
      passoutYear: passoutYear ? String(passoutYear) : "",
    }));
    if (edit === "true") {
      router.back();
    } else {
      router.push("/setup/english-test");
    }
  };

  const isFormValid = 
    highestLevel !== "" && 
    status !== "" && 
    cgpa.trim().length > 0 && 
    !cgpaError &&
    passoutYear !== null;

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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              { backgroundColor: colors.border },
              i === 3 && { backgroundColor: colors.primary }
            ]} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.questionText, { color: colors.textSecondary }]}>Tell us about your background</Text>

        {/* Highest Education Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Highest Education Level</Text>
          <View style={styles.levelRow}>
            {EDUCATION_LEVELS.map((level) => {
              const isSelected = highestLevel === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  activeOpacity={0.8}
                  style={[
                    styles.levelCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "10" }
                  ]}
                  onPress={() => setHighestLevel(level.id)}
                >
                  <Ionicons 
                    name={level.icon as any} 
                    size={22} 
                    color={isSelected ? colors.primary : colors.textSecondary} 
                    style={styles.levelIcon}
                  />
                  <Text style={[styles.levelLabelText, { color: colors.textSecondary }, isSelected && { color: colors.primary, fontWeight: "800" }]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Education Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Education Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  style={[
                    styles.statusCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "10" }
                  ]}
                  onPress={() => setStatus(opt.id)}
                >
                  <Ionicons 
                    name={opt.icon as any} 
                    size={24} 
                    color={isSelected ? colors.primary : colors.textSecondary} 
                  />
                  <View style={styles.statusTextContainer}>
                    <Text style={[styles.statusLabelText, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: "800" }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.statusDescText, { color: colors.textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Academics Score */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Academics Score</Text>
          <View style={[styles.scoreInputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.scoreInput, { color: colors.text }]}
              placeholder="e.g. 3.8"
              placeholderTextColor={colors.textSecondary}
              value={cgpa}
              onChangeText={handleCgpaChange}
              keyboardType="numeric"
            />
          </View>
          {cgpaError ? <Text style={styles.errorText}>{cgpaError}</Text> : null}
        </View>

        {/* Year of Passing */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Year of Passing</Text>
          <View style={styles.yearsGrid}>
            {YEARS.map((y) => {
              const isSelected = passoutYear === y;
              return (
                <TouchableOpacity
                  key={y}
                  activeOpacity={0.8}
                  style={[
                    styles.yearButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
                  ]}
                  onPress={() => setPassoutYear(y)}
                >
                  <Text style={[styles.yearButtonText, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: "800" }]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    fontSize: 26,
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
  },
  levelCard: {
    flex: 1,
    height: 90,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  levelIcon: {
    marginBottom: 6,
  },
  levelLabelText: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
  },
  statusCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabelText: {
    fontSize: 13,
    fontWeight: "800",
  },
  statusDescText: {
    fontSize: 11,
    marginTop: 2,
  },
  scoreInputCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 58,
    justifyContent: "center",
  },
  scoreInput: {
    fontSize: 16,
    fontWeight: "700",
  },
  yearsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  yearButton: {
    width: (width - 48 - 40) / 5, // 5 columns
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  yearButtonText: {
    fontSize: 13,
    fontWeight: "700",
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
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
});
