import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#1A8A99",
  textDark: "#111827",
  textGray: "#6B7280",
  bgLight: "#FFFFFF",
  orange: "#F59E0B",
  blue: "#4D7EF1",
  bgSubtle: "#F9FAFB",
};

// Mock data
const UNIVERSITIES = [
  {
    id: "1",
    title: "University of Melbourne",
    location: "Melbourne, Australia",
    ranking: "#33",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "University of Toronto",
    location: "Toronto, Canada",
    ranking: "#18",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Sydney University",
    location: "Sydney, Australia",
    ranking: "#41",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "UBC",
    location: "Vancouver, Canada",
    ranking: "#45",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
  },
];

export default function CategoryList() {
  const { name } = useLocalSearchParams();
  const categoryTitle = typeof name === "string" ? name : "Category";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="chevron-left" size={24} color={THEME.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <TouchableOpacity style={styles.iconButton}>
           <Feather name="filter" size={20} color={THEME.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        <Text style={styles.resultsText}>Showing matching results</Text>

        <View style={styles.listContainer}>
          {UNIVERSITIES.map((u) => (
            <TouchableOpacity 
              key={u.id} 
              style={styles.cardContainer} 
              activeOpacity={0.9}
              onPress={() => router.push(("/university/" + u.id) as any)}
            >
              <Image source={{ uri: u.image }} style={styles.cardImage} />
              
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                   <Text style={styles.cardTitle} numberOfLines={1}>{u.title}</Text>
                   <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{u.ranking}</Text>
                   </View>
                </View>
                
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color={THEME.orange} />
                  <Text style={styles.locationText}>{u.location}</Text>
                </View>

                <View style={styles.cardTags}>
                   <Text style={styles.tagText}>Public</Text>
                   <Text style={styles.tagText}>Research</Text>
                   <Text style={styles.tagText}>Top 50</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgSubtle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: THEME.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.textDark,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsText: {
    fontSize: 14,
    color: THEME.textGray,
    marginBottom: 16,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: THEME.bgLight,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.textDark,
    marginRight: 10,
  },
  rankBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    color: THEME.bgLight,
    fontSize: 12,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: THEME.textGray,
    marginLeft: 6,
    fontWeight: "500",
  },
  cardTags: {
    flexDirection: "row",
    gap: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.textDark,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
});
