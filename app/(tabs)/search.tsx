import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { GlassCard, canUseGlassEffect } from "../../components/GlassCard";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { Skeleton } from "../../components/Skeleton";
import { calculateAcceptanceChance, searchUniversities, UniversityResult } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

const THEME = {
  primary: "#33BFFF",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#64748B",
  bgLight: "#F8FAFF",
  orange: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  white: "#FFFFFF",
};



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

export default function UniversitySelection() {
  const insets = useSafeAreaInsets();
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark } = useTheme();
  const { pendingCountry, pendingFlag, openFilter } = useLocalSearchParams<{ pendingCountry?: string; pendingFlag?: string; openFilter?: string }>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Open filter modal from other screens if requested
  useEffect(() => {
    if (openFilter === "true") {
      setFilterVisible(true);
    }
  }, [openFilter]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // UI Refs
  const scrollRef = useRef<ScrollView>(null);

  // Filter states
  const [admissionChance, setAdmissionChance] = useState("All");
  const [matchRating, setMatchRating] = useState("All");
  const [feeRange, setFeeRange] = useState(100000); // Max fee slider
  const [selectedCountry, setSelectedCountry] = useState((pendingCountry as string) || userData.country || "All");

  // Dynamic API state
  const [universities, setUniversities] = useState<UniversityResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countriesList, setCountriesList] = useState<string[]>([]);

  useEffect(() => {
    const { getAvailableCountries } = require("../../lib/api");
    getAvailableCountries().then((data: any[]) => {
      if (data && data.length > 0) {
        const names = Array.from(new Set(data.map((item: any) => item.name)));
        setCountriesList(["All", ...names]);
      }
    });
  }, []);
  const [focusCount, setFocusCount] = useState(0);

  // Trigger search on focus
  useFocusEffect(
    useCallback(() => {
      setFocusCount(prev => prev + 1);
      console.log("[Search] Page focused, refreshing...");
    }, [])
  );

  // Sync with params
  useEffect(() => {
    if (pendingCountry) {
      setSelectedCountry(pendingCountry as string);
    }
  }, [pendingCountry]);

  // Sync with Study Plan changes
  useEffect(() => {
    if (userData.country) {
      console.log(`[Search Sync] Destination changed in Study Plan to: ${userData.country}`);
      setSelectedCountry(userData.country);
    }
  }, [userData.country]);

  useEffect(() => {
    let mounted = true;

    // Immediate feedback
    setIsLoading(true);

    const fetchIt = async () => {
      // Clear current view and scroll to top for fresh start
      if (mounted) {
        setUniversities([]);
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }

      console.log(`[Search Effect] Fetching for: ${selectedCountry || userData.country || 'All'}`);
      const data = await searchUniversities(searchQuery, selectedCountry || userData.country || "All");

      if (mounted) {
        setUniversities(data);
        setIsLoading(false);

        // Fetch real tuition details for the first 10 search results in the background
        const topResults = data.slice(0, 10);
        const { getUniversityDetails } = require("../../lib/api");
        Promise.all(
          topResults.map(async (uni) => {
            try {
              const details = await getUniversityDetails(String(uni.id), uni.country || "USA");
              if (details) {
                return {
                  ...uni,
                  tuition: details.tuition,
                  tuitionValue: details.tuitionValue,
                };
              }
            } catch (e) {
              console.warn("Failed background tuition fetch for search:", uni.name, e);
            }
            return uni;
          })
        ).then((updatedUnis) => {
          if (mounted) {
            setUniversities((prev) => {
              return prev.map((p) => {
                const match = updatedUnis.find((u) => String(u.id) === String(p.id));
                return match ? match : p;
              });
            });
          }
        });
      }
    };
    // Debounce to prevent rapid multiple calls if state updates sequentially
    const t = setTimeout(fetchIt, 400);
    return () => { mounted = false; clearTimeout(t); };
  }, [searchQuery, selectedCountry, userData.country, focusCount]);

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      // Study Level Filter
      let levelMatch = true;
      if (userData.studyLevel) {
        const userLevel = userData.studyLevel.toLowerCase();
        const uniLevels = (uni.levels || []).map((l: string) => l.toLowerCase());

        // Match "Bachelors", "Bachelor", "Undergraduate"
        if (userLevel.includes("bachelor") || userLevel.includes("undergrad")) {
          levelMatch = uniLevels.some(l => l.includes("bachelor") || l.includes("undergrad"));
        }
        // Match "Masters", "Master", "Postgraduate", "PG"
        else if (userLevel.includes("master") || userLevel.includes("postgrad") || userLevel.includes("pg")) {
          levelMatch = uniLevels.some(l => l.includes("master") || l.includes("postgrad") || l.includes("pg"));
        }

        // If uni has no levels specified, we allow it (safety fallback)
        if (!uni.levels || uni.levels.length === 0) levelMatch = true;
      }

      const matchesChance = admissionChance === "All" || uni.admissionChance === admissionChance;
      const matchesRating = matchRating === "All" || parseFloat(uni.matchRating || "0") >= parseFloat(matchRating);
      const feeVal = uni.tuitionValue || 100000;
      const matchesFee = feeVal <= feeRange;

      return levelMatch && matchesChance && matchesRating && matchesFee;
    });
  }, [universities, admissionChance, matchRating, feeRange, userData.studyLevel]);

  const resetFilters = () => {
    setAdmissionChance("All");
    setMatchRating("All");
    setFeeRange(100000);
    setSelectedCountry("All");
  };

  const hasActiveFilters = (admissionChance !== "All" || matchRating !== "All" || feeRange < 100000 || selectedCountry !== "All");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search and Header Section Moved Inside ScrollView */}
        <View style={[styles.header, { backgroundColor: colors.background, paddingHorizontal: 0, paddingTop: (insets.top || StatusBar.currentHeight || 24) + 20 }]}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Find Universities That Match Your Profile</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Compare costs, admission chances, and visa success — all in one place
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <ProfileAvatar size={48} color={colors.border} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBar, { borderBottomColor: colors.border }, isSearchFocused && { borderBottomColor: colors.primary }]}>
            <Feather name="search" size={20} color={isSearchFocused ? colors.primary : colors.textSecondary} />
            <TextInput
              placeholder="Search universities, courses..."
              style={[styles.searchInput, { color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="swap-vert" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                hasActiveFilters && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
              ]}
              onPress={() => setFilterVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color={hasActiveFilters ? colors.primary : colors.text} />
              <Text style={[styles.actionButtonText, { color: hasActiveFilters ? colors.primary : colors.text }]}>Filters</Text>
            </TouchableOpacity>

            {/* View Mode Toggle */}
            <View style={[styles.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.8}
              >
                <Ionicons name="list" size={16} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('grid')}
                activeOpacity={0.8}
              >
                <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#fff' : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={[styles.uniRowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.uniRowTop}>
                   <Skeleton width={56} height={56} borderRadius={12} />
                   <View style={{ flex: 1, gap: 8, paddingLeft: 12 }}>
                      <Skeleton width="80%" height={16} borderRadius={4} />
                      <Skeleton width="50%" height={14} borderRadius={4} />
                   </View>
                </View>
                <View style={[styles.uniRowBottom, { borderTopColor: colors.border }]}>
                   <View style={styles.uniRowStats}>
                      <Skeleton width={60} height={30} borderRadius={4} />
                      <Skeleton width={60} height={30} borderRadius={4} />
                   </View>
                   <Skeleton width={80} height={36} borderRadius={18} />
                </View>
              </View>
            ))}
          </View>
        ) : filteredUniversities.length > 0 ? (
          viewMode === 'list' ? (
            // ── LIST VIEW ──
            filteredUniversities.map((uni) => (
              <TouchableOpacity
                key={uni.id}
                style={[styles.uniRowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/university/${uni.id}?country=${encodeURIComponent(uni.country)}&name=${encodeURIComponent(uni.name)}`)}
                activeOpacity={0.7}
              >
                <View style={styles.uniRowTop}>
                  <View style={[styles.uniRowLogoBox, { borderColor: colors.border, backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC" }]}>
                    {uni.logo ? (
                      <Image source={{ uri: uni.logo }} style={styles.uniRowLogo} resizeMode="contain" />
                    ) : (
                      <Ionicons name="school" size={24} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.uniRowMainInfo}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <Text style={[styles.uniRowName, { color: colors.text, flex: 1 }]} numberOfLines={1}>{uni.name}</Text>
                      {uni.recommended && (
                        <View style={[styles.matchBadge, { backgroundColor: colors.primary + "15" }]}>
                          <Text style={[styles.matchBadgeText, { color: colors.primary }]}>Matched</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.uniRowCourse, { color: colors.primary }]} numberOfLines={1}>
                      {uni.course || (uni.levels ? uni.levels.join(" & ") : "Bachelors & Masters")}
                    </Text>
                    <View style={styles.uniRowLocationWrap}>
                       <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                       <Text style={[styles.uniRowLocationText, { color: colors.textSecondary }]} numberOfLines={1}>{uni.location}</Text>
                       {uni.rank && uni.rank !== "N/A" && (
                         <>
                           <Text style={{ color: colors.border, marginHorizontal: 4 }}>•</Text>
                           <Text style={[styles.uniRowLocationText, { color: colors.textSecondary }]}>Rank #{uni.rank}</Text>
                         </>
                       )}
                    </View>
                  </View>
                </View>
                
                <View style={[styles.uniRowBottom, { borderTopColor: colors.border }]}>
                  <View style={styles.uniRowStats}>
                     <View style={styles.uniRowStatItem}>
                        <Text style={[styles.uniRowStatLabel, { color: colors.textSecondary }]}>Tuition</Text>
                        <Text style={[styles.uniRowStatValue, { color: colors.text }]}>{uni.tuition}</Text>
                     </View>
                     <View style={styles.uniRowStatItem}>
                        <Text style={[styles.uniRowStatLabel, { color: colors.textSecondary }]}>Acceptance</Text>
                        <Text style={[styles.uniRowStatValue, { color: colors.text }]}>{calculateAcceptanceChance(userData, uni).score}%</Text>
                     </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.uniRowSelectBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (pendingCountry) {
                        setUserData({ ...userData, country: pendingCountry as string, flag: pendingFlag as string, selectedUniversities: [uni, ...userData.selectedUniversities.filter(u => u.id !== uni.id)] });
                      } else { selectUniversity(uni); }
                      router.replace("/(tabs)/explore");
                    }}
                  >
                    <Text style={styles.uniRowSelectBtnText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            // ── GRID VIEW ──
            <View style={styles.gridContainer}>
              {filteredUniversities.map((uni) => (
                <TouchableOpacity
                  key={uni.id}
                  style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/university/${uni.id}?country=${encodeURIComponent(uni.country)}&name=${encodeURIComponent(uni.name)}`)}
                  activeOpacity={0.7}
                >
                  {/* Logo */}
                  <View style={[styles.gridLogoBox, { backgroundColor: isDark ? '#2C2C2E' : '#F8FAFC', borderColor: colors.border }]}>
                    {uni.logo ? (
                      <Image source={{ uri: uni.logo }} style={styles.gridLogo} resizeMode="contain" />
                    ) : (
                      <Ionicons name="school" size={28} color={colors.primary} />
                    )}
                    {uni.recommended && (
                      <View style={[styles.gridMatchDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>

                  {/* Name */}
                  <Text style={[styles.gridUniName, { color: colors.text }]} numberOfLines={2}>{uni.name}</Text>

                  {/* Location */}
                  <View style={styles.gridLocation}>
                    <Ionicons name="location-outline" size={10} color={colors.textSecondary} />
                    <Text style={[styles.gridLocationText, { color: colors.textSecondary }]} numberOfLines={1}>{uni.location}</Text>
                  </View>

                  {/* Stats row */}
                  <View style={[styles.gridStatsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.gridStat}>
                      <Text style={[styles.gridStatVal, { color: colors.primary }]}>{calculateAcceptanceChance(userData, uni).score}%</Text>
                      <Text style={[styles.gridStatLabel, { color: colors.textSecondary }]}>Accept</Text>
                    </View>
                    <View style={[styles.gridStatDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.gridStat}>
                      <Text style={[styles.gridStatVal, { color: colors.text }]} numberOfLines={1}>{uni.tuition}</Text>
                      <Text style={[styles.gridStatLabel, { color: colors.textSecondary }]}>Tuition</Text>
                    </View>
                  </View>

                  {/* Select btn */}
                  <TouchableOpacity
                    style={[styles.gridSelectBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (pendingCountry) {
                        setUserData({ ...userData, country: pendingCountry as string, flag: pendingFlag as string, selectedUniversities: [uni, ...userData.selectedUniversities.filter(u => u.id !== uni.id)] });
                      } else { selectUniversity(uni); }
                      router.replace("/(tabs)/explore");
                    }}
                  >
                    <Text style={styles.gridSelectBtnText}>Select</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={64} color={colors.border} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>No Universities Found</Text>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>Try adjusting your search query or filters.</Text>
            <TouchableOpacity style={[styles.clearFiltersBtn, { backgroundColor: colors.card }]} onPress={resetFilters}>
              <Text style={[styles.clearFiltersBtnText, { color: colors.text }]}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>

              {/* Admission Chances */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>Admission Chances</Text>
                <View style={styles.chipRow}>
                  {["All", "High", "Moderate", "Low"].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        admissionChance === level && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
                        level === "High" && admissionChance === level && { backgroundColor: "#DCFCE7", borderColor: "#10B981" }
                      ]}
                      onPress={() => setAdmissionChance(level)}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: colors.textSecondary },
                        admissionChance === level && { color: colors.primary },
                        level === "High" && admissionChance === level && { color: "#10B981" }
                      ]}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Match Rating */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>Match Rating</Text>
                {[
                  { id: "All", label: "All Ratings", stars: 0 },
                  { id: "4.5", label: "4.5 & above", stars: 4 },
                  { id: "4.0", label: "4.0 - 4.5", stars: 4 },
                  { id: "3.5", label: "3.5 - 4.0", stars: 3 },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.ratingRow,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      matchRating === item.id && { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }
                    ]}
                    onPress={() => setMatchRating(item.id)}
                  >
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= item.stars ? "star" : "star-outline"}
                          size={16}
                          color={s <= item.stars ? "#FBBF24" : colors.border}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text style={[styles.ratingText, { color: colors.text }, matchRating === item.id && { color: colors.primary }]}>{item.label}</Text>
                    </View>
                    <Ionicons
                      name={matchRating === item.id ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={matchRating === item.id ? colors.primary : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Estimated Fee */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                <View style={styles.feeHeader}>
                  <Text style={[styles.filterLabel, { color: colors.text }]}>Max Tuition Fee / yr</Text>
                  <Text style={[styles.feeValue, { color: colors.primary }]}>${Math.round(feeRange / 1000)}k</Text>
                </View>
                {/* Simplified Slider using TouchableOpacity for demo */}
                <View style={styles.sliderMock}>
                  <TouchableOpacity
                    style={styles.sliderFullWidth}
                    activeOpacity={1}
                    onPress={(e) => {
                      const x = e.nativeEvent.locationX;
                      const newFee = (x / (width - 48)) * 100000;
                      setFeeRange(Math.max(20000, Math.min(100000, newFee)));
                    }}
                  >
                    <View style={[styles.sliderTrack, { backgroundColor: colors.border }]} />
                    <View style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${(feeRange / 100000) * 100}%` }]} />
                    <View style={[styles.sliderThumb, { borderColor: colors.card, backgroundColor: colors.primary, left: `${(feeRange / 100000) * 100}%` }]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.feeRange}>
                  <Text style={[styles.rangeText, { color: colors.textSecondary }]}>$20k</Text>
                  <Text style={[styles.rangeText, { color: colors.textSecondary }]}>$100k+</Text>
                </View>
              </View>

              {/* Country Dropdown */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border, borderBottomWidth: 0 }]}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>Country</Text>
                <View style={styles.chipRow}>
                  {(countriesList.length > 0 ? countriesList : ["All", "UK", "USA", "Canada", "Australia", "Germany", "Ireland", "Netherlands"]).map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        selectedCountry === c && { borderColor: colors.primary, backgroundColor: colors.primary + "15" }
                      ]}
                      onPress={() => setSelectedCountry(c)}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: colors.textSecondary },
                        selectedCountry === c && { color: colors.primary }
                      ]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.resetBtn, { borderColor: colors.border }]} onPress={resetFilters}>
                <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={() => setFilterVisible(false)}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  header: {
    paddingHorizontal: 0,
    backgroundColor: THEME.white,
    paddingTop: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.5,
    paddingRight: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: "500",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    height: 48,
    marginBottom: 20,
  },
  searchBarActive: {
    borderBottomColor: THEME.primary,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: THEME.textDark,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 44,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  // ── View Mode Toggle ──
  viewToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    height: 44,
  },
  viewToggleBtn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Grid Styles ──
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: (width - 40 - 12) / 2,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    overflow: "hidden",
  },
  gridLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  gridLogo: {
    width: "100%",
    height: "100%",
  },
  gridMatchDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gridUniName: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 4,
  },
  gridLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 12,
  },
  gridLocationText: {
    fontSize: 11,
    flex: 1,
  },
  gridStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginBottom: 10,
  },
  gridStat: {
    flex: 1,
    alignItems: "center",
  },
  gridStatVal: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  gridStatLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  gridStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    marginHorizontal: 4,
  },
  gridSelectBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  gridSelectBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  uniRowCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  uniRowTop: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  uniRowLogoBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uniRowLogo: {
    width: "100%",
    height: "100%",
  },
  uniRowMainInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  uniRowName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  uniRowCourse: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  uniRowLocationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  uniRowLocationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  uniRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  uniRowStats: {
    flexDirection: "row",
    gap: 20,
  },
  uniRowStatItem: {},
  uniRowStatLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  uniRowStatValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  uniRowSelectBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
  },
  uniRowSelectBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.85,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
  },
  filterScroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  filterSection: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    backgroundColor: "transparent",
  },
  activeChip: {
    borderColor: THEME.primary,
    backgroundColor: "rgba(51, 191, 255, 0.05)",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textGray,
  },
  activeChipText: {
    color: THEME.primary,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeRatingRow: {
    backgroundColor: "rgba(51, 191, 255, 0.05)",
    borderColor: "rgba(51, 191, 255, 0.2)",
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textDark,
    marginLeft: 10,
  },
  activeRatingText: {
    color: THEME.primary,
  },
  feeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 20,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.primary,
  },
  sliderMock: {
    height: 30,
    justifyContent: "center",
    position: "relative",
    marginBottom: 12,
  },
  sliderFullWidth: {
    width: '100%',
    height: 30,
    justifyContent: "center",
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
  },
  sliderFill: {
    position: "absolute",
    height: 6,
    backgroundColor: THEME.primary,
    borderRadius: 3,
    top: 12,
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    borderWidth: 4,
    borderColor: THEME.white,
    top: 3,
    marginLeft: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  feeRange: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textGray,
  },
  applyBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.primary,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "white",
  },
  noResults: {
    alignItems: "center",
    paddingTop: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: "center",
    marginBottom: 32,
  },
  clearFiltersBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  clearFiltersBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
  },
});
