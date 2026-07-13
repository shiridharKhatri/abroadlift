import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const COLORS = {
  primary: "#33BFFF", 
  textDark: "#111827",
  textGray: "#64748B",
  white: "#FFFFFF",
  bgSubtle: "#F8FAFF",
  border: "#E5E7EB",
};

export default function EditProfile() {
  const { userData, setUserData } = useUser();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    profileImage: userData.profileImage,
    recentAcademicField: userData.recentAcademicField || "",
    cgpa: userData.cgpa || "",
    passoutYear: userData.passoutYear || "",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    setUserData(prev => ({
      ...prev,
      name: formData.name,
      username: formData.username,
      profileImage: formData.profileImage,
      recentAcademicField: formData.recentAcademicField,
      cgpa: formData.cgpa,
      passoutYear: formData.passoutYear,
    }));
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 6 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
             <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
          
          {/* Avatar Section */}
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                 {formData.profileImage ? (
                   <Image source={{ uri: formData.profileImage }} style={styles.avatarImage} />
                 ) : (
                   <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                 )}
              </View>
              <View style={[styles.cameraIcon, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Feather name="camera" size={14} color="white" />
              </View>
            </View>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.name}
                onChangeText={(val) => setFormData({...formData, name: val})}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.username}
                onChangeText={(val) => setFormData({...formData, username: val})}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Recent Field of Study</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.recentAcademicField}
                onChangeText={(val) => setFormData({...formData, recentAcademicField: val})}
                placeholder="e.g. Science"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CGPA / Percentage</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.cgpa}
                onChangeText={(val) => setFormData({...formData, cgpa: val})}
                placeholder="e.g. 3.8"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Passout Year</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.passoutYear}
                onChangeText={(val) => setFormData({...formData, passoutYear: val})}
                placeholder="e.g. 2024"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Additional Settings */}
          <View style={[styles.footerInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Your profile information is used to personalize your university recommendations and study journey.
             </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
  },
  avatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footerInfo: {
    marginTop: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "500",
  },
});
