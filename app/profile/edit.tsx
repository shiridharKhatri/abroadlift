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
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: Platform.OS === 'android' ? (insets.top || 30) + 10 : insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary + "15" }]} onPress={handleSave}>
             <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
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
                   <Ionicons name="person-circle-outline" size={60} color={colors.textSecondary} />
                 )}
              </View>
              <View style={[styles.cameraIcon, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Feather name="camera" size={16} color="white" />
              </View>
            </View>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Profile Photo</Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.name}
                onChangeText={(val) => setFormData({...formData, name: val})}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Recent Field of Study</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.recentAcademicField}
                onChangeText={(val) => setFormData({...formData, recentAcademicField: val})}
                placeholder="e.g. Science"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>CGPA / Percentage</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Passout Year</Text>
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
          <View style={[styles.footerInfo, { backgroundColor: colors.card }]}>
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
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
  },
  saveButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  scrollInner: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginLeft: 4,
  },
  input: {
    height: 56,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 20,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 18,
    textAlign: "center",
  },
});
