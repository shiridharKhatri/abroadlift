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
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (insets.top || 30) + 10 : insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
            <View style={styles.avatarBox}>
               {formData.profileImage ? (
                 <Image source={{ uri: formData.profileImage }} style={styles.avatarImage} />
               ) : (
                 <Ionicons name="person" size={50} color={COLORS.textGray} />
               )}
               <View style={styles.cameraIcon}>
                  <Feather name="camera" size={16} color="white" />
               </View>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input}
                value={formData.name}
                onChangeText={(val) => setFormData({...formData, name: val})}
                placeholder="Full Name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput 
                style={styles.input}
                value={formData.username}
                onChangeText={(val) => setFormData({...formData, username: val})}
                placeholder="Username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recent Field of Study</Text>
              <TextInput 
                style={styles.input}
                value={formData.recentAcademicField}
                onChangeText={(val) => setFormData({...formData, recentAcademicField: val})}
                placeholder="e.g. Science"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CGPA / Percentage</Text>
              <TextInput 
                style={styles.input}
                value={formData.cgpa}
                onChangeText={(val) => setFormData({...formData, cgpa: val})}
                placeholder="e.g. 3.8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Passout Year</Text>
              <TextInput 
                style={styles.input}
                value={formData.passoutYear}
                onChangeText={(val) => setFormData({...formData, passoutYear: val})}
                placeholder="e.g. 2024"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Additional Settings */}
          <View style={styles.footerInfo}>
             <Text style={styles.footerText}>
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
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
