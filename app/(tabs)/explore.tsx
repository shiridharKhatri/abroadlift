import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { Skeleton } from "../../components/Skeleton";
import { calculateAcceptanceChance, searchUniversities, UniversityResult } from "../../lib/api";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#33BFFF",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#64748B",
  bgLight: "#F8FAFF",
  orange: "#F97316",
  green: "#10B981",
  white: "#FFFFFF",
  blue: "#3B82F6",
  red: "#EF4444",
};

const COUNTRIES = [
  { id: "usa", name: "USA", flag: "🇺🇸" },
  { id: "uk", name: "UK", flag: "🇬🇧" },
  { id: "canada", name: "Canada", flag: "🇨🇦" },
  { id: "australia", name: "Australia", flag: "🇦🇺" },
  { id: "germany", name: "Germany", flag: "🇩🇪" },
  { id: "ireland", name: "Ireland", flag: "🇮🇪" },
  { id: "malta", name: "Malta", flag: "🇲🇹" },
];

const COUNTRY_CODES: Record<string, string> = {
  "usa": "us",
  "united states": "us",
  "uk": "gb",
  "united kingdom": "gb",
  "canada": "ca",
  "korea": "kr",
  "south korea": "kr",
  "netherlands": "nl",
  "nether": "nl",
  "brazil": "br",
  "germany": "de",
  "india": "in",
  "australia": "au",
  "france": "fr",
  "japan": "jp",
  "italy": "it",
  "ireland": "ie",
  "malta": "mt"
};

const getFlagUrl = (countryName: string | undefined) => {
  const normalized = (countryName || "").toLowerCase().trim();
  const code = COUNTRY_CODES[normalized];
  if (!code) return null;
  return `https://flagcdn.com/w160/${code}.png`;
};

