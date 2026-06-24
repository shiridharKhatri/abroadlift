import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { getUniversityDetails, UniversityDetail, getCostOfLiving } from "../../lib/api";
import { ActivityIndicator } from "react-native";

const { width, height } = Dimensions.get("window");

const THEME = {
  primary: "#33BFFF", 
  secondary: "#004be3",
  textDark: "#111827",
  textGray: "#6B7280",
  bgLight: "#F8FAFF",
  orange: "#F59E0B",
  blue: "#3B82F6",
  green: "#10B981",
  white: "#FFFFFF",
  purple: "#6366F1",
};

const UNIVERSITIES: Record<string, any> = {
  "1": {
    title: "University of Melbourne",
    location: "Melbourne, Australia",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
    description: "The University of Melbourne is one of Australia's leading research universities, known for academic excellence and global reputation.",
    type: "Public Research",
    established: "1853",
    campus: "Parkville",
    students: "50,000+",
  },
  "2": {
    title: "University of Toronto",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    description: "The University of Toronto is a globally top-ranked public research university in Canada, offering world-class innovation and learning programs.",
    type: "Public Research",
    established: "1827",
    campus: "St. George",
    students: "60,000+",
  },
  "3": {
    title: "Stanford University",
    location: "Stanford, USA",
    image: "https://images.unsplash.com/photo-1533667586627-9f5cb393304a?auto=format&fit=crop&q=80&w=800",
    description: "Located in the heart of Silicon Valley, Stanford University is recognized as one of the world's leading research and teaching institutions. It offers unmatched opportunities for tech innovation.",
    type: "Private Research",
    established: "1885",
    campus: "Suburban",
    students: "17,000+",
  },
};

const TABS = ["Estimates", "Overview", "Rankings", "Courses & Fees"];

