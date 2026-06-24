import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  searchUniversities,
  calculateAcceptanceChance,
  UniversityResult,
} from "../../lib/api";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#0066FF",
  primaryLight: "#E8F0FE",
  accent: "#00C48C",
  accentLight: "rgba(0, 196, 140, 0.08)",
  orange: "#FF9F0A",
  orangeLight: "rgba(255, 159, 10, 0.08)",
  red: "#FF3B30",
  redLight: "rgba(255, 59, 48, 0.08)",
  textDark: "#0F172A",
  textMedium: "#475569",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  bgPage: "#F8FAFC",
  white: "#FFFFFF",
  cardShadow: "rgba(15, 23, 42, 0.06)",
};

// Gradient palettes for cards without images
const CARD_GRADIENTS: [string, string, string][] = [
  ["#0066FF", "#3D7EFF", "#6B9AFF"],
  ["#6366F1", "#818CF8", "#A5B4FC"],
  ["#8B5CF6", "#A78BFA", "#C4B5FD"],
  ["#0891B2", "#22D3EE", "#67E8F9"],
  ["#059669", "#34D399", "#6EE7B7"],
  ["#D97706", "#F59E0B", "#FCD34D"],
];

const getTagInfo = (label: string, score: number) => {
  if (score >= 75) return { text: "Best Match", color: THEME.accent, bg: THEME.accentLight };
  if (score >= 60) return { text: "Good Fit", color: THEME.primary, bg: THEME.primaryLight };
  if (score >= 45) return { text: "Moderate", color: THEME.orange, bg: THEME.orangeLight };
  return { text: "Reach", color: THEME.red, bg: THEME.redLight };
};

const ProgressBar = ({ percentage }: { percentage: number }) => {
  const getColor = (p: number) => {
    if (p >= 70) return THEME.accent;
    if (p >= 50) return THEME.orange;
    return THEME.red;
  };
  const color = getColor(percentage);

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.progressPercent, { color }]}>{percentage}%</Text>
    </View>
  );
};