const COUNTRY_THEMES: Record<string, {
  colors: [string, string];
  titleColor: string;
  countryColor: string;
  editBg: string;
  editText: string;
}> = {
  "USA": {
    colors: ["#1E3A8A", "#3B82F6"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "United Kingdom": {
    colors: ["#0F172A", "#1E3A8A"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "UK": {
    colors: ["#0F172A", "#1E3A8A"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Canada": {
    colors: ["#7F1D1D", "#DC2626"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Germany": {
    colors: ["#1E293B", "#D97706"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Australia": {
    colors: ["#064E3B", "#059669"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Ireland": {
    colors: ["#14532D", "#16A34A"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "France": {
    colors: ["#1E3A8A", "#EF4444"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Japan": {
    colors: ["#881337", "#E11D48"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
  "Korea": {
    colors: ["#1E3A8A", "#E11D48"],
    titleColor: "rgba(255,255,255,0.75)",
    countryColor: "#FFFFFF",
    editBg: "rgba(255,255,255,0.2)",
    editText: "#FFFFFF"
  },
};

const getCountryTheme = (countryName: string | undefined, isDark: boolean, colors: any) => {
  const normalized = (countryName || "").trim();
  const theme = COUNTRY_THEMES[normalized];
  if (!theme) {
    return {
      colors: [colors.primary, colors.primary + "CC"] as [string, string],
      titleColor: "rgba(255,255,255,0.75)",
      countryColor: "#FFFFFF",
      editBg: "rgba(255,255,255,0.2)",
      editText: "#FFFFFF"
    };
  }

  if (isDark) {
    // In dark mode, make the colors slightly darker and less saturated
    return {
      colors: [theme.colors[0] + "D0", theme.colors[1] + "B0"] as [string, string],
      titleColor: "rgba(255,255,255,0.65)",
      countryColor: "#FFFFFF",
      editBg: "rgba(255,255,255,0.15)",
      editText: "#FFFFFF"
    };
  }

  return theme;
};

export default function DashboardScreen() {
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark } = useTheme();
  const countryTheme = getCountryTheme(userData.country, isDark, colors);
  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<'options' | 'country'>('options');
  const [recommendedUnis, setRecommendedUnis] = React.useState<UniversityResult[]>([]);
  const [estimatedCost, setEstimatedCost] = React.useState<string>("--");
  const [acceptanceChance, setAcceptanceChance] = React.useState<string>("--");
  const [visaReadiness, setVisaReadiness] = React.useState<string>("--");
  const [loadingUnis, setLoadingUnis] = React.useState(true);
  const [showCountryFallback, setShowCountryFallback] = React.useState(false);

  const USD_TO_NPR = 134;

  const calculateDynamicMetrics = (user: any) => {
    // 1. Acceptance Chance calculation
    const gpa = parseFloat(user.cgpa || "0");
    const engScore = parseFloat(user.score || "0");

    // Normalize GPA
    let gpaNorm = gpa / 4.0;
    if (gpa > 4.5) gpaNorm = gpa / 10.0;
    if (gpaNorm > 1) gpaNorm = 1;

    // Normalize English (assuming IELTS 0-9)
    let engNorm = engScore / 9.0;
    if (engNorm > 1) engNorm = 1;

    // Base probability
    let prob = 35 + (gpaNorm * 40) + (engNorm * 20);

    // Rank Factor
    if (user.selectedUniversities?.length > 0) {
      const rankStr = user.selectedUniversities[0].rank || "";
      const rankVal = parseInt(rankStr.replace(/[^0-9]/g, ""));
      if (!isNaN(rankVal)) {
        if (rankVal < 50) prob -= 20;
        else if (rankVal < 200) prob -= 10;
        else if (rankVal > 500) prob += 10;
      }
    }

    const finalProb = Math.min(98, Math.max(5, Math.round(prob)));
    let chanceLabel = "Moderate";
    if (finalProb >= 80) chanceLabel = "Very High";
    else if (finalProb >= 65) chanceLabel = "High";
    else if (finalProb < 45) chanceLabel = "Low";

    setAcceptanceChance(`${finalProb}% - ${chanceLabel}`);

    // 2. Visa Readiness (Placeholder dynamic)
    let visaScore = 50 + (gpaNorm * 20) + (engNorm * 10);
    const finalVisa = Math.min(95, Math.round(visaScore));
    let visaLabel = "Good";
    if (finalVisa < 65) visaLabel = "Needs Work";
    else if (finalVisa > 85) visaLabel = "Strong";
    setVisaReadiness(`${finalVisa}% - ${visaLabel}`);
  };

  const getDynamicNotifications = () => {
    const list = [];

    // 1. Welcome Notification
    list.push({
      id: "welcome",
      icon: "sparkles-outline",
      iconColor: isDark ? colors.primary : THEME.blue,
      bgColor: isDark ? "#1E293B" : "#EFF6FF",
      title: `Welcome to AbroadLift, ${userData.name || "Student"}!`,
      body: "Start exploring universities and building your roadmap today.",
      time: "Just now"
    });

    // 2. Profile Status Notification
    const hasAcademics = userData.cgpa && userData.score;
    list.push({
      id: "profile",
      icon: "person-outline",
      iconColor: isDark ? colors.secondary : "#D97706",
      bgColor: isDark ? "#1E293B" : "#FEF3C7",
      title: hasAcademics ? "Profile Status: Active" : "Complete Your Profile",
      body: hasAcademics
        ? "Your academic grades and test scores are updated. You are ready to view admission chances!"
        : "Add your academic grades and English test scores to estimate your exact admission chances.",
      time: hasAcademics ? "1 hour ago" : "2 hours ago"
    });

    // 3. Shortlist/Target Notification
    const hasShortlist = userData.selectedUniversities && userData.selectedUniversities.length > 0;
    list.push({
      id: "shortlist",
      icon: "bookmark-outline",
      iconColor: isDark ? colors.primary : THEME.green,
      bgColor: isDark ? "#1E293B" : "#ECFDF5",
      title: hasShortlist ? "Shortlist Updated" : "Explore Universities",
      body: hasShortlist
        ? `${userData.selectedUniversities[0].name || "Your selected school"} has been successfully added to your shortlist.`
        : `Start shortlisting universities in ${userData.country || "your destination"} to track visa readiness.`,
      time: "Yesterday"
    });

    return list;
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      const load = async () => {
        try {
          setLoadingUnis(true);
          const { getCostOfLiving } = require("../../lib/api");

          let costData = null;
          try {
            costData = await getCostOfLiving(userData.country || "UK");
          } catch (err) {
            console.warn("Failed to fetch cost data:", err);
          }

          let results: UniversityResult[] = [];
          let isFallback = false;
          try {
            results = await searchUniversities("", userData.country || "UK");
          } catch (err) {
            console.warn("Failed to fetch country universities:", err);
          }

          if (!results || results.length === 0) {
            try {
              // Fallback to all global schools if the country search is empty
              results = await searchUniversities("", "All");
              isFallback = true;
            } catch (err) {
              console.warn("Failed to fetch global universities fallback:", err);
            }
          }

          if (mounted) {
            setShowCountryFallback(isFallback);
            // Filter by study level first
            let filtered = results;
            if (userData.studyLevel) {
              const userLevel = userData.studyLevel.toLowerCase();
              filtered = results.filter(uni => {
                if (!uni.levels || uni.levels.length === 0) return true;
                const uniLevels = uni.levels.map((l: string) => l.toLowerCase());

                if (userLevel.includes("bachelor") || userLevel.includes("undergrad")) {
                  return uniLevels.some(l => l.includes("bachelor") || l.includes("undergrad"));
                }
                if (userLevel.includes("master") || userLevel.includes("postgrad") || userLevel.includes("pg")) {
                  return uniLevels.some(l => l.includes("master") || l.includes("postgrad") || l.includes("pg"));
                }
                return true;
              });
            }

            const recommended = filtered.slice(0, 5);
            setRecommendedUnis(recommended);

            const { getUniversityDetails } = require("../../lib/api");
            Promise.all(
              recommended.map(async (uni) => {
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
                  console.warn("Failed background tuition fetch for explore:", uni.name, e);
                }
                return uni;
              })
            ).then((updatedUnis) => {
              if (mounted) {
                setRecommendedUnis(updatedUnis);
              }
            });

            if (costData) {
              const monthlyUsd = costData.monthly_estimate_usd || 1500;
              const annualLivingUsd = monthlyUsd * 12;

              // Tuition logic: use selected uni if available, else regional average
              let tuitionUsd = 20000;
              if (userData.selectedUniversities?.length > 0) {
                tuitionUsd = userData.selectedUniversities[0].tuitionValue || 20000;
              }

              const totalNpr = (annualLivingUsd + tuitionUsd) * USD_TO_NPR;
              setEstimatedCost(`NPR ${(totalNpr / 1000000).toFixed(1)}M`);
            } else {
              // Fallback default calculation if API response or URL is missing
              const monthlyUsd = 1500;
              const annualLivingUsd = monthlyUsd * 12;
              let tuitionUsd = 20000;
              if (userData.selectedUniversities?.length > 0) {
                tuitionUsd = userData.selectedUniversities[0].tuitionValue || 20000;
              }
              const totalNpr = (annualLivingUsd + tuitionUsd) * USD_TO_NPR;
              setEstimatedCost(`NPR ${(totalNpr / 1000000).toFixed(1)}M`);
            }

            calculateDynamicMetrics(userData);
            setLoadingUnis(false);
          }
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          if (mounted) setLoadingUnis(false);
        }
      };
      load();
      return () => { mounted = false; };
    }, [userData])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: colors.text }]}>Hi, {userData.name || "user"} 👋</Text>
          <Text style={[styles.subGreetingText, { color: colors.textSecondary }]}>Here's your abroad study overview</Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => setShowNotificationsModal(true)}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <ProfileAvatar size={44} color={colors.border} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Global Search Bar */}
        <View style={styles.globalSearchContainer}>
          <TouchableOpacity
            style={[styles.globalSearchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Feather name="search" size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="Search university or courses"
              style={[styles.globalSearchInput, { color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtnSmall}
            onPress={() => router.push({
              pathname: "/(tabs)/search",
              params: { openFilter: "true" }
            })}
          >
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Study Plan Card */}
        <TouchableOpacity
          style={styles.studyPlanCard}
          onPress={() => setShowPlanModal(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={countryTheme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.studyPlanCardGradient}
          >
            <View style={styles.studyPlanInfo}>
              <View style={styles.flagIconWrapper}>
                {getFlagUrl(userData.country) ? (
                  <Image
                    source={{ uri: getFlagUrl(userData.country)! }}
                    style={styles.flagImageCircle}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.flagEmojiLarge}>🗺️</Text>
                )}
              </View>
              <View style={styles.studyPlanTextWrapper}>
                <Text style={styles.studyPlanLabel}>Study Plan</Text>
                <Text style={styles.studyCountry}>{userData.country || "Select Destination"}</Text>
              </View>
            </View>
            <View style={styles.editButtonGlass}>
              <Feather name="edit-2" size={14} color="#FFFFFF" />
              <Text style={styles.editText}>Edit</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {/* Estimated Cost Card */}
          <View style={[styles.statCard, { backgroundColor: isDark ? "#064E3B20" : "#F0FDF4", borderColor: isDark ? "#064E3B40" : "#DCFCE7" }]}>
            <View>
              <View style={styles.statIconHeader}>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#F3F4F6" }]}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color={isDark ? colors.primary : THEME.textDark} />
                </View>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Estimated Cost</Text>
              </View>
              {loadingUnis || estimatedCost === "--" ? (
                <Skeleton width={120} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={[styles.statValue, { color: colors.text }]}>{estimatedCost} <Text style={[styles.statUnit, { color: colors.textSecondary }]}>/ year</Text></Text>
              )}
              {loadingUnis || estimatedCost === "--" ? (
                <Skeleton width={90} height={20} borderRadius={6} style={{ marginVertical: 4 }} />
              ) : (
                <View style={[styles.statBadge, { backgroundColor: isDark ? "#2C2C2E" : "#F0FDF4" }]}>
                  <View style={styles.affordableDot} />
                  <Text style={[styles.statBadgeText, { color: isDark ? colors.text : THEME.textGray }]}>Affordable</Text>
                </View>
              )}
              <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>Tuition + Living</Text>
            </View>
            <TouchableOpacity
              style={[styles.statButton, { backgroundColor: colors.primary + "15" }]}
              onPress={() => router.push({
                pathname: "/university/cost-breakdown",
                params: { country: userData.country || "UK" }
              })}
            >
              <Text style={[styles.statButtonText, { color: colors.primary }]}>View Breakdown</Text>
            </TouchableOpacity>
          </View>

          {/* Admission Chances Card */}
          <View style={[styles.statCard, { backgroundColor: isDark ? "#9A341220" : "#FFF7ED", borderColor: isDark ? "#9A341240" : "#FFEDD5" }]}>
            <View>
              <View style={styles.statIconHeader}>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#FFF7ED" }]}>
                  <MaterialCommunityIcons name="target" size={20} color={isDark ? colors.primary : THEME.orange} />
                </View>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Acceptance Chance</Text>
              </View>
              {loadingUnis || acceptanceChance === "--" ? (
                <Skeleton width={120} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={[styles.statValue, { color: colors.text }]}>{acceptanceChance}</Text>
              )}

              {loadingUnis || acceptanceChance === "--" ? (
                <View style={{ gap: 8, marginVertical: 6 }}>
                  <Skeleton width={100} height={16} borderRadius={4} />
                  <Skeleton width={100} height={16} borderRadius={4} />
                </View>
              ) : (
                <>
                  <View style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={16} color={THEME.green} />
                    <Text style={[styles.checkText, { color: colors.textSecondary }]}>Good GPA</Text>
                  </View>
                  <View style={styles.checkRow}>
                    <Ionicons name="warning" size={16} color={THEME.orange} />
                    <Text style={[styles.checkText, { color: colors.textSecondary }]}>Improve IELTS</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.statButton, { backgroundColor: colors.primary + "15" }]}
              onPress={() => router.push("/university/admission-chance")}
            >
              <Text style={[styles.statButtonText, { color: colors.primary }]}>Set Goals</Text>
            </TouchableOpacity>
          </View>

          {/* Visa Readiness Card */}
          <View style={[styles.statCard, { backgroundColor: isDark ? "#3730A320" : "#EEF2FF", borderColor: isDark ? "#3730A340" : "#E0E7FF" }]}>
            <View>
              <View style={styles.statIconHeader}>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? "#2C2C2E" : THEME.secondary + "15" }]}>
                  <Text style={[styles.visaIconText, { color: isDark ? colors.primary : THEME.secondary }]}>VISA</Text>
                </View>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Visa Readiness</Text>
              </View>
              {loadingUnis || visaReadiness === "--" ? (
                <Skeleton width={120} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={[styles.statValue, { color: colors.text }]}>{visaReadiness}</Text>
              )}

              {loadingUnis || visaReadiness === "--" ? (
                <View style={{ gap: 8, marginVertical: 6 }}>
                  <Skeleton width={140} height={8} borderRadius={4} />
                  <Skeleton width={120} height={16} borderRadius={4} />
                </View>
              ) : (
                <>
                  <View style={[styles.progressBarContainer, { backgroundColor: isDark ? "#2C2C2E" : "#E2E8F0" }]}>
                    <View style={[styles.progressBarFull, { width: "60%", backgroundColor: colors.primary }]} />
                  </View>

                  <View style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={16} color={THEME.green} />
                    <Text style={[styles.checkText, { color: colors.textSecondary }]}>Strong Academics</Text>
                  </View>
                  <View style={styles.checkRow}>
                    <Ionicons name="warning" size={16} color={THEME.orange} />
                    <Text style={[styles.checkText, { color: colors.textSecondary }]}>Financial Proof Weak</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.statButton, { backgroundColor: colors.primary + "15" }]}
              onPress={() => router.push("/visa-readiness")}
            >
              <Text style={[styles.statButtonText, { color: colors.primary }]}>Improve</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Improve Your Chances Banner */}
        <LinearGradient
          colors={[THEME.primary, THEME.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.improveBannerGradient}
        >
          <View style={styles.improveContent}>
            <View style={styles.improveTitleRow}>
              <Ionicons name="sparkles" size={18} color="#FFE066" />
              <Text style={styles.improveTitle}>Improve Your Chances</Text>
            </View>
            <Text style={styles.improveSubtitle}>Get personalized recommendations and actionable steps to boost your admissions success rate.</Text>
            <TouchableOpacity
              style={styles.viewPlanButton}
              onPress={() => router.push("/university/admission-chance")}
            >
              <Text style={styles.viewPlanButtonText}>View Plan</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Recommended Universities */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Universities</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Based on your profile & budget</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {showCountryFallback && (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#2C2C2E" : "#FFF7ED",
            borderColor: isDark ? "#3F3F46" : "#FFEDD5",
            borderWidth: 1,
            borderRadius: 16,
            padding: 12,
            marginHorizontal: 20,
            marginBottom: 16,
            gap: 8
          }}>
            <Ionicons name="information-circle" size={18} color={THEME.orange} />
            <Text style={{
              flex: 1,
              fontSize: 12,
              fontWeight: "600",
              color: isDark ? colors.text : THEME.orange
            }}>
              No universities match {userData.country || "selected destination"} yet. Showing global recommendations instead.
            </Text>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.uniCardsScroll}>
          {loadingUnis ? (
            [1, 2, 3].map((key) => (
              <View
                key={key}
                style={[styles.uniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.uniImageContainer}>
                  <Skeleton width="100%" height={140} borderRadius={0} />
                </View>
                <View style={styles.uniCardContent}>
                  <Skeleton width={180} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={140} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={80} height={16} borderRadius={4} />
                </View>
              </View>
            ))
          ) : recommendedUnis.length > 0 ? recommendedUnis.map((uni, idx) => (
            <TouchableOpacity
              key={uni.id || idx}
              style={[styles.uniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({
                pathname: "/university/[id]",
                params: { id: uni.id, country: uni.country, name: uni.name }
              })}
            >
              <View style={styles.uniImageContainer}>
                <Image
                  source={{ uri: uni.image || "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=400" }}
                  style={styles.uniImage}
                />
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{calculateAcceptanceChance(userData, uni).score}% Match</Text>
                </View>
              </View>
              <View style={styles.uniCardContent}>
                <Text style={[styles.uniCardName, { color: colors.text }]} numberOfLines={1}>{uni.name}</Text>
                <View style={styles.uniLocationRow}>
                  <Ionicons name="location" size={14} color={THEME.orange} />
                  <Text style={[styles.uniLocationText, { color: colors.textSecondary }]} numberOfLines={1}>{uni.location}</Text>
                </View>
                <View style={styles.uniCostRow}>
                  <Text style={[styles.uniCostValue, { color: colors.text }]}>
                    {uni.tuition}
                    {uni.tuition !== "N/A" && (
                      <Text style={[styles.uniCostUnit, { color: colors.textSecondary }]}>/ year</Text>
                    )}
                  </Text>
                  <View style={[styles.safeBadge, { backgroundColor: uni.acceptanceRate && uni.acceptanceRate > 50 ? "#DCFCE7" : "#FFF7ED" }]}>
                    <Text style={[styles.safeText, { color: uni.acceptanceRate && uni.acceptanceRate > 50 ? THEME.green : THEME.orange }]}>
                      {uni.acceptanceRate && uni.acceptanceRate > 50 ? "Safe" : "Moderate"}
                    </Text>
                  </View>
                </View>
                <View style={styles.uniActions}>
                  {(() => {
                    const isSaved = userData.selectedUniversities?.some(
                      (u) => String(u.id) === String(uni.id)
                    );
                    return (
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          { backgroundColor: isSaved ? colors.primary : colors.primary + "15" }
                        ]}
                        onPress={() => {
                          if (isSaved) {
                            setUserData((prev) => ({
                              ...prev,
                              selectedUniversities: prev.selectedUniversities.filter(
                                (u) => String(u.id) !== String(uni.id)
                              ),
                            }));
                          } else {
                            selectUniversity({
                              id: uni.id,
                              name: uni.name,
                              location: uni.location || uni.country,
                              image: uni.image,
                              course: uni.course || "MSc Computer Science",
                              tuition: uni.tuition || "N/A",
                              tuitionValue: uni.tuitionValue,
                            });
                          }
                        }}
                      >
                        <Text style={[styles.saveBtnText, { color: isSaved ? "white" : colors.primary }]}>
                          {isSaved ? "Saved" : "Save"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })()}
                  <TouchableOpacity
                    style={[styles.compareBtn, { borderColor: colors.border }]}
                    onPress={() => router.push({
                      pathname: "/university/[id]",
                      params: { id: uni.id, country: uni.country, name: uni.name }
                    })}
                  >
                    <Text style={styles.compareBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={{ width: width - 40, height: 100, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>No recommendations found for {userData.country}</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginBottom: 16, color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/search")}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#E0F2FE" }]}>
              <Ionicons name="search" size={20} color={isDark ? colors.primary : THEME.blue} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Compare Universities</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/visa-readiness")}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#F5F3FF" }]}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={isDark ? colors.secondary : "#8B5CF6"} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>View Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/university/admission-chance")}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#DCFCE7" }]}>
              <MaterialCommunityIcons name="bullseye-arrow" size={20} color={isDark ? colors.primary : THEME.green} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Improve My Chances</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/recent")}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: isDark ? "#2C2C2E" : "#FFEDD5" }]}>
              <Ionicons name="bookmark" size={20} color={isDark ? colors.secondary : THEME.orange} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Saved Universities</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotificationsModal}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={() => { }}
          >
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              <TouchableOpacity
                style={[styles.modalCloseCircle, { backgroundColor: colors.card }]}
                onPress={() => setShowNotificationsModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.notificationsList}>
              {getDynamicNotifications().map((notif, index) => (
                <View
                  key={notif.id}
                  style={[
                    styles.notificationItem,
                    { borderBottomColor: colors.border },
                    index === 2 && { borderBottomWidth: 0 }
                  ]}
                >
                  <View style={[styles.notifIconBox, { backgroundColor: notif.bgColor }]}>
                    <Ionicons name={notif.icon as any} size={18} color={notif.iconColor} />
                  </View>
                  <View style={styles.notifTextContent}>
                    <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                    <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{notif.body}</Text>
                    <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Plan Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPlanModal}
        onRequestClose={() => {
          setShowPlanModal(false);
          setModalStep('options');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowPlanModal(false);
            setModalStep('options');
          }}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }, modalStep === 'country' && { height: '80%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />

            {modalStep === 'options' ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Update Study Plan</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>What would you like to update first?</Text>

                <View style={styles.modalOptions}>
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setModalStep('country')}
                  >
                    <View style={[styles.modalOptionIcon, { backgroundColor: isDark ? "#1E293B" : "#E0F2FE" }]}>
                      <Ionicons name="globe-outline" size={24} color={isDark ? colors.primary : THEME.blue} />
                    </View>
                    <View style={styles.modalOptionTextWrapper}>
                      <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Change Destination</Text>
                      <Text style={[styles.modalOptionDesc, { color: colors.textSecondary }]}>Current: {userData.flag} {userData.country}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      setShowPlanModal(false);
                      router.push("/search");
                    }}
                  >
                    <View style={[styles.modalOptionIcon, { backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }]}>
                      <Ionicons name="business-outline" size={24} color={isDark ? colors.primary : THEME.textDark} />
                    </View>
                    <View style={styles.modalOptionTextWrapper}>
                      <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Find University</Text>
                      <Text style={[styles.modalOptionDesc, { color: colors.textSecondary }]}>Search universities in {userData.country}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity onPress={() => setModalStep('options')}>
                    <Feather name="chevron-left" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Destination</Text>
                  <View style={{ width: 24 }} />
                </View>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Where do you want to study?</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalGrid}>
                    {COUNTRIES.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.modalCountryItem,
                          { backgroundColor: colors.card, borderColor: colors.border },
                          userData.country === c.name && [styles.modalCountrySelected, { borderColor: colors.primary, backgroundColor: colors.primary + "15" }]
                        ]}
                        onPress={() => {
                          setShowPlanModal(false); setModalStep('options'); router.push({ pathname: "/search", params: { pendingCountry: c.name, pendingFlag: c.flag } });
                          setModalStep('options');
                        }}
                      >
                        <Text style={styles.modalCountryFlag}>{c.flag}</Text>
                        <Text style={[styles.modalCountryName, { color: colors.text }]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.card }]}
              onPress={() => {
                setShowPlanModal(false);
                setModalStep('options');
              }}
            >
              <Text style={[styles.modalCloseBtnText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 4,
  },
  subGreetingText: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: "500",
  },
  topBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  studyPlanCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  studyPlanCardGradient: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studyPlanInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flagIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    overflow: "hidden",
  },
  flagImageCircle: {
    width: "100%",
    height: "100%",
  },
  flagEmojiLarge: {
    fontSize: 24,
  },
  studyPlanTextWrapper: {
    justifyContent: "center",
  },
  studyPlanLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  studyCountry: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  editButtonGlass: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  editText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statCard: {
    width: 210,
    backgroundColor: THEME.white,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    minHeight: 280,
    justifyContent: "space-between",
  },
  statIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textDark,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 8,
  },
  statUnit: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 6,
  },
  affordableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.green,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  statSubtitle: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "500",
    lineHeight: 16,
  },
  statButton: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  statButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  checkText: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "600",
  },
  visaIconText: {
    fontSize: 10,
    fontWeight: "900",
    color: THEME.white,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBarFull: {
    height: "100%",
    borderRadius: 3,
  },
  improveBannerGradient: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
  },
  improveContent: {
    padding: 24,
    justifyContent: "center",
  },
  improveTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  improveTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.white,
  },
  improveSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: "500",
  },
  viewPlanButton: {
    backgroundColor: THEME.white,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  viewPlanButtonText: {
    color: THEME.secondary,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: "500",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.blue,
  },
  uniCardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  uniCard: {
    width: 260,
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  uniImageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  uniImage: {
    width: "100%",
    height: "100%",
  },
  matchBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  matchText: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.blue,
  },
  uniCardContent: {
    padding: 16,
  },
  uniCardName: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 6,
  },
  uniLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  uniLocationText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  uniCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
  },
  uniCostValue: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.textDark,
  },
  uniCostUnit: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  safeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  uniActions: {
    flexDirection: "row",
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.white,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textGray,
  },
  compareBtn: {
    flex: 1.5,
    height: 38,
    borderRadius: 12,
    backgroundColor: THEME.textDark,
    justifyContent: "center",
    alignItems: "center",
  },
  compareBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.white,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  quickActionItem: {
    width: (width - 44) / 2,
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textDark,
    lineHeight: 18,
  },
  globalSearchContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  globalSearchBar: {
    flex: 1,
    height: 52,
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  globalSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textDark,
  },
  filterBtnSmall: {
    width: 52,
    height: 52,
    backgroundColor: THEME.textDark,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    minHeight: 400,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: THEME.textGray,
    marginBottom: 24,
    fontWeight: "500",
  },
  modalOptions: {
    gap: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionTextWrapper: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  modalCountryItem: {
    width: (width - 72) / 2,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 8,
  },
  modalCountrySelected: {
    borderColor: THEME.blue,
    backgroundColor: "#F0F9FF",
  },
  modalCountryFlag: {
    fontSize: 24,
  },
  modalCountryName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textDark,
  },
  modalCloseBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textGray,
  },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notifTextContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    color: THEME.textGray,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "600",
  },
});
