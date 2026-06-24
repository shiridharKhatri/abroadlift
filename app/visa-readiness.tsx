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
  const [expandedSections, setExpandedSections] = React.useState<string[]>(["profile-1", "risks", "profile-2"]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isExpanded = (id: string) => expandedSections.includes(id);

  const SectionHeader = ({ title, icon, color, iconBg, onToggle, expanded }: { title: string; icon: any; color: string; iconBg: string; onToggle: () => void; expanded: boolean }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.sectionTitleText}>{title}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const AnalysisItem = ({ label, type }: { label: string; type: 'success' | 'warning' }) => (
    <View style={styles.analysisItemRow}>
      <View style={styles.analysisIconWrap}>
        {type === 'success' ? (
          <View style={[styles.statusIcon, { backgroundColor: COLORS.green }]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        ) : (
          <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
        )}
      </View>
      <Text style={styles.analysisItemText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 30) + 10 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visa Readiness</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <ProfileAvatar size={44} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollInner, { paddingBottom: 40 + insets.bottom }]}
      >
        
        {/* Readiness Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>Visa Readiness Score</Text>
              <Text style={styles.summaryValue}>60% - Needs Work</Text>
              <View style={styles.averageBadge}>
                <View style={styles.orangeDot} />
                <Text style={styles.averageBadgeText}>Average Cost</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
               <View style={styles.donutBase}>
                  <View style={[styles.donutSegment, { borderColor: COLORS.primary, borderTopColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: COLORS.orange, borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-45deg' }] }]} />
                  <View style={[styles.donutSegment, { borderColor: '#14B8A6', borderTopColor: 'transparent', borderRightColor: 'transparent', width: 66, height: 66, top: -10, left: -10, transform: [{ rotate: '120deg' }] }]} />
               </View>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryFooter}>
             <View style={styles.footerIconItem}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.footerIconText}>Financial Strength</Text>
             </View>
             <View style={styles.footerIconItem}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.footerIconText}>Documents</Text>
             </View>
             <View style={styles.footerIconItem}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.footerIconText}>Country Rules</Text>
             </View>
          </View>
        </View>

        {/* Breakdown Sections */}
        <View style={styles.breakdownContainer}>

           {/* Profile Analysis (Blue) */}
           <View style={styles.sectionBox}>
             <SectionHeader 
                title="Profile Analysis" 
                icon="person-outline" 
                color="#3B82F6" 
                iconBg="#DBEAFE" 
                onToggle={() => toggleSection("profile-1")}
                expanded={isExpanded("profile-1")}
             />
             {isExpanded("profile-1") && (
               <View style={styles.sectionBody}>
                 <AnalysisItem label="Strong Academics" type="success" />
                 <AnalysisItem label="Good Study Plan" type="success" />
                 <AnalysisItem label="Financial Proof Weak" type="warning" />
                 <AnalysisItem label="Low Bank Balance" type="warning" />
               </View>
             )}
           </View>

           {/* Risk Factors (Orange) */}
           <View style={styles.sectionBox}>
             <SectionHeader 
                title="Risk Factors" 
                icon="warning-outline" 
                color="#D97706" 
                iconBg="#FEF3C7" 
                onToggle={() => toggleSection("risks")}
                expanded={isExpanded("risks")}
             />
             {isExpanded("risks") && (
               <View style={styles.sectionBody}>
                 <AnalysisItem label="Insufficient Bank Balance" type="warning" />
                 <AnalysisItem label="Weak Financial Document" type="warning" />
                 <AnalysisItem label="No Sponsor Proof" type="warning" />
               </View>
             )}
           </View>

           {/* Profile Analysis (Green) */}
           <View style={styles.sectionBox}>
             <SectionHeader 
                title="Profile Analysis" 
                icon="checkmark-circle-outline" 
                color="#059669" 
                iconBg="#D1FAE5" 
                onToggle={() => toggleSection("profile-2")}
                expanded={isExpanded("profile-2")}
             />
             {isExpanded("profile-2") && (
               <View style={styles.sectionBody}>
                 <AnalysisItem label="Financial Proof" type="success" />
                 <AnalysisItem label="Academics" type="success" />
                 <AnalysisItem label="Country Rules" type="success" />
                 <AnalysisItem label="Documents" type="warning" />
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
