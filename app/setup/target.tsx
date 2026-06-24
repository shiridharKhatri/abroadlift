import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  ImageBackground,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  glassBase: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.6)",
  cardSelectedBg: "#E0F2FE",
  cardBorder: "#E2E8F0",
};

const INTAKE_OPTIONS = [
  { id: "spring_2026", label: "Spring 2026", sub: "January Intake" },
  { id: "summer_2026", label: "Summer 2026", sub: "May Intake" },
  { id: "fall_2025", label: "Fall 2025", sub: "September Intake" },
  { id: "not_sure", label: "Not Sure", sub: "We'll suggest" },
];

export default function IntakeSetup() {
  const { userData, setUserData } = useUser();
  
  // Initialize with values from context or defaults
  // We'll map the intake string to our ID if needed, but for now just use selection
  const [selectedIntake, setSelectedIntake] = useState(userData.intake || "Fall 2025");

  const handleContinue = () => {
    setUserData(prev => ({
      ...prev,
      intake: selectedIntake,
    }));
    router.push("/setup/university-select");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require("../../assets/images/onboarding-bg-4k.png")}
        style={styles.background}
        imageStyle={{ top: -140, height: height + 140 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Target Intake</Text>
            <View style={{ width: 44 }} /> 
          </View>

          {/* Progress Tracker (Step 6 of 7) */}
          <View style={styles.trackerContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View 
                key={i} 
                style={[
                  styles.trackerSegment, 
                  i === 6 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
                ]} 
              />
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.titleSection}>
              <Text style={styles.questionTitle}>When do you want to start your studies?</Text>
              <Text style={styles.questionSubtitle}>This helps us estimate your admission chances</Text>
            </View>

            {/* Banner Image - Map of Flags */}
            <View style={styles.bannerContainer}>
              <Image 
                source={require("./world_flags_map.png")} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>

            {/* Intake Grid */}
            <View style={styles.grid}>
              {INTAKE_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card, 
                    selectedIntake === item.label && styles.selectedCard
                  ]}
                  onPress={() => setSelectedIntake(item.label)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Feather 
                        name="calendar" 
                        size={16} 
                        color={selectedIntake === item.label ? COLORS.primary : "#EF4444"} 
                      />
                      <Text style={styles.cardTitle}>{item.label}</Text>
                    </View>
                    <Text style={styles.cardSub}>{item.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 40 }} />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 24,
  },
  trackerSegment: {
    height: 6,
    borderRadius: 3,
    width: 32,
  },
  trackerSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  trackerSegmentInactive: {
    backgroundColor: "#E2E8F0",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    fontWeight: "500",
  },
  bannerContainer: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
    backgroundColor: "#F1F5F9",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    width: (width - 64) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: COLORS.cardSelectedBg,
    borderColor: COLORS.primary,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
});
