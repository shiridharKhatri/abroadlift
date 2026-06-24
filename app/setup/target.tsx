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
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  borderLight: "#F1F5F9",
  cardSelectedBg: "#F0F9FF",
  cardBorder: "#E2E8F0",
};

const INTAKE_OPTIONS = [
  { id: "spring_2026", label: "Spring 2026", sub: "January Intake" },
  { id: "summer_2026", label: "Summer 2026", sub: "May Intake" },
  { id: "fall_2025", label: "Fall 2025", sub: "September Intake" },
  { id: "not_sure", label: "Not Sure", sub: "We'll suggest" },
];

export default function IntakeSetup() {
  const { userData, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedIntake, setSelectedIntake] = useState(userData.intake || "Fall 2025");

  const handleContinue = () => {
    setUserData(prev => ({
      ...prev,
      intake: selectedIntake,
    }));
    router.push("/setup/university-select");
  };

  // Get dynamic suggestion based on selected country
  const getIntakeRecommendation = () => {
    const c = (userData.country || "USA").toUpperCase();
    if (c.includes("USA") || c.includes("UK") || c.includes("CANADA") || c.includes("AUSTRALIA")) {
      return `Fall (September) Intake is highly recommended for ${userData.country || "your destination"}. It offers 80% of all available courses, holds the highest scholarship funding, and ensures maximum internship/co-op opportunities.`;
    }
    return "Fall (September) is the primary intake globally, followed by Spring (January). Fall generally provides the widest course selections and highest funding approvals.";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Target Intake</Text>
        <View style={{ width: 44 }} /> 
      </View>

      {/* Progress Tracker (Step 6 of 7) */}
      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              { backgroundColor: colors.border },
              i === 6 && { backgroundColor: colors.primary }
            ]} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.questionTitle, { color: colors.text }]}>When do you want to start your studies?</Text>
          <Text style={[styles.questionSubtitle, { color: colors.textSecondary }]}>Intakes dictate application deadlines and visa processing times</Text>
        </View>

        {/* Dynamic Country Intake Recommendation Box */}
        <View style={[styles.recommendationCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#FEF9F2", borderColor: "#FDEED7" }]}>
          <View style={styles.recHeader}>
            <Ionicons name="sparkles" size={18} color={isDark ? colors.primary : "#D97706"} />
            <Text style={[styles.recTitle, { color: isDark ? colors.text : "#92400E" }]}>{userData.country || "Global"} Intake Recommendation</Text>
          </View>
          <Text style={[styles.recText, { color: colors.textSecondary }]}>{getIntakeRecommendation()}</Text>
        </View>

        {/* Intake Options Grid */}
        <View style={styles.grid}>
          {INTAKE_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card, 
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedIntake === item.label && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
              ]}
              onPress={() => setSelectedIntake(item.label)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Feather 
                    name="calendar" 
                    size={16} 
                    color={selectedIntake === item.label ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[styles.cardTitle, { color: colors.text }, selectedIntake === item.label && { color: colors.primary, fontWeight: "800" }]}>
                    {item.label}
                  </Text>
                </View>
                <Text style={[styles.cardSub, { color: colors.textSecondary }]}>{item.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    backgroundColor: "#E2E8F0",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    fontWeight: "500",
  },
  recommendationCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B45309",
  },
  recText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    width: (width - 64) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  selectedCard: {
    backgroundColor: COLORS.cardSelectedBg,
    borderColor: COLORS.primary,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  selectedCardTitle: {
    color: COLORS.primary,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textGray,
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
    fontWeight: "800",
  },
});
