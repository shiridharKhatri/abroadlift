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

const ENGLISH_LEVELS = ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"];
const TEST_TYPES = ["IELTS", "PTE", "TOEFL", "Duolingo"] as const;

type TestType = typeof TEST_TYPES[number];

const TEST_TIPS: Record<TestType, string> = {
  IELTS: "Most top universities require an overall band of 6.5 or higher, with no sub-score under 6.0.",
  PTE: "An overall score of 58 or higher is generally required for bachelor's and master's admissions.",
  TOEFL: "An overall score of 80 to 90 is recommended for most competitive institutions.",
  Duolingo: "A minimum score of 115 to 120 is standard for major universities accepting Duolingo.",
};

export default function EnglishTestSelection() {
  const { userData, setUserData } = useUser();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [hasTakenTest, setHasTakenTest] = useState<boolean | null>(
    userData.testType && userData.testType !== "Not Taken" ? true :
    userData.englishLevel && userData.englishLevel !== "N/A" ? false : null
  );
  const [testType, setTestType] = useState<string>(userData.testType === "Not Taken" ? "" : userData.testType || "");
  const [score, setScore] = useState(userData.score === "Pending" || userData.score === "N/A" ? "" : userData.score || "");
  const [englishLevel, setEnglishLevel] = useState(userData.englishLevel === "N/A" ? "" : userData.englishLevel || "");
  const [scoreError, setScoreError] = useState("");

  const handleToggle = (taken: boolean) => {
    setHasTakenTest(taken);
    if (taken) {
      setEnglishLevel("");
    } else {
      setTestType(""); 
      setScore("");
      setScoreError("");
    }
  };
  
  const handleComplete = () => {
    setUserData(prev => ({
        ...prev,
        score: hasTakenTest ? score : "N/A",
        testType: hasTakenTest ? testType : "Not Taken",
        englishLevel: hasTakenTest ? "N/A" : englishLevel
    }));
    if (edit === "true") {
      router.back();
    } else {
      router.push("/setup/target");
    }
  };

  const isScoreValid = (type: string, val: string) => {
    if (!val) return false;
    const num = parseFloat(val);
    if (isNaN(num)) return false;
    if (type === "IELTS") return num <= 9.0;
    if (type === "PTE") return num <= 90;
    if (type === "TOEFL") return num <= 120;
    if (type === "Duolingo") return num <= 160;
    return true;
  };

  const handleScoreChange = (text: string) => {
    setScore(text);
    if (text) {
      const num = parseFloat(text);
      if (testType === "IELTS" && num > 9.0) setScoreError("IELTS score cannot be above 9.0");
      else if (testType === "PTE" && num > 90) setScoreError("PTE score cannot be above 90");
      else if (testType === "TOEFL" && num > 120) setScoreError("TOEFL score cannot be above 120");
      else if (testType === "Duolingo" && num > 160) setScoreError("Duolingo score cannot be above 160");
      else setScoreError("");
    } else {
      setScoreError("");
    }
  };

  const isFormValid = hasTakenTest === true 
    ? (testType !== "" && score.trim().length > 0 && isScoreValid(testType, score) && !scoreError)
    : (hasTakenTest === false && englishLevel !== "");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>English</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: colors.textSecondary }]}>Have you taken an English test?</Text>

        {/* Yes/No Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn, 
              { backgroundColor: colors.card, borderColor: colors.border },
              hasTakenTest === true && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
            ]}
            onPress={() => handleToggle(true)}
          >
            <Text style={[styles.toggleText, { color: colors.textSecondary }, hasTakenTest === true && { color: colors.primary, fontWeight: "800" }]}>Yes, I have</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn, 
              { backgroundColor: colors.card, borderColor: colors.border },
              hasTakenTest === false && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
            ]}
            onPress={() => handleToggle(false)}
          >
            <Text style={[styles.toggleText, { color: colors.textSecondary }, hasTakenTest === false && { color: colors.primary, fontWeight: "800" }]}>No, I haven't</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Content based on selection */}
        {hasTakenTest === true && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select your test type</Text>
            
            <View style={styles.badgeGrid}>
              {TEST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.badge, 
                    { backgroundColor: colors.card, borderColor: colors.border },
                    testType === type && { borderColor: colors.primary, backgroundColor: colors.primary }
                  ]}
                  onPress={() => { setTestType(type); setScore(""); setScoreError(""); }}
                >
                  <Text style={[styles.badgeText, { color: colors.textSecondary }, testType === type && { color: "white", fontWeight: "800" }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {testType !== "" && (
              <View style={styles.form}>
                <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Overall {testType} Score</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderBottomColor: colors.border }]}
                    placeholder={
                      testType === "IELTS" ? "e.g. 7.5" :
                      testType === "PTE" ? "e.g. 65" :
                      testType === "TOEFL" ? "e.g. 100" :
                      "e.g. 120"
                    }
                    placeholderTextColor={colors.textSecondary}
                    value={score}
                    onChangeText={handleScoreChange}
                    keyboardType="numeric"
                  />
                  {scoreError ? <Text style={styles.errorText}>{scoreError}</Text> : null}
                </View>

                {/* Recommendation Tip Banner */}
                <View style={[styles.infoCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                  <Ionicons name="bulb" size={20} color={isDark ? colors.primary : "#3B82F6"} />
                  <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : "#92400E" }]}>
                    {TEST_TIPS[testType as TestType]}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {hasTakenTest === false && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select your proficiency level</Text>
            <View style={styles.badgeGrid}>
              {ENGLISH_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.badge, 
                    { backgroundColor: colors.card, borderColor: colors.border },
                    englishLevel === level && { borderColor: colors.primary, backgroundColor: colors.primary }
                  ]}
                  onPress={() => setEnglishLevel(level)}
                >
                  <Text style={[styles.badgeText, { color: colors.textSecondary }, englishLevel === level && { color: "white", fontWeight: "800" }]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {englishLevel !== "" && (
              <View style={[styles.infoCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <Ionicons name="information-circle-outline" size={22} color={isDark ? colors.primary : "#059669"} />
                <Text style={[styles.infoTextEmerald, { color: isDark ? colors.textSecondary : "#065F46" }]}>
                  Many universities accept Medium of Instruction (MOI) certificates from your previous college, or offer English pathway courses (ESL) if your scores are pending.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton, 
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            !isFormValid && { opacity: 0.5 }
          ]}
          disabled={!isFormValid}
          onPress={handleComplete}
        >
          <Text style={styles.continueButtonText}>{edit === "true" ? "Save Changes" : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  activeToggle: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0F9FF",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textGray,
  },
  activeToggleText: {
    color: COLORS.primary,
  },
  formSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textGray,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.bgSubtle,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  activeBadgeText: {
    color: COLORS.white,
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
  },
  textInput: {
    fontSize: 18,
    color: COLORS.textDark,
    fontWeight: "700",
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
    fontWeight: "600",
  },
  infoTextEmerald: {
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
