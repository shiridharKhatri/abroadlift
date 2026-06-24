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
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#111827",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  border: "#E5E7EB",
  red: "#EF4444",
};

export default function ProfileTab() {
  const { userData, logout } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        
        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { justifyContent: "center", alignItems: "center", overflow: "hidden" }]}>
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="person" size={56} color={COLORS.textGray} />
            )}
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileUsername}>{userData.username}</Text>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push("/profile/edit")}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MY PREFERENCES</Text>
        </View>

        <View style={styles.preferencesContainer}>
          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>Target Country</Text>
                <Text style={styles.prefValue}>{userData.flag} {userData.country || "Not Set"}</Text>
            </View>
          </View>

          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <Ionicons name="school-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>Study Level</Text>
                <Text style={styles.prefValue}>{userData.studyLevel || "Not Set"}</Text>
            </View>
          </View>

          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>Field of Interest</Text>
                <Text style={styles.prefValue}>{userData.fieldOfStudy || "Not Set"}</Text>
            </View>
          </View>

          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <MaterialCommunityIcons name="certificate-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>Academics</Text>
                <Text style={styles.prefValue}>
                    {userData.recentAcademicField 
                        ? `${userData.recentAcademicField} • ${userData.cgpa} CGPA${userData.passoutYear ? ` • ${userData.passoutYear}` : ""}` 
                        : "Not Set"}
                </Text>
            </View>
          </View>

          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <Ionicons name="language-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>English Proficiency</Text>
                <Text style={styles.prefValue}>
                    {userData.testType === "Not Taken" 
                        ? (userData.englishLevel || "Not Set")
                        : (userData.score ? `${userData.testType}: ${userData.score}` : "Not Set")
                    }
                </Text>
            </View>
          </View>

          <View style={styles.prefItem}>
            <View style={styles.prefIconBox}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefTextContent}>
                <Text style={styles.prefLabel}>Intake & Aid</Text>
                <Text style={styles.prefValue}>
                    {userData.intake || "Not Set"} {userData.scholarshipNeeded ? "• Financial Aid Needed" : ""}
                </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={[styles.menuContainer, { marginTop: 32 }]}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Saved Universities</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <Text style={[styles.menuItemText, { color: COLORS.red }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  profileTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textGray,
    letterSpacing: 1.5,
  },
  preferencesContainer: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 20,
  },
  prefItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  prefIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prefTextContent: {
    flex: 1,
  },
  prefLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textGray,
    marginBottom: 2,
  },
  prefValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
});
