import React, { useState, useEffect } from "react";
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
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getUniversityDetails, searchUniversities, UniversityDetail, UniversityResult } from "../../lib/api";
import { useTheme } from "../context/ThemeContext";
import { Skeleton } from "../../components/Skeleton";

const { width } = Dimensions.get("window");

export default function CompareScreen() {
  const { id1, country1 } = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  // Selected Universities
  const [uni1, setUni1] = useState<UniversityDetail | null>(null);
  const [uni2, setUni2] = useState<UniversityDetail | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // Search Modal state
  const [activeSlot, setActiveSlot] = useState<"uni1" | "uni2" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UniversityResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Load Uni 1 on mount
  useEffect(() => {
    if (id1) {
      loadUniversity(id1 as string, (country1 as string) || "USA", "uni1");
    }
  }, [id1, country1]);

  const loadUniversity = async (id: string, country: string, slot: "uni1" | "uni2") => {
    if (slot === "uni1") setLoading1(true);
    else setLoading2(true);

    try {
      const details = await getUniversityDetails(id, country);
      if (slot === "uni1") setUni1(details);
      else setUni2(details);
    } catch (error) {
      console.error(`Error loading university detail for slot ${slot}:`, error);
    } finally {
      if (slot === "uni1") setLoading1(false);
      else setLoading2(false);
    }
  };

  // Perform Search
  const handleSearchTextChange = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUniversities(text, "All");
      setSearchResults(results || []);
    } catch (e) {
      console.warn("Search error:", e);
    } finally {
      setSearching(false);
    }
  };

  const selectUniversityForSlot = (item: UniversityResult) => {
    if (activeSlot) {
      loadUniversity(String(item.id), item.country || "USA", activeSlot);
    }
    // Reset search modal
    setActiveSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Helper parser for comparing ranks & tuitions
  const parseRank = (rankVal: any): number => {
    if (!rankVal) return 99999;
    const clean = String(rankVal).replace(/[^0-9]/g, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 99999 : parsed;
  };

  const parseTuition = (tuitionVal: any): number => {
    if (!tuitionVal) return 0;
    if (typeof tuitionVal === "number") return tuitionVal;
    const clean = String(tuitionVal).replace(/[^0-9]/g, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseAcceptance = (rate: any): number => {
    if (!rate) return 0;
    if (typeof rate === "number") return rate;
    const clean = String(rate).replace(/[^0-9]/g, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Compare winner calculation (lower rank, lower tuition, higher acceptance rate is better)
  const getWinner = (metric: "rank" | "tuition" | "acceptance"): "uni1" | "uni2" | "tie" | null => {
    if (!uni1 || !uni2) return null;

    if (metric === "rank") {
      const r1 = parseRank(uni1.ranking_world || uni1.rank);
      const r2 = parseRank(uni2.ranking_world || uni2.rank);
      if (r1 === r2) return "tie";
      return r1 < r2 ? "uni1" : "uni2";
    }

    if (metric === "tuition") {
      const t1 = parseTuition(uni1.tuitionValue || uni1.tuition);
      const t2 = parseTuition(uni2.tuitionValue || uni2.tuition);
      if (t1 === 0 || t2 === 0) return null;
      if (t1 === t2) return "tie";
      return t1 < t2 ? "uni1" : "uni2"; // Lower tuition is winning
    }

    if (metric === "acceptance") {
      const a1 = parseAcceptance(uni1.acceptanceRate);
      const a2 = parseAcceptance(uni2.acceptanceRate);
      if (a1 === a2) return "tie";
      return a1 > a2 ? "uni1" : "uni2"; // Higher acceptance rate is generally "easier/better"
    }

    return null;
  };

  const renderComparisonRow = (
    label: string,
    val1: string | React.ReactNode,
    val2: string | React.ReactNode,
    winner?: "uni1" | "uni2" | "tie" | null
  ) => {
    return (
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.tableLabelCol}>
          <Text style={[styles.tableLabelText, { color: colors.textSecondary }]}>{label}</Text>
        </View>
        <View 
          style={[
            styles.tableValCol, 
            winner === "uni1" && [styles.winnerCol, { backgroundColor: colors.primary + "10", borderColor: colors.primary }]
          ]}
        >
          {React.isValidElement(val1) ? (
            val1
          ) : (
            <Text style={[styles.tableValText, { color: colors.text }, winner === "uni1" && { fontWeight: "800", color: colors.primary }]} numberOfLines={2}>
              {val1 !== null && val1 !== undefined ? String(val1) : "-"}
            </Text>
          )}
        </View>
        <View 
          style={[
            styles.tableValCol, 
            winner === "uni2" && [styles.winnerCol, { backgroundColor: colors.primary + "10", borderColor: colors.primary }]
          ]}
        >
          {React.isValidElement(val2) ? (
            val2
          ) : (
            <Text style={[styles.tableValText, { color: colors.text }, winner === "uni2" && { fontWeight: "800", color: colors.primary }]} numberOfLines={2}>
              {val2 !== null && val2 !== undefined ? String(val2) : "-"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Compare Universities</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Cards for Universities */}
        <View style={styles.selectionRow}>
          
          {/* University 1 Card */}
          <TouchableOpacity 
            style={[styles.uniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setActiveSlot("uni1")}
            activeOpacity={0.8}
          >
            {loading1 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : uni1 ? (
              <View style={styles.uniCardContent}>
                <Image source={{ uri: uni1.logo || uni1.image }} style={styles.uniLogo} />
                <Text style={[styles.uniNameText, { color: colors.text }]} numberOfLines={2}>{uni1.name}</Text>
                <Text style={[styles.uniLocText, { color: colors.textSecondary }]} numberOfLines={1}>{uni1.location}</Text>
                <View style={styles.changeBadge}>
                  <Text style={styles.changeBadgeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptySelector}>
                <Ionicons name="add-circle-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptySelectorText, { color: colors.textSecondary }]}>Add University</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.vsBadge}>
            <Text style={styles.vsBadgeText}>VS</Text>
          </View>

          {/* University 2 Card */}
          <TouchableOpacity 
            style={[styles.uniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setActiveSlot("uni2")}
            activeOpacity={0.8}
          >
            {loading2 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : uni2 ? (
              <View style={styles.uniCardContent}>
                <Image source={{ uri: uni2.logo || uni2.image }} style={styles.uniLogo} />
                <Text style={[styles.uniNameText, { color: colors.text }]} numberOfLines={2}>{uni2.name}</Text>
                <Text style={[styles.uniLocText, { color: colors.textSecondary }]} numberOfLines={1}>{uni2.location}</Text>
                <View style={styles.changeBadge}>
                  <Text style={styles.changeBadgeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptySelector}>
                <Ionicons name="add-circle-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptySelectorText, { color: colors.textSecondary }]}>Add University</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Comparison Details Table */}
        {uni1 || uni2 ? (
          <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            {/* Table Header Row */}
            <View style={[styles.tableRow, styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
              <View style={styles.tableLabelCol}>
                <Text style={styles.headerLabelText}>Metric</Text>
              </View>
              <View style={styles.tableValCol}>
                <Text style={[styles.headerUniName, { color: colors.text }]} numberOfLines={1}>
                  {uni1 ? uni1.name : "Uni 1"}
                </Text>
              </View>
              <View style={styles.tableValCol}>
                <Text style={[styles.headerUniName, { color: colors.text }]} numberOfLines={1}>
                  {uni2 ? uni2.name : "Uni 2"}
                </Text>
              </View>
            </View>

            {/* Comparison Rows */}
            {renderComparisonRow(
              "Country",
              uni1 ? uni1.country : "-",
              uni2 ? uni2.country : "-"
            )}

            {renderComparisonRow(
              "World Rank",
              uni1 ? `# ${uni1.ranking_world || uni1.rank || "N/A"}` : "-",
              uni2 ? `# ${uni2.ranking_world || uni2.rank || "N/A"}` : "-",
              getWinner("rank")
            )}

            {renderComparisonRow(
              "Tuition (Avg)",
              uni1 ? (typeof uni1.tuition === "number" ? `$${uni1.tuition.toLocaleString()}/yr` : uni1.tuition) : "-",
              uni2 ? (typeof uni2.tuition === "number" ? `$${uni2.tuition.toLocaleString()}/yr` : uni2.tuition) : "-",
              getWinner("tuition")
            )}

            {renderComparisonRow(
              "Acceptance Rate",
              uni1 ? `${uni1.acceptanceRate}%` : "-",
              uni2 ? `${uni2.acceptanceRate}%` : "-",
              getWinner("acceptance")
            )}

            {renderComparisonRow(
              "Institution Type",
              uni1 ? uni1.type || "Public" : "-",
              uni2 ? uni2.type || "Public" : "-"
            )}

            {renderComparisonRow(
              "Established",
              uni1 ? uni1.established || "N/A" : "-",
              uni2 ? uni2.established || "N/A" : "-"
            )}

            {renderComparisonRow(
              "Students count",
              uni1 ? uni1.students || "N/A" : "-",
              uni2 ? uni2.students || "N/A" : "-"
            )}

            {renderComparisonRow(
              "Campus Type",
              uni1 ? uni1.campus || "N/A" : "-",
              uni2 ? uni2.campus || "N/A" : "-"
            )}
          </View>
        ) : (
          <View style={styles.infoBanner}>
            <Ionicons name="arrow-up-circle-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
              Add universities above to view comparison
            </Text>
          </View>
        )}
      </ScrollView>

      {/* University Selection Modal */}
      <Modal
        visible={activeSlot !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setActiveSlot(null);
          setSearchQuery("");
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.background }]} 
              onPress={() => {
                setActiveSlot(null);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose University
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Search Box */}
          <View style={styles.searchBarWrapper}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search university name..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchTextChange}
                autoFocus={true}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Search Results List */}
          {searching ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.resultItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectUniversityForSlot(item)}
                >
                  <Image source={{ uri: item.logo || item.image }} style={styles.resultLogo} />
                  <View style={styles.resultDetails}>
                    <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.resultLoc, { color: colors.textSecondary }]}>{item.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.centered}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {searchQuery ? "No universities found" : "Type above to search"}
                  </Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  uniCard: {
    flex: 1,
    height: 180,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  uniCardContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uniLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFF",
    resizeMode: "contain",
  },
  uniNameText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 6,
  },
  uniLocText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  changeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  changeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3B82F6",
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  vsBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  emptySelector: {
    alignItems: "center",
    gap: 8,
  },
  emptySelectorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tableContainer: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    backgroundColor: "transparent",
    paddingVertical: 14,
  },
  tableLabelCol: {
    width: 100,
    paddingLeft: 16,
    paddingVertical: 12,
  },
  tableValCol: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(226, 232, 240, 0.5)",
  },
  winnerCol: {
    borderWidth: 1,
    borderRadius: 8,
  },
  tableLabelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tableValText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  headerLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  headerUniName: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  infoBanner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  resultLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F8FAFF",
    resizeMode: "contain",
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  resultLoc: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
