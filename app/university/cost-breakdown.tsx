import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { getCostOfLiving, getRelocationIndex, getUniversityDetails } from "../../lib/api";
import { ActivityIndicator } from "react-native";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#3B82F6", // Blue from screenshot
  secondary: "#10B981", // Green
  textDark: "#111827",
  textGray: "#64748B",
  bgLight: "#F8FAFF",
  orange: "#F97316",
  green: "#10B981",
  white: "#FFFFFF",
  blue: "#3B82F6",
  divider: "#F1F5F9",
};

const SectionHeader = ({ title, icon, color, expanded = false, onToggle }: { title: string; icon: any; color: string; expanded?: boolean; onToggle?: () => void }) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
    <View style={styles.sectionTitleRow}>
      <View style={[styles.sectionIconBox, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
    <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
  </TouchableOpacity>
);

const CostItem = ({ label, value, subValue, footerText }: { label: string; value: string; subValue?: string; footerText?: string }) => (
  <View style={styles.costItemWrapper}>
    <View style={styles.costItemRow}>
      <Text style={styles.costLabel}>{label}</Text>
      <View style={styles.costValueWrapper}>
        {subValue && <Text style={styles.costSubLabel}>{subValue}</Text>}
        <Text style={styles.costValueText}>{value}</Text>
      </View>
    </View>
    {footerText && <Text style={styles.itemFooterText}>{footerText}</Text>}
  </View>
);

export default function CostBreakdownScreen() {
  const { id, country: countryParam } = useLocalSearchParams();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = React.useState("First year");
  const [loading, setLoading] = React.useState(true);
  const [costData, setCostData] = React.useState<any>(null);
  const [qoiData, setQoiData] = React.useState<any>(null);
  const [uniData, setUniData] = React.useState<any>(null);
  
  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    "year-tuition", 
    "year-living", 
    "monthly", 
    "pre-app", 
    "regional", 
    "visa", 
    "travel",
    "roi"
  ]);

  const USD_TO_NPR = 134;

  const currentCountry = (countryParam as string) || userData.country || "UK";

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cost, qoi, uni] = await Promise.all([
          getCostOfLiving(currentCountry),
          getRelocationIndex(currentCountry),
          id ? getUniversityDetails(id as string, currentCountry) : Promise.resolve(null)
        ]);
        
        setCostData(cost);
        setQoiData(qoi);
        setUniData(uni);
      } catch (error) {
        console.error("Error fetching cost data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentCountry, id]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isExpanded = (id: string) => expandedSections.includes(id);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ marginTop: 12, color: THEME.textGray, fontWeight: "600" }}>Calculating Estimates...</Text>
      </View>
    );
  }

  // Calculate values
  const monthlyUsd = costData?.monthly_estimate_usd || 1500;
  const annualLivingUsd = monthlyUsd * 12;
  const tuitionUsd = uniData?.tuitionValue || 20000;
  
  const totalFirstYearNpr = (tuitionUsd + annualLivingUsd) * USD_TO_NPR;
  const fmtNpr = (v: number) => {
     if (v >= 100000) return `NPR ${(v / 100000).toFixed(1)} Lakhs`;
     return `NPR ${v.toLocaleString()}`;
  };

  const fmtCurrency = (v: number) => v.toLocaleString();

  // ROI / QOI mapping
  const qualityOfLife = qoiData?.quality_of_life_index || "N/A";
  const safety = qoiData?.safety_index || "N/A";
  const health = qoiData?.health_care_index || "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={THEME.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cost Breakdown</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <ProfileAvatar size={44} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>Total Estimated Cost (Year 1)</Text>
              <Text style={styles.summaryValue}>{fmtNpr(totalFirstYearNpr)}</Text>
              <View style={styles.averageBadge}>
                <View style={styles.orangeDot} />
                <Text style={styles.averageBadgeText}>{currentCountry} Average</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
               <View style={styles.donutBase}>
                  <View style={[styles.donutSegment, { borderColor: '#3B82F6', borderTopColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: '#10B981', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: '#F97316', borderTopColor: 'transparent', borderRightColor: 'transparent', width: 66, height: 66, top: -10, left: -10, transform: [{ rotate: '120deg' }] }]} />
               </View>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryFooter}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.summaryFooterText}>Cost based on country, lifestyle, university.</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          {["First year", "Year on year", "Month on month"].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Breakdown Sections */}
        <View style={styles.breakdownContainer}>

          {/* Year Breakdown (Tuition/Education) */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Tuition & Fees" 
              icon="wallet-outline" 
              color="#A3E635" 
              expanded={isExpanded("year-tuition")}
              onToggle={() => toggleSection("year-tuition")}
            />
            {isExpanded("year-tuition") && (
              <View style={styles.sectionBody}>
                <CostItem label="Annual Tuition" value={fmtNpr(tuitionUsd * USD_TO_NPR)} subValue={`$${tuitionUsd.toLocaleString()}`} />
                <CostItem label="Study Level" value={uniData?.type || userData.studyLevel || "Masters"} />
                <Text style={styles.footerInfoText}>Fees vary by course and university</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.primaryActionButton}>
             <Text style={styles.primaryActionText}>View All Study Cost</Text>
          </TouchableOpacity>

          {/* Year Breakdown (Living) */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Living Expenses" 
              icon="information-outline" 
              color="#A3E635" 
              expanded={isExpanded("year-living")}
              onToggle={() => toggleSection("year-living")}
            />
            {isExpanded("year-living") && (
              <View style={styles.sectionBody}>
                <CostItem label="Annual Total" value={fmtNpr(annualLivingUsd * USD_TO_NPR)} subValue={`$${annualLivingUsd.toLocaleString()}`} />
                <CostItem label="Rent (Approx)" value={fmtNpr((monthlyUsd * 0.4) * USD_TO_NPR)} subValue="40% of budget" />
                <CostItem label="Food & Others" value={fmtNpr((monthlyUsd * 0.6) * USD_TO_NPR)} subValue="60% of budget" />
                <Text style={styles.footerInfoText}>Based on average {currentCountry} lifestyle</Text>
              </View>
            )}
          </View>

          {/* Total Monthly Cost */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Total Monthly Cost" 
              icon="calendar-outline" 
              color="#A3E635" 
              expanded={isExpanded("monthly")}
              onToggle={() => toggleSection("monthly")}
            />
            {isExpanded("monthly") && (
              <View style={styles.sectionBody}>
                <View style={styles.compactMonthlyRow}>
                   <Text style={styles.monthlyValueText}>{fmtNpr(monthlyUsd * USD_TO_NPR)} / month</Text>
                   <Text style={[styles.itemFooterText, { marginTop: 4 }]}>Approx. ${monthlyUsd.toLocaleString()} USD</Text>
                </View>
              </View>
            )}
          </View>

          {/* ROI & Quality of Index */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="ROI & Quality Index" 
              icon="trending-up" 
              color={THEME.blue} 
              expanded={isExpanded("roi")}
              onToggle={() => toggleSection("roi")}
            />
            {isExpanded("roi") && (
              <View style={styles.sectionBody}>
                <CostItem label="Quality of Life" value={String(qualityOfLife)} subValue="Index / 200" />
                <CostItem label="Safety Index" value={String(safety)} subValue="Index / 100" />
                <CostItem label="Health Care" value={String(health)} subValue="Index / 100" />
                <CostItem label="Purchasing Power" value={qoiData?.purchasing_power_index || "N/A"} subValue="Index" />
                <Text style={styles.footerInfoText}>High index indicates better return on living</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.primaryActionButton}>
             <Text style={styles.primaryActionText}>Save Plan</Text>
          </TouchableOpacity>

          {/* Pre-application Cost */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Pre-application Cost" 
              icon="information-outline" 
              color="#A3E635" 
              expanded={isExpanded("pre-app")}
              onToggle={() => toggleSection("pre-app")}
            />
            {isExpanded("pre-app") && (
              <View style={styles.sectionBody}>
                <CostItem label="Consultancy Fee" value="NPR 0 - 50,000" />
                <CostItem label="IELTS Test" value="NPR 27,000 - 30,000" />
                <CostItem label="Documents" value="NPR 27,000 - 30,000" />
                <CostItem label="Medical" value="NPR 27,000 - 30,000" />
                <CostItem label="Application Fees" value="NPR 27,000 - 30,000" />
              </View>
            )}
          </View>

          {/* Tuition Fees (Regional) */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Tuition Fees" 
              icon="school-outline" 
              color="#FB923C" 
              expanded={isExpanded("regional")}
              onToggle={() => toggleSection("regional")}
            />
            {isExpanded("regional") && (
              <View style={styles.sectionBody}>
                <CostItem label="USA/UK" value="NPR 17-44 Lakhs" subValue="per year" />
                <CostItem label="Canada/Australia" value="NPR 17-44 Lakhs" subValue="per year" />
                <CostItem label="Germany/Europe" value="NPR 17-44 Lakhs" subValue="per year" />
              </View>
            )}
          </View>

          {/* Visa & Government Costs */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Visa & Government Costs" 
              icon="card-account-details-outline" 
              color="#60A5FA" 
              expanded={isExpanded("visa")}
              onToggle={() => toggleSection("visa")}
            />
            {isExpanded("visa") && (
              <View style={styles.sectionBody}>
                <CostItem label="Visa Fee" value="NPR 1.5-5 Lakhs" subValue="Insurance - " />
                <CostItem label="Biometrics" value="" />
              </View>
            )}
          </View>

          {/* Travel & Setup */}
          <View style={styles.sectionBox}>
            <SectionHeader 
              title="Travel & Setup" 
              icon="airplane-takeoff" 
              color="#E879F9" 
              expanded={isExpanded("travel")}
              onToggle={() => toggleSection("travel")}
            />
            {isExpanded("travel") && (
              <View style={styles.sectionBody}>
                <CostItem label="Flight Ticket" value="NPR 47,000 - 2 Lakhs" />
              </View>
            )}
          </View>

        </View>

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
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#FEF9F2", 
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
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
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
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
    gap: 8,
  },
  summaryFooterText: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 4,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: THEME.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textGray,
  },
  activeTabText: {
    color: THEME.white,
  },
  breakdownContainer: {
    gap: 20,
  },
  sectionBox: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    backgroundColor: THEME.white,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: THEME.white,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: 12,
  },
  costItemWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  costItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  costValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  costSubLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  costValueText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textDark,
  },
  itemFooterText: {
    fontSize: 12,
    color: THEME.textGray,
    marginTop: 4,
  },
  footerInfoText: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
  compactMonthlyRow: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  monthlyValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textDark,
  },
  primaryActionButton: {
    backgroundColor: THEME.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: "800",
  },
});
