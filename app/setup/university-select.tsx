import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const THEME = {
  primary: "#33BFFF",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#6B7280",
  bgLight: "#F8FAFF",
  orange: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  white: "#FFFFFF",
};

const MATCHED_UNIVERSITIES = [
  {
    id: "1",
    name: "University College London",
    course: "MSc Computer Science",
    location: "LONDON, UK",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
    rank: "#1 Global",
    duration: "1 Year",
    tuition: "$32,100 / yr",
    acceptanceRate: 75,
    recommended: true,
  },
  {
    id: "2",
    name: "Imperial College London",
    course: "MSc Artificial Intelligence",
    location: "LONDON, UK",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    rank: "#3 Global",
    duration: "1 Year",
    tuition: "$35,500 / yr",
    acceptanceRate: 58,
    recommended: true,
  },
  {
    id: "3",
    name: "University of Oxford",
    course: "MSc Software Engineering",
    location: "OXFORD, UK",
    image: "https://images.unsplash.com/photo-1533667586627-9f5cb393304a?auto=format&fit=crop&q=80&w=800",
    rank: "#2 Global",
    duration: "1 Year",
    tuition: "$38,000 / yr",
    acceptanceRate: 25,
    recommended: true,
  },
];

const ProgressTracker = ({ percentage }: { percentage: number }) => {
  const getColor = (p: number) => {
    if (p >= 70) return THEME.green;
    if (p >= 50) return THEME.orange;
    return THEME.red;
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: getColor(percentage) }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: getColor(percentage) }]}>{percentage}%</Text>
    </View>
  );
};

export default function UniversitySelectionSetup() {
  const { userData, selectUniversity } = useUser();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUniversities = useMemo(() => {
    return MATCHED_UNIVERSITIES.filter(uni =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelect = (uni: any) => {
    selectUniversity(uni);
    router.push("/(tabs)/explore");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 30) + 10 : insets.top + 10 }]}>
        {/* Header Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={28} color={THEME.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selection</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Progress Dots */}
        <View style={styles.trackerContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View
              key={i}
              style={[
                styles.trackerSegment,
                i === 7 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
              ]}
            />
          ))}
        </View>

        {/* Selected Preferences Summary Bar */}
        <View style={styles.studyPlanBar}>
          <Text style={styles.studyPlanEmoji}>{userData.flag}</Text>
          <Text style={styles.studyPlanText}>
            Study in <Text style={styles.studyPlanCountry}>{userData.country}</Text> • {userData.studyLevel}
          </Text>
        </View>

        <Text style={styles.title}>Recommended For You</Text>
        <Text style={styles.subtitle}>
          Compare costs and admission chances based on your profile
        </Text>

        {/* New Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={20} color={THEME.textGray} style={styles.searchIcon} />
          <TextInput
            placeholder="Search universities or courses..."
            placeholderTextColor={THEME.textGray}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom }
        ]}
      >
        {filteredUniversities.length > 0 ? (
          filteredUniversities.map((uni) => (
            <View
              key={uni.id}
              style={styles.card}
            >
              {/* Top part is clickable for selection */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleSelect(uni)}
                style={{ flex: 1 }}
              >
                {/* Banner Image */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: uni.image }} style={styles.cardImage} />
                  <View style={styles.rankBadge}>
                    <BlurView intensity={40} tint="light" style={styles.rankBlur}>
                      <Ionicons name="trophy-outline" size={12} color="#004be3" />
                      <Text style={styles.rankText}>{uni.rank}</Text>
                    </BlurView>
                  </View>
                </View>

                <View style={[styles.cardInfo, { paddingBottom: 0 }]}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationLeft}>
                      <Ionicons name="location-outline" size={14} color="#64748B" />
                      <Text style={styles.locationText}>{uni.location}</Text>
                    </View>
                    {uni.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Matched</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.nameRow}>
                    <View style={styles.uniIconBox}>
                      <Ionicons name="school" size={20} color={THEME.secondary} />
                    </View>
                    <View style={styles.nameTexts}>
                      <Text style={styles.uniName}>{uni.name}</Text>
                      <Text style={styles.courseName}>{uni.course}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Feather name="calendar" size={14} color="#64748B" />
                      <View style={styles.detailTextWrapper}>
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>{uni.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <Feather name="dollar-sign" size={14} color="#64748B" />
                      <View style={styles.detailTextWrapper}>
                        <Text style={styles.detailLabel}>Tuition</Text>
                        <Text style={styles.detailValue}>{uni.tuition}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.acceptanceRow}>
                    <View style={styles.acceptanceLabelBox}>
                      <Ionicons name="stats-chart" size={14} color="#64748B" />
                      <Text style={styles.acceptanceLabel}>Admission Chance</Text>
                    </View>
                    <ProgressTracker percentage={uni.acceptanceRate} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons are separate from the main card click area */}
              <View style={[styles.cardInfo, { paddingTop: 0, paddingBottom: 24 }]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelect(uni)}
                  >
                    <Text style={styles.selectButtonText}>Select University</Text>
                    <Feather name="arrow-right" size={18} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => router.push(`/university/${uni.id}`)}
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No results for "{searchQuery}"</Text>
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.resetText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  header: {
    paddingHorizontal: 24,
    backgroundColor: THEME.white,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.bgLight,
    borderRadius: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textDark,
    letterSpacing: -0.5,
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  trackerSegment: {
    height: 6,
    borderRadius: 3,
    width: 28,
  },
  trackerSegmentActive: {
    backgroundColor: THEME.primary,
  },
  trackerSegmentInactive: {
    backgroundColor: "#E2E8F0",
  },
  studyPlanBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
  },
  studyPlanEmoji: {
    fontSize: 20,
  },
  studyPlanText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textGray,
  },
  studyPlanCountry: {
    color: THEME.secondary,
    fontWeight: "800",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.textDark,
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textGray,
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bgLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.textDark,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 32,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  rankBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  rankBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.secondary,
  },
  cardInfo: {
    padding: 24,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textGray,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  recommendedBadge: {
    backgroundColor: "rgba(51, 191, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.primary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  uniIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 75, 227, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  nameTexts: {
    flex: 1,
  },
  uniName: {
    fontSize: 19,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "48%",
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
  },
  acceptanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: THEME.bgLight,
    padding: 16,
    borderRadius: 16,
  },
  acceptanceLabelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  acceptanceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 0.7,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "900",
    width: 32,
    textAlign: "right",
  },
  selectButton: {
    backgroundColor: THEME.secondary,
    width: "100%",
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  selectButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: "800",
  },
  actionButtons: {
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  detailsButton: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsButtonText: {
    color: THEME.textGray,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textGray,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  resetText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "800",
  },
});
