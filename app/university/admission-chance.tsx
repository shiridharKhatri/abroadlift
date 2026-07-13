import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { Skeleton } from "../../components/Skeleton";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { calculateAcceptanceChance, searchUniversities, UniversityResult } from "../../lib/api";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#1A8A99",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#64748B",
  bgLight: "#F8FAFF",
  orange: "#F97316",
  green: "#10B981",
  white: "#FFFFFF",
  blue: "#3B82F6",
  red: "#EF4444",
  divider: "#F1F5F9",
};

const AnalysisItem = ({
  label,
  value,
  status,
  onPress,
  hideBorder
}: {
  label: string;
  value: string;
  status: 'success' | 'warning';
  onPress?: () => void;
  hideBorder?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.analysisItemRow,
        { borderBottomColor: colors.border },
        hideBorder && { borderBottomWidth: 0 }
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.analysisLeft}>
        {status === 'success' ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        ) : (
          <Ionicons name="warning" size={20} color="#F97316" />
        )}
        <Text style={[styles.analysisLabel, { color: colors.text }]}>
          {label}: <Text style={[styles.analysisValueText, { color: colors.textSecondary }]}>{value}</Text>
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

export default function AdmissionChanceScreen() {
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark } = useTheme();
  const [unis, setUnis] = React.useState<UniversityResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeRiskLevel, setActiveRiskLevel] = React.useState<'Safe' | 'Moderate' | 'Ambitious'>('Safe');
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const results = await searchUniversities("", userData.country || "UK");
        if (mounted) {
          setUnis(results);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading universities for admission chances:", err);
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userData.country]);

  // Compute dynamic user admission metrics
  const gpa = parseFloat(userData.cgpa || "0");
  const engScore = parseFloat(userData.score || "0");

  let gpaNorm = 0.5;
  if (gpa > 0) {
    gpaNorm = gpa / 4.0;
    if (gpa > 4.5) gpaNorm = gpa / 10.0;
    if (gpaNorm > 1) gpaNorm = 1;
  }

  let engNorm = 0.6;
  if (engScore > 0) {
    engNorm = engScore / 9.0;
    if (engNorm > 1) engNorm = 1;
  }

  const baseProb = 35 + (gpaNorm * 40) + (engNorm * 20);
  const finalProb = Math.min(98, Math.max(5, Math.round(baseProb)));

  let chanceLabel = "Moderate";
  if (finalProb >= 80) chanceLabel = "Very High";
  else if (finalProb >= 65) chanceLabel = "High";
  else if (finalProb < 45) chanceLabel = "Low";

  // Dynamic values for profile analysis items
  let gpaVal = "Not Set";
  let gpaStatus: 'success' | 'warning' = 'warning';
  if (gpa > 0) {
    const scale = gpa > 4.5 ? '10.0' : '4.0';
    const isStrong = gpa >= 3.3 || (gpa > 4.5 && gpa >= 8.0);
    gpaVal = `${isStrong ? 'Strong' : 'Needs work'} (${userData.cgpa}/${scale})`;
    gpaStatus = isStrong ? 'success' : 'warning';
  }

  let engVal = "Not Set";
  let engStatus: 'success' | 'warning' = 'warning';
  if (engScore > 0) {
    const isStrong = engScore >= 6.5;
    engVal = `${isStrong ? 'Strong' : 'Need improvement'} (${userData.score})`;
    engStatus = isStrong ? 'success' : 'warning';
  }

  // Helper to format USD tuition to NPR (1 USD = 134 NPR)
  const formatTuition = (tuition: string | number) => {
    if (tuition === undefined || tuition === null) return "N/A";
    const tuitionStr = String(tuition);
    if (tuitionStr.toLowerCase().includes("npr")) return tuitionStr;

    const num = parseInt(tuitionStr.replace(/[^0-9]/g, ""));
    if (isNaN(num)) return tuitionStr;

    if (tuitionStr.includes("$")) {
      const nprVal = num * 134;
      return `NPR ${nprVal.toLocaleString()}`;
    }
    return tuitionStr;
  };

  // Categorize universities dynamically
  const categorizedUnis = React.useMemo(() => {
    const safe: UniversityResult[] = [];
    const moderate: UniversityResult[] = [];
    const ambitious: UniversityResult[] = [];

    unis.forEach(uni => {
      const match = calculateAcceptanceChance(userData, uni);
      if (match.score >= 80) {
        safe.push(uni);
      } else if (match.score >= 60) {
        moderate.push(uni);
      } else {
        ambitious.push(uni);
      }
    });

    return { Safe: safe, Moderate: moderate, Ambitious: ambitious };
  }, [unis, userData]);

  const currentList = categorizedUnis[activeRiskLevel];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admission Chance</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <ProfileAvatar size={38} color={colors.border} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>ADMISSION MATCH RATE</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {finalProb}% <Text style={[styles.summaryStatus, { color: colors.primary }]}>({chanceLabel})</Text>
          </Text>
          <View style={[styles.averageBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: finalProb >= 65 ? THEME.green : THEME.orange }]} />
            <Text style={[styles.averageBadgeText, { color: colors.textSecondary }]}>
              {finalProb >= 65 ? "Competitive Profile" : "Improvement Suggested"}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryFooter}>
            <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.summaryFooterText, { color: colors.textSecondary }]}>
              Chances are estimates based on GPA & English scores. Complete your profile details for higher accuracy.
            </Text>
          </View>
        </View>

        {/* Profile Analysis */}
        <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            activeOpacity={0.7}
            onPress={() => setIsProfileExpanded(!isProfileExpanded)}
          >
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Your Profile Metrics</Text>
            <Feather name={isProfileExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {isProfileExpanded && (
            <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
              <AnalysisItem
                label="Academic CGPA"
                value={gpaVal}
                status={gpaStatus}
                onPress={() => router.push("/setup/academics")}
              />
              <AnalysisItem
                label="English Proficiency"
                value={engVal}
                status={engStatus}
                onPress={() => router.push("/setup/english-test")}
              />
              <AnalysisItem
                label="Target Major"
                value={userData.fieldOfStudy || "General"}
                status="success"
                onPress={() => router.push("/setup/field-of-study")}
                hideBorder={true}
              />
            </View>
          )}
        </View>

        {/* Universities By Risk Level */}
        <Text style={[styles.riskTitle, { color: colors.text }]}>Target Institutions</Text>
        <View style={[styles.riskTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['Safe', 'Moderate', 'Ambitious'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.riskTab, activeRiskLevel === level && { backgroundColor: colors.primary }]}
              onPress={() => setActiveRiskLevel(level)}
              activeOpacity={0.8}
            >
              <Text style={activeRiskLevel === level ? styles.riskTabTextActive : [styles.riskTabText, { color: colors.textSecondary }]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          [1, 2, 3].map((key) => (
            <View key={key} style={[styles.uniListRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                <Skeleton width="70%" height={16} borderRadius={4} />
                <Skeleton width="45%" height={12} borderRadius={4} />
              </View>
              <Skeleton width={60} height={28} borderRadius={14} />
            </View>
          ))
        ) : currentList.length > 0 ? (
          currentList.map((uni) => {
            const match = calculateAcceptanceChance(userData, uni);
            const isSaved = userData.selectedUniversities?.some((u) => String(u.id) === String(uni.id));
            return (
              <TouchableOpacity
                key={uni.id}
                style={[styles.uniListRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({
                  pathname: "/university/[id]",
                  params: { id: uni.id, country: uni.country, name: uni.name }
                })}
                activeOpacity={0.7}
              >
                {/* Logo placeholder / school icon */}
                <View style={[styles.uniLogoBox, { backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC", borderColor: colors.border }]}>
                  {uni.logo ? (
                    <Image source={{ uri: uni.logo }} style={styles.uniLogo} resizeMode="contain" />
                  ) : (
                    <Ionicons name="school" size={20} color={colors.primary} />
                  )}
                </View>

                {/* Info block */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.uniRowName, { color: colors.text }]} numberOfLines={1}>{uni.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.uniRowLocation, { color: colors.textSecondary }]} numberOfLines={1}>{uni.location}</Text>
                    {uni.tuition && uni.tuition !== "N/A" && (
                      <>
                        <Text style={{ color: colors.border }}>•</Text>
                        <Text style={[styles.uniRowLocation, { color: colors.textSecondary }]}>{formatTuition(uni.tuition)}/yr</Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Match Chip + Save */}
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: colors.primary }}>{match.score}% Match</Text>
                  <TouchableOpacity
                    style={[styles.saveBtnMini, { backgroundColor: isSaved ? colors.primary : colors.primary + "15" }]}
                    onPress={() => {
                      if (isSaved) {
                        setUserData((prev) => ({
                          ...prev,
                          selectedUniversities: prev.selectedUniversities.filter((u) => String(u.id) !== String(uni.id)),
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
                    <Text style={[styles.saveBtnMiniText, { color: isSaved ? "white" : colors.primary }]}>
                      {isSaved ? "Saved" : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No universities categorized as "{activeRiskLevel}" match your profile.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
  },
  summaryStatus: {
    fontSize: 18,
    fontWeight: "800",
  },
  averageBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  averageBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryFooterText: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    flex: 1,
  },
  sectionBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: "800",
  },
  sectionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
  analysisItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  analysisLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  analysisLabel: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  analysisValueText: {
    fontSize: 13,
    fontWeight: "500",
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 12,
  },
  riskTabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  riskTab: {
    flex: 1,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  riskTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  riskTabTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  uniListRow: {
    flexDirection: "row",
    alignItems: "center",
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
  uniLogo: {
    width: "100%",
    height: "100%",
  },
  uniRowName: {
    fontSize: 14,
    fontWeight: "700",
  },
  uniRowLocation: {
    fontSize: 11,
    fontWeight: "500",
  },
  saveBtnMini: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  saveBtnMiniText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
    fontWeight: "500",
  },
});
