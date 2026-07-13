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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { canUseGlassEffect, GlassCard } from "../../components/GlassCard";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { Skeleton } from "../../components/Skeleton";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { calculateAcceptanceChance, searchUniversities, UniversityResult } from "../../lib/api";

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
  const insets = useSafeAreaInsets();
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark, setThemeMode } = useTheme();
  const countryTheme = getCountryTheme(userData.country, isDark, colors);

  // Compute dynamic user admission metrics locally for the dashboard view
  const gpa = parseFloat(userData.cgpa || "0");
  const engScore = parseFloat(userData.score || "0");

  let gpaStatus: 'success' | 'warning' = 'warning';
  let gpaText = 'Set GPA';
  if (gpa > 0) {
    const isStrong = gpa >= 3.3 || (gpa > 4.5 && gpa >= 8.0);
    gpaStatus = isStrong ? 'success' : 'warning';
    gpaText = isStrong ? 'Good GPA' : 'Improve GPA';
  }

  let engStatus: 'success' | 'warning' = 'warning';
  let engText = 'Set English Score';
  if (engScore > 0) {
    const isStrong = engScore >= 6.5;
    engStatus = isStrong ? 'success' : 'warning';
    const testLabel = userData.testType && userData.testType !== 'Not Taken' ? userData.testType : 'IELTS';
    engText = isStrong ? `Good ${testLabel}` : `Improve ${testLabel}`;
  }

  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<'options' | 'country'>('options');
  const [recommendedUnis, setRecommendedUnis] = React.useState<UniversityResult[]>([]);
  const [estimatedCost, setEstimatedCost] = React.useState<string>("--");
  const [acceptanceChance, setAcceptanceChance] = React.useState<string>("--");
  const [visaReadiness, setVisaReadiness] = React.useState<string>("--");
  const [loadingUnis, setLoadingUnis] = React.useState(true);
  const [showCountryFallback, setShowCountryFallback] = React.useState(false);
  const [countriesList, setCountriesList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const { getAvailableCountries } = require("../../lib/api");
    getAvailableCountries().then((data: any) => {
      if (data && data.length > 0) {
        setCountriesList(data);
      }
    });
  }, []);

  const USD_TO_NPR = 134;

  const calculateDynamicMetrics = async (user: any) => {
    // 1. Acceptance Chance calculation
    const gpa = parseFloat(user.cgpa || "0");
    const engScore = parseFloat(user.score || "0");

    let gpaNorm = gpa / 4.0;
    if (gpa > 4.5) gpaNorm = gpa / 10.0;
    if (gpaNorm > 1) gpaNorm = 1;

    let engNorm = engScore / 9.0;
    if (engNorm > 1) engNorm = 1;

    // Use server values if available, otherwise calculate locally
    let finalProb = user.admissionProb;
    let chanceLabel = "";

    // Call POST api/admission-chance endpoint to get the exact score matching the site
    if (user.selectedUniversities?.length > 0) {
      const selUni = user.selectedUniversities[0];
      const { getAdmissionChance } = require("../../lib/api");
      try {
        const res = await getAdmissionChance(
          {
            gpa: user.cgpa || "0",
            testType: user.testType || "IELTS",
            testScore: user.score || "0",
            backlogs: "0",
            studyGap: "0"
          },
          {
            admissionRate: selUni.acceptanceRate || 62,
            tuitionFee: selUni.tuitionValue || 20000,
            rankingWorld: parseInt(String(selUni.rank || "").replace(/[^0-9]/g, "")) || undefined,
            englishReq: 6.5,
            gpaRequirement: 3.0,
            internationalPercentage: 18,
            countryCode: selUni.country || "US",
            name: selUni.name
          }
        );
        if (res && typeof res.admissionPct === 'number') {
          finalProb = res.admissionPct;
          chanceLabel = res.band?.label || "Moderate";
        }
      } catch (err) {
        console.warn("Failed to get admission chance from endpoint:", err);
      }
    }

    if (typeof finalProb !== 'number') {
      const baseProb = 35 + (gpaNorm * 40) + (engNorm * 20);
      finalProb = Math.min(98, Math.max(5, Math.round(baseProb)));
    }

    if (!chanceLabel) {
      chanceLabel = "Moderate";
      if (finalProb >= 80) chanceLabel = "Very High";
      else if (finalProb >= 65) chanceLabel = "High";
      else if (finalProb < 45) chanceLabel = "Low";
    }

    setAcceptanceChance(`${finalProb}% - ${chanceLabel}`);

    // 2. Visa Readiness (Use server-computed visaSuccessProb if available)
    const finalVisa = typeof user.visaSuccessProb === 'number'
      ? user.visaSuccessProb
      : (() => {
        let localVisaProb = 60;
        if (user.passportReady) localVisaProb += 10;
        if (user.docsReady) localVisaProb += 10;
        const balance = parseFloat(user.bankBalance || "0");
        if (balance > 3000000) localVisaProb += 15;
        return Math.min(98, localVisaProb);
      })();

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

            let tuitionUsd = 20000;
            let city = "";
            let country = userData.country || "US";

            if (userData.selectedUniversities?.length > 0) {
              const selUni = userData.selectedUniversities[0];
              tuitionUsd = selUni.tuitionValue || 20000;
              city = selUni.city || "";
              country = selUni.country || userData.country || "US";
            }

            const { getCostEstimate } = require("../../lib/api");
            let costEstimateResult = null;
            try {
              costEstimateResult = await getCostEstimate(city, country, tuitionUsd);
            } catch (err) {
              console.warn("Failed to fetch cost estimate:", err);
            }

            if (costEstimateResult && costEstimateResult.total_npr) {
              const totalNpr = costEstimateResult.total_npr;
              if (totalNpr >= 10000000) {
                setEstimatedCost(`NPR ${(totalNpr / 10000000).toFixed(1)} Crore`);
              } else if (totalNpr >= 100000) {
                setEstimatedCost(`NPR ${(totalNpr / 100000).toFixed(1)} Lakhs`);
              } else {
                setEstimatedCost(`NPR ${totalNpr.toLocaleString()}`);
              }
            } else {
              const monthlyUsd = costData?.monthly_estimate_usd || costData?.monthlyEstimateUsd || 1500;
              const annualLivingUsd = monthlyUsd * 12;
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={[styles.topBar, { paddingTop: (insets.top || StatusBar.currentHeight || 24) + 16, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingText, { color: colors.text }]}>Hi, {userData.name || "Student"}</Text>
          <Text style={[styles.subGreetingText, { color: colors.textSecondary }]}>Your abroad study overview</Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setThemeMode(isDark ? "light" : "dark")}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowNotificationsModal(true)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <ProfileAvatar size={42} color={colors.border} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Feather name="search" size={16} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search university or courses…</Text>
          <TouchableOpacity
            style={[styles.filterDot, { backgroundColor: colors.primary }]}
            onPress={() => router.push({ pathname: "/(tabs)/search", params: { openFilter: "true" } })}
          >
            <Ionicons name="options" size={14} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Study Plan Row ── */}
        <TouchableOpacity
          style={[styles.studyPlanRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowPlanModal(true)}
          activeOpacity={0.75}
        >
          <View style={styles.studyPlanLeft}>
            {getFlagUrl(userData.country) ? (
              <Image source={{ uri: getFlagUrl(userData.country)! }} style={styles.flagImg} resizeMode="cover" />
            ) : (
              <View style={[styles.flagPlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.studyPlanLabel, { color: colors.textSecondary }]}>STUDY DESTINATION</Text>
              <Text style={[styles.studyPlanCountry, { color: colors.text }]}>{userData.country || "Select Destination"}</Text>
            </View>
          </View>
          <View style={[styles.editChip, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="edit-2" size={12} color={colors.primary} />
            <Text style={[styles.editChipText, { color: colors.primary }]}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* ── Metrics Row ── */}
        <View style={styles.metricsRow}>
          {/* Cost */}
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: "/university/cost-breakdown", params: { country: userData.country || "UK" } })}
            activeOpacity={0.75}
          >
            <View style={[styles.metricIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="cash-outline" size={16} color="#0369A1" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Est. Cost / yr</Text>
            {loadingUnis || estimatedCost === "--" ? (
              <Skeleton width={70} height={18} borderRadius={4} />
            ) : (
              <Text style={[styles.metricValue, { color: colors.text }]}>{estimatedCost}</Text>
            )}
          </TouchableOpacity>

          {/* Acceptance */}
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/university/admission-chance")}
            activeOpacity={0.75}
          >
            <View style={[styles.metricIconBox, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="trending-up-outline" size={16} color="#15803D" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Acceptance</Text>
            {loadingUnis || acceptanceChance === "--" ? (
              <Skeleton width={70} height={18} borderRadius={4} />
            ) : (
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {acceptanceChance.replace(" - ", "\n")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Visa */}
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/visa-readiness")}
            activeOpacity={0.75}
          >
            <View style={[styles.metricIconBox, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#7C3AED" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Visa</Text>
            {loadingUnis || visaReadiness === "--" ? (
              <Skeleton width={70} height={18} borderRadius={4} />
            ) : (
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {visaReadiness.replace(" - ", "\n")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Profile Status Strip ── */}
        <TouchableOpacity
          style={[styles.profileStrip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.75}
        >
          <View style={styles.profileStripLeft}>
            <View style={[styles.profileStripDot, {
              backgroundColor: (userData.cgpa && userData.score) ? THEME.green : THEME.orange
            }]} />
            <Text style={[styles.profileStripText, { color: colors.text }]}>
              {(userData.cgpa && userData.score) ? "Profile complete — ready for applications" : "Complete your profile to get accurate results"}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Quick Actions ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          {[
            { icon: "search-outline", label: "Find Universities", bg: "#E0F2FE", color: "#0369A1", route: "/(tabs)/search" },
            { icon: "document-text-outline", label: "Documents", bg: "#F5F3FF", color: "#7C3AED", route: "/visa-readiness" },
            { icon: "stats-chart-outline", label: "Improve Chances", bg: "#DCFCE7", color: "#15803D", route: "/university/admission-chance" },
            { icon: "heart-outline", label: "Saved", bg: "#FFF7ED", color: "#C2410C", route: "/(tabs)/recent" },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: isDark ? colors.border : action.bg }]}>
                <Ionicons name={action.icon as any} size={20} color={isDark ? colors.primary : action.color} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recommended Universities ── */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Based on your profile</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {showCountryFallback && (
          <View style={[styles.fallbackBanner, { backgroundColor: isDark ? "#2C2C2E" : "#FFF7ED", borderColor: isDark ? "#3F3F46" : "#FFEDD5" }]}>
            <Ionicons name="information-circle" size={16} color={THEME.orange} />
            <Text style={[styles.fallbackText, { color: isDark ? colors.text : THEME.orange }]}>
              No matches for {userData.country || "destination"} — showing global picks instead.
            </Text>
          </View>
        )}

        {/* List-style university rows */}
        {loadingUnis ? (
          [1, 2, 3].map((k) => (
            <View key={k} style={[styles.uniListRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                <Skeleton width="75%" height={15} borderRadius={4} />
                <Skeleton width="50%" height={12} borderRadius={4} />
              </View>
              <Skeleton width={60} height={28} borderRadius={14} />
            </View>
          ))
        ) : recommendedUnis.length > 0 ? (
          recommendedUnis.map((uni, idx) => {
            const isSaved = userData.selectedUniversities?.some((u) => String(u.id) === String(uni.id));
            return (
              <TouchableOpacity
                key={uni.id || idx}
                style={[styles.uniListRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: "/university/[id]", params: { id: uni.id, country: uni.country, name: uni.name } })}
                activeOpacity={0.7}
              >
                {/* Logo */}
                <View style={[styles.uniLogoBox, { backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC", borderColor: colors.border }]}>
                  {uni.logo ? (
                    <Image source={{ uri: uni.logo }} style={styles.uniLogo} resizeMode="contain" />
                  ) : (
                    <Ionicons name="school" size={20} color={colors.primary} />
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.uniRowName, { color: colors.text }]} numberOfLines={1}>{uni.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.uniRowLocation, { color: colors.textSecondary }]} numberOfLines={1}>{uni.location}</Text>
                    {uni.tuition && uni.tuition !== "N/A" && (
                      <>
                        <Text style={{ color: colors.border }}>•</Text>
                        <Text style={[styles.uniRowLocation, { color: colors.textSecondary }]}>{uni.tuition}/yr</Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Save btn */}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: isSaved ? colors.primary : colors.primary + "15" }]}
                  onPress={() => {
                    if (isSaved) {
                      setUserData((prev) => ({ ...prev, selectedUniversities: prev.selectedUniversities.filter((u) => String(u.id) !== String(uni.id)) }));
                    } else {
                      selectUniversity({ id: uni.id, name: uni.name, location: uni.location || uni.country, image: uni.image, course: uni.course || "MSc Computer Science", tuition: uni.tuition || "N/A", tuitionValue: uni.tuitionValue });
                    }
                  }}
                >
                  <Text style={[styles.saveBtnText, { color: isSaved ? "white" : colors.primary }]}>{isSaved ? "Saved" : "Save"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={[styles.uniListRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No recommendations found for {userData.country}</Text>
          </View>
        )}

      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal animationType="slide" transparent visible={showNotificationsModal} onRequestClose={() => setShowNotificationsModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotificationsModal(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={() => {}}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              <TouchableOpacity style={[styles.modalCloseCircle, { backgroundColor: colors.card }]} onPress={() => setShowNotificationsModal(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.notificationsList}>
              {getDynamicNotifications().map((notif, index) => (
                <View key={notif.id} style={[styles.notificationItem, { borderBottomColor: colors.border }, index === 2 && { borderBottomWidth: 0 }]}>
                  {/* Small unread indicator dot instead of a big colored circle */}
                  <View style={[styles.statusDot, { backgroundColor: notif.iconColor, marginTop: 6 }]} />
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

      {/* ── Plan Edit Modal ── */}
      <Modal animationType="slide" transparent visible={showPlanModal} onRequestClose={() => { setShowPlanModal(false); setModalStep('options'); }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setShowPlanModal(false); setModalStep('options'); }}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }, modalStep === 'country' && { height: '80%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />

            {modalStep === 'options' ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Update Study Plan</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>What would you like to update first?</Text>
                <View style={styles.modalOptions}>
                  <TouchableOpacity style={[styles.modalOption, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setModalStep('country')}>
                    <View style={[styles.modalOptionIcon, { backgroundColor: isDark ? "#1E293B" : "#E0F2FE" }]}>
                      <Ionicons name="globe-outline" size={24} color={isDark ? colors.primary : THEME.blue} />
                    </View>
                    <View style={styles.modalOptionTextWrapper}>
                      <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Change Destination</Text>
                      <Text style={[styles.modalOptionDesc, { color: colors.textSecondary }]}>Current: {userData.flag} {userData.country}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalOption, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { setShowPlanModal(false); router.push("/search"); }}>
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
                    {(countriesList.length > 0 ? countriesList : COUNTRIES).map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.modalCountryItem, { backgroundColor: colors.card, borderColor: colors.border }, userData.country === c.name && [styles.modalCountrySelected, { borderColor: colors.primary, backgroundColor: colors.primary + "15" }]]}
                        onPress={() => { setShowPlanModal(false); setModalStep('options'); router.push({ pathname: "/search", params: { pendingCountry: c.name, pendingFlag: c.flag } }); }}
                      >
                        <Text style={styles.modalCountryFlag}>{c.flag}</Text>
                        <Text style={[styles.modalCountryName, { color: colors.text }]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.card }]} onPress={() => { setShowPlanModal(false); setModalStep('options'); }}>
              <Text style={[styles.modalCloseBtnText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subGreetingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  topBarIcons: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { paddingBottom: 110 },

  // ── Search Bar ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, fontWeight: "500" },
  filterDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Study Plan Row ──
  studyPlanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  studyPlanLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  flagImg: { width: 40, height: 40, borderRadius: 20 },
  flagPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  studyPlanLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  studyPlanCountry: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editChipText: { fontSize: 12, fontWeight: "700" },

  // ── Metrics Row ──
  metricsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    minHeight: 115,
    justifyContent: "space-between",
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  metricLabel: { fontSize: 11, fontWeight: "600" },
  metricValue: { fontSize: 14, fontWeight: "800" },

  // ── Profile strip ──
  profileStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  profileStripLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  profileStripDot: { width: 8, height: 8, borderRadius: 4 },
  profileStripText: { fontSize: 13, fontWeight: "600", flex: 1 },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  sectionSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  seeAllText: { fontSize: 13, fontWeight: "700" },

  // ── Quick Actions ──
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  quickActionItem: {
    width: (width - 40 - 10) / 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  quickActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: { fontSize: 13, fontWeight: "700", flex: 1 },

  // ── Fallback banner ──
  fallbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fallbackText: { flex: 1, fontSize: 12, fontWeight: "600" },

  // ── University List Rows ──
  uniListRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  uniLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uniLogo: { width: "100%", height: "100%" },
  uniRowName: { fontSize: 14, fontWeight: "700" },
  uniRowLocation: { fontSize: 11, fontWeight: "500" },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  saveBtnText: { fontSize: 12, fontWeight: "700" },

  // ── Modals ──
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  modalIndicator: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "900" },
  modalSubtitle: { fontSize: 14, fontWeight: "500", marginBottom: 20 },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptions: { gap: 12 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionTextWrapper: { flex: 1 },
  modalOptionTitle: { fontSize: 15, fontWeight: "700" },
  modalOptionDesc: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  modalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 20 },
  modalCountryItem: {
    width: (width - 48 - 24) / 3,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  modalCountrySelected: {},
  modalCountryFlag: { fontSize: 24 },
  modalCountryName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  modalCloseBtn: {
    marginTop: 16,
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: { fontSize: 15, fontWeight: "700" },

  // ── Notifications ──
  notificationsList: { maxHeight: 400 },
  notificationItem: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  notifTextContent: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  notifBody: { fontSize: 12, fontWeight: "500", lineHeight: 17 },
  notifTime: { fontSize: 11, marginTop: 4 },
});
