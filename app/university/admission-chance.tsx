import React from "react";
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
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { searchUniversities, calculateAcceptanceChance, UniversityResult } from "../../lib/api";

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

const AnalysisItem = ({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' }) => (
  <View style={styles.analysisItemRow}>
    <View style={styles.analysisLeft}>
      {status === 'success' ? (
        <Ionicons name="checkmark-circle" size={20} color={THEME.green} />
      ) : (
        <Ionicons name="warning" size={20} color={THEME.orange} />
      )}
      <Text style={styles.analysisLabel}>
        {label}: <Text style={styles.analysisValueText}>{value}</Text>
      </Text>
    </View>
    <Feather name="chevron-right" size={16} color={THEME.textGray} />
  </View>
);

const FactorItem = ({ label, icon, iconType = 'feather' }: { label: string; icon: string; iconType?: 'feather' | 'material' | 'ionicons' }) => (
  <View style={styles.factorItemRow}>
    <View style={styles.factorLeft}>
      <View style={styles.factorIconBox}>
        {iconType === 'feather' && <Feather name={icon as any} size={18} color={THEME.orange} />}
        {iconType === 'material' && <MaterialCommunityIcons name={icon as any} size={18} color={THEME.orange} />}
        {iconType === 'ionicons' && <Ionicons name={icon as any} size={18} color={THEME.orange} />}
      </View>
      <Text style={styles.factorLabel}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={16} color={THEME.textGray} />
  </View>
);

export default function AdmissionChanceScreen() {
  const { userData } = useUser();
  const [unis, setUnis] = React.useState<UniversityResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeRiskLevel, setActiveRiskLevel] = React.useState<'Safe' | 'Moderate' | 'Ambitious'>('Safe');
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(true);
  const [isFactorsExpanded, setIsFactorsExpanded] = React.useState(false);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={THEME.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admission Chance</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <ProfileAvatar size={44} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>Admission Percentage</Text>
              <Text style={styles.summaryValue}>
                {finalProb}% <Text style={styles.summaryStatus}>- {chanceLabel}</Text>
              </Text>
              <View style={styles.averageBadge}>
                <View style={styles.orangeDot} />
                <Text style={styles.averageBadgeText}>Average Cost</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <Ionicons name="pie-chart" size={60} color={THEME.primary} />
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryFooter}>
            <Ionicons name="information-circle-outline" size={16} color={THEME.textGray} />
            <Text style={styles.summaryFooterText}>
              Opportunity for some universities. Room for improve.
            </Text>
          </View>
        </View>

        {/* Profile Analysis */}
        <View style={styles.sectionBox}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            activeOpacity={0.7}
            onPress={() => setIsProfileExpanded(!isProfileExpanded)}
          >
            <Text style={styles.sectionTitleText}>Your Profile Analysis</Text>
            <Feather name={isProfileExpanded ? "chevron-up" : "chevron-down"} size={20} color={THEME.textGray} />
          </TouchableOpacity>
          
          {isProfileExpanded && (
            <View style={styles.sectionBody}>
              <AnalysisItem label="CGPA" value={gpaVal} status={gpaStatus} />
              <AnalysisItem label="IELTS" value={engVal} status={engStatus} />
              <AnalysisItem 
                label="Course Competitiveness" 
                value={userData.fieldOfStudy || "General"} 
                status="success" 
              />
            </View>
          )}
        </View>

        {/* Key Admission Factors */}
        <View style={styles.sectionBox}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            activeOpacity={0.7}
            onPress={() => setIsFactorsExpanded(!isFactorsExpanded)}
          >
            <Text style={styles.sectionTitleText}>Key Admission Factors</Text>
            <Feather name={isFactorsExpanded ? "chevron-up" : "chevron-down"} size={20} color={THEME.textGray} />
          </TouchableOpacity>
          
          {isFactorsExpanded && (
            <View style={styles.sectionBody}>
              <FactorItem label="CGPA" icon="star" iconType="feather" />
              <FactorItem label="IELTS Score" icon="checkmark-circle-outline" iconType="ionicons" />
              <FactorItem label="Course Competitiveness" icon="target" iconType="material" />
            </View>
          )}
        </View>

        {/* Universities By Risk Level */}
        <Text style={styles.riskTitle}>Universities By Risk Level</Text>
        <View style={styles.riskTabs}>
          {(['Safe', 'Moderate', 'Ambitious'] as const).map((level) => (
            <TouchableOpacity 
              key={level}
              style={[styles.riskTab, activeRiskLevel === level && styles.riskTabActive]}
              onPress={() => setActiveRiskLevel(level)}
            >
              <Text style={activeRiskLevel === level ? styles.riskTabTextActive : styles.riskTabText}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loaderText}>Loading matches...</Text>
          </View>
        ) : currentList.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.uniCardsScroll}>
            {currentList.map((uni) => {
              const match = calculateAcceptanceChance(userData, uni);
              return (
                <TouchableOpacity 
                  key={uni.id} 
                  style={styles.uniCard}
                  onPress={() => router.push({
                    pathname: "/university/[id]",
                    params: { id: uni.id, country: uni.country, name: uni.name }
                  })}
                >
                  <View style={styles.uniImageContainer}>
                    <Image source={{ uri: uni.image || "" }} style={styles.uniImage} />
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{match.score}% Match</Text>
                    </View>
                  </View>
                  <View style={styles.uniCardContent}>
                    <Text style={styles.uniCardName} numberOfLines={1}>{uni.name}</Text>
                    <View style={styles.uniLocationRow}>
                      <Ionicons name="location" size={14} color={THEME.orange} />
                      <Text style={styles.uniLocationText} numberOfLines={1}>{uni.location}</Text>
                    </View>
                    <View style={styles.uniCostRow}>
                      <Text style={styles.uniCostValue}>
                        {formatTuition(uni.tuition)}
                        <Text style={styles.uniCostUnit}>/ year</Text>
                      </Text>
                      <View style={[
                        styles.safeBadge,
                        activeRiskLevel === 'Moderate' && { backgroundColor: "#FEF3C7" },
                        activeRiskLevel === 'Ambitious' && { backgroundColor: "#FEE2E2" }
                      ]}>
                        <Text style={[
                          styles.safeText,
                          activeRiskLevel === 'Moderate' && { color: THEME.orange },
                          activeRiskLevel === 'Ambitious' && { color: THEME.red }
                        ]}>
                          {activeRiskLevel}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.uniActions}>
                      <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.compareBtn} 
                        activeOpacity={0.7}
                        onPress={() => router.push({
                          pathname: "/university/[id]",
                          params: { id: uni.id, country: uni.country, name: uni.name }
                        })}
                      >
                        <Text style={styles.compareBtnText}>Compare</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={THEME.textGray} />
            <Text style={styles.emptyText}>
              No universities categorized as "{activeRiskLevel}" for your current profile.
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
    backgroundColor: THEME.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.white,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textDark,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#FDF9F3",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FBEBD6",
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textDark,
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 12,
  },
  summaryStatus: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textDark,
  },
  averageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBEBD6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.orange,
  },
  averageBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.orange,
  },
  chartContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 16,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryFooterText: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "500",
  },
  sectionBox: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    backgroundColor: THEME.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: THEME.white,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
    paddingVertical: 4,
  },
  analysisItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  analysisLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  analysisLabel: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: "700",
  },
  analysisValueText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.textGray,
  },
  factorItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  factorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  factorIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textDark,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.textDark,
    marginTop: 10,
    marginBottom: 16,
  },
  riskTabs: {
    flexDirection: "row",
    backgroundColor: THEME.white,
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    marginBottom: 20,
  },
  riskTab: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  riskTabActive: {
    backgroundColor: THEME.blue,
  },
  riskTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textGray,
  },
  riskTabTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.white,
  },
  uniCardsScroll: {
    paddingBottom: 20,
  },
  uniCard: {
    width: 280,
    backgroundColor: THEME.white,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  uniImageContainer: {
    height: 140,
    width: "100%",
  },
  uniImage: {
    width: "100%",
    height: "100%",
  },
  matchBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 10,
    fontWeight: "900",
    color: THEME.blue,
  },
  uniCardContent: {
    padding: 16,
  },
  uniCardName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 8,
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
    fontWeight: "600",
  },
  uniCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  uniCostValue: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.textDark,
  },
  uniCostUnit: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "500",
  },
  safeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.green,
  },
  uniActions: {
    flexDirection: "row",
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: THEME.orange,
    fontSize: 13,
    fontWeight: "800",
  },
  compareBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  compareBtnText: {
    color: THEME.blue,
    fontSize: 13,
    fontWeight: "800",
  },
  loaderContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    textAlign: "center",
    color: THEME.textGray,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
