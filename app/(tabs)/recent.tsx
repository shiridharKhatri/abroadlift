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
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#004be3",
  secondary: "#1A8A99",
  textDark: "#111827",
  textGray: "#6B7280",
  bgSubtle: "#F8FAFF",
  white: "#FFFFFF",
};

export default function RecentUniversities() {
  const { userData } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      
      <View style={styles.header}>
        <Text style={styles.title}>Recent Universities</Text>
        <Text style={styles.subtitle}>Track your previous selections and cost estimates</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {(userData.selectedUniversities || []).length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
                <Feather name="clock" size={40} color={THEME.textGray} />
            </View>
            <Text style={styles.emptyTitle}>No Recent Selections</Text>
            <Text style={styles.emptySubtitle}>Universities you select during setup or search will appear here for quick reference.</Text>
            <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => router.push("/search")}
            >
                <Text style={styles.browseButtonText}>Browse Universities</Text>
            </TouchableOpacity>
          </View>
        ) : (
          (userData.selectedUniversities || []).map((uni, index) => (
            <TouchableOpacity 
              key={`${uni.id}-${index}`} 
              activeOpacity={0.9} 
              style={styles.card}
              onPress={() => router.push(`/university/${uni.id}`)}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: uni.image }} style={styles.cardImage} />
                <View style={styles.overlay}>
                    <View style={styles.costBadge}>
                        <Text style={styles.costValue}>{uni.tuition}</Text>
                        <Text style={styles.costLabel}>Est. Tuition</Text>
                    </View>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.uniMainInfo}>
                    <Text style={styles.uniName}>{uni.name}</Text>
                    <Text style={styles.courseName}>{uni.course}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={14} color={THEME.textGray} />
                        <Text style={styles.footerText}>{uni.location}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.viewDetailsBtn}
                        onPress={() => router.push("/university/cost-breakdown")}
                    >
                        <Text style={styles.viewDetailsText}>View Cost</Text>
                        <Feather name="chevron-right" size={14} color={THEME.primary} />
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textGray,
    lineHeight: 20,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    height: 140,
    width: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-end",
    padding: 16,
  },
  costBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  costValue: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.textDark,
  },
  costLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textGray,
    textTransform: "uppercase",
  },
  cardInfo: {
    padding: 16,
  },
  uniMainInfo: {
    marginBottom: 16,
  },
  uniName: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textGray,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.primary,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  browseButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: "800",
  },
});
