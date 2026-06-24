import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  red: "#EF4444",
  divider: "#F1F5F9",
  cardBg: "#FFFFFF",
};

export default function ProfileTab() {
  const { userData, logout } = useUser();

  const handleEditPress = () => {
    router.push("/profile/edit");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.settingsHeaderBtn}
          onPress={handleEditPress}
        >
          <Feather name="edit-3" size={20} color={THEME.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Profile Card / Header Box */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInner}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : "S"}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.avatarEditBadge} onPress={handleEditPress}>
              <Feather name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{userData.name || "New Student"}</Text>
          <Text style={styles.profileUsername}>{userData.username || "@student"}</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <Feather name="chevron-right" size={14} color={THEME.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Preferences Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STUDY PREFERENCES</Text>
        </View>

        <View style={styles.grid}>
          {/* Target Country */}
          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="location-outline" size={18} color={THEME.blue} />
            </View>
            <Text style={styles.prefLabel}>Target Country</Text>
            <Text style={styles.prefValue} numberOfLines={1}>
              {userData.flag ? `${userData.flag} ` : ""}{userData.country || "Not Set"}
            </Text>
          </View>

          {/* Study Level */}
          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="school-outline" size={18} color={THEME.green} />
            </View>
            <Text style={styles.prefLabel}>Study Level</Text>
            <Text style={styles.prefValue} numberOfLines={1}>
              {userData.studyLevel || "Not Set"}
            </Text>
          </View>

          {/* Field of Interest */}
          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="book-outline" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.prefLabel}>Field of Interest</Text>
            <Text style={styles.prefValue} numberOfLines={1}>
              {userData.fieldOfStudy || "Not Set"}
            </Text>
          </View>

          {/* English Proficiency */}
          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="language-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.prefLabel}>English Score</Text>
            <Text style={styles.prefValue} numberOfLines={1}>
              {userData.testType && userData.testType !== "Not Taken"
                ? `${userData.testType}: ${userData.score || "N/A"}`
                : userData.englishLevel || "Not Set"}
            </Text>
          </View>

          {/* Academics */}
          <View style={[styles.gridCard, { width: "100%" }]}>
            <View style={styles.rowLayout}>
              <View style={[styles.iconBox, { backgroundColor: "#FFF1F2" }]}>
                <MaterialCommunityIcons name="certificate-outline" size={20} color={THEME.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Academics</Text>
                <Text style={styles.prefValue}>
                  {userData.recentAcademicField 
                    ? `${userData.recentAcademicField} • ${userData.cgpa} CGPA${userData.passoutYear ? ` (${userData.passoutYear})` : ""}` 
                    : "Not Set"}
                </Text>
              </View>
            </View>
          </View>

          {/* Intake & Aid */}
          <View style={[styles.gridCard, { width: "100%" }]}>
            <View style={styles.rowLayout}>
              <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="calendar-outline" size={18} color="#15803D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Intake & Aid</Text>
                <Text style={styles.prefValue}>
                  {userData.intake || "Not Set"} {userData.scholarshipNeeded ? "• Financial Aid Requested" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu/Quick Links */}
        <View style={styles.menuGroup}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/recent")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={20} color={THEME.textDark} />
              <Text style={styles.menuItemText}>Saved Universities</Text>
            </View>
            <Feather name="chevron-right" size={16} color={THEME.textGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={THEME.textDark} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Feather name="chevron-right" size={16} color={THEME.textGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={20} color={THEME.textDark} />
              <Text style={styles.menuItemText}>Account Settings</Text>
            </View>
            <Feather name="chevron-right" size={16} color={THEME.textGray} />
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
    paddingBottom: 40,
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
});