export default function UniversityDetails() {
  const { id, country: countryParam, name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { userData, selectUniversity } = useUser();
  
  // Resolve the actual country to use for API and display
  const currentCountry = (countryParam && countryParam !== "undefined") 
    ? (countryParam as string) 
    : (userData.country || "UK");
  const [selectedTab, setSelectedTab] = useState("Estimates");
  const [courseSearch, setCourseSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uniData, setUniData] = useState<UniversityDetail | null>(null);
  const [costData, setCostData] = useState<any>(null);

  const USD_TO_NPR = 134;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [data, cost] = await Promise.all([
          getUniversityDetails(id as string, currentCountry),
          getCostOfLiving(currentCountry)
        ]);
        if (mounted) {
          setUniData(data);
          setCostData(cost);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading uni details/cost:", error);
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, currentCountry]);

  const fallback = UNIVERSITIES["3"];
  const details = {
    title: uniData?.name || (name as string) || fallback.title,
    location: uniData?.location || fallback.location,
    image: uniData?.image || fallback.image, 
    description: uniData?.description || fallback.description,
    type: uniData?.type || fallback.type,
    established: uniData?.established || fallback.established,
    campus: uniData?.campus || fallback.campus,
    students: uniData?.students || fallback.students,
    ranking_world: uniData?.ranking_world || "N/A",
    ranking_national: uniData?.ranking_national || "N/A",
    fee_usd: uniData?.tuitionValue || 65000,
  };

  const renderEstimates = () => {
    const tuitionUsd = details.fee_usd || 20000;
    const livingUsd = (costData?.monthly_estimate_usd || 1500) * 12;
    const totalNpr = (tuitionUsd + livingUsd) * USD_TO_NPR;

    const fmtNpr = (v: number) => {
        if (v >= 100000) return `NPR ${(v / 100000).toFixed(1)} Lakhs`;
        return `NPR ${v.toLocaleString()}`;
    };

    return (
    <View style={styles.tabContent}>
      <View style={styles.estimateCard}>
        <Text style={styles.estimateLabel}>ESTIMATED TOTAL COST / YR</Text>
        <Text style={styles.estimateValue}>{fmtNpr(totalNpr)}</Text>
        <Text style={{ fontSize: 13, color: THEME.textGray, marginBottom: 16, fontWeight: "600" }}>
           Approx. ${(tuitionUsd + livingUsd).toLocaleString()} USD
        </Text>
        <View style={styles.costBar}>
          <View style={[styles.costSegment, { width: `${(tuitionUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: '#6366F1' }]} />
          <View style={[styles.costSegment, { width: `${(livingUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: '#FBBF24' }]} />
          <View style={[styles.costSegment, { width: '5%', backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.costLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.legendText}>Tuition</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
            <Text style={styles.legendText}>Living</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Other</Text>
          </View>
        </View>
      </View>

      <View style={styles.chancesCard}>
        <Text style={styles.chancesTitle}>Your Chances</Text>
        <View style={styles.chancesVisual}>
          <View style={styles.circularProgress}>
            <View style={[styles.circularFill, { transform: [{ rotate: '45deg' }] }]} />
            <View style={styles.circularInner}>
              <Text style={styles.percentageText}>12%</Text>
            </View>
          </View>
          <Text style={styles.admissionLabel}>Admission</Text>
        </View>
        <Text style={styles.chancesDescription}>
          Based on your profile, you have a <Text style={{ fontWeight: '800' }}>low chance</Text> of admission. Improve your test scores to increase odds.
        </Text>
        <TouchableOpacity 
          style={styles.completeEstimateBtn}
          onPress={() => router.push({
            pathname: "/university/cost-breakdown",
            params: { id: id, country: currentCountry }
          })}
        >
          <Text style={styles.completeEstimateBtnText}>Get Complete Cost Breakdown</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name="book-outline" size={18} color={THEME.purple} />
        </View>
        <Text style={styles.contentSectionTitle}>About University</Text>
      </View>
      <View style={styles.overviewTextCard}>
        <Text style={styles.overviewText}>{details.description}</Text>
        {uniData?.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>ADMISSION NOTES</Text>
            <Text style={styles.notesText}>{uniData.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name="star-outline" size={18} color={THEME.orange} />
        </View>
        <Text style={styles.contentSectionTitle}>Highlights</Text>
      </View>
      <View style={styles.highlightItem}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={12} color={THEME.blue} />
        </View>
        <Text style={styles.highlightText}>#1 in Computer Science</Text>
      </View>
      <View style={styles.highlightItem}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={12} color={THEME.blue} />
        </View>
        <Text style={styles.highlightText}>Silicon Valley Network</Text>
      </View>
      <View style={styles.highlightItem}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={12} color={THEME.blue} />
        </View>
        <Text style={styles.highlightText}>High Employability</Text>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name="gift-outline" size={18} color={THEME.orange} />
        </View>
        <Text style={styles.contentSectionTitle}>Scholarships</Text>
      </View>
      
      {uniData?.scholarships && uniData.scholarships.length > 0 ? (
        uniData.scholarships.map((s, idx) => (
          <View key={idx} style={styles.scholarshipCard}>
            <View style={styles.scholarshipHeader}>
               <Text style={styles.scholarshipName}>{s.name}</Text>
               <Text style={styles.scholarshipValue}>{s.value}</Text>
            </View>
            {s.eligibility && (
              <Text style={styles.scholarshipElig}>
                <Text style={{ fontWeight: '700' }}>Eligibility: </Text>{s.eligibility}
              </Text>
            )}
            {s.notes && (
              <Text style={styles.scholarshipNotes}>{s.notes}</Text>
            )}
            {s.type && (
              <View style={[styles.typeBadge, { backgroundColor: s.type === 'merit' ? '#FEF3C7' : '#DCFCE7' }]}>
                <Text style={[styles.typeBadgeText, { color: s.type === 'merit' ? '#D97706' : '#166534' }]}>{s.type.toUpperCase()}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.noScholarshipBox}>
          <Text style={styles.noScholarshipText}>Check university website for latest scholarships.</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name="business-outline" size={18} color={THEME.blue} />
        </View>
        <Text style={styles.contentSectionTitle}>Key Facts</Text>
      </View>
      <View style={styles.keyFactsGrid}>
        <View style={styles.factCard}>
          <View style={styles.factIconBox}>
            <MaterialCommunityIcons name="office-building" size={20} color="#BF90FF" />
          </View>
          <Text style={styles.factLabel}>TYPE</Text>
          <Text style={styles.factValue}>{details.type}</Text>
        </View>
        <View style={styles.factCard}>
          <View style={styles.factIconBox}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.factLabel}>ESTABLISHED</Text>
          <Text style={styles.factValue}>{details.established}</Text>
        </View>
        <View style={styles.factCard}>
          <View style={styles.factIconBox}>
            <Ionicons name="location-outline" size={20} color="#F43F5E" />
          </View>
          <Text style={styles.factLabel}>CAMPUS</Text>
          <Text style={styles.factValue}>{details.campus}</Text>
        </View>
        <View style={styles.factCard}>
          <View style={styles.factIconBox}>
            <Ionicons name="people-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.factLabel}>STUDENTS</Text>
          <Text style={styles.factValue}>{details.students}</Text>
        </View>
      </View>
    </View>
  );

  const renderRankings = () => (
    <View style={styles.tabContent}>
      <View style={styles.rankingGlobalCard}>
        <View style={styles.globalHeader}>
          <View style={styles.medalIcon}>
            <Ionicons name="ribbon" size={24} color="#FBBF24" />
          </View>
          <View>
            <Text style={styles.globalRatingTitle}>Global Excellence</Text>
            <Text style={styles.globalRatingSub}>Top ranked globally</Text>
          </View>
        </View>
        <View style={styles.globalRanksRow}>
           <View style={styles.rankSubCard}>
             <Text style={styles.rankAgency}>QS WORLD</Text>
             <Text style={styles.rankNumber}>#{details.ranking_world}</Text>
             <Text style={styles.rankScope}>Global</Text>
          </View>
          <View style={styles.rankSubCard}>
             <Text style={styles.rankAgency}>NATIONAL</Text>
             <Text style={styles.rankNumber}>#{details.ranking_national}</Text>
             <Text style={styles.rankScope}>National</Text>
          </View>
        </View>
        <View style={styles.ribbonOverlay}>
           <Ionicons name="ribbon-outline" size={140} color="rgba(255,255,255,0.15)" />
        </View>
      </View>

      <View style={styles.nationalRankCard}>
         <View style={styles.nationalIconBox}>
            <Ionicons name="location" size={24} color={THEME.blue} />
         </View>
         <View style={{ flex: 1 }}>
            <View style={styles.nationalRow}>
               <Text style={styles.nationalLabel}>NATIONAL RANK</Text>
               <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>Top Tier</Text>
               </View>
            </View>
            <Text style={styles.nationalValue}>#2 USA <Text style={styles.nationalSub}>in Country</Text></Text>
         </View>
      </View>
    </View>
  );

  const renderCourses = () => (
    <View style={styles.tabContent}>
      <View style={styles.courseSearchWrapper}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput 
          placeholder="Search Courses..." 
          style={styles.courseInput}
          placeholderTextColor="#94A3B8"
          value={courseSearch}
          onChangeText={setCourseSearch}
        />
      </View>

      {(uniData?.courses?.length ? uniData.courses.map(c => ({
          name: c.name,
          duration: c.level.join(", ") || "Unknown",
          mode: "Full-time",
          fee: c.fee || (details.fee_usd ? `$${details.fee_usd.toLocaleString()}/yr` : "Unknown"),
          category: c.category.toUpperCase() || "GENERAL"
      })) : [
        { name: "MSc Computer Science", duration: "2 Years", mode: "Full-time", fee: "$62,000/yr", category: "ENGINEERING" },
        { name: "MBA", duration: "2 Years", mode: "Full-time", fee: "$75,000/yr", category: "BUSINESS" },
        { name: "MSc Data Science", duration: "1.5 Years", mode: "Full-time", fee: "$58,000/yr", category: "ENGINEERING" },
      ]).map((course, idx) => (
        <View key={idx} style={styles.courseCard}>
          <View style={styles.courseCardHeader}>
            <Text style={styles.courseName}>{course.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: course.category === 'ENGINEERING' ? '#DBEAFE' : '#E0E7FF' }]}>
              <Text style={[styles.categoryText, { color: course.category === 'ENGINEERING' ? '#2563EB' : '#4338CA' }]}>{course.category}</Text>
            </View>
          </View>
          <View style={styles.courseDetails}>
            <View style={styles.courseDetailItem}>
              <Ionicons name="time-outline" size={16} color="#94A3B8" />
              <Text style={styles.courseDetailText}>{course.duration}</Text>
            </View>
            <View style={styles.courseDetailItem}>
              <Ionicons name="briefcase-outline" size={16} color="#94A3B8" />
              <Text style={styles.courseDetailText}>{course.mode}</Text>
            </View>
          </View>
          <Text style={styles.tuitionLabel}>Tuition Fee</Text>
          <View style={styles.tuitionRow}>
            <Text style={styles.tuitionValue}>{course.fee}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ marginTop: 12, color: THEME.textGray, fontWeight: "600" }}>Loading University Details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: details.image }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />
          
          <View style={[styles.bannerHeader, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.headerCircleBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <View style={styles.headerRightBtns}>
              <TouchableOpacity style={styles.headerCircleBtn}>
                <Ionicons name="share-social-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerCircleBtn}>
                <Ionicons name="heart-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerCircleBtn}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <ProfileAvatar size={40} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bannerBottomInfo}>
            <Text style={styles.uniTitle}>{details.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={styles.locationText}>{details.location}</Text>
            </View>
          </View>
        </View>

        {/* Sticky Tab Bar */}
        <View style={styles.tabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {TABS.map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabItem, selectedTab === tab && styles.activeTabItem]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content Area */}
        <View style={styles.mainContent}>
          {selectedTab === "Estimates" && renderEstimates()}
          {selectedTab === "Overview" && renderOverview()}
          {selectedTab === "Rankings" && renderRankings()}
          {selectedTab === "Courses & Fees" && renderCourses()}
        </View>

        {/* Action Button */}
        <View style={styles.bottomActionWrap}>
          <TouchableOpacity 
            style={styles.shortlistBtn}
            onPress={() => {
              selectUniversity({
                id: id as string,
                name: details.title,
                location: details.location,
                image: details.image,
                course: uniData?.courses?.[0]?.name || "MSc Computer Science",
              });
              router.push("/(tabs)/explore");
            }}
          >
            <Text style={styles.shortlistBtnText}>Shortlist University</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  bannerContainer: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bannerHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerRightBtns: {
    flexDirection: "row",
    gap: 8,
  },
  profileBtnImage: {
    width: "100%",
    height: "100%",
  },
  bannerBottomInfo: {
    position: "absolute",
    bottom: 16,
    left: 20,
  },
  uniTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "white",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    opacity: 0.9,
  },
  tabBarWrapper: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabScroll: {
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTabItem: {
    borderBottomColor: THEME.blue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
  },
  activeTabText: {
    color: THEME.blue,
  },
  mainContent: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  estimateCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  estimateLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 12,
  },
  estimateValue: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 12,
  },
  costBar: {
    height: 10,
    width: "100%",
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 20,
  },
  costSegment: {
    height: "100%",
  },
  costLegend: {
    flexDirection: "row",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  chancesCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chancesTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 12,
  },
  chancesVisual: {
    alignItems: "center",
    marginBottom: 24,
  },
  circularProgress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  circularFill: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#EF4444",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.textDark,
  },
  admissionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 8,
  },
  chancesDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  completeEstimateBtn: {
    backgroundColor: "#EFF6FF",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  completeEstimateBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.blue,
  },
  circularInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textDark,
  },
  overviewTextCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 28,
  },
  overviewText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#475569",
    fontWeight: "500",
  },
  notesBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.orange,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    lineHeight: 20,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  keyFactsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  factCard: {
    width: (width - 64) / 2,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  factIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  factLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 4,
  },
  factValue: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.textDark,
  },
  scholarshipCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  scholarshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  scholarshipName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
  },
  scholarshipValue: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.green,
  },
  scholarshipElig: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
    lineHeight: 18,
  },
  scholarshipNotes: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  noScholarshipBox: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 24,
    alignItems: "center",
  },
  noScholarshipText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  rankingGlobalCard: {
    backgroundColor: THEME.blue,
    borderRadius: 32,
    padding: 28,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  globalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
    zIndex: 10,
  },
  medalIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  globalRatingTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "white",
  },
  globalRatingSub: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
    fontWeight: "600",
  },
  globalRanksRow: {
    flexDirection: "row",
    gap: 16,
    zIndex: 10,
  },
  rankSubCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rankAgency: {
    fontSize: 10,
    fontWeight: "800",
    color: "white",
    opacity: 0.9,
    marginBottom: 6,
  },
  rankNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginBottom: 2,
  },
  rankScope: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
  },
  ribbonOverlay: {
    position: "absolute",
    right: -20,
    bottom: -20,
    opacity: 0.4,
  },
  nationalRankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 20,
  },
  nationalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  nationalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nationalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
  },
  tierBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tierText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.blue,
  },
  nationalValue: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.textDark,
  },
  nationalSub: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  courseSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  courseInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textDark,
  },
  courseCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  courseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.textDark,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "900",
  },
  courseDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  courseDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  courseDetailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tuitionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
  },
  tuitionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tuitionValue: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
  },
  bottomActionWrap: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  shortlistBtn: {
    backgroundColor: THEME.blue,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: THEME.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  shortlistBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
});
