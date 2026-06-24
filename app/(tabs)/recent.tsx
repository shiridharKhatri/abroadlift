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
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#1A8A99",
  secondary: "#004be3",
  textDark: "#0F172A",
  textGray: "#64748B",
  bgLight: "#F8FAFC",
  white: "#FFFFFF",
  blue: "#3B82F6",
  green: "#10B981",
  divider: "#F1F5F9",
};

export default function RecentUniversities() {
  const { userData } = useUser();
  const selectedList = userData.selectedUniversities || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>Saved</Text>
          {selectedList.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedList.length} SAVED</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Track your selected institutions and estimate your costs</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {selectedList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="heart" size={36} color={THEME.textGray} />
            </View>
            <Text style={styles.emptyTitle}>Your saved list is empty</Text>
            <Text style={styles.emptySubtitle}>
              Universities you save during setup or search will appear here for quick access and comparing estimates.
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/search")}
            >
              <Text style={styles.browseButtonText}>Explore Universities</Text>
              <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ) : (
          selectedList.map((uni, index) => (
            <TouchableOpacity 
              key={`${uni.id}-${index}`} 
              activeOpacity={0.95} 
              style={styles.card}
              onPress={() => router.push(`/university/${uni.id}`)}
            >
              {/* Card Image Cover */}
              <View style={styles.cardHeader}>
                <Image source={{ uri: uni.image }} style={styles.cardImage} />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.costBadge}>
                  <Text style={styles.costValue}>{uni.tuition || "$25,000 / yr"}</Text>
                  <Text style={styles.costLabel}>EST. TUITION</Text>
                </View>
              </View>

              {/* Card Contents */}
              <View style={styles.cardInfo}>
                <View style={styles.uniMainInfo}>
                  <Text style={styles.uniName}>{uni.name}</Text>
                  {uni.course ? (
                    <View style={styles.courseRow}>
                      <View style={styles.courseIndicator} />
                      <Text style={styles.courseName} numberOfLines={1}>{uni.course}</Text>
                    </View>
                  ) : null}
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="location-outline" size={15} color={THEME.textGray} />
                    <Text style={styles.footerText}>{uni.location}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewDetailsBtn}
                    onPress={() => router.push({
                      pathname: "/university/cost-breakdown",
                      params: { id: uni.id, country: uni.location.split(",")[1]?.trim() || "Canada" }
                    })}
                  >
                    <Text style={styles.viewDetailsText}>View Cost</Text>
                    <Feather name="arrow-right" size={14} color={THEME.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textDark,
    letterSpacing: -0.8,
  },
  countBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.blue,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textGray,
    lineHeight: 20,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  cardHeader: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  costBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  costValue: {
    fontSize: 13,
    fontWeight: "900",
    color: THEME.textDark,
  },
  costLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textGray,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  cardInfo: {
    padding: 18,
  },
  uniMainInfo: {
    marginBottom: 16,
  },
  uniName: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 6,
    lineHeight: 22,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  courseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.blue,
  },
  courseName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textGray,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.textGray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: "500",
  },
  browseButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  browseButtonText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: "800",
  },
});
