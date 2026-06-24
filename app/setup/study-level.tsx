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
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#0F172A",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  glassBorder: "rgba(255, 255, 255, 0.5)",
};

const STUDY_LEVELS = [
  { id: "bachelors", name: "Bachelor's Degree", icon: "school-outline", provider: "Ionicons" },
  { id: "masters", name: "Master's Degree", icon: "book-outline", provider: "Ionicons" },
  { id: "phd", name: "PHD Degree", icon: "book-outline", provider: "Ionicons" },
  { id: "diploma", name: "Diploma", icon: "certificate-outline", provider: "MaterialCommunityIcons" },
];

export default function StudyLevelSelection() {
  const { userData, setUserData } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    STUDY_LEVELS.find(l => l.name === userData.studyLevel)?.id || null
  );
  
  // Animated values for each option's blur
  const anims = React.useRef(STUDY_LEVELS.reduce((acc, level) => {
    acc[level.id] = new Animated.Value(level.name === userData.studyLevel ? 1 : 0);
    return acc;
  }, {} as Record<string, Animated.Value>)).current;

  const handleSelect = (id: string, name: string) => {
    if (id === selectedLevel) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Smoothly fade out the old selection and fade in the new one
    const animTasks = [
      Animated.timing(anims[id], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ];

    if (selectedLevel) {
      animTasks.push(
        Animated.timing(anims[selectedLevel], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animTasks).start();

    setSelectedLevel(id);
    setUserData(prev => ({ ...prev, studyLevel: name }));
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
            <Text style={styles.headerTitle}>Study Level</Text>
            <View style={{ width: 44 }} /> 
          </View>

          <View style={styles.trackerContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View 
                key={i} 
                style={[
                  styles.trackerSegment, 
                  i === 2 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
                ]} 
              />
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.questionText}>What level of study are you planning?</Text>

            {/* Education Banner */}
            <View style={styles.bannerContainer}>
              <Image
                source={require("../../assets/images/onboarding-bg-4k.png")} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>

            {/* Level List */}
            <View style={styles.list}>
              {STUDY_LEVELS.map((level) => {
                const isSelected = selectedLevel === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    activeOpacity={0.8}
                    style={[
                      styles.levelItem,
                      isSelected && styles.selectedItem,
                    ]}
                    onPress={() => handleSelect(level.id, level.name)}
                  >
                    <Animated.View style={[styles.glassContainer, { opacity: anims[level.id] }]}>
                      <Image 
                        source={require("../../assets/images/onboarding-bg-4k.png")}
                        style={styles.glassImageBackground}
                        blurRadius={30}
                      />
                      <View style={styles.glassOverlay} />
                    </Animated.View>

                    <View style={styles.iconWrapper}>
                      {level.provider === 'Ionicons' ? (
                        <Ionicons name={level.icon as any} size={24} color={isSelected ? COLORS.primary : COLORS.textDark} />
                      ) : (
                        <MaterialCommunityIcons name={level.icon as any} size={24} color={isSelected ? COLORS.primary : COLORS.textDark} />
                      )}
                    </View>
                    <Text style={[styles.levelName, isSelected && styles.selectedLevelName]}>{level.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Bottom Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedLevel && { opacity: 0.5 }
              ]}
              disabled={!selectedLevel}
              onPress={() => router.push("/setup/field-of-study")}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
    fontWeight: "700",
    color: COLORS.textDark,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
    fontWeight: "500",
  },
  bannerContainer: {
    width: "100%",
    height: 160,
    borderRadius: 20,
    backgroundColor: COLORS.bgSubtle,
    overflow: "hidden",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  list: {
    gap: 12,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
    position: "relative",
    marginBottom: 2,
  },
  selectedItem: {
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "transparent",
    transform: [{ scale: 1.02 }],
  },
  glassContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  glassImageBackground: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
    top: -460,
    left: -20,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  iconWrapper: {
    width: 44,
    alignItems: "flex-start",
    zIndex: 1,
  },
  levelName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textDark,
    zIndex: 1,
  },
  selectedLevelName: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "transparent",
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
});
