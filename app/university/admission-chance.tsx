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
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { ProfileAvatar } from "../../components/ProfileAvatar";

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
      <Text style={styles.analysisLabel}>{label}: <Text style={styles.analysisValueText}>{value}</Text></Text>
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
              <Text style={styles.summaryValue}>75% <Text style={styles.summaryStatus}>- Moderate</Text></Text>
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
            <Text style={styles.summaryFooterText}>Opportunity for some universities. Room for improve.</Text>
          </View>
        </View>

        {/* Profile Analysis */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>Your Profile Analysis</Text>
            <Feather name="chevron-up" size={20} color={THEME.textGray} />
          </View>
          <View style={styles.sectionBody}>
            <AnalysisItem label="CGPA" value="Strong (3.5/4.0)" status="success" />
            <AnalysisItem label="IELTS" value="Need improvement (6.0)" status="warning" />
            <AnalysisItem label="Course Competitiveness" value="" status="success" />
          </View>
        </View>

        {/* Key Admission Factors */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>Key Admission Factors</Text>
            <Feather name="chevron-down" size={20} color={THEME.textGray} />
          </View>
          <View style={styles.sectionBody}>
            <FactorItem label="CGPA" icon="star" iconType="feather" />
            <FactorItem label="IELTS Score" icon="checkmark-circle-outline" iconType="ionicons" />
            <FactorItem label="Course Competitiveness" icon="target" iconType="material" />
          </View>
        </View>

        {/* Universities By Risk Level */}
        <Text style={styles.riskTitle}>Universities By Risk Level</Text>
        <View style={styles.riskTabs}>
          <TouchableOpacity style={[styles.riskTab, styles.riskTabActive]}>
            <Text style={styles.riskTabTextActive}>Safe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.riskTab}>
            <Text style={styles.riskTabText}>Moderate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.riskTab}>
            <Text style={styles.riskTabText}>Ambitious</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.uniCardsScroll}>
          <View style={styles.uniCard}>
            <View style={styles.uniImageContainer}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=400" }}
                style={styles.uniImage}
              />
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>85% Match</Text>
              </View>
            </View>
            <View style={styles.uniCardContent}>
              <Text style={styles.uniCardName}>University of Melbourne</Text>
              <View style={styles.uniLocationRow}>
                <Ionicons name="location" size={14} color={THEME.orange} />
                <Text style={styles.uniLocationText}>Melbourne, Australia</Text>
              </View>
              <View style={styles.uniCostRow}>
                <Text style={styles.uniCostValue}>NPR 20,500,00<Text style={styles.uniCostUnit}>/ year</Text></Text>
                <View style={styles.safeBadge}>
                  <Text style={styles.safeText}>Safe</Text>
                </View>
              </View>
              <View style={styles.uniActions}>
                <TouchableOpacity style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compareBtn}>
                  <Text style={styles.compareBtnText}>Compare</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.uniCard}>
            <View style={styles.uniImageContainer}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400" }}
                style={styles.uniImage}
              />
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>72% Match</Text>
              </View>
            </View>
            <View style={styles.uniCardContent}>
              <Text style={styles.uniCardName}>University of Toronto</Text>
              <View style={styles.uniLocationRow}>
                <Ionicons name="location" size={14} color={THEME.orange} />
                <Text style={styles.uniLocationText}>Toronto, Canada</Text>
              </View>
              <View style={styles.uniCostRow}>
                <Text style={styles.uniCostValue}>NPR 11,500,00<Text style={styles.uniCostUnit}>/ year</Text></Text>
                <View style={[styles.safeBadge, { backgroundColor: "#DCFCE7" }]}>
                  <Text style={[styles.safeText, { color: THEME.green }]}>Safe</Text>
                </View>
              </View>
              <View style={styles.uniActions}>
                <TouchableOpacity style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compareBtn}>
                  <Text style={styles.compareBtnText}>Compare</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

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
  profileImage: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 10,
    fontWeight: "900",
    color: THEME.green,
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
});
