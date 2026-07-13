import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
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

  const SectionHeader = ({ title, onToggle, expanded }: { title: string; onToggle: () => void; expanded: boolean }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
      <Text style={[styles.sectionTitleText, { color: colors.text }]}>{title}</Text>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const AnalysisItem = ({ label, type }: { label: string; type: 'success' | 'warning' }) => (
    <View style={[styles.analysisItemRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.statusDotMini, { backgroundColor: type === 'success' ? COLORS.green : COLORS.orange }]} />
      <Text style={[styles.analysisItemText, { color: colors.text }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Visa Readiness</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <ProfileAvatar size={38} color={colors.border} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: 40 + insets.bottom }]}
      >

        {/* Readiness Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>VISA READINESS SCORE</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{score}% <Text style={[styles.summaryStatus, { color: colors.primary }]}>({label})</Text></Text>
          
          <View style={[styles.averageBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: score >= 65 ? COLORS.green : COLORS.orange }]} />
            <Text style={[styles.averageBadgeText, { color: colors.textSecondary }]}>Dynamic Visa Evaluation</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.summaryFooter}>
            <View style={styles.footerIconItem}>
              <Text style={[styles.footerLabelText, { color: colors.textSecondary }]}>Budget: </Text>
              <Text style={[styles.footerIconText, { color: colors.text }]}>${(userData.yearlyBudget || "0")}/yr</Text>
            </View>
            <View style={styles.footerIconItem}>
              <Text style={[styles.footerLabelText, { color: colors.textSecondary }]}>Degree: </Text>
              <Text style={[styles.footerIconText, { color: colors.text }]}>{userData.studyLevel || "N/A"}</Text>
            </View>
            <View style={styles.footerIconItem}>
              <Text style={[styles.footerLabelText, { color: colors.textSecondary }]}>Nationality: </Text>
              <Text style={[styles.footerIconText, { color: colors.text }]}>{userData.country || "Nepal"}</Text>
            </View>
          </View>
        </View>

        {/* Breakdown Sections */}
        <View style={styles.breakdownContainer}>

          {/* Profile Analysis */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader
              title="Profile Strengths"
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

          {/* Risk Factors */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader
              title="Risk Factors"
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

          {/* Visa Guidance Steps */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader
              title={`${userData.selectedUniversities?.[0]?.country || "Destination"} Visa Steps`}
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
  scrollInner: {
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
    justifyContent: "space-between",
  },
  footerIconItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLabelText: {
    fontSize: 11,
    fontWeight: "500",
  },
  footerIconText: {
    fontSize: 11,
    fontWeight: "700",
  },
  breakdownContainer: {
    gap: 16,
  },
  sectionBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
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
    paddingBottom: 8,
  },
  analysisItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  statusDotMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  analysisItemText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },
});
