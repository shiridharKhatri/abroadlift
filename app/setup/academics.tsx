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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  glassBase: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.6)",
};

export default function AcademicsSetup() {
  const { userData, setUserData } = useUser();
  const [recentField, setRecentField] = useState(userData.recentAcademicField || "");
  const [cgpa, setCgpa] = useState(userData.cgpa || "");
  const [passoutYear, setPassoutYear] = useState(userData.passoutYear || "");
  const [cgpaError, setCgpaError] = useState("");
  const [yearError, setYearError] = useState("");

  const handleContinue = () => {
    setUserData(prev => ({
      ...prev,
      recentAcademicField: recentField,
      cgpa: cgpa,
      passoutYear: passoutYear,
    }));
    router.push("/setup/english-test");
  };

  const isFormValid = 
    recentField.trim().length > 0 && 
    cgpa.trim().length > 0 && 
    parseFloat(cgpa) <= 4.0 &&
    passoutYear.trim().length === 4 &&
    parseInt(passoutYear) >= 1950 &&
    parseInt(passoutYear) <= 2030;

  const handleCgpaChange = (text: string) => {
    setCgpa(text);
    if (text && parseFloat(text) > 4.0) {
      setCgpaError("CGPA cannot be above 4.0");
    } else {
      setCgpaError("");
    }
  };

  const handleYearChange = (text: string) => {
    setPassoutYear(text);
    if (text.length === 4) {
      const year = parseInt(text);
      if (year < 1950 || year > 2030) {
        setYearError("Please enter a valid year (1950-2030)");
      } else {
        setYearError("");
      }
    } else if (text.length > 0) {
      setYearError(""); 
    } else {
        setYearError("");
    }
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="chevron-left" size={28} color={COLORS.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Academics</Text>
              <View style={{ width: 44 }} /> 
            </View>

            <View style={styles.trackerContainer}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.trackerSegment, 
                    i === 4 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
                  ]} 
                />
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.questionText}>Tell us about your education</Text>

              {/* Input Group */}
              <View style={styles.form}>
                
                {/* Field of Study Card */}
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Recent Field of Study</Text>
                  <View style={styles.textInputWrapper}>
                    <Feather name="book-open" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Science"
                      placeholderTextColor={COLORS.textGray}
                      value={recentField}
                      onChangeText={setRecentField}
                    />
                  </View>
                </View>

                {/* CGPA Card */}
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>CGPA / Percentage</Text>
                  <View style={styles.textInputWrapper}>
                    <Feather name="trending-up" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 3.8"
                      placeholderTextColor={COLORS.textGray}
                      value={cgpa}
                      onChangeText={handleCgpaChange}
                      keyboardType="numeric"
                    />
                  </View>
                  {cgpaError ? <Text style={styles.errorText}>{cgpaError}</Text> : null}
                </View>

                {/* Passout Year Card */}
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Passout Year</Text>
                  <View style={styles.textInputWrapper}>
                    <Feather name="calendar" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 2024"
                      placeholderTextColor={COLORS.textGray}
                      value={passoutYear}
                      onChangeText={handleYearChange}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                  {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
                </View>

                {/* Continue Button inside Form Flow */}
                <TouchableOpacity
                  style={[
                    styles.continueButton, 
                    { marginTop: 40 },
                    !isFormValid && { opacity: 0.5 }
                  ]}
                  onPress={handleContinue}
                  disabled={!isFormValid}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
    fontWeight: "700",
    color: COLORS.textDark,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
    fontWeight: "500",
  },
  form: {
    gap: 16,
  },
  inputCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textGray,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
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
    backgroundColor: "#E5E7EB",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
});
