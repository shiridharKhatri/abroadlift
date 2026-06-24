import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
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
  glassBorder: "rgba(0, 0, 0, 0.05)",
};

const COUNTRIES = [
  { id: "usa", name: "USA", code: "us", flag: "🇺🇸" },
  { id: "uk", name: "UK", code: "gb", flag: "🇬🇧" },
  { id: "canada", name: "Canada", code: "ca", flag: "🇨🇦" },
  { id: "korea", name: "Korea", code: "kr", flag: "🇰🇷" },
  { id: "nether", name: "Nether", code: "nl", flag: "🇳🇱" },
  { id: "brazil", name: "Brazil", code: "br", flag: "🇧🇷" },
  { id: "germany", name: "Germany", code: "de", flag: "🇩🇪" },
  { id: "india", name: "India", code: "in", flag: "🇮🇳" },
  { id: "australia", name: "Australia", code: "au", flag: "🇦🇺" },
  { id: "france", name: "France", code: "fr", flag: "🇫🇷" },
  { id: "japan", name: "Japan", code: "jp", flag: "🇯🇵" },
  { id: "italy", name: "Italy", code: "it", flag: "🇮🇹" },
];

export default function CountrySelection() {
  const { userData, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    COUNTRIES.find(c => c.name === userData.country)?.id || null
  );

  const toggleCountry = (id: string, name: string, flag: string) => {
    setSelectedCountryId(id);
    setUserData(prev => ({ ...prev, country: name, flag: flag }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 20) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Country</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.trackerContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={i} 
            style={[
              styles.trackerSegment, 
              { backgroundColor: colors.border },
              i === 1 && { backgroundColor: colors.primary }
            ]} 
          />
        ))}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: colors.text }]}>Which country are you interested in?</Text>

        {/* Information Banner */}
        <View style={[styles.infoCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#F0F9FF", borderColor: "#E0F2FE" }]}>
          <Ionicons name="information-circle-outline" size={22} color={isDark ? colors.primary : "#0388C7"} />
          <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : "#0369A1" }]}>
            Selecting your destination automatically configures local cost of living estimates, visa readiness tracks, and tailored university match criteria.
          </Text>
        </View>

        {/* Country Grid */}
        <View style={styles.grid}>
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.id}
              style={[
                styles.countryItem,
                selectedCountryId === country.id && styles.selectedItem,
              ]}
              onPress={() => toggleCountry(country.id, country.name, country.flag)}
            >
              <View style={styles.flagWrapper}>
                <View style={[
                  styles.flagContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedCountryId === country.id && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + "15" }
                ]}>
                  <Image
                    source={{ uri: `https://flagcdn.com/w160/${country.code}.png` }}
                    style={styles.flagImage}
                    resizeMode="cover"
                  />
                </View>
                {selectedCountryId === country.id && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.background }]}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.countryName,
                { color: colors.textSecondary },
                selectedCountryId === country.id && { color: colors.primary, fontWeight: "800" }
              ]}>{country.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            !selectedCountryId && { opacity: 0.5 }
          ]}
          disabled={!selectedCountryId}
          onPress={() => router.push("/setup/study-level")}
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
    paddingTop: 40, 
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 18,
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    fontWeight: "500",
    opacity: 0.8,
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#E0F2FE",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0369A1",
    lineHeight: 18,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  countryItem: {
    width: (width - 64) / 4,
    alignItems: "center",
    marginBottom: 24,
  },
  selectedItem: {
    transform: [{ scale: 1.05 }],
  },
  selectedFlagContainer: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(51, 191, 255, 0.05)",
    borderWidth: 2,
  },
  checkBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    zIndex: 10,
  },
  flagWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  flagContainer: {
    width: 60,
    height: 44,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    position: "relative",
    overflow: "hidden",
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  flagImage: {
    width: "100%",
    height: "100%",
  },
  countryName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textGray,
  },
  selectedCountryName: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  footer: {
    padding: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
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
