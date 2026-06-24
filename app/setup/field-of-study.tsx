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
  TextInput,
  Animated,
} from "react-native";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
  bgSubtle: "rgba(255, 255, 255, 0.4)",
  glassBorder: "rgba(255, 255, 255, 0.5)",
};

const FIELDS = [
  { id: "engineering", name: "Engineering and Technology" },
  { id: "business", name: "Business, Management" },
  { id: "sciences", name: "Sciences" },
  { id: "arts", name: "Arts" },
  { id: "law", name: "Law" },
];

export default function FieldOfStudySelection() {
  const { userData, setUserData } = useUser();
  const [selectedField, setSelectedField] = useState<string | null>(
    FIELDS.find(f => f.name === userData.fieldOfStudy)?.id || null
  );
  const [search, setSearch] = useState("");

  const anims = React.useRef(FIELDS.reduce((acc, field) => {
    acc[field.id] = new Animated.Value(field.name === userData.fieldOfStudy ? 1 : 0);
    return acc;
  }, {} as Record<string, Animated.Value>)).current;

  const handleSelect = (id: string, name: string) => {
    if (id === selectedField) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const animTasks = [
      Animated.timing(anims[id], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ];

    if (selectedField) {
      animTasks.push(
        Animated.timing(anims[selectedField], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animTasks).start();

    setSelectedField(id);
    setUserData(prev => ({ ...prev, fieldOfStudy: name }));
  };

  const filteredFields = FIELDS.filter(field => 
    field.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <Text style={styles.headerTitle}>Field Of Study</Text>
            <View style={{ width: 44 }} /> 
          </View>

          <View style={styles.trackerContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View 
                key={i} 
                style={[
                  styles.trackerSegment, 
                  i === 3 ? styles.trackerSegmentActive : styles.trackerSegmentInactive
                ]} 
              />
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.questionText}>What do you want to study?</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={COLORS.textGray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder='"Search study courses"'
                placeholderTextColor={COLORS.textGray}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Fields List */}
            <View style={styles.list}>
              {filteredFields.map((field) => {
                const isSelected = selectedField === field.id;
                return (
                  <TouchableOpacity
                    key={field.id}
                    activeOpacity={0.8}
                    style={[
                      styles.levelItem,
                      isSelected && styles.selectedItem,
                    ]}
                    onPress={() => handleSelect(field.id, field.name)}
                  >
                    <Animated.View style={[styles.glassContainer, { opacity: anims[field.id] }]}>
                      <Image 
                        source={require("../../assets/images/onboarding-bg-4k.png")}
                        style={styles.glassImageBackground}
                        blurRadius={30}
                      />
                      <View style={styles.glassOverlay} />
                    </Animated.View>

                    <Text style={[styles.fieldName, isSelected && styles.selectedFieldName]}>{field.name}</Text>
                    {isSelected && <Feather name="check" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
              {filteredFields.length === 0 && (
                <Text style={styles.noResultsText}>No fields found matching "{search}"</Text>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedField && { opacity: 0.5 }
              ]}
              disabled={!selectedField}
              onPress={() => router.push("/setup/academics")}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  list: {
    gap: 12,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  fieldName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    zIndex: 1,
  },
  selectedFieldName: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  noResultsText: {
    textAlign: "center",
    color: COLORS.textGray,
    fontSize: 16,
    marginTop: 20,
    fontWeight: "500",
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
