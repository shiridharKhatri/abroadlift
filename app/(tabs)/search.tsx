import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { searchUniversities, calculateAcceptanceChance, UniversityResult } from "../../lib/api";
import { useTheme } from "../context/ThemeContext";
import { Skeleton } from "../../components/Skeleton";

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
    tuitionValue: 32100,
    acceptanceRate: 75,
    admissionChance: "High",
    matchRating: "4.5",
    country: "UK",
    city: "London",
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
    tuitionValue: 35500,
    acceptanceRate: 58,
    admissionChance: "Moderate",
    matchRating: "4.5",
    country: "UK",
    city: "London",
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
    tuitionValue: 38000,
    acceptanceRate: 25,
    admissionChance: "Low",
    matchRating: "4.5",
    country: "UK",
    city: "Oxford",
    recommended: true,
  },
  {
    id: "4",
    name: "Stanford University",
    course: "MS Computer Science",
    location: "Stanford, USA",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
    rank: "#2 Global",
    duration: "2 Year",
    tuition: "$55,000 / yr",
    tuitionValue: 55000,
    acceptanceRate: 5,
    admissionChance: "Low",
    matchRating: "4.0",
    country: "USA",
    city: "Stanford",
    recommended: false,
  },
  {
    id: "5",
    name: "University of Toronto",
    course: "MSc Computer Science",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    rank: "#18 Global",
    duration: "2 Year",
    tuition: "$28,000 / yr",
    tuitionValue: 28000,
    acceptanceRate: 40,
    admissionChance: "Moderate",
    matchRating: "4.0",
    country: "Canada",
    city: "Toronto",
    recommended: false,
  }
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

export default function UniversitySelection() {
  const insets = useSafeAreaInsets();
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark } = useTheme();
  const { pendingCountry, pendingFlag, openFilter } = useLocalSearchParams<{ pendingCountry?: string; pendingFlag?: string; openFilter?: string }>();
  const [filterVisible, setFilterVisible] = useState(false);
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search and Header Section Moved Inside ScrollView */}
        <View style={[styles.header, { backgroundColor: colors.background, paddingHorizontal: 0, paddingTop: 10 }]}>
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
          </View>
        </View>
        {isLoading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, overflow: "hidden" }]}>
                {/* Image Placeholder */}
                <View style={{ height: 160, width: "100%" }}>
                  <Skeleton width="100%" height={160} borderRadius={0} />
                </View>
                {/* Details Placeholder */}
                <View style={{ padding: 16, gap: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Skeleton width={120} height={14} borderRadius={4} />
                    <Skeleton width={60} height={18} borderRadius={10} />
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Skeleton width={36} height={36} borderRadius={12} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width="80%" height={16} borderRadius={4} />
                      <Skeleton width="50%" height={12} borderRadius={4} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : filteredUniversities.length > 0 ? (
          filteredUniversities.map((uni) => (
            <View key={uni.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Top part is clickable for details navigation */}
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={{ flex: 1 }}
                onPress={() => router.push(`/university/${uni.id}?country=${encodeURIComponent(uni.country)}&name=${encodeURIComponent(uni.name)}`)}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: uni.image }} style={styles.cardImage} />
                  {uni.rank && uni.rank !== "N/A" && (
                    <View style={styles.rankBadge}>
                      <BlurView intensity={20} style={styles.rankBlur}>
                        <Ionicons name="trophy-outline" size={12} color="#004be3" />
                        <Text style={styles.rankText}>{uni.rank}</Text>
                      </BlurView>
                    </View>
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationLeft}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]}>{uni.location}</Text>
                    </View>
                    {uni.recommended && (
                      <View style={[styles.recommendedBadge, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={[styles.recommendedText, { color: colors.primary }]}>Matched</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.nameRow}>
                    <View style={[styles.uniIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC" }]}>
                      {uni.logo ? (
                        <Image source={{ uri: uni.logo }} style={styles.uniLogoImage} resizeMode="contain" />
                      ) : (
                        <Ionicons name="school" size={20} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.nameTexts}>
                        <Text style={[styles.uniName, { color: colors.text }]}>{uni.name}</Text>
                        <Text style={[styles.courseName, { color: colors.textSecondary }]}>{uni.course || (uni.levels ? uni.levels.join(" & ") : "Bachelors & Masters Program")}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Feather name="calendar" size={14} color={colors.textSecondary} />
                        <View style={styles.detailTextWrapper}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{uni.duration || "2 - 4 Years"}</Text>
                        </View>
                    </View>
                    <View style={styles.detailItem}>
                        <Feather name="briefcase" size={14} color={colors.textSecondary} />
                        <View style={styles.detailTextWrapper}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tuition</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{uni.tuition}</Text>
                        </View>
                    </View>
                  </View>

                  <View style={styles.acceptanceRow}>
                    <View style={styles.acceptanceLabelBox}>
                        <Ionicons name="stats-chart" size={14} color={colors.textSecondary} />
                        <Text style={[styles.acceptanceLabel, { color: colors.textSecondary }]}>Acceptance</Text>
                    </View>
                    <ProgressTracker percentage={calculateAcceptanceChance(userData, uni).score} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons Area */}
              <View style={[styles.cardInfo, { paddingTop: 0, paddingBottom: 24 }]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.selectButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (pendingCountry) {
                        setUserData({ 
                          ...userData, 
                          country: pendingCountry as string, 
                          flag: pendingFlag as string,
                          selectedUniversities: [uni, ...userData.selectedUniversities.filter(u => u.id !== uni.id)]
                        });
                      } else {
                        selectUniversity(uni);
                      }
                      router.replace("/(tabs)/explore");
                    }}
                  >
                    <Text style={styles.selectButtonText}>Select University</Text>
                    <Feather name="arrow-right" size={18} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.detailsButton, { borderColor: colors.border }]}
                    onPress={() => router.push(`/university/${uni.id}`)}
                  >
                    <Text style={[styles.detailsButtonText, { color: colors.text }]}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
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
                    {["All", "UK", "USA", "Canada", "Australia", "Germany", "Ireland", "Netherlands"].map((c) => (
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

    </SafeAreaView>
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
  card: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    overflow: "hidden",
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    gap: 4,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#004be3",
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
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  recommendedBadge: {
    backgroundColor: "rgba(51, 191, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.primary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  uniIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uniLogoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
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
    color: "#6366F1",
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
  },
  acceptanceLabelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  acceptanceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 0.8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "900",
    width: 32,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  selectButton: {
    flex: 1.25,
    backgroundColor: THEME.secondary,
    height: 50,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectButtonText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: "800",
  },
  detailsButton: {
    flex: 1,
    height: 50,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsButtonText: {
    color: THEME.textGray,
    fontSize: 14,
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
