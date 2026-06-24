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
};

const FIELDS = [
  { id: "engineering", name: "Engineering and Technology" },
  { id: "business", name: "Business & Management (MBA)" },
  { id: "sciences", name: "Computer & Data Sciences" },
  { id: "arts", name: "Arts & Humanities" },
  { id: "law", name: "Law & Public Policy" },
  { id: "medicine", name: "Medicine & Healthcare" },
];

const POPULAR_BADGES = [
  "Computer Science",
  "Data Science",
  "MBA",
  "Information Technology",
  "Nursing",
  "Finance",
  "Mechanical Engineering"
];

export default function FieldOfStudySelection() {
  const { userData, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedField, setSelectedField] = useState<string | null>(
    FIELDS.find(f => f.name === userData.fieldOfStudy)?.id || null
  );
  const [customField, setCustomField] = useState(
    FIELDS.some(f => f.name === userData.fieldOfStudy) ? "" : userData.fieldOfStudy || ""
  );
  const [search, setSearch] = useState("");

  const handleSelect = (id: string, name: string) => {
    setSelectedField(id);
    setCustomField("");
    setUserData(prev => ({ ...prev, fieldOfStudy: name }));
  };

  const handleCustomFieldChange = (text: string) => {
    setSearch(text);
    setCustomField(text);
    setSelectedField(null);
    setUserData(prev => ({ ...prev, fieldOfStudy: text }));
  };

  const handleBadgePress = (badgeName: string) => {
    setSearch(badgeName);
    setCustomField(badgeName);
    setSelectedField(null);
    setUserData(prev => ({ ...prev, fieldOfStudy: badgeName }));
  };

  const filteredFields = FIELDS.filter(field => 
    field.name.toLowerCase().includes(search.toLowerCase())
  );

  const isFormValid = selectedField !== null || customField.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Field Of Study</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: colors.textSecondary }]}>What do you want to study?</Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search or type custom study course"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={handleCustomFieldChange}
          />
        </View>

        {/* Popular Badges Recommendations */}
        <View style={styles.badgesWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Recommendations</Text>
          <View style={styles.badgeGrid}>
            {POPULAR_BADGES.map((badge) => {
              const isSelected = customField === badge;
              return (
                <TouchableOpacity
                  key={badge}
                  style={[
                    styles.badgeItem, 
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => handleBadgePress(badge)}
                >
                  <Text style={[styles.badgeText, { color: colors.textSecondary }, isSelected && { color: "white", fontWeight: "800" }]}>
                    {badge}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Standard Fields List */}
        <View style={styles.listWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Broad Categories</Text>
          <View style={styles.list}>
            {filteredFields.map((field) => {
              const isSelected = selectedField === field.id;
              return (
                <TouchableOpacity
                  key={field.id}
                  activeOpacity={0.8}
                  style={[
                    styles.levelItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
                  ]}
                  onPress={() => handleSelect(field.id, field.name)}
                >
                  <Text style={[styles.fieldName, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: "800" }]}>
                    {field.name}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
            {filteredFields.length === 0 && search.trim().length > 0 && (
              <View style={[styles.customSelectionCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                <Text style={[styles.customSelectionText, { color: colors.text }]}>
                  Use custom field: <Text style={{ fontWeight: "800" }}>"{search}"</Text>
                </Text>
              </View>
            )}
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
          disabled={!isFormValid}
          onPress={() => router.push("/setup/academics")}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgSubtle,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textGray,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  badgesWrapper: {
    marginBottom: 24,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgSubtle,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  badgeItemActive: {
    backgroundColor: "#F0F9FF",
    borderColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textGray,
  },
  badgeTextActive: {
    color: COLORS.primary,
  },
  listWrapper: {
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  selectedItem: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0F9FF",
  },
  fieldName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  selectedFieldName: {
    color: COLORS.primary,
  },
  customSelectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  customSelectionText: {
    fontSize: 14,
    color: COLORS.textDark,
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
