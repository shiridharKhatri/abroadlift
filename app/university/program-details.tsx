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
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const THEME = {
  primary: "#1A8A99",
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#64748B",
  bgLight: "#F8FAFC",
  orange: "#F97316",
  green: "#10B981",
  white: "#FFFFFF",
  blue: "#3B82F6",
  divider: "#E2E8F0",
};

export default function ProgramDetailsScreen() {
  const params = useLocalSearchParams();
  const [isDescExpanded, setIsDescExpanded] = React.useState(false);

  // Safely parse query parameters
  const name = (params.name as string) || "Program Details";
  const category = (params.category as string) || "General";
  const fee = (params.fee as string) || "Varies";
  const rawDescription = (params.description as string) || "";
  const universityName = (params.universityName as string) || "University Detail";
  const coop = params.coop === "true";
  const pgwp = params.pgwp === "true";
  const applicationFee = (params.application_fee as string) || "Varies";
  const deliveryMethod = (params.delivery_method as string) || "";
  const lengthBreakdown = (params.length_breakdown as string) || "";
  const languageOfInstruction = (params.language_of_instruction as string) || "English";
  const country = (params.country as string) || "Canada";

  let level: string[] = [];
  try {
    if (params.level) {
      level = JSON.parse(params.level as string);
    }
  } catch (e) {
    console.error("Error parsing level:", e);
  }

  let otherFees: any[] = [];
  try {
    if (params.other_fees) {
      otherFees = JSON.parse(params.other_fees as string);
    }
  } catch (e) {
    console.error("Error parsing other_fees:", e);
  }

  let requirements: any = null;
  try {
    if (params.requirements) {
      requirements = JSON.parse(params.requirements as string);
    }
  } catch (e) {
    console.error("Error parsing requirements:", e);
  }

  // Strips HTML helper
  const stripHtml = (html: string) => {
    if (!html) return "No description available.";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .trim();
  };

  const description = stripHtml(rawDescription);

  // Format delivery method string
  const formatDelivery = (val: string) => {
    if (!val) return "In Class";
    return val
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Typical intakes mapping
  const getTypicalIntakes = (countryName: string) => {
    const c = countryName.toLowerCase().trim();
    if (c.includes("canada")) {
      return [
        { term: "Fall Intake", months: "September", status: "Main Intake" },
        { term: "Winter Intake", months: "January", status: "Secondary" },
        { term: "Summer Intake", months: "May", status: "Limited Programs" },
      ];
    }
    if (c.includes("usa") || c.includes("united states")) {
      return [
        { term: "Fall Intake", months: "August - September", status: "Main Intake" },
        { term: "Spring Intake", months: "January", status: "Secondary" },
        { term: "Summer Intake", months: "May", status: "Limited" },
      ];
    }
    if (c.includes("uk") || c.includes("united kingdom") || c.includes("great britain")) {
      return [
        { term: "Autumn Intake", months: "September - October", status: "Main Intake" },
        { term: "Winter Intake", months: "January - February", status: "Secondary" },
      ];
    }
    if (c.includes("australia")) {
      return [
        { term: "Semester 1", months: "February", status: "Main Intake" },
        { term: "Semester 2", months: "July", status: "Secondary" },
        { term: "Summer Intake", months: "November", status: "Limited" },
      ];
    }
    if (c.includes("germany")) {
      return [
        { term: "Winter Semester", months: "October", status: "Main Intake" },
        { term: "Summer Semester", months: "April", status: "Secondary" },
      ];
    }
    return [
      { term: "Fall Intake", months: "September", status: "Main Intake" },
      { term: "Spring Intake", months: "January", status: "Secondary" },
    ];
  };

  const intakes = getTypicalIntakes(country);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={THEME.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Program Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Course Info Section */}
        <View style={styles.introCard}>
          <Text style={styles.universityName}>{universityName.toUpperCase()}</Text>
          <Text style={styles.programTitle}>{name}</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{category.toUpperCase()}</Text>
            </View>
            {level.map((lvl, index) => (
              <View key={index} style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{lvl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tuition & App Fee Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={22} color={THEME.blue} />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Annual Tuition</Text>
              <Text style={styles.statValue}>{fee}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="card-outline" size={22} color={THEME.green} />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Application Fee</Text>
              <Text style={styles.statValue}>
                {applicationFee && !isNaN(Number(applicationFee)) ? `$${applicationFee}` : applicationFee}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery & Duration Info */}
        <View style={styles.detailsListCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailRowLabel}>Delivery Method</Text>
            <Text style={styles.detailRowValue}>{formatDelivery(deliveryMethod)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailRowLabel}>Instruction Language</Text>
            <Text style={styles.detailRowValue}>{languageOfInstruction}</Text>
          </View>
          {lengthBreakdown ? (
            <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0, flexDirection: "column", alignItems: "flex-start", gap: 6 }]}>
              <Text style={styles.detailRowLabel}>Duration / Format</Text>
              <Text style={[styles.detailRowValue, { textAlign: "left", lineHeight: 20 }]}>{lengthBreakdown}</Text>
            </View>
          ) : null}
        </View>

        {/* Work Authorizations Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={18} color={THEME.primary} />
            <Text style={styles.sectionTitle}>Work & Stay Options</Text>
          </View>

          <View style={styles.workOptionsRow}>
            <View style={[styles.workCard, coop ? styles.workCardActive : styles.workCardInactive]}>
              <Ionicons 
                name={coop ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={coop ? THEME.green : THEME.textGray} 
              />
              <View style={styles.workInfo}>
                <Text style={styles.workTitle}>Co-op Program</Text>
                <Text style={styles.workDesc}>
                  {coop ? "Offers integrated paid internship / work terms." : "No co-op options listed."}
                </Text>
              </View>
            </View>

            <View style={[styles.workCard, pgwp ? styles.workCardActive : styles.workCardInactive]}>
              <Ionicons 
                name={pgwp ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={pgwp ? THEME.green : THEME.textGray} 
              />
              <View style={styles.workInfo}>
                <Text style={styles.workTitle}>Post-Grad Work Permit (PGWP)</Text>
                <Text style={styles.workDesc}>
                  {pgwp ? "Eligible for stay back work permit after graduation." : "Not listed or eligible for PGWP."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Typical Intakes Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={18} color={THEME.primary} />
            <Text style={styles.sectionTitle}>Intake Timeline ({country})</Text>
          </View>
          <View style={styles.intakesCard}>
            {intakes.map((item, index) => (
              <View key={index} style={[styles.intakeRow, index === intakes.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.intakeTerm}>{item.term}</Text>
                  <Text style={styles.intakeMonths}>{item.months}</Text>
                </View>
                <View style={styles.intakeStatusBadge}>
                  <Text style={styles.intakeStatusText}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Admission Requirements Section */}
        {requirements && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-done-circle-outline" size={18} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Academic & Test Requirements</Text>
            </View>
            <View style={styles.requirementsCard}>
              {requirements.min_gpa && (
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>Minimum GPA</Text>
                  <Text style={styles.reqValue}>{requirements.min_gpa}%</Text>
                </View>
              )}
              {requirements.min_ielts_average && (
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>IELTS Requirement</Text>
                  <Text style={styles.reqValue}>{requirements.min_ielts_average} Average</Text>
                </View>
              )}
              {requirements.min_toefl_total && (
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>TOEFL Score</Text>
                  <Text style={styles.reqValue}>{requirements.min_toefl_total} Minimum</Text>
                </View>
              )}
              {requirements.min_duolingo_score && (
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>Duolingo Score</Text>
                  <Text style={styles.reqValue}>{requirements.min_duolingo_score}</Text>
                </View>
              )}
              {requirements.min_pte_overall && (
                <View style={[styles.reqRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Text style={styles.reqLabel}>PTE Overall</Text>
                  <Text style={styles.reqValue}>{requirements.min_pte_overall}</Text>
                </View>
              )}

              {/* Prerequisites list */}
              {requirements.other_requirements && requirements.other_requirements.filter((r: string) => r && r.trim() !== "").length > 0 && (
                <View style={styles.prereqSection}>
                  <Text style={styles.prereqTitle}>Academic Prerequisites</Text>
                  {requirements.other_requirements
                    .filter((r: string) => r && r.trim() !== "")
                    .map((reqText: string, rIdx: number) => (
                      <View key={rIdx} style={styles.prereqItem}>
                        <FontAwesome5 name="chevron-right" size={10} color={THEME.blue} style={{ marginTop: 4 }} />
                        <Text style={styles.prereqText}>{reqText.trim()}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={THEME.primary} />
            <Text style={styles.sectionTitle}>Program Overview</Text>
          </View>
          <View style={styles.descCard}>
            <Text style={styles.descText}>
              {description.length > 250 && !isDescExpanded
                ? `${description.substring(0, 250)}...`
                : description}
            </Text>
            {description.length > 250 && (
              <TouchableOpacity
                onPress={() => setIsDescExpanded(!isDescExpanded)}
                style={{ marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center" }}
              >
                <Text style={{ color: THEME.blue, fontWeight: "700", fontSize: 13 }}>
                  {isDescExpanded ? "Read Less" : "Read More"}
                </Text>
                <Ionicons 
                  name={isDescExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={THEME.blue} 
                  style={{ marginLeft: 4 }} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Other Fees Section */}
        {otherFees && otherFees.length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={18} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Other Estimated Fees</Text>
            </View>
            <View style={styles.feesCard}>
              {otherFees.map((item: any, index: number) => {
                const isObject = typeof item === "object" && item !== null;
                let feeName = `Fee #${index + 1}`;
                let feeAmount = "Varies";

                if (isObject) {
                  feeName = item.name || item.description || feeName;
                  feeAmount = item.amount || item.value || feeAmount;
                } else if (typeof item === "string") {
                  const colonIndex = item.indexOf(":");
                  if (colonIndex !== -1) {
                    feeName = item.substring(0, colonIndex).trim();
                    feeAmount = item.substring(colonIndex + 1).trim();
                  } else {
                    feeName = item;
                    feeAmount = "";
                  }
                }

                return (
                  <View key={index} style={[styles.feeRow, index === otherFees.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={styles.feeLabel}>{feeName}</Text>
                    {feeAmount ? <Text style={styles.feeValue}>{feeAmount}</Text> : null}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textDark,
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: THEME.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    marginBottom: 16,
  },
  universityName: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textGray,
    letterSpacing: 1,
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
    lineHeight: 28,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.blue,
  },
  levelBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textGray,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.divider,
    gap: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textGray,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.textDark,
  },
  detailsListCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  detailRowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textGray,
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
  },
  workOptionsRow: {
    flexDirection: "column",
    gap: 12,
  },
  workCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
    alignItems: "flex-start",
  },
  workCardActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  workCardInactive: {
    backgroundColor: THEME.white,
    borderColor: THEME.divider,
  },
  workInfo: {
    flex: 1,
  },
  workTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 4,
  },
  workDesc: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textGray,
    lineHeight: 18,
  },
  intakesCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  intakeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  intakeTerm: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 2,
  },
  intakeMonths: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textGray,
  },
  intakeStatusBadge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intakeStatusText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.orange,
  },
  requirementsCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  reqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  reqLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
  },
  reqValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.blue,
  },
  prereqSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
    paddingBottom: 8,
  },
  prereqTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 10,
  },
  prereqItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  prereqText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textGray,
    lineHeight: 18,
    flex: 1,
  },
  descCard: {
    backgroundColor: THEME.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
  },
  descText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#334155",
    fontWeight: "500",
  },
  feesCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.divider,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  feeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
    flex: 1.5,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.primary,
    flex: 1,
    textAlign: "right",
  },
});
