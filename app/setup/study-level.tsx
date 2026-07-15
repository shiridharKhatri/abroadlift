import React, { useState, useEffect } from "react";
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
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  borderLight: "#F1F5F9",
};

const LEVEL_METADATA: Record<string, { icon: string; provider: string; desc: string }> = {
  "bachelors": {
    icon: "school-outline",
    provider: "Ionicons",
    desc: "Ideal for high school / 10+2 graduates looking for foundational degrees. Duration: 3–4 years."
  },
  "3_year_bachelors": {
    icon: "school-outline",
    provider: "Ionicons",
    desc: "3-Year Bachelor's Degree programs popular in UK, Europe, and Australia."
  },
  "masters_degree": {
    icon: "book-outline",
    provider: "Ionicons",
    desc: "For university graduates aiming for specialization. Duration: 1–2 years."
  },
  "masters": {
    icon: "book-outline",
    provider: "Ionicons",
    desc: "For university graduates aiming for specialization. Duration: 1–2 years."
  },
  "doctoral_phd": {
    icon: "ribbon-outline",
    provider: "Ionicons",
    desc: "For advanced research candidates. Requires a prior master's degree."
  },
  "post_graduate_diploma": {
    icon: "certificate-outline",
    provider: "MaterialCommunityIcons",
    desc: "Vocational and career-focused programs with faster employment paths. Duration: 1–2 years."
  },
  "post_graduate_certificate": {
    icon: "certificate-outline",
    provider: "MaterialCommunityIcons",
    desc: "Specialized postgraduate certificates for fast-tracked career growth."
  },
  "english": {
    icon: "language-outline",
    provider: "Ionicons",
    desc: "English as Second Language (ESL) preparation programs."
  }
};

const CATEGORY_MAP: Record<string, string[]> = {
  "Postgraduate Programs": [
    "masters_degree", "doctoral_phd", "post_graduate_diploma", 
    "post_graduate_certificate", "integrated_masters"
  ],
  "Undergraduate Programs": [
    "bachelors", "3_year_bachelors", "diploma", "advanced_diploma", "certificate"
  ],
  "Primary & Secondary Education (K-12)": [
    "grade_12", "grade_11", "grade_10", "grade_9", "grade_8", 
    "grade_7", "grade_6", "grade_5", "grade_4", "grade_3", "grade_2", "grade_1"
  ],
  "Language & Preparation Programs": [
    "english"
  ]
};

const CATEGORY_ICONS: Record<string, string> = {
  "Postgraduate Programs": "ribbon-outline",
  "Undergraduate Programs": "book-outline",
  "Primary & Secondary Education (K-12)": "business-outline",
  "Language & Preparation Programs": "language-outline"
};

const getCategory = (id: string) => {
  for (const [category, ids] of Object.entries(CATEGORY_MAP)) {
    if (ids.includes(id)) return category;
  }
  return "Other Programs";
};

const STATIC_STUDY_LEVELS = [
  { id: "bachelors", name: "Bachelor's Degree" },
  { id: "masters_degree", name: "Master's Degree" },
  { id: "doctoral_phd", name: "PHD Degree" },
  { id: "post_graduate_diploma", name: "Diploma" },
];

export default function StudyLevelSelection() {
  const { userData, setUserData } = useUser();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  const [groupedLevels, setGroupedLevels] = useState<Record<string, any[]>>({});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const { getStudyLevels } = require("../../lib/api");
    getStudyLevels().then((data: any[]) => {
      const formatted = data.map((item: any) => {
        const meta = LEVEL_METADATA[item.v] || {
          icon: "school-outline",
          provider: "Ionicons",
          desc: "Academic study programs."
        };
        return {
          id: item.v,
          name: item.l,
          icon: meta.icon,
          provider: meta.provider,
          desc: meta.desc,
        };
      });

      const grouped = formatted.reduce((acc: any, level: any) => {
        const category = getCategory(level.id);
        if (!acc[category]) acc[category] = [];
        acc[category].push(level);
        return acc;
      }, {});
      
      // Sort categories to roughly match CATEGORY_MAP order
      const orderedGrouped: Record<string, any[]> = {};
      Object.keys(CATEGORY_MAP).forEach(key => {
        if (grouped[key]) orderedGrouped[key] = grouped[key];
      });
      if (grouped["Other Programs"]) orderedGrouped["Other Programs"] = grouped["Other Programs"];
      
      setGroupedLevels(orderedGrouped);

      // Pre-select current level if it matches
      const current = formatted.find((l: any) => l.name === userData.studyLevel);
      if (current) {
        setSelectedLevel(current.id);
        setExpandedCategory(getCategory(current.id));
      } else {
        const fallbackMatch = STATIC_STUDY_LEVELS.find((l: any) => l.name === userData.studyLevel);
        if (fallbackMatch) {
          setSelectedLevel(fallbackMatch.id);
          setExpandedCategory(getCategory(fallbackMatch.id));
        } else {
          // Default to first category if nothing is selected
          const firstCategory = Object.keys(orderedGrouped)[0];
          if (firstCategory) setExpandedCategory(firstCategory);
        }
      }
    });
  }, [userData.studyLevel]);
  
  const handleSelect = (id: string, name: string) => {
    setSelectedLevel(id);
    setUserData(prev => ({ ...prev, studyLevel: name }));
  };

  const toggleCategory = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === category ? null : category);
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : "#92400E" }]}>
            Selecting the correct level filters course requirements, admission score minimums, and stay-back work permit paths.
          </Text>
        </View>

        {/* Categories Accordion */}
        <View style={styles.accordionContainer}>
          {Object.entries(groupedLevels).map(([category, levels]) => {
            const isExpanded = expandedCategory === category;
            
            return (
              <View key={category} style={[styles.categoryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity 
                  style={[
                    styles.categoryHeader, 
                    isExpanded ? { backgroundColor: colors.primary + "0A" } : { backgroundColor: colors.card },
                    isExpanded && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]} 
                  onPress={() => toggleCategory(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={[styles.categoryIconWrapper, isExpanded && { backgroundColor: colors.primary }]}>
                      <Ionicons 
                        name={(CATEGORY_ICONS[category] as any) || "school-outline"} 
                        size={20} 
                        color={isExpanded ? "#FFF" : colors.primary} 
                      />
                    </View>
                    <Text style={[styles.categoryTitle, { color: colors.text }, isExpanded && { color: colors.primary }]}>
                      {category}
                    </Text>
                  </View>
                  <View style={[styles.chevronWrapper, isExpanded && { backgroundColor: colors.primary + "1A" }]}>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={isExpanded ? colors.primary : colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.categoryContent}>
                    {levels.map((level: any) => {
                      const isSelected = selectedLevel === level.id;
                      return (
                        <TouchableOpacity
                          key={level.id}
                          activeOpacity={0.8}
                          style={[
                            styles.levelItem,
                            { borderColor: colors.border },
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
                )}
              </View>
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
              router.push("/setup/academics");
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
  accordionContainer: {
    gap: 16,
  },
  categoryContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  categoryIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "1A",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    lineHeight: 22,
  },
  chevronWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgSubtle,
  },
  categoryContent: {
    padding: 12,
    gap: 12,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: "center",
    alignItems: "center",
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
});
