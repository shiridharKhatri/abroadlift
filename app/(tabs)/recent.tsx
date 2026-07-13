import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 - 12) / 2;

export default function RecentUniversities() {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useUser();
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const selectedList = userData.selectedUniversities || [];

  const removeUniversity = (id: string) => {
    Alert.alert(
      "Remove University",
      "Are you sure you want to remove this university from your saved list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setUserData({
              ...userData,
              selectedUniversities: selectedList.filter((u) => u.id !== id),
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: (insets.top || StatusBar.currentHeight || 24) + 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {selectedList.length > 0
                ? `${selectedList.length} ${selectedList.length === 1 ? "university" : "universities"} saved`
                : "Track your selected institutions"}
            </Text>
          </View>

          {/* View Toggle */}
          {selectedList.length > 0 && (
            <View
              style={[
                styles.viewToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  viewMode === "list" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode("list")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="list"
                  size={15}
                  color={viewMode === "list" ? "#fff" : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  viewMode === "grid" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode("grid")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="grid"
                  size={15}
                  color={viewMode === "grid" ? "#fff" : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedList.length === 0 ? (
          /* ── Empty State ── */
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Ionicons name="heart-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No saved universities
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Universities you save during setup or search will appear here.
            </Text>
            <TouchableOpacity
              style={[
                styles.browseButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => router.push("/(tabs)/search")}
              activeOpacity={0.85}
            >
              <Text style={styles.browseButtonText}>Find Universities</Text>
              <Feather
                name="arrow-right"
                size={15}
                color="white"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
        ) : viewMode === "list" ? (
          /* ── LIST VIEW ── */
          <>
            {selectedList.map((uni, index) => (
              <TouchableOpacity
                key={`${uni.id}-${index}`}
                style={[
                  styles.listCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push(`/university/${uni.id}`)}
                activeOpacity={0.7}
              >
                {/* Top: Logo + Info */}
                <View style={styles.listTop}>
                  <View
                    style={[
                      styles.logoBox,
                      {
                        backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {uni.logo ? (
                      <Image
                        source={{ uri: uni.logo }}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="school"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>

                  <View style={styles.listMainInfo}>
                    <Text
                      style={[styles.uniName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {uni.name}
                    </Text>
                    {uni.course ? (
                      <Text
                        style={[
                          styles.uniCourse,
                          { color: colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {uni.course}
                      </Text>
                    ) : null}
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.locationText,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {uni.location}
                      </Text>
                    </View>
                  </View>

                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeUniversity(uni.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Bottom: Tuition + Actions */}
                <View
                  style={[
                    styles.listBottom,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Tuition
                      </Text>
                      <Text
                        style={[styles.statValue, { color: colors.text }]}
                      >
                        {uni.tuition || "N/A"}
                      </Text>
                    </View>
                    {uni.rank && uni.rank !== "N/A" && (
                      <View style={styles.statItem}>
                        <Text
                          style={[
                            styles.statLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Rank
                        </Text>
                        <Text
                          style={[styles.statValue, { color: colors.text }]}
                        >
                          #{uni.rank}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.costBtn,
                      { backgroundColor: colors.primary + "15" },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/university/cost-breakdown",
                        params: {
                          id: uni.id,
                          country:
                            uni.location.split(",")[1]?.trim() || "Canada",
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.costBtnText, { color: colors.primary }]}
                    >
                      Cost Breakdown
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          /* ── GRID VIEW ── */
          <View style={styles.gridContainer}>
            {selectedList.map((uni, index) => (
              <TouchableOpacity
                key={`${uni.id}-${index}`}
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push(`/university/${uni.id}`)}
                activeOpacity={0.7}
              >
                {/* Remove dot */}
                <TouchableOpacity
                  style={[
                    styles.gridRemoveBtn,
                    { backgroundColor: colors.border },
                  ]}
                  onPress={() => removeUniversity(uni.id)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="close" size={11} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Logo */}
                <View
                  style={[
                    styles.gridLogoBox,
                    {
                      backgroundColor: isDark ? "#2C2C2E" : "#F8FAFC",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {uni.logo ? (
                    <Image
                      source={{ uri: uni.logo }}
                      style={styles.gridLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="school" size={28} color={colors.primary} />
                  )}
                </View>

                <Text
                  style={[styles.gridUniName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {uni.name}
                </Text>

                <View style={styles.gridLocRow}>
                  <Ionicons
                    name="location-outline"
                    size={10}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.gridLocText,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {uni.location}
                  </Text>
                </View>

                {/* Tuition pill */}
                <View
                  style={[
                    styles.gridTuitionPill,
                    { backgroundColor: colors.primary + "12" },
                  ]}
                >
                  <Text
                    style={[styles.gridTuitionText, { color: colors.primary }]}
                    numberOfLines={1}
                  >
                    {uni.tuition || "N/A"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.gridCostBtn,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/university/cost-breakdown",
                      params: {
                        id: uni.id,
                        country:
                          uni.location.split(",")[1]?.trim() || "Canada",
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.gridCostBtnText}>Cost Breakdown</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Quick action: Add more ── */}
        {selectedList.length > 0 && (
          <TouchableOpacity
            style={[
              styles.addMoreBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(tabs)/search")}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addMoreText, { color: colors.primary }]}>
              Add More Universities
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  // ── Toggle ──
  viewToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  viewToggleBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },

  // ── LIST CARD ──
  listCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  listTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: { width: "100%", height: "100%" },
  listMainInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  uniName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  uniCourse: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  listBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statRow: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {},
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  costBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  costBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── GRID ──
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    overflow: "hidden",
  },
  gridRemoveBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  gridLogoBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  gridLogo: { width: "100%", height: "100%" },
  gridUniName: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
    marginBottom: 5,
  },
  gridLocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  gridLocText: {
    fontSize: 10,
    flex: 1,
  },
  gridTuitionPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  gridTuitionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  gridCostBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  gridCostBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Add More ──
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Empty State ──
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
