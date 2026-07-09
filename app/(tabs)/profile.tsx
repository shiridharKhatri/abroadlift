import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#1A8A99",
  secondary: "#004be3",
  red: "#EF4444",
};

const COUNTRY_CODES: Record<string, string> = {
  "usa": "us",
  "united states": "us",
  "uk": "gb",
  "united kingdom": "gb",
  "canada": "ca",
  "korea": "kr",
  "south korea": "kr",
  "netherlands": "nl",
  "nether": "nl",
  "brazil": "br",
  "germany": "de",
  "india": "in",
  "australia": "au",
  "france": "fr",
  "japan": "jp",
  "italy": "it",
  "ireland": "ie",
  "malta": "mt"
};

const getFlagUrl = (countryName: string | undefined) => {
  const normalized = (countryName || "").toLowerCase().trim();
  const code = COUNTRY_CODES[normalized];
  if (!code) return null;
  return `https://flagcdn.com/w160/${code}.png`;
};

export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useUser();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);
  const [showThemeModal, setShowThemeModal] = React.useState(false);

  const handleEditPress = () => {
    router.push("/profile/edit");
  };

  const getDynamicNotifications = () => {
    // simplified for brevity
    return [
      {
        id: "welcome",
        icon: "sparkles-outline",
        title: `Welcome, ${userData.name || "Student"}!`,
        body: "Start exploring universities and building your roadmap today.",
        time: "Just now"
      }
    ];
  };

  const dynamicNotifications = getDynamicNotifications();

  const PreferenceRow = ({ label, value, flag, onPress, hideBorder }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[styles.prefRow, !hideBorder && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
      <Text style={[styles.prefLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.prefValueContainer}>
        {flag && getFlagUrl(flag) && (
          <Image 
            source={{ uri: getFlagUrl(flag)! }} 
            style={styles.flagIcon}
            resizeMode="cover"
          />
        )}
        <Text style={[styles.prefValue, { color: colors.textSecondary }]} numberOfLines={2}>
          {value || "Not Set"}
        </Text>
        <Feather name="chevron-right" size={18} color={colors.border} style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Clean Header */}
      <View style={[styles.header, { paddingTop: (insets.top || StatusBar.currentHeight || 24) + 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Minimal Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderLeft}>
            <View style={[styles.avatarInner, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : "S"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileNameBox}>
              <Text style={[styles.profileName, { color: colors.text }]}>{userData.name || "New Student"}</Text>
              <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>{userData.username || "@student"}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={handleEditPress}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Study Preferences List */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>STUDY OVERVIEW</Text>
          <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <PreferenceRow 
              label="Target Country" 
              value={userData.country} 
              flag={userData.country} 
              onPress={() => router.push("/setup/country?edit=true")}
            />
            <PreferenceRow 
              label="Study Level" 
              value={userData.studyLevel} 
              onPress={() => router.push("/setup/study-level?edit=true")}
            />
            <PreferenceRow 
              label="Field of Study" 
              value={userData.fieldOfStudy} 
              onPress={() => router.push("/setup/field-of-study?edit=true")}
            />
            <PreferenceRow 
              label="English Proficiency" 
              value={userData.testType && userData.testType !== "Not Taken" ? `${userData.testType}: ${userData.score}` : userData.englishLevel} 
              onPress={() => router.push("/setup/english-test?edit=true")}
            />
            <PreferenceRow 
              label="Academic Background" 
              value={userData.recentAcademicField ? `${userData.recentAcademicField}\n${userData.cgpa} CGPA (${userData.passoutYear})` : "Not Set"} 
              onPress={() => router.push("/setup/academics?edit=true")}
            />
            <PreferenceRow 
              label="Intake & Aid" 
              value={`${userData.intake || "Not Set"}${userData.scholarshipNeeded ? "\nFinancial Aid Requested" : ""}`} 
              onPress={() => router.push("/setup/target?edit=true")}
              hideBorder
            />
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SETTINGS</Text>
          <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/(tabs)/recent")}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Saved Universities</Text>
              <Feather name="chevron-right" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => setShowNotificationsModal(true)}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
              <View style={styles.menuValueBox}>
                {dynamicNotifications.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: THEME.primary }]}>
                    <Text style={styles.badgeText}>{dynamicNotifications.length}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={18} color={colors.border} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => setShowThemeModal(true)}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Appearance</Text>
              <View style={styles.menuValueBox}>
                <Text style={[styles.menuValueText, { color: colors.textSecondary }]}>
                  {themeMode === "system" ? "System" : themeMode === "light" ? "Light" : "Dark"}
                </Text>
                <Feather name="chevron-right" size={18} color={colors.border} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/profile/edit")}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Account Details</Text>
              <Feather name="chevron-right" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Text style={[styles.menuItemText, { color: THEME.red }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Theme Modal */}
      <Modal animationType="fade" transparent={true} visible={showThemeModal} onRequestClose={() => setShowThemeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowThemeModal(false)}>
          <View style={[styles.modalCenterContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitleCenter, { color: colors.text }]}>Appearance</Text>
            {[{ id: "light", label: "Light Mode" }, { id: "dark", label: "Dark Mode" }, { id: "system", label: "System Default" }].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.themeOptionRow, { borderBottomColor: colors.border }]}
                onPress={() => { setThemeMode(opt.id as any); setShowThemeModal(false); }}
              >
                <Text style={{ fontSize: 17, color: themeMode === opt.id ? THEME.primary : colors.text }}>{opt.label}</Text>
                {themeMode === opt.id && <Ionicons name="checkmark" size={22} color={THEME.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications Modal */}
      <Modal animationType="fade" transparent={true} visible={showNotificationsModal} onRequestClose={() => setShowNotificationsModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotificationsModal(false)}>
          <View style={[styles.modalCenterContent, { backgroundColor: colors.card, borderColor: colors.border, minHeight: 300 }]}>
            <Text style={[styles.modalTitleCenter, { color: colors.text }]}>Notifications</Text>
            {dynamicNotifications.map((notif, index) => (
              <View key={notif.id} style={[styles.notificationItem, { borderBottomColor: colors.border, borderBottomWidth: index === dynamicNotifications.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{notif.body}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  profileHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 16,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: "700",
  },
  profileNameBox: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 15,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardBlock: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
  },
  prefLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  prefValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.5,
    justifyContent: "flex-end",
  },
  flagIcon: {
    width: 24,
    height: 18,
    borderRadius: 4,
    marginRight: 8,
  },
  prefValue: {
    fontSize: 16,
    textAlign: "right",
    flexShrink: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuValueBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuValueText: {
    fontSize: 16,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: "center",
    padding: 20,
  },
  modalCenterContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  themeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notificationItem: {
    paddingVertical: 14,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
  },
});
