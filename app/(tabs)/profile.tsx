import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

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
  red: "#EF4444",
  divider: "#F1F5F9",
  cardBg: "#FFFFFF",
};

export default function ProfileTab() {
  const { userData, logout } = useUser();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);
  const [showThemeModal, setShowThemeModal] = React.useState(false);

  const handleEditPress = () => {
    router.push("/profile/edit");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
        <TouchableOpacity
          style={[styles.settingsHeaderBtn, { backgroundColor: colors.card }]}
          onPress={handleEditPress}
        >
          <Feather name="edit-3" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Profile Card / Header Box */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarInner, { borderColor: colors.primary, backgroundColor: colors.background }]}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
                  <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : "S"}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]} onPress={handleEditPress}>
              <Feather name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>{userData.name || "New Student"}</Text>
          <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>{userData.username || "@student"}</Text>

          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary + "15" }]} onPress={handleEditPress}>
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Preferences Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>STUDY PREFERENCES</Text>
        </View>

        <View style={styles.grid}>
          {/* Target Country */}
          <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
              <Ionicons name="location-outline" size={18} color={isDark ? colors.primary : THEME.blue} />
            </View>
            <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>Target Country</Text>
            <Text style={[styles.prefValue, { color: colors.text }]} numberOfLines={1}>
              {userData.flag ? `${userData.flag} ` : ""}{userData.country || "Not Set"}
            </Text>
          </View>

          {/* Study Level */}
          <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#ECFDF5" }]}>
              <Ionicons name="school-outline" size={18} color={isDark ? colors.secondary : THEME.green} />
            </View>
            <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>Study Level</Text>
            <Text style={[styles.prefValue, { color: colors.text }]} numberOfLines={1}>
              {userData.studyLevel || "Not Set"}
            </Text>
          </View>

          {/* Field of Interest */}
          <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#F5F3FF" }]}>
              <Ionicons name="book-outline" size={18} color={isDark ? colors.primary : "#8B5CF6"} />
            </View>
            <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>Field of Interest</Text>
            <Text style={[styles.prefValue, { color: colors.text }]} numberOfLines={1}>
              {userData.fieldOfStudy || "Not Set"}
            </Text>
          </View>

          {/* English Proficiency */}
          <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#FEF3C7" }]}>
              <Ionicons name="language-outline" size={18} color={isDark ? colors.secondary : "#D97706"} />
            </View>
            <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>English Score</Text>
            <Text style={[styles.prefValue, { color: colors.text }]} numberOfLines={1}>
              {userData.testType && userData.testType !== "Not Taken"
                ? `${userData.testType}: ${userData.score || "N/A"}`
                : userData.englishLevel || "Not Set"}
            </Text>
          </View>

          {/* Academics */}
          <View style={[styles.gridCard, { width: "100%", backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowLayout}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#FFF1F2" }]}>
                <MaterialCommunityIcons name="certificate-outline" size={20} color={isDark ? colors.primary : THEME.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>Academics</Text>
                <Text style={[styles.prefValue, { color: colors.text }]}>
                  {userData.recentAcademicField
                    ? `${userData.recentAcademicField} • ${userData.cgpa} CGPA${userData.passoutYear ? ` (${userData.passoutYear})` : ""}`
                    : "Not Set"}
                </Text>
              </View>
            </View>
          </View>

          {/* Intake & Aid */}
          <View style={[styles.gridCard, { width: "100%", backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowLayout}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? "#1E293B" : "#F0FDF4" }]}>
                <Ionicons name="calendar-outline" size={18} color={isDark ? colors.secondary : "#15803D"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefLabel, { color: colors.textSecondary }]}>Intake & Aid</Text>
                <Text style={[styles.prefValue, { color: colors.text }]}>
                  {userData.intake || "Not Set"} {userData.scholarshipNeeded ? "• Financial Aid Requested" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu/Quick Links */}
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/(tabs)/recent")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Saved Universities</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowNotificationsModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="color-palette-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>App Theme</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: "700", textTransform: "capitalize" }}>
                {themeMode === "system" ? "System Default" : themeMode}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/profile/edit")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Account Settings</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={logout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={THEME.red} />
              <Text style={[styles.menuItemText, { color: THEME.red }]}>Log Out</Text>
            </View>
            <Feather name="chevron-right" size={16} color={THEME.red} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotificationsModal}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              <TouchableOpacity
                style={[styles.modalCloseCircle, { backgroundColor: colors.card }]}
                onPress={() => setShowNotificationsModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.notificationsList}>
              <View style={[styles.notificationItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.notifIconBox, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                  <Ionicons name="sparkles-outline" size={18} color={isDark ? colors.primary : THEME.blue} />
                </View>
                <View style={styles.notifTextContent}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>Welcome to AbroadLift!</Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]}>Start exploring universities and building your roadmap today.</Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary }]}>Just now</Text>
                </View>
              </View>

              <View style={[styles.notificationItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.notifIconBox, { backgroundColor: isDark ? "#1E293B" : "#FEF3C7" }]}>
                  <Ionicons name="person-outline" size={18} color={isDark ? colors.secondary : "#D97706"} />
                </View>
                <View style={styles.notifTextContent}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>Complete Your Profile</Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]}>Add your academic grades and English scores to estimate admission chances.</Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary }]}>2 hours ago</Text>
                </View>
              </View>

              <View style={[styles.notificationItem, { borderBottomWidth: 0 }]}>
                <View style={[styles.notifIconBox, { backgroundColor: isDark ? "#1E293B" : "#ECFDF5" }]}>
                  <Ionicons name="bookmark-outline" size={18} color={isDark ? colors.primary : THEME.green} />
                </View>
                <View style={styles.notifTextContent}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>Shortlist Updated</Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]}>Conestoga College - Doon has been successfully added to your shortlist.</Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary }]}>Yesterday</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Theme Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showThemeModal}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
              <TouchableOpacity
                style={[styles.modalCloseCircle, { backgroundColor: colors.card }]}
                onPress={() => setShowThemeModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { id: "light", label: "Light Mode", icon: "sunny-outline" },
                { id: "dark", label: "Dark Mode", icon: "moon-outline" },
                { id: "system", label: "System Default", icon: "phone-portrait-outline" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeOptionRow,
                    { backgroundColor: colors.card, borderColor: themeMode === opt.id ? colors.primary : colors.border }
                  ]}
                  onPress={() => {
                    setThemeMode(opt.id as any);
                    setShowThemeModal(false);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Ionicons name={opt.icon as any} size={20} color={colors.text} />
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{opt.label}</Text>
                  </View>
                  {themeMode === opt.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textDark,
    letterSpacing: -0.5,
  },
  settingsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.divider,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: THEME.primary,
    padding: 3,
    backgroundColor: THEME.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.primary,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: THEME.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textGray,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: THEME.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textGray,
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  gridCard: {
    width: (width - 52) / 2,
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.divider,
    borderRadius: 20,
    padding: 16,
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  prefLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textGray,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  prefValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.textDark,
  },
  menuGroup: {
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.divider,
    borderRadius: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textDark,
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
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notifTextContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    color: THEME.textGray,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: "600",
  },
  themeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
});
