import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { router, Stack } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useTheme } from "../context/ThemeContext";

import { useUser } from "../context/UserContext";
import { checkVisa, getVisaGuidance } from "../lib/api";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  green: "#10B981",
  orange: "#F97316",
  red: "#EF4444",
  border: "#F1F5F9",
  blue: "#3B82F6",
};

export default function VisaReadinessPage() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { userData, token } = useUser();

  const [expandedSections, setExpandedSections] = React.useState<string[]>(["profile-1", "risks", "guidance"]);
  const [loading, setLoading] = React.useState(true);
  const [score, setScore] = React.useState(60);
  const [label, setLabel] = React.useState("Needs Work");
  const [analysisItems, setAnalysisItems] = React.useState<any[]>([]);
  const [riskItems, setRiskItems] = React.useState<any[]>([]);
  const [guidanceSteps, setGuidanceSteps] = React.useState<any[]>([]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isExpanded = (id: string) => expandedSections.includes(id);

  React.useEffect(() => {
    const runAnalysis = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const nationality = userData.country || "Nepal";
        const destination = userData.selectedUniversities?.[0]?.country || "USA";
        const degreeLevel = userData.studyLevel || "Masters";
        const fundsAvailable = userData.yearlyBudget ? parseFloat(userData.yearlyBudget) : 25000;
        const ieltsScore = userData.score ? parseFloat(userData.score) : 6.5;
        const pastRejections = 0;

        const [visaResult, guidanceResult] = await Promise.all([
          checkVisa(token, {
            nationality,
            destination,
            degreeLevel,
            fundsAvailable,
            ieltsScore,
            pastRejections: pastRejections > 0,
          }),
          getVisaGuidance(destination.toLowerCase() === "united kingdom" ? "uk" : destination),
        ]);

        const rate = visaResult?.successRate ?? 60;
        setScore(rate);

        if (rate >= 80) setLabel("Excellent");
        else if (rate >= 65) setLabel("Good");
        else if (rate >= 50) setLabel("Needs Work");
        else setLabel("Weak");

        // Build dynamic profile analysis
        const analysis = [];
        const gpa = parseFloat(userData.cgpa || "0");
        if (gpa >= 3.0) {
          analysis.push({ label: `Strong Academics (GPA: ${gpa})`, type: "success" });
        } else if (gpa > 0) {
          analysis.push({ label: `Academics can be improved (GPA: ${gpa})`, type: "warning" });
        } else {
          analysis.push({ label: "Academic records not set", type: "warning" });
        }

        if (ieltsScore >= 6.5) {
          analysis.push({ label: `Strong English proficiency (Score: ${ieltsScore})`, type: "success" });
        } else if (ieltsScore > 0) {
          analysis.push({ label: `English test score is average (Score: ${ieltsScore})`, type: "warning" });
        } else {
          analysis.push({ label: "English test score not set", type: "warning" });
        }

        if (fundsAvailable >= 30000) {
          analysis.push({ label: "Sufficient financial coverage", type: "success" });
        } else {
          analysis.push({ label: "Financial proof could be stronger", type: "warning" });
        }
        setAnalysisItems(analysis);

        // Build dynamic risk factors
        const risks = [];
        if (fundsAvailable < 20000) {
          risks.push({ label: `Low available funds: $${fundsAvailable.toLocaleString()}/yr` });
        }
        if (pastRejections > 0) {
          risks.push({ label: "Previous visa refusal recorded" });
        }
        if (!userData.selectedUniversities || userData.selectedUniversities.length === 0) {
          risks.push({ label: "No target university selected yet" });
        }
        if (risks.length === 0) {
          risks.push({ label: "No critical risk factors identified" });
        }
        setRiskItems(risks);

        if (guidanceResult && guidanceResult.steps) {
          setGuidanceSteps(guidanceResult.steps);
        }
      } catch (err) {
        console.error("Error running visa analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [userData, token]);

  const SectionHeader = ({ title, icon, color, iconBg, onToggle, expanded }: { title: string; icon: any; color: string; iconBg: string; onToggle: () => void; expanded: boolean }) => (
    <TouchableOpacity style={[styles.sectionHeader, { backgroundColor: colors.card }]} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>{title}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const AnalysisItem = ({ label, type }: { label: string; type: 'success' | 'warning' }) => (
    <View style={[styles.analysisItemRow, { borderBottomColor: colors.border }]}>
      <View style={styles.analysisIconWrap}>
        {type === 'success' ? (
          <View style={[styles.statusIcon, { backgroundColor: COLORS.green }]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        ) : (
          <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
        )}
      </View>
      <Text style={[styles.analysisItemText, { color: colors.text }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? (insets.top || 30) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Visa Readiness</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <ProfileAvatar size={44} color={colors.border} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollInner, { paddingBottom: 40 + insets.bottom }]}
      >
        
        {/* Readiness Summary Card */}
        <View style={[styles.summaryCard, isDark ? { backgroundColor: colors.card, borderColor: colors.border } : { backgroundColor: "#FEF9F2", borderColor: "#FDEED7" }]}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>Visa Readiness Score</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{score}% - {label}</Text>
              <View style={[styles.averageBadge, isDark && { backgroundColor: colors.border }]}>
                <View style={styles.orangeDot} />
                <Text style={styles.averageBadgeText}>Dynamic Evaluation</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
               <View style={[styles.donutBase, { borderColor: isDark ? colors.border : "#E2E8F0" }]}>
                  <View style={[styles.donutSegment, { borderColor: colors.primary, borderTopColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: `${(score / 100) * 360}deg` }] }]} />
               </View>
            </View>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: isDark ? colors.border : "#FDEED7" }]} />
          <View style={styles.summaryFooter}>
             <View style={styles.footerIconItem}>
                <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.footerIconText, { color: colors.textSecondary }]}>${(userData.yearlyBudget || "0")}/yr</Text>
             </View>
             <View style={styles.footerIconItem}>
                <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.footerIconText, { color: colors.textSecondary }]}>{userData.studyLevel || "N/A"}</Text>
             </View>
             <View style={styles.footerIconItem}>
                <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.footerIconText, { color: colors.textSecondary }]}>{userData.country || "N/A"}</Text>
             </View>
          </View>
        </View>

        {/* Breakdown Sections */}
        <View style={styles.breakdownContainer}>

           {/* Profile Analysis (Blue) */}
           <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <SectionHeader 
                title="Profile Strengths" 
                icon="person-outline" 
                color="#3B82F6" 
                iconBg={isDark ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE"} 
                onToggle={() => toggleSection("profile-1")}
                expanded={isExpanded("profile-1")}
             />
             {isExpanded("profile-1") && (
               <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                 {analysisItems.map((item, idx) => (
                   <AnalysisItem key={idx} label={item.label} type={item.type} />
                 ))}
               </View>
             )}
           </View>

           {/* Risk Factors (Orange) */}
           <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <SectionHeader 
                title="Risk Factors" 
                icon="warning-outline" 
                color="#D97706" 
                iconBg={isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7"} 
                onToggle={() => toggleSection("risks")}
                expanded={isExpanded("risks")}
             />
             {isExpanded("risks") && (
               <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                 {riskItems.map((item, idx) => (
                   <AnalysisItem key={idx} label={item.label} type="warning" />
                 ))}
               </View>
             )}
           </View>

           {/* Visa Guidance Steps (Green) */}
           <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <SectionHeader 
                title={`${userData.selectedUniversities?.[0]?.country || "Destination"} Visa Steps`}
                icon="checkmark-circle-outline" 
                color="#059669" 
                iconBg={isDark ? "rgba(5, 150, 105, 0.15)" : "#D1FAE5"} 
                onToggle={() => toggleSection("guidance")}
                expanded={isExpanded("guidance")}
             />
             {isExpanded("guidance") && (
               <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                 {guidanceSteps.map((step, idx) => (
                   <AnalysisItem key={idx} label={`${step.title}: ${step.description}`} type="success" />
                 ))}
                 {guidanceSteps.length === 0 && (
                   <AnalysisItem label="Loading target visa rules..." type="warning" />
                 )}
               </View>
             )}
           </View>

        </View>

      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    backgroundColor: "#FEF9F2", 
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FDEED7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  averageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE8CC",
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
    backgroundColor: COLORS.orange,
  },
  averageBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.orange,
  },
  chartContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  donutBase: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 12,
    borderColor: "#E2E8F0",
    position: 'relative',
  },
  donutSegment: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#FDEED7",
    marginBottom: 12,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerIconItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerIconText: {
    fontSize: 10,
    color: COLORS.textGray,
    fontWeight: "600",
  },
  breakdownContainer: {
    gap: 20,
  },
  sectionBox: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: 8,
  },
  analysisItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  analysisIconWrap: {
    width: 24,
    alignItems: "center",
  },
  statusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  analysisItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
});
