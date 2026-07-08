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
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { getCostEstimate, getCostOfLiving, getRelocationIndex, getUniversityDetails } from "../../lib/api";
import { ActivityIndicator } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Skeleton } from "../../components/Skeleton";

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

const SectionHeader = ({ title, icon, color, expanded = false, onToggle }: { title: string; icon: any; color: string; expanded?: boolean; onToggle?: () => void }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.sectionHeader, { backgroundColor: colors.card }]} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconBox, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>{title}</Text>
      </View>
      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const CostItem = ({ label, value, subValue, footerText }: { label: string; value: string; subValue?: string; footerText?: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.costItemWrapper, { borderBottomColor: colors.border }]}>
      <View style={styles.costItemRow}>
        <Text style={[styles.costLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View style={styles.costValueWrapper}>
          {subValue && <Text style={[styles.costSubLabel, { color: colors.textSecondary }]}>{subValue}</Text>}
          <Text style={[styles.costValueText, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
      {footerText && <Text style={[styles.itemFooterText, { color: colors.textSecondary }]}>{footerText}</Text>}
    </View>
  );
};

export default function CostBreakdownScreen() {
  const { id, country: countryParam } = useLocalSearchParams();
  const { userData, setUserData, selectUniversity } = useUser();
  const { colors, isDark } = useTheme();
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

  const [costEstimate, setCostEstimate] = React.useState<any>(null);

  const currentCountry = (countryParam as string) || userData.country || "UK";

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let uni = null;
        let resolvedCountry = currentCountry;
        if (id) {
          uni = await getUniversityDetails(id as string, currentCountry);
          if (uni && uni.country) {
            resolvedCountry = uni.country;
          }
        }

        const [cost, qoi] = await Promise.all([
          getCostOfLiving(resolvedCountry),
          getRelocationIndex(resolvedCountry),
        ]);
        
        setCostData(cost);
        setQoiData(qoi);
        setUniData(uni);

        // Also fetch cost estimate for live exchange rate
        const tuitionForEstimate = uni?.tuitionValue || 20000;
        const city = uni?.location?.split(",")[0]?.trim() || "";
        try {
          const estimate = await getCostEstimate(city, resolvedCountry, tuitionForEstimate);
          if (estimate) setCostEstimate(estimate);
        } catch (e) {
          console.warn("Cost estimate fetch failed:", e);
        }
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background }]} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cost Breakdown</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* University Card Placeholder */}
          <View style={[styles.uniCard, isDark && { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Skeleton width={48} height={48} borderRadius={8} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="60%" height={16} borderRadius={4} />
              <Skeleton width="40%" height={12} borderRadius={4} />
            </View>
          </View>

          {/* Summary Card Placeholder */}
          <View style={[styles.summaryCard, isDark && { backgroundColor: colors.card, borderColor: colors.border }, { padding: 20 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, gap: 10 }}>
                <Skeleton width="80%" height={16} borderRadius={4} />
                <Skeleton width="60%" height={24} borderRadius={6} />
                <Skeleton width={120} height={20} borderRadius={10} />
              </View>
              <View style={{ width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" }}>
                <Skeleton width={80} height={80} borderRadius={40} />
              </View>
            </View>
          </View>

          {/* Tab Control Placeholder */}
          <View style={{ flexDirection: "row", gap: 12, marginVertical: 20 }}>
            <Skeleton width={100} height={36} borderRadius={18} />
            <Skeleton width={100} height={36} borderRadius={18} />
            <Skeleton width={100} height={36} borderRadius={18} />
          </View>

          {/* Breakdown Items Placeholders */}
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map((key) => (
              <View
                key={key}
                style={{
                  height: 60,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Skeleton width={32} height={32} borderRadius={16} />
                  <Skeleton width={120} height={16} borderRadius={4} />
                </View>
                <Skeleton width={60} height={16} borderRadius={4} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const actualCountry = uniData?.country || currentCountry;

  // Use live exchange rate from cost estimate, fallback to static
  const USD_TO_NPR = costEstimate?.exchange_rate || 134;

  // Calculate values — use real breakdown if available
  const monthlyUsd = costData?.monthly_estimate_usd || costData?.monthlyEstimateUsd || 1500;
  const annualLivingUsd = costData?.annual_estimate_usd || costData?.annualEstimateUsd || monthlyUsd * 12;
  const tuitionUsd = uniData?.tuitionValue || 0;
  
  // Use real breakdown from API if available
  const breakdown = costData?.breakdown || {};
  const monthlyBreakdown = costData?.monthlyBreakdown || {};
  const annualRent = breakdown.rent || Math.round(monthlyUsd * 0.4 * 12);
  const annualFood = breakdown.food || Math.round(monthlyUsd * 0.25 * 12);
  const annualTransport = breakdown.transport || Math.round(monthlyUsd * 0.1 * 12);
  const annualInsurance = breakdown.insurance || Math.round(monthlyUsd * 0.05 * 12);
  const annualOther = breakdown.other || (annualLivingUsd - annualRent - annualFood - annualTransport - annualInsurance);

  const monthlyRent = monthlyBreakdown.rent || Math.round(annualRent / 12);
  const monthlyFood = monthlyBreakdown.food || Math.round(annualFood / 12);
  const monthlyTransport = monthlyBreakdown.transport || Math.round(annualTransport / 12);

  const totalFirstYearNpr = (tuitionUsd + annualLivingUsd) * USD_TO_NPR;
  const fmtNpr = (v: number) => {
     if (v >= 100000) return `NPR ${(v / 100000).toFixed(1)} Lakhs`;
     return `NPR ${v.toLocaleString()}`;
  };

  const fmtCurrency = (v: number) => v.toLocaleString();

  // ROI / QOI mapping — use real relocation index data
  const qualityOfLife = qoiData?.lifestyle || qoiData?.quality_of_life_index || "N/A";
  const safety = qoiData?.safety || qoiData?.safety_index || "N/A";
  const health = qoiData?.healthcare || qoiData?.health_care_index || "N/A";

  // Tab-dependent values
  let displayTotalTitle = "Total Estimated Cost (Year 1)";
  let displayTotalCost = totalFirstYearNpr;
  
  let tuitionLabel = "Annual Tuition";
  let tuitionValue = tuitionUsd * USD_TO_NPR;
  let tuitionSub = `$${tuitionUsd.toLocaleString()}`;

  let livingLabel = "Annual Total";
  let livingValue = annualLivingUsd * USD_TO_NPR;
  let livingSub = `$${annualLivingUsd.toLocaleString()}`;

  let rentLabel = "Rent (Annual)";
  let rentValue = annualRent * USD_TO_NPR;
  let rentSub = `$${annualRent.toLocaleString()}`;

  let foodLabel = "Food & Groceries (Annual)";
  let foodValue = annualFood * USD_TO_NPR;
  let foodSub = `$${annualFood.toLocaleString()}`;

  let isYearOnYear = activeTab === "Year on year";

  if (activeTab === "Month on month") {
    displayTotalTitle = "Total Estimated Cost (Per Month)";
    displayTotalCost = (tuitionUsd / 12 + monthlyUsd) * USD_TO_NPR;

    tuitionLabel = "Monthly Tuition (Pro-rata)";
    tuitionValue = (tuitionUsd / 12) * USD_TO_NPR;
    tuitionSub = `$${Math.round(tuitionUsd / 12).toLocaleString()}`;

    livingLabel = "Monthly Living Expenses";
    livingValue = monthlyUsd * USD_TO_NPR;
    livingSub = `$${monthlyUsd.toLocaleString()}`;

    rentLabel = "Rent (Monthly)";
    rentValue = monthlyRent * USD_TO_NPR;
    rentSub = `$${monthlyRent.toLocaleString()}`;

    foodLabel = "Food & Groceries (Monthly)";
    foodValue = monthlyFood * USD_TO_NPR;
    foodSub = `$${monthlyFood.toLocaleString()}`;
  } else if (activeTab === "Year on year") {
    displayTotalTitle = "Total Estimated Cost (3-Year Degree)";
    displayTotalCost = totalFirstYearNpr * 3.15; // Year 1 + Year 2 (1.05) + Year 3 (1.10)

    tuitionLabel = "3-Year Total Tuition";
    tuitionValue = tuitionUsd * 3.15 * USD_TO_NPR;
    tuitionSub = `$${Math.round(tuitionUsd * 3.15).toLocaleString()}`;

    livingLabel = "3-Year Living Expenses";
    livingValue = annualLivingUsd * 3.15 * USD_TO_NPR;
    livingSub = `$${Math.round(annualLivingUsd * 3.15).toLocaleString()}`;

    rentLabel = "3-Year Rent";
    rentValue = annualRent * 3.15 * USD_TO_NPR;
    rentSub = "Includes 5% annual inflation";

    foodLabel = "3-Year Food & Others";
    foodValue = annualFood * 3.15 * USD_TO_NPR;
    foodSub = "Includes 5% annual inflation";
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cost Breakdown</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <ProfileAvatar size={44} color={colors.border} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* University Card */}
        {uniData && (
          <View style={[styles.uniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {uniData.logo || uniData.image ? (
              <Image 
                source={{ uri: uniData.logo || uniData.image }} 
                style={[styles.uniLogo, { backgroundColor: isDark ? colors.border : "#F8FAFF" }]} 
              />
            ) : (
              <View style={[styles.uniLogoPlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="school" size={24} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.uniDetails}>
              <Text style={[styles.uniName, { color: colors.text }]} numberOfLines={1}>
                {uniData.name}
              </Text>
              <View style={styles.uniLocationRow}>
                <Ionicons name="location-sharp" size={14} color={THEME.primary} />
                <Text style={[styles.uniLocation, { color: colors.textSecondary }]}>
                  {uniData.location}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Summary Card */}
        <View style={[styles.summaryCard, isDark && { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>{displayTotalTitle}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{fmtNpr(displayTotalCost)}</Text>
              <View style={[styles.averageBadge, isDark && { backgroundColor: colors.border }]}>
                <View style={styles.orangeDot} />
                <Text style={styles.averageBadgeText}>{actualCountry} Average</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
               <View style={[styles.donutBase, { borderColor: colors.border }]}>
                  <View style={[styles.donutSegment, { borderColor: '#3B82F6', borderTopColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: '#10B981', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: '#F97316', borderTopColor: 'transparent', borderRightColor: 'transparent', width: 66, height: 66, top: -10, left: -10, transform: [{ rotate: '120deg' }] }]} />
               </View>
            </View>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryFooter}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.summaryFooterText, { color: colors.textSecondary }]}>Cost based on country, lifestyle, university.</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={[styles.tabsContainer, { borderColor: colors.border }]}>
          {["First year", "Year on year", "Month on month"].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === tab && { color: "#ffffff" }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Breakdown Sections */}
        <View style={styles.breakdownContainer}>

          {/* Year Breakdown (Tuition/Education) */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Tuition & Fees" 
              icon="wallet-outline" 
              color="#A3E635" 
              expanded={isExpanded("year-tuition")}
              onToggle={() => toggleSection("year-tuition")}
            />
            {isExpanded("year-tuition") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label={tuitionLabel} value={tuitionUsd > 0 ? fmtNpr(tuitionValue) : "N/A"} subValue={tuitionUsd > 0 ? tuitionSub : undefined} />
                <CostItem label="Study Level" value={uniData?.type || userData.studyLevel || "Masters"} />
                {isYearOnYear && (
                  <>
                    <CostItem label="Year 1 Tuition" value={tuitionUsd > 0 ? fmtNpr(tuitionUsd * USD_TO_NPR) : "N/A"} />
                    <CostItem label="Year 2 Tuition (Est)" value={tuitionUsd > 0 ? fmtNpr(tuitionUsd * 1.05 * USD_TO_NPR) : "N/A"} />
                    <CostItem label="Year 3 Tuition (Est)" value={tuitionUsd > 0 ? fmtNpr(tuitionUsd * 1.10 * USD_TO_NPR) : "N/A"} />
                  </>
                )}
                <Text style={[styles.footerInfoText, { color: colors.text }]}>Fees vary by course and university</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.primaryActionButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
             <Text style={styles.primaryActionText}>View All Study Cost</Text>
          </TouchableOpacity>

          {/* Year Breakdown (Living) */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Living Expenses" 
              icon="information-outline" 
              color="#A3E635" 
              expanded={isExpanded("year-living")}
              onToggle={() => toggleSection("year-living")}
            />
            {isExpanded("year-living") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label={livingLabel} value={fmtNpr(livingValue)} subValue={livingSub} />
                <CostItem label={rentLabel} value={fmtNpr(rentValue)} subValue={rentSub} />
                <CostItem label={foodLabel} value={fmtNpr(foodValue)} subValue={foodSub} />
                {isYearOnYear && (
                  <>
                    <CostItem label="Year 1 Living" value={fmtNpr(annualLivingUsd * USD_TO_NPR)} />
                    <CostItem label="Year 2 Living (Est)" value={fmtNpr(annualLivingUsd * 1.05 * USD_TO_NPR)} />
                    <CostItem label="Year 3 Living (Est)" value={fmtNpr(annualLivingUsd * 1.10 * USD_TO_NPR)} />
                  </>
                )}
                <Text style={[styles.footerInfoText, { color: colors.text }]}>Based on average {actualCountry} lifestyle</Text>
              </View>
            )}
          </View>

          {/* Total Monthly Cost */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Total Monthly Cost" 
              icon="calendar-outline" 
              color="#A3E635" 
              expanded={isExpanded("monthly")}
              onToggle={() => toggleSection("monthly")}
            />
            {isExpanded("monthly") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <View style={styles.compactMonthlyRow}>
                   <Text style={[styles.monthlyValueText, { color: colors.text }]}>{fmtNpr(monthlyUsd * USD_TO_NPR)} / month</Text>
                   <Text style={[styles.itemFooterText, { color: colors.textSecondary, marginTop: 4 }]}>Approx. ${monthlyUsd.toLocaleString()} USD</Text>
                </View>
              </View>
            )}
          </View>

          {/* ROI & Quality of Index */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="ROI & Quality Index" 
              icon="trending-up" 
              color={colors.primary} 
              expanded={isExpanded("roi")}
              onToggle={() => toggleSection("roi")}
            />
            {isExpanded("roi") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label="Quality of Life" value={String(qualityOfLife)} subValue="Index / 200" />
                <CostItem label="Safety Index" value={String(safety)} subValue="Index / 100" />
                <CostItem label="Health Care" value={String(health)} subValue="Index / 100" />
                <CostItem label="Purchasing Power" value={qoiData?.purchasing_power_index || "N/A"} subValue="Index" />
                <Text style={[styles.footerInfoText, { color: colors.text }]}>High index indicates better return on living</Text>
              </View>
            )}
          </View>

          {(() => {
            const isSaved = userData.selectedUniversities?.some(
              (u) => String(u.id) === String(id)
            );
            return (
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  {
                    backgroundColor: isSaved ? colors.textSecondary : colors.primary,
                    shadowColor: isSaved ? colors.textSecondary : colors.primary
                  }
                ]}
                onPress={() => {
                  if (isSaved) {
                    setUserData((prev) => ({
                      ...prev,
                      selectedUniversities: prev.selectedUniversities.filter(
                        (u) => String(u.id) !== String(id)
                      ),
                    }));
                  } else {
                    selectUniversity({
                      id: id as string,
                      name: uniData?.name || "University",
                      location: uniData?.location || actualCountry,
                      image: uniData?.image || "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=400",
                      course: uniData?.courses?.[0]?.name || "MSc Computer Science",
                      tuition: uniData?.tuition || "N/A",
                      tuitionValue: uniData?.tuitionValue,
                    });
                  }
                }}
              >
                <Text style={styles.primaryActionText}>
                  {isSaved ? "Saved to Profile" : "Save Plan"}
                </Text>
              </TouchableOpacity>
            );
          })()}

          {/* Pre-application Cost */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Pre-application Cost" 
              icon="information-outline" 
              color="#A3E635" 
              expanded={isExpanded("pre-app")}
              onToggle={() => toggleSection("pre-app")}
            />
            {isExpanded("pre-app") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label="Consultancy Fee" value="NPR 0 - 50,000" />
                <CostItem label="IELTS Test" value="NPR 27,000 - 30,000" />
                <CostItem label="Documents" value="NPR 27,000 - 30,000" />
                <CostItem label="Medical" value="NPR 27,000 - 30,000" />
                <CostItem label="Application Fees" value="NPR 27,000 - 30,000" />
              </View>
            )}
          </View>

          {/* Tuition Fees (Regional) */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Tuition Fees" 
              icon="school-outline" 
              color="#FB923C" 
              expanded={isExpanded("regional")}
              onToggle={() => toggleSection("regional")}
            />
            {isExpanded("regional") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label="USA/UK" value="NPR 17-44 Lakhs" subValue="per year" />
                <CostItem label="Canada/Australia" value="NPR 17-44 Lakhs" subValue="per year" />
                <CostItem label="Germany/Europe" value="NPR 17-44 Lakhs" subValue="per year" />
              </View>
            )}
          </View>

          {/* Visa & Government Costs */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Visa & Government Costs" 
              icon="card-account-details-outline" 
              color="#60A5FA" 
              expanded={isExpanded("visa")}
              onToggle={() => toggleSection("visa")}
            />
            {isExpanded("visa") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                <CostItem label="Visa Fee" value="NPR 1.5-5 Lakhs" subValue="Insurance - " />
                <CostItem label="Biometrics" value="" />
              </View>
            )}
          </View>

          {/* Travel & Setup */}
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader 
              title="Travel & Setup" 
              icon="airplane-takeoff" 
              color="#E879F9" 
              expanded={isExpanded("travel")}
              onToggle={() => toggleSection("travel")}
            />
            {isExpanded("travel") && (
              <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
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
  uniCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    backgroundColor: THEME.white,
    marginBottom: 16,
    gap: 12,
  },
  uniLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F8FAFF",
    resizeMode: "contain",
  },
  uniLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uniDetails: {
    flex: 1,
    justifyContent: "center",
  },
  uniName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 2,
  },
  uniLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uniLocation: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
});
