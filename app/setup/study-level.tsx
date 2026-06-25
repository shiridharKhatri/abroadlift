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
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
};

const STUDY_LEVELS = [
  { 
    id: "bachelors", 
    name: "Bachelor's Degree", 
    icon: "school-outline", 
    provider: "Ionicons",
    desc: "Ideal for high school / 10+2 graduates looking for foundational degrees. Duration: 3–4 years."
  },
  { 
    id: "masters", 
    name: "Master's Degree", 
    icon: "book-outline", 
    provider: "Ionicons",
    desc: "For university graduates aiming for specialization. Duration: 1–2 years."
  },
  { 
    id: "phd", 
    name: "PHD Degree", 
    icon: "ribbon-outline", 
    provider: "Ionicons",
    desc: "For advanced research candidates. Requires a prior master's degree."
  },
  { 
    id: "diploma", 
    name: "Diploma", 
    icon: "certificate-outline", 
    provider: "MaterialCommunityIcons",
    desc: "Vocational and career-focused programs with faster employment paths. Duration: 1–2 years."
  },
];

export default function StudyLevelSelection() {
  const { userData, setUserData } = useUser();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    STUDY_LEVELS.find(l => l.name === userData.studyLevel)?.id || null
  );
  
  const handleSelect = (id: string, name: string) => {
    setSelectedLevel(id);
    setUserData(prev => ({ ...prev, studyLevel: name }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Level</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              { backgroundColor: colors.border },
              i === 2 && { backgroundColor: colors.primary }
            ]} 
          />
        ))}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: colors.textSecondary }]}>What level of study are you planning?</Text>

        {/* Info Banner */}
        <View style={[styles.infoCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
          <Ionicons name="sparkles" size={20} color={isDark ? colors.primary : "#D97706"} />
          <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : "#92400E" }]}>
            Selecting the correct level filters course requirements, admission score minimums, and stay-back work permit paths.
          </Text>
        </View>

        {/* Level List */}
        <View style={styles.list}>
          {STUDY_LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                activeOpacity={0.8}
                style={[
                  styles.levelItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => handleSelect(level.id, level.name)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: colors.border }, isSelected && { backgroundColor: colors.primary }]}>
                  {level.provider === 'Ionicons' ? (
                    <Ionicons name={level.icon as any} size={22} color={isSelected ? "white" : colors.textSecondary} />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={22} color={isSelected ? "white" : colors.textSecondary} />
                  )}
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.levelName, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: "800" }]}>{level.name}</Text>
                  <Text style={[styles.levelDesc, { color: colors.textSecondary }]}>{level.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            !selectedLevel && { opacity: 0.5 }
          ]}
          disabled={!selectedLevel}
          onPress={() => {
            if (edit === "true") {
              router.back();
            } else {
              router.push("/setup/field-of-study");
            }
          }}
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
  infoCard: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FEEB99",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#D97706",
    lineHeight: 18,
    fontWeight: "600",
  },
  list: {
    gap: 16,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    gap: 16,
  },
  selectedItem: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0F9FF",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIconWrapper: {
    backgroundColor: COLORS.white,
  },
  textWrapper: {
    flex: 1,
    gap: 4,
  },
  levelName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  selectedLevelName: {
    color: COLORS.primary,
  },
  levelDesc: {
    fontSize: 12,
    color: COLORS.textGray,
    lineHeight: 16,
    fontWeight: "500",
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
});
