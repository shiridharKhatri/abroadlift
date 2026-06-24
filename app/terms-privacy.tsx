import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./context/ThemeContext";

const { width } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#33BFFF",
  textDark: "#0F172A",
  textMuted: "#64748B",
  white: "#FFFFFF",
  borderLight: "#E2E8F0",
  bgLight: "#F8FAFC",
};

export default function TermsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(
    tab === "privacy" ? "privacy" : "terms"
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: 20 + insets.top }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Legal Agreements</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "terms" && [styles.activeTab, { backgroundColor: colors.background }]]}
          onPress={() => setActiveTab("terms")}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "terms" && [styles.activeTabText, { color: colors.text }]]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "privacy" && [styles.activeTab, { backgroundColor: colors.background }]]}
          onPress={() => setActiveTab("privacy")}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "privacy" && [styles.activeTabText, { color: colors.text }]]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "terms" ? (
          <View style={styles.section}>
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: June 2026</Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              By accessing and using AbroadLift, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Scope of Services</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AbroadLift provides tools, information, and services related to college selection, visa readiness, and study abroad preparation. All information provided is for general guidance purposes.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Registration</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You must register for an account to use certain features. You agree to provide accurate, complete information during registration and keep it updated. You are responsible for safeguarding your account details.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Acceptable Use Policy</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You agree not to use the app for any illegal purposes or to submit fraudulent academic, financial, or visa information. Any form of abuse or violation of intellectual property is strictly prohibited.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Limitation of Liability</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AbroadLift is not responsible for admission decisions, visa rejections, or external financial transactions. Service is provided "as is" without warranty of any kind.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: June 2026</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We collect personal details such as your name, email address, phone number, and academic history to customize your profile, provide matching recommendations, and send necessary notifications.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Data</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Your information is used solely to match you with universities, evaluate study level fits, verify visa readiness steps, and improve our services.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Information Sharing</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We do not sell your personal data. We only share details with accredited academic institutions or processing agents with your explicit consent when submitting inquiries.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Security</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We implement advanced security measures including encryption and secure socket layers to protect your personal information from unauthorized access, modification, or exposure.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Privacy Rights</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You have the right to request access to, edit, or delete your personal data stored on our servers at any time. Simply reach out to our team at support@abroadlift.com.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.bgLight,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.textDark,
    fontWeight: "700",
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  section: {
    paddingBottom: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 24,
    marginBottom: 12,
  },
});