export default function UniversitySelectionSetup() {
  const { userData, selectUniversity, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<UniversityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  // Fetch real universities based on user's selected country
  useEffect(() => {
    let cancelled = false;
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);
      try {
        const country = userData.country || "USA";
        let results = await searchUniversities("", country);
        
        if (results.length === 0) {
          // Fallback to all globally available universities
          results = await searchUniversities("", "All");
          if (!cancelled) {
            setUniversities(results);
            setShowFallbackNotice(true);
          }
        } else {
          if (!cancelled) {
            setUniversities(results);
            setShowFallbackNotice(false);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load universities");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUniversities();
    return () => { cancelled = true; };
  }, [userData.country]);

  // Compute admission chances for each university
  const enrichedUniversities = useMemo(() => {
    return universities.map((uni) => {
      const chance = calculateAcceptanceChance(userData, uni);
      const tag = getTagInfo(chance.label, chance.score);
      return { ...uni, admissionScore: chance.score, admissionLabel: chance.label, tag };
    });
  }, [universities, userData]);

  // Sort: Best Match first, then by admission score descending
  const sortedUniversities = useMemo(() => {
    return [...enrichedUniversities].sort((a, b) => b.admissionScore - a.admissionScore);
  }, [enrichedUniversities]);

  // Filter by search query
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return sortedUniversities;
    const q = searchQuery.toLowerCase();
    return sortedUniversities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(q) ||
        uni.location.toLowerCase().includes(q) ||
        (uni.course && uni.course.toLowerCase().includes(q))
    );
  }, [sortedUniversities, searchQuery]);

  const handleSelect = useCallback((uni: any) => {
    selectUniversity(uni);
    router.push("/(tabs)/explore");
  }, [selectUniversity]);

  const handleSkip = useCallback(() => {
    setUserData(prev => ({ ...prev, onboardingComplete: true }));
    router.replace("/(tabs)/explore");
  }, [setUserData]);

  const handleImageError = useCallback((id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

  const hasValidImage = (uni: UniversityResult) => {
    if (imageErrors[String(uni.id)]) return false;
    if (!uni.image) return false;
    // Filter out the generic unsplash fallback
    if (uni.image.includes("unsplash.com/photo-1541339907198")) return false;
    return true;
  };

  const formatTuition = (tuition: string | number) => {
    if (typeof tuition === "number") return `$${tuition.toLocaleString()} / yr`;
    if (typeof tuition === "string" && tuition.includes("$")) return tuition;
    return tuition || "Contact University";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === "android"
                ? (insets.top || 30) + 10
                : insets.top + 10,
          },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={THEME.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selection</Text>
          <TouchableOpacity style={styles.skipHeaderBtn} onPress={handleSkip}>
            <Text style={styles.skipHeaderBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Steps */}
        <View style={styles.steps}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View
              key={i}
              style={[styles.stepDot, i === 7 && styles.stepDotActive]}
            />
          ))}
        </View>

        {/* Preferences Chip */}
        <View style={styles.prefChip}>
          <Text style={styles.prefEmoji}>{userData.flag || "🌍"}</Text>
          <Text style={styles.prefText}>
            Study in{" "}
            <Text style={styles.prefCountry}>{userData.country || "Any"}</Text>
            {userData.studyLevel ? ` · ${userData.studyLevel}` : ""}
          </Text>
        </View>

        <Text style={styles.pageTitle}>Recommended For You</Text>
        <Text style={styles.pageSubtitle}>
          Universities matched to your profile & preferences
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={THEME.textLight} />
          <TextInput
            placeholder="Search universities or courses..."
            placeholderTextColor={THEME.textLight}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results count */}
        {!loading && (
          <Text style={styles.resultCount}>
            {filteredUniversities.length} universities found
            {userData.country && !showFallbackNotice ? ` in ${userData.country}` : " globally"}
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom },
        ]}
      >
        {/* Fallback Notice Banner */}
        {showFallbackNotice && !loading && !error && (
          <View style={styles.fallbackBanner}>
            <Ionicons name="information-circle" size={20} color={THEME.primary} />
            <Text style={styles.fallbackBannerText}>
              No universities match <Text style={{ fontWeight: "700" }}>{userData.country}</Text> yet. Showing global recommendations instead.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Finding universities...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Ionicons name="cloud-offline-outline" size={48} color={THEME.textLight} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setLoading(true);
                setError(null);
                searchUniversities("", userData.country || "USA")
                  .then(setUniversities)
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              }}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredUniversities.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons name="search-outline" size={48} color={THEME.textLight} />
            <Text style={styles.emptyText}>
              No results for "{searchQuery}"
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ marginBottom: 20 }}>
              <Text style={styles.clearText}>Clear Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipToDashboardBtn} onPress={handleSkip}>
              <Text style={styles.skipToDashboardBtnText}>Skip to Dashboard</Text>
              <Feather name="arrow-right" size={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          filteredUniversities.map((uni, index) => {
            const gradientIndex = index % CARD_GRADIENTS.length;
            const showImage = hasValidImage(uni);

            return (
              <View key={String(uni.id)} style={styles.card}>
                {/* Card Banner */}
                <View style={styles.cardBanner}>
                  {showImage ? (
                    <Image
                      source={{ uri: uni.image }}
                      style={styles.bannerImage}
                      onError={() => handleImageError(String(uni.id))}
                    />
                  ) : (
                    <LinearGradient
                      colors={CARD_GRADIENTS[gradientIndex]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.bannerGradient}
                    >
                      <View style={styles.gradientPattern}>
                        <View style={[styles.gradientCircle, styles.circle1]} />
                        <View style={[styles.gradientCircle, styles.circle2]} />
                      </View>
                      <Ionicons name="school" size={36} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.gradientUniName} numberOfLines={2}>
                        {uni.name}
                      </Text>
                    </LinearGradient>
                  )}

                  {/* Rank Badge */}
                  {uni.rank && uni.rank !== "N/A" && (
                    <View style={styles.rankBadge}>
                      <Ionicons name="trophy-outline" size={11} color={THEME.primary} />
                      <Text style={styles.rankText}>{uni.rank}</Text>
                    </View>
                  )}

                  {/* Tag Badge */}
                  <View style={[styles.tagBadge, { backgroundColor: uni.tag.bg }]}>
                    <Text style={[styles.tagText, { color: uni.tag.color }]}>
                      {uni.tag.text}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelect(uni)}
                  style={styles.cardBody}
                >
                  {/* Location */}
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={THEME.textLight} />
                    <Text style={styles.locationText}>
                      {uni.location || uni.country}
                    </Text>
                  </View>

                  {/* University Name & Course */}
                  <Text style={styles.uniName} numberOfLines={2}>
                    {uni.name}
                  </Text>
                  {uni.course && uni.course !== "Various Courses" && (
                    <Text style={styles.courseName}>{uni.course}</Text>
                  )}

                  {/* Details Grid */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailChip}>
                      <Feather name="clock" size={13} color={THEME.textMedium} />
                      <Text style={styles.detailChipText}>
                        {uni.duration || "Check Site"}
                      </Text>
                    </View>
                    <View style={styles.detailChip}>
                      <Feather name="dollar-sign" size={13} color={THEME.textMedium} />
                      <Text style={styles.detailChipText}>
                        {formatTuition(uni.tuition)}
                      </Text>
                    </View>
                  </View>

                  {/* Admission Chance */}
                  <View style={styles.admissionBox}>
                    <View style={styles.admissionHeader}>
                      <View style={styles.admissionLabelRow}>
                        <Ionicons name="analytics-outline" size={15} color={THEME.textMedium} />
                        <Text style={styles.admissionLabel}>Your Admission Chance</Text>
                      </View>
                      <Text
                        style={[
                          styles.admissionTag,
                          { color: uni.tag.color, backgroundColor: uni.tag.bg },
                        ]}
                      >
                        {uni.admissionLabel}
                      </Text>
                    </View>
                    <ProgressBar percentage={uni.admissionScore} />
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => handleSelect(uni)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.selectBtnText}>Select University</Text>
                    <Feather name="arrow-right" size={16} color={THEME.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() =>
                      router.push(`/university/${uni.id}`)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgPage,
  },

  // ---- Header ----
  header: {
    paddingHorizontal: 20,
    backgroundColor: THEME.white,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.bgPage,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textDark,
    letterSpacing: -0.3,
  },
  steps: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  stepDot: {
    height: 5,
    width: 24,
    borderRadius: 2.5,
    backgroundColor: "#E2E8F0",
  },
  stepDotActive: {
    backgroundColor: THEME.primary,
    width: 32,
  },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  prefEmoji: {
    fontSize: 18,
  },
  prefText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textMedium,
  },
  prefCountry: {
    color: THEME.primary,
    fontWeight: "800",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textDark,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.textLight,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bgPage,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: "500",
  },
  resultCount: {
    fontSize: 12,
    color: THEME.textLight,
    fontWeight: "600",
    marginTop: 2,
  },

  // ---- Scroll ----
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ---- Card ----
  card: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  cardBanner: {
    height: 140,
    width: "100%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  gradientPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  circle1: {
    width: 160,
    height: 160,
    top: -40,
    right: -30,
  },
  circle2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -20,
  },
  gradientUniName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  rankBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.primary,
  },
  tagBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
  },

  // ---- Card Body ----
  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  uniName: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  courseName: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.primary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.bgPage,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMedium,
  },
  admissionBox: {
    backgroundColor: THEME.bgPage,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  admissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  admissionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  admissionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
  },
  admissionTag: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },

  // ---- Progress ----
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "900",
    width: 36,
    textAlign: "right",
  },

  // ---- Card Actions ----
  cardActions: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 8,
  },
  selectBtn: {
    backgroundColor: THEME.primary,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectBtnText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: "700",
  },
  viewBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  viewBtnText: {
    color: THEME.textMedium,
    fontSize: 14,
    fontWeight: "600",
  },

  // ---- States ----
  centerBox: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 15,
    color: THEME.textLight,
    fontWeight: "600",
    marginTop: 14,
  },
  errorText: {
    fontSize: 15,
    color: THEME.textMedium,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    borderRadius: 12,
  },
  retryBtnText: {
    color: THEME.white,
    fontWeight: "700",
    fontSize: 14,
  },
  emptyText: {
    fontSize: 15,
    color: THEME.textMedium,
    fontWeight: "600",
    marginTop: 14,
  },
  clearText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "800",
    marginTop: 8,
  },
  skipHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
  },
  skipHeaderBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.primary,
  },
  fallbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 102, 255, 0.15)",
  },
  fallbackBannerText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textMedium,
    lineHeight: 18,
  },
  skipToDashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 102, 255, 0.1)",
  },
  skipToDashboardBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.primary,
  },
});
