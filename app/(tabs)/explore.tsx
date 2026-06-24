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
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { searchUniversities, calculateAcceptanceChance, UniversityResult } from "../../lib/api";
import { useFocusEffect } from "@react-navigation/native";

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
  { id: "france", name: "France", flag: "🇫🇷" },
  { id: "japan", name: "Japan", flag: "🇯🇵" },
  { id: "italy", name: "Italy", flag: "🇮🇹" },
  { id: "korea", name: "Korea", flag: "🇰🇷" },
  { id: "india", name: "India", flag: "🇮🇳" },
];

export default function DashboardScreen() {
  const { userData, setUserData } = useUser();
  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<'options' | 'country'>('options');
  const [recommendedUnis, setRecommendedUnis] = React.useState<UniversityResult[]>([]);
  const [estimatedCost, setEstimatedCost] = React.useState<string>("--");
  const [acceptanceChance, setAcceptanceChance] = React.useState<string>("--");
  const [visaReadiness, setVisaReadiness] = React.useState<string>("--");
  const [loadingUnis, setLoadingUnis] = React.useState(true);

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

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      const load = async () => {
        try {
          setLoadingUnis(true);
          const { getCostOfLiving } = require("../../lib/api");
          
          const [results, costData] = await Promise.all([
            searchUniversities("", userData.country || "UK"),
            getCostOfLiving(userData.country || "UK")
          ]);

          if (mounted) {
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

            setRecommendedUnis(filtered.slice(0, 5));
            
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hi, {userData.name || "user"} 👋</Text>
          <Text style={styles.subGreetingText}>Here's your abroad study overview</Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={THEME.textDark} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <ProfileAvatar size={44} color="#E2E8F0" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Study Plan Card */}
        <TouchableOpacity 
          style={styles.studyPlanCard}
          onPress={() => setShowPlanModal(true)}
        >
          <View style={styles.studyPlanInfo}>
            <Text style={styles.flagEmoji}>{userData.flag || "🗺️"}</Text>
            <View style={styles.studyPlanTextWrapper}>
                <Text style={styles.studyPlanLabel}>Study Plan <Text style={styles.studyCountry}>{userData.country || "Select country"}</Text></Text>
            </View>
          </View>
          <View style={styles.editButton}>
            <Feather name="edit-2" size={14} color={THEME.blue} />
            <Text style={styles.editText}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
           {/* Estimated Cost Card */}
           <View style={styles.statCard}>
              <View>
                <View style={styles.statIconHeader}>
                  <View style={[styles.statIconBox, { backgroundColor: "#F3F4F6" }]}>
                    <MaterialCommunityIcons name="currency-usd" size={20} color={THEME.textDark} />
                  </View>
                  <Text style={styles.statTitle}>Estimated Cost</Text>
                </View>
                <Text style={styles.statValue}>{estimatedCost} <Text style={styles.statUnit}>/ year</Text></Text>
                <View style={styles.statBadge}>
                  <View style={styles.affordableDot} />
                  <Text style={styles.statBadgeText}>Affordable</Text>
                </View>
                <Text style={styles.statSubtitle}>Tuition + Living</Text>
              </View>
              <TouchableOpacity 
                style={[styles.statButton, { backgroundColor: THEME.green }]}
                onPress={() => router.push({
                  pathname: "/university/cost-breakdown",
                  params: { country: userData.country || "UK" }
                })}
              >
                <Text style={styles.statButtonText}>View Breakdown</Text>
              </TouchableOpacity>
           </View>

            {/* Admission Chances Card */}
            <View style={styles.statCard}>
               <View>
                 <View style={styles.statIconHeader}>
                   <View style={[styles.statIconBox, { backgroundColor: "#FFF7ED" }]}>
                     <MaterialCommunityIcons name="target" size={20} color={THEME.orange} />
                   </View>
                   <Text style={styles.statTitle}>Acceptance Chance</Text>
                 </View>
                 <Text style={styles.statValue}>{acceptanceChance}</Text>
                 
                 <View style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={16} color={THEME.green} />
                    <Text style={styles.checkText}>Good GPA</Text>
                 </View>
                 <View style={styles.checkRow}>
                    <Ionicons name="warning" size={16} color={THEME.orange} />
                    <Text style={styles.checkText}>Improve IELTS</Text>
                 </View>
               </View>

               <TouchableOpacity 
                 style={[styles.statButton, { backgroundColor: THEME.orange }]}
                 onPress={() => router.push("/university/admission-chance")}
               >
                 <Text style={styles.statButtonText}>Set Goals</Text>
               </TouchableOpacity>
            </View>

            {/* Visa Readiness Card */}
            <View style={styles.statCard}>
               <View>
                 <View style={styles.statIconHeader}>
                   <View style={[styles.statIconBox, { backgroundColor: THEME.secondary }]}>
                     <Text style={styles.visaIconText}>VISA</Text>
                   </View>
                   <Text style={styles.statTitle}>Visa Readiness</Text>
                 </View>
                 <Text style={styles.statValue}>{visaReadiness}</Text>
                 
                 <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFull, { width: "60%", backgroundColor: THEME.blue }]} />
                 </View>

                 <View style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={16} color={THEME.green} />
                    <Text style={styles.checkText}>Strong Academics</Text>
                 </View>
                 <View style={styles.checkRow}>
                    <Ionicons name="warning" size={16} color={THEME.orange} />
                    <Text style={styles.checkText}>Financial Proof Weak</Text>
                 </View>
               </View>

               <TouchableOpacity 
                 style={[styles.statButton, { backgroundColor: THEME.blue }]}
                 onPress={() => router.push("/visa-readiness")}
               >
                 <Text style={styles.statButtonText}>Improve</Text>
               </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Improve Your Chances Banner */}
        <View style={styles.improveBanner}>
           <View style={styles.improveContent}>
              <View style={styles.improveTitleRow}>
                 <Ionicons name="sparkles" size={18} color={THEME.orange} />
                 <Text style={styles.improveTitle}>Improve Your Chances</Text>
              </View>
              <Text style={styles.improveSubtitle} numberOfLines={2}>Get personalized steps to boost your success.</Text>
              <TouchableOpacity 
                 style={styles.viewPlanButton}
                 onPress={() => router.push("/university/admission-chance")}
              >
                <Text style={styles.viewPlanButtonText}>View Plan</Text>
              </TouchableOpacity>
           </View>
           <View style={styles.imageFadeContainer}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80" }} 
                style={styles.improveImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "#FDF5E1"]}
                start={{ x: 1, y: 0.5 }}
                end={{ x: 0, y: 0.5 }}
                style={styles.fadeOverlay}
              />
           </View>
        </View>

        {/* Recommended Universities */}
        <View style={styles.sectionHeader}>
           <View>
            <Text style={styles.sectionTitle}>Recommended Universities</Text>
            <Text style={styles.sectionSubtitle}>Based on your profile & budget</Text>
           </View>
           <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={styles.seeAllText}>See All</Text>
           </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.uniCardsScroll}>
           {loadingUnis ? (
             <View style={{ width: width - 40, height: 280, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator size="large" color={THEME.blue} />
               <Text style={{ marginTop: 12, color: THEME.textGray }}>Loading recommendations...</Text>
             </View>
           ) : recommendedUnis.length > 0 ? recommendedUnis.map((uni, idx) => (
             <TouchableOpacity 
               key={uni.id || idx} 
               style={styles.uniCard}
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
                   <Text style={styles.uniCardName} numberOfLines={1}>{uni.name}</Text>
                   <View style={styles.uniLocationRow}>
                      <Ionicons name="location" size={14} color={THEME.orange} />
                      <Text style={styles.uniLocationText} numberOfLines={1}>{uni.location}</Text>
                   </View>
                   <View style={styles.uniCostRow}>
                      <Text style={styles.uniCostValue}>{uni.tuition}<Text style={styles.uniCostUnit}>/ year</Text></Text>
                      <View style={[styles.safeBadge, { backgroundColor: uni.acceptanceRate && uni.acceptanceRate > 50 ? "#DCFCE7" : "#FFF7ED" }]}>
                          <Text style={[styles.safeText, { color: uni.acceptanceRate && uni.acceptanceRate > 50 ? THEME.green : THEME.orange }]}>
                            {uni.acceptanceRate && uni.acceptanceRate > 50 ? "Safe" : "Moderate"}
                          </Text>
                      </View>
                   </View>
                   <View style={styles.uniActions}>
                      <TouchableOpacity style={styles.saveBtn}>
                          <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.compareBtn}
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
               <Text style={{ color: THEME.textGray }}>No recommendations found for {userData.country}</Text>
             </View>
           )}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginBottom: 16 }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
           <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIconBox, { backgroundColor: "#E0F2FE" }]}>
                <Ionicons name="search" size={20} color={THEME.blue} />
              </View>
              <Text style={styles.quickActionText}>Compare Universities</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIconBox, { backgroundColor: "#F5F3FF" }]}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>View Documents</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIconBox, { backgroundColor: "#DCFCE7" }]}>
                <MaterialCommunityIcons name="bullseye-arrow" size={20} color={THEME.green} />
              </View>
              <Text style={styles.quickActionText}>Improve My Chances</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIconBox, { backgroundColor: "#FFEDD5" }]}>
                <Ionicons name="bookmark" size={20} color={THEME.orange} />
              </View>
              <Text style={styles.quickActionText}>Saved Universities</Text>
           </TouchableOpacity>
        </View>

        {/* Global Search Bar */}
        <View style={styles.globalSearchContainer}>
          <View style={styles.globalSearchBar}>
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput 
              placeholder="Search university or courses" 
              style={styles.globalSearchInput}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <TouchableOpacity style={styles.filterBtnSmall}>
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

      </ScrollView>

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
           <View style={[styles.modalContent, modalStep === 'country' && { height: '80%' }]}>
             <View style={styles.modalIndicator} />
             
             {modalStep === 'options' ? (
               <>
                 <Text style={styles.modalTitle}>Update Study Plan</Text>
                 <Text style={styles.modalSubtitle}>What would you like to update first?</Text>

                 <View style={styles.modalOptions}>
                   <TouchableOpacity 
                     style={styles.modalOption}
                     onPress={() => setModalStep('country')}
                   >
                     <View style={[styles.modalOptionIcon, { backgroundColor: "#E0F2FE" }]}>
                       <Ionicons name="globe-outline" size={24} color={THEME.blue} />
                     </View>
                     <View style={styles.modalOptionTextWrapper}>
                       <Text style={styles.modalOptionTitle}>Change Destination</Text>
                       <Text style={styles.modalOptionDesc}>Current: {userData.flag} {userData.country}</Text>
                     </View>
                     <Feather name="chevron-right" size={20} color="#CBD5E1" />
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={styles.modalOption}
                     onPress={() => {
                       setShowPlanModal(false);
                       router.push("/search");
                     }}
                   >
                     <View style={[styles.modalOptionIcon, { backgroundColor: "#F3F4F6" }]}>
                       <Ionicons name="business-outline" size={24} color={THEME.textDark} />
                     </View>
                     <View style={styles.modalOptionTextWrapper}>
                       <Text style={styles.modalOptionTitle}>Find University</Text>
                       <Text style={styles.modalOptionDesc}>Search universities in {userData.country}</Text>
                     </View>
                     <Feather name="chevron-right" size={20} color="#CBD5E1" />
                   </TouchableOpacity>
                 </View>
               </>
             ) : (
               <>
                 <View style={styles.modalHeaderRow}>
                   <TouchableOpacity onPress={() => setModalStep('options')}>
                     <Feather name="chevron-left" size={24} color={THEME.textDark} />
                   </TouchableOpacity>
                   <Text style={styles.modalTitle}>Select Destination</Text>
                   <View style={{ width: 24 }} />
                 </View>
                 <Text style={styles.modalSubtitle}>Where do you want to study?</Text>

                 <ScrollView showsVerticalScrollIndicator={false}>
                   <View style={styles.modalGrid}>
                     {COUNTRIES.map((c) => (
                       <TouchableOpacity 
                         key={c.id}
                         style={[
                           styles.modalCountryItem,
                           userData.country === c.name && styles.modalCountrySelected
                         ]}
                         onPress={() => {
                           setShowPlanModal(false); setModalStep('options'); router.push({ pathname: "/search", params: { pendingCountry: c.name, pendingFlag: c.flag } });
                           setModalStep('options');
                         }}
                       >
                         <Text style={styles.modalCountryFlag}>{c.flag}</Text>
                         <Text style={styles.modalCountryName}>{c.name}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 </ScrollView>
               </>
             )}

             <TouchableOpacity 
               style={styles.modalCloseBtn}
               onPress={() => {
                 setShowPlanModal(false);
                 setModalStep('options');
               }}
             >
               <Text style={styles.modalCloseBtnText}>Close</Text>
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
    paddingBottom: 40,
  },
  studyPlanCard: {
    marginHorizontal: 20,
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  studyPlanInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagEmoji: {
    fontSize: 20,
    width: 32,
    height: 32,
    textAlign: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    lineHeight: 32,
  },
  studyPlanTextWrapper: {
  },
  studyPlanLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textDark,
  },
  studyCountry: {
    color: THEME.blue,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.blue,
  },
  statsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statCard: {
    width: 200,
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
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
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  statButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.white,
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
  improveBanner: {
    height: 160,
    marginHorizontal: 20,
    backgroundColor: "#FDF5E1",
    borderRadius: 24,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  improveContent: {
    flex: 1,
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
    fontWeight: "900",
    color: "#92400E",
  },
  improveSubtitle: {
    fontSize: 13,
    color: "#B45309",
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: "500",
  },
  improveBullets: {
    marginBottom: 20,
    gap: 4,
  },
  bulletItem: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  viewPlanButton: {
    backgroundColor: THEME.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: THEME.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewPlanButtonText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: "800",
  },
  imageFadeContainer: {
    width: 140,
    position: "relative",
  },
  improveImage: {
    width: "100%",
    height: "100%",
  },
  fadeOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 40,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
});
