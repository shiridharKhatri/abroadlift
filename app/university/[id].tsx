import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import {
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { Skeleton } from "../../components/Skeleton";
import { getCostOfLiving, getUniversityDetails, UniversityDetail, calculateAcceptanceChance } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { GlassCard, canUseGlassEffect } from "../../components/GlassCard";
import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

const THEME = {
    primary: "#33BFFF",
    secondary: "#004be3",
    textDark: "#111827",
    textGray: "#6B7280",
    bgLight: "#F8FAFF",
    orange: "#F59E0B",
    blue: "#3B82F6",
    green: "#10B981",
    white: "#FFFFFF",
    purple: "#6366F1",
};

const UNIVERSITIES: Record<string, any> = {
    "1": {
        title: "University of Melbourne",
        location: "Melbourne, Australia",
        image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
        description: "The University of Melbourne is one of Australia's leading research universities, known for academic excellence and global reputation.",
        type: "Public Research",
        established: "1853",
        campus: "Parkville",
        students: "50,000+",
    },
    "2": {
        title: "University of Toronto",
        location: "Toronto, Canada",
        image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
        description: "The University of Toronto is a globally top-ranked public research university in Canada, offering world-class innovation and learning programs.",
        type: "Public Research",
        established: "1827",
        campus: "St. George",
        students: "60,000+",
    },
    "3": {
        title: "Stanford University",
        location: "Stanford, USA",
        image: "https://images.unsplash.com/photo-1533667586627-9f5cb393304a?auto=format&fit=crop&q=80&w=800",
        description: "Located in the heart of Silicon Valley, Stanford University is recognized as one of the world's leading research and teaching institutions. It offers unmatched opportunities for tech innovation.",
        type: "Private Research",
        established: "1885",
        campus: "Suburban",
        students: "17,000+",
    },
};

const TABS = ["Estimates", "Overview", "Gallery", "Courses & Fees"];

export default function UniversityDetails() {
    const { id, country: countryParam, name } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { userData, selectUniversity, setUserData } = useUser();
    const { colors, isDark } = useTheme();

    // Resolve the actual country to use for API and display
    const currentCountry = (countryParam && countryParam !== "undefined")
        ? (countryParam as string)
        : (userData.country || "UK");
    const [selectedTab, setSelectedTab] = useState("Estimates");
    const [courseSearch, setCourseSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUniDescriptionExpanded, setIsUniDescriptionExpanded] = useState(false);
    const [uniData, setUniData] = useState<UniversityDetail | null>(null);
    const [costData, setCostData] = useState<any>(null);
    const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const USD_TO_NPR = 134;

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [data, cost] = await Promise.all([
                    getUniversityDetails(id as string, currentCountry),
                    getCostOfLiving(currentCountry)
                ]);
                if (mounted) {
                    setUniData(data);
                    setCostData(cost);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error loading uni details/cost:", error);
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [id, currentCountry]);

    const stripHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').trim();
    };

    const fallback = UNIVERSITIES["3"];
    const details = {
        title: uniData?.name || (name as string) || fallback.title,
        location: uniData?.location || fallback.location,
        image: uniData?.image || fallback.image,
        description: stripHtml(uniData?.description || fallback.description),
        type: uniData?.type || fallback.type,
        established: uniData?.established || fallback.established,
        campus: uniData?.campus || fallback.campus,
        students: uniData?.students || fallback.students,
        ranking_world: uniData?.ranking_world || "N/A",
        ranking_national: uniData?.ranking_national || "N/A",
        fee_usd: uniData?.tuitionValue || 0,
        latitude: uniData?.latitude,
        longitude: uniData?.longitude,
        website: uniData?.website || "",
    };

    const isShortlisted = userData.selectedUniversities?.some(
        (u) => String(u.id) === String(id)
    );

    const toggleShortlist = () => {
        if (isShortlisted) {
            setUserData((prev) => ({
                ...prev,
                selectedUniversities: prev.selectedUniversities.filter(
                    (u) => String(u.id) !== String(id)
                ),
            }));
        } else {
            selectUniversity({
                id: id as string,
                name: details.title,
                location: details.location,
                image: details.image,
                course: uniData?.courses?.[0]?.name || "MSc Computer Science",
                tuition: uniData?.tuition || "N/A",
                tuitionValue: uniData?.tuitionValue,
            });
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${details.title} in ${details.location} on AbroadLift!`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const renderEstimates = () => {
        const tuitionUsd = details.fee_usd || 0;
        const livingUsd = (costData?.monthly_estimate_usd || 1500) * 12;
        const otherUsd = (tuitionUsd + livingUsd) * 0.05;
        const totalNpr = (tuitionUsd + livingUsd + otherUsd) * USD_TO_NPR;

        const fmtNpr = (v: number) => {
            if (v >= 10000000) return `NPR ${(v / 10000000).toFixed(2)} Crore`;
            if (v >= 100000) return `NPR ${(v / 100000).toFixed(1)} Lakhs`;
            return `NPR ${v.toLocaleString()}`;
        };

        // Compute dynamic admission chance
        const chance = calculateAcceptanceChance(userData, {
            id: id,
            acceptanceRate: uniData?.acceptanceRate,
            rank: details.ranking_world
        });
        const score = chance.score;
        const label = chance.label;

        let chanceColor = "#EF4444"; // Red for Reach
        let chanceDesc = "low chance";
        let chanceAdvice = "Improve your test scores to increase odds.";
        if (label === "Safe") {
            chanceColor = "#10B981"; // Green
            chanceDesc = "high chance";
            chanceAdvice = "Your academic profile is extremely competitive for this university.";
        } else if (label === "Good") {
            chanceColor = "#3B82F6"; // Blue
            chanceDesc = "good chance";
            chanceAdvice = "Your profile meets or exceeds most requirements.";
        } else if (label === "Moderate") {
            chanceColor = "#F59E0B"; // Orange
            chanceDesc = "moderate chance";
            chanceAdvice = "Consider improving your grades or test scores to boost your odds.";
        }

        return (
            <View style={styles.tabContent}>
                {/* Cost Breakdown Card */}
                <View style={[styles.estimateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>ESTIMATED ANNUAL EXPENSES</Text>
                    <Text style={[styles.estimateValue, { color: colors.text }]}>{fmtNpr(totalNpr)}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20, fontWeight: "600" }}>
                        Approx. ${(tuitionUsd + livingUsd + otherUsd).toLocaleString()} USD / year
                    </Text>

                    {/* Progress visual bar */}
                    <View style={[styles.costBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.costSegment, { width: `${(tuitionUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: colors.primary }]} />
                        <View style={[styles.costSegment, { width: `${(livingUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: '#FBBF24' }]} />
                        <View style={[styles.costSegment, { width: '5%', backgroundColor: '#10B981' }]} />
                    </View>

                    {/* Table-based Estimates Breakdown */}
                    <View style={{ gap: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>Tuition Fees</Text>
                            </View>
                            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{fmtNpr(tuitionUsd * USD_TO_NPR)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>Living Expenses</Text>
                            </View>
                            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{fmtNpr(livingUsd * USD_TO_NPR)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>Insurance & Other</Text>
                            </View>
                            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{fmtNpr(otherUsd * USD_TO_NPR)}</Text>
                        </View>
                    </View>
                </View>

                {/* Admission Chances Card */}
                <View style={[styles.chancesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.chancesTitle, { color: colors.text }]}>Admissions Match</Text>
                    
                    <View style={{ gap: 14, marginBottom: 20 }}>
                        {/* Match Progress Bar */}
                        <View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 12 }}>Profile Match Rate</Text>
                                <Text style={{ color: chanceColor, fontWeight: "800", fontSize: 13 }}>{score}% ({label})</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                                <View style={{ height: "100%", width: `${score}%`, backgroundColor: chanceColor }} />
                            </View>
                        </View>

                        {/* Acceptance Rate Bar */}
                        <View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 12 }}>Uni Acceptance Rate</Text>
                                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 13 }}>{uniData?.acceptanceRate || 65}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                                <View style={{ height: "100%", width: `${uniData?.acceptanceRate || 65}%`, backgroundColor: colors.primary }} />
                            </View>
                        </View>
                    </View>

                    <View style={{ backgroundColor: colors.background, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textSecondary, fontWeight: "500" }}>
                            Based on your profile, you have a <Text style={{ fontWeight: '700', color: colors.text }}>{chanceDesc}</Text> of admission. {chanceAdvice}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.completeEstimateBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push({
                            pathname: "/university/cost-breakdown",
                            params: { id: id, country: currentCountry }
                        })}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.completeEstimateBtnText, { color: "#FFFFFF" }]}>Get Cost Breakdown</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.completeEstimateBtn,
                            {
                                backgroundColor: "transparent",
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                marginTop: 10
                            }
                        ]}
                        onPress={() => router.push({
                            pathname: "/university/compare",
                            params: { id1: id, country1: currentCountry }
                        })}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.completeEstimateBtnText, { color: colors.primary }]}>Compare University</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderOverview = () => {
        const isLongDescription = details.description.length > 250;
        const displayedDescription = isLongDescription && !isUniDescriptionExpanded
            ? `${details.description.substring(0, 250)}...`
            : details.description;

        return (
            <View style={styles.tabContent}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>About University</Text>
                </View>
                <View style={[styles.overviewTextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.overviewText, { color: colors.text }]}>{displayedDescription}</Text>
                    {isLongDescription && (
                        <TouchableOpacity
                            onPress={() => setIsUniDescriptionExpanded(!isUniDescriptionExpanded)}
                            style={{ marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center" }}
                        >
                            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                                {isUniDescriptionExpanded ? "Read Less" : "Read More"}
                            </Text>
                            <Ionicons
                                name={isUniDescriptionExpanded ? "chevron-up" : "chevron-down"}
                                size={14}
                                color={colors.primary}
                                style={{ marginLeft: 4 }}
                            />
                        </TouchableOpacity>
                    )}
                    {uniData?.notes && (
                        <View style={[styles.notesBox, { borderTopColor: colors.border }]}>
                            <Text style={[styles.notesLabel, { color: colors.primary }]}>ADMISSION NOTES</Text>
                            <Text style={[styles.notesText, { color: colors.text }]}>{uniData.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Highlights List (Text-First) */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Quick Information</Text>
                </View>
                <View style={[styles.overviewTextCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 12, paddingVertical: 16 }]}>
                    {details.ranking_world && details.ranking_world !== "N/A" && details.ranking_world !== "0" && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 13 }}>QS World Ranking</Text>
                            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>#{details.ranking_world}</Text>
                        </View>
                    )}
                    {details.ranking_national && details.ranking_national !== "N/A" && details.ranking_national !== "0" && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 13 }}>National Ranking</Text>
                            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>#{details.ranking_national}</Text>
                        </View>
                    )}
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 13 }}>Institution Type</Text>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{details.type || "Public Research"}</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 13 }}>Established Year</Text>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{details.established !== "N/A" ? details.established : "N/A"}</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 13 }}>Total Students</Text>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>
                            {(() => {
                                const count = details.students;
                                if (!count) return "10,000+";
                                if (typeof count === "number" || !isNaN(Number(count))) {
                                    return Number(count).toLocaleString();
                                }
                                return count;
                            })()}
                        </Text>
                    </View>
                    {uniData?.address && (
                        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10, marginTop: 4 }}>
                            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 11, marginBottom: 2 }}>ADDRESS</Text>
                            <Text style={{ color: colors.text, fontWeight: "500", fontSize: 13, lineHeight: 18 }}>{uniData.address}</Text>
                        </View>
                    )}
                    {details.website ? (
                        <TouchableOpacity
                            onPress={() => {
                                Linking.openURL(details.website).catch(err => console.error("Error opening URL", err));
                            }}
                            activeOpacity={0.7}
                            style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10 }}
                        >
                            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 11, marginBottom: 2 }}>OFFICIAL PORTAL</Text>
                            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13, textDecorationLine: "underline" }}>
                                {details.website}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Scholarships Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Scholarships</Text>
                </View>

                {uniData?.scholarships && uniData.scholarships.length > 0 ? (
                    uniData.scholarships.map((s, idx) => (
                        <View key={idx} style={[styles.scholarshipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.scholarshipHeader}>
                                <Text style={[styles.scholarshipName, { color: colors.text }]} numberOfLines={1}>{s.name}</Text>
                                <Text style={[styles.scholarshipValue, { color: colors.primary }]}>{s.value}</Text>
                            </View>
                            {s.eligibility && (
                                <Text style={[styles.scholarshipElig, { color: colors.textSecondary }]} numberOfLines={2}>
                                    <Text style={{ fontWeight: '700', color: colors.text }}>Eligible: </Text>{s.eligibility}
                                </Text>
                            )}
                            {s.notes && (
                                <Text style={[styles.scholarshipNotes, { color: colors.textSecondary }]}>{s.notes}</Text>
                            )}
                            {s.type && (
                                <View style={[styles.typeBadge, { backgroundColor: s.type === 'merit' ? '#FEF3C7' : '#DCFCE7' }]}>
                                    <Text style={[styles.typeBadgeText, { color: s.type === 'merit' ? '#D97706' : '#166534' }]}>{s.type.toUpperCase()}</Text>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={[styles.noScholarshipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.noScholarshipText, { color: colors.textSecondary }]}>Check official portal for scholarships</Text>
                    </View>
                )}

                {/* Campus Location Map */}
                {(() => {
                    const lat = parseFloat(String(details.latitude));
                    const lng = parseFloat(String(details.longitude));
                    const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                    if (!hasCoordinates) return null;
                    return (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Campus Location</Text>
                            </View>
                            <View style={[styles.mapContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: lat,
                                        longitude: lng,
                                        latitudeDelta: 0.02,
                                        longitudeDelta: 0.02,
                                    }}
                                    scrollEnabled={true}
                                    zoomEnabled={true}
                                    rotateEnabled={false}
                                    pitchEnabled={false}
                                >
                                    <Marker
                                        coordinate={{ latitude: lat, longitude: lng }}
                                        title={details.title}
                                        description={details.location}
                                    />
                                </MapView>
                                <TouchableOpacity
                                    style={[styles.directionsButton, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        const url = Platform.select({
                                            ios: `maps:0,0?q=${details.title}@${lat},${lng}`,
                                            android: `geo:0,0?q=${lat},${lng}(${details.title})`,
                                        });
                                        if (url) {
                                            Linking.openURL(url).catch(err => console.error("Error opening maps", err));
                                        }
                                    }}
                                >
                                    <Ionicons name="navigate-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                                    <Text style={styles.directionsButtonText}>Get Directions</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    );
                })()}
            </View>
        );
    };

    const renderRankings = () => {
        const hasRank = (details.ranking_world && details.ranking_world !== "N/A" && details.ranking_world !== "0") ||
            (details.ranking_national && details.ranking_national !== "N/A" && details.ranking_national !== "0");

        return (
            <View style={styles.tabContent}>
                {hasRank ? (
                    <>
                        <View style={[styles.rankingGlobalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.globalHeader}>
                                <View style={styles.medalIcon}>
                                    <Ionicons name="ribbon" size={24} color="#FBBF24" />
                                </View>
                                <View>
                                    <Text style={[styles.globalRatingTitle, { color: colors.text }]}>Global Excellence</Text>
                                    <Text style={[styles.globalRatingSub, { color: colors.textSecondary }]}>University Rankings</Text>
                                </View>
                            </View>
                            <View style={styles.globalRanksRow}>
                                {details.ranking_world !== "N/A" && details.ranking_world !== "0" && (
                                    <View style={[styles.rankSubCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.rankAgency, { color: colors.textSecondary }]}>QS WORLD</Text>
                                        <Text style={[styles.rankNumber, { color: colors.text }]}>#{details.ranking_world}</Text>
                                        <Text style={[styles.rankScope, { color: colors.textSecondary }]}>Global</Text>
                                    </View>
                                )}
                                {details.ranking_national !== "N/A" && details.ranking_national !== "0" && (
                                    <View style={[styles.rankSubCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.rankAgency, { color: colors.textSecondary }]}>NATIONAL</Text>
                                        <Text style={[styles.rankNumber, { color: colors.text }]}>#{details.ranking_national}</Text>
                                        <Text style={[styles.rankScope, { color: colors.textSecondary }]}>National</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.noPhotosBox}>
                        <Ionicons name="ribbon-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                        <Text style={[styles.noPhotosText, { color: colors.textSecondary }]}>Rankings data not available. Visit official website.</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderCourses = () => {
        const rawCourses = uniData?.courses || [];

        const normalizeLevel = (lvl: string): string => {
            const low = String(lvl).trim().toLowerCase();
            if (low.includes("bachelor") || low.includes("ug") || low.includes("undergrad")) {
                return "Bachelors";
            }
            if (low.includes("master") || low.includes("pg") || low.includes("postgrad")) {
                return "Masters";
            }
            if (low.includes("doctor") || low.includes("phd") || low.includes("ph.d")) {
                return "Doctorate";
            }
            if (low.includes("diploma")) {
                return "Diploma";
            }
            if (low.includes("certificate")) {
                return "Certificate";
            }
            const formatted = low.charAt(0).toUpperCase() + low.slice(1);
            if (formatted.length > 15) {
                return formatted.substring(0, 12) + "...";
            }
            return formatted;
        };

        // Dynamically get the unique levels present in the available courses, cleaned & normalized
        const uniqueLevels = ["All"];
        rawCourses.forEach(c => {
            const levels = Array.isArray(c.level) ? c.level : [c.level || "General"];
            levels.forEach((lvl: string) => {
                if (lvl && lvl.trim() !== "") {
                    const normalized = normalizeLevel(lvl);
                    if (!uniqueLevels.includes(normalized)) {
                        uniqueLevels.push(normalized);
                    }
                }
            });
        });

        // Ensure current filter value exists in dynamic levels, fallback to "All"
        const activeFilter = uniqueLevels.includes(levelFilter) ? levelFilter : "All";

        // Filter the courses based on search text and dynamic level filter
        const filtered = rawCourses.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                (c.category && c.category.toLowerCase().includes(courseSearch.toLowerCase()));

            if (activeFilter === "All") return matchesSearch;

            const levels = Array.isArray(c.level) ? c.level : [c.level || ""];
            const matchesLevel = levels.some((lvl: string) => {
                return normalizeLevel(lvl) === activeFilter;
            });

            return matchesSearch && matchesLevel;
        });

        return (
            <View style={[styles.tabContent, { zIndex: 5 }]}>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, zIndex: 10, position: "relative" }}>
                    <View style={[styles.courseSearchWrapper, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, marginBottom: 0 }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            placeholder="Search Courses..."
                            style={[styles.courseInput, { color: colors.text }]}
                            placeholderTextColor={colors.textSecondary}
                            value={courseSearch}
                            onChangeText={setCourseSearch}
                        />
                    </View>
                    <View style={{ zIndex: 20 }}>
                        <TouchableOpacity
                            style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => setShowLevelDropdown(!showLevelDropdown)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="filter" size={16} color={colors.primary} />
                            <Text style={[styles.filterButtonText, { color: colors.text }]}>
                                {activeFilter === "All" ? "All Levels" : activeFilter}
                            </Text>
                            <Ionicons name={showLevelDropdown ? "chevron-up" : "chevron-down"} size={14} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {showLevelDropdown && (
                            <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {uniqueLevels.map((lvl) => (
                                    <TouchableOpacity
                                        key={lvl}
                                        style={[
                                            styles.dropdownItem,
                                            activeFilter === lvl && { backgroundColor: colors.primary + "15" }
                                        ]}
                                        onPress={() => {
                                            setLevelFilter(lvl);
                                            setShowLevelDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            { color: colors.text },
                                            activeFilter === lvl && { color: colors.primary, fontWeight: "700" }
                                        ]}>
                                            {lvl === "All" ? "All Levels" : lvl}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {filtered.length > 0 ? (
                    (() => {
                        const grouped: Record<string, any[]> = {};
                        filtered.forEach((course) => {
                            const cat = course.category ? String(course.category).trim() : "General";
                            const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                            if (!grouped[formattedCat]) {
                                grouped[formattedCat] = [];
                            }
                            grouped[formattedCat].push(course);
                        });

                        const sortedCategories = Object.keys(grouped).sort();

                        return sortedCategories.map((category) => {
                            const isExpanded = !!expandedCategories[category];
                            return (
                                <View key={category} style={{ marginBottom: 12 }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryHeaderCard, 
                                            { 
                                                backgroundColor: colors.card, 
                                                borderColor: colors.border,
                                                marginBottom: isExpanded ? 12 : 4
                                            }
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setExpandedCategories(prev => ({
                                                ...prev,
                                                [category]: !prev[category]
                                            }));
                                        }}
                                    >
                                        <View style={styles.categoryHeaderLeft}>
                                            <Ionicons 
                                                name={
                                                    category.toLowerCase().includes("engineering") ? "construct-outline" :
                                                    category.toLowerCase().includes("science") || category.toLowerCase().includes("comput") || category.toLowerCase().includes("tech") ? "flask-outline" :
                                                    category.toLowerCase().includes("business") || category.toLowerCase().includes("manag") || category.toLowerCase().includes("finan") ? "business-outline" :
                                                    category.toLowerCase().includes("art") || category.toLowerCase().includes("design") ? "color-palette-outline" :
                                                    category.toLowerCase().includes("health") || category.toLowerCase().includes("medic") || category.toLowerCase().includes("nurs") ? "heart-outline" :
                                                    "book-outline"
                                                } 
                                                size={20} 
                                                color={colors.primary} 
                                                style={{ marginRight: 12 }}
                                            />
                                            <View>
                                                <Text style={[styles.categoryHeaderTitle, { color: colors.text }]}>{category}</Text>
                                                <Text style={[styles.categoryHeaderSub, { color: colors.textSecondary }]}>
                                                    {grouped[category].length} {grouped[category].length === 1 ? "Program" : "Programs"}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons 
                                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                                            size={18} 
                                            color={colors.textSecondary} 
                                        />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={{ paddingLeft: 8 }}>
                                            {grouped[category].map((course: any, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        router.push({
                                                            pathname: "/university/program-details",
                                                            params: {
                                                                name: course.name || "",
                                                                category: course.category || "",
                                                                level: JSON.stringify(course.level || []),
                                                                fee: course.fee || "",
                                                                description: course.description || "",
                                                                other_fees: JSON.stringify(course.other_fees || []),
                                                                coop: course.coop_participating ? "true" : "false",
                                                                pgwp: course.pgwp_participating ? "true" : "false",
                                                                universityName: details.title,
                                                                application_fee: course.application_fee || "",
                                                                delivery_method: course.delivery_method || "",
                                                                length_breakdown: course.length_breakdown || "",
                                                                language_of_instruction: course.language_of_instruction || "",
                                                                requirements: course.requirements ? JSON.stringify(course.requirements) : "",
                                                                country: uniData?.country || "",
                                                            },
                                                        });
                                                    }}
                                                >
                                                    {/* Category Tag */}
                                                    <View style={styles.courseTopRow}>
                                                        <View style={[styles.categoryTag, { backgroundColor: colors.primary + "15" }]}>
                                                            <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                                                                {(course.category || "General").toUpperCase()}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Course Title */}
                                                    <Text style={[styles.courseName, { color: colors.text }]}>{course.name}</Text>

                                                    {/* Course Details */}
                                                    <View style={styles.courseDetails}>
                                                        <View style={styles.courseDetailItem}>
                                                            <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
                                                            <Text style={[styles.courseDetailText, { color: colors.textSecondary }]}>
                                                                {Array.isArray(course.level) ? course.level.join(", ") : (course.level || "2 - 4 Years")}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.courseDetailItem}>
                                                            <Ionicons name="briefcase-outline" size={15} color={colors.textSecondary} />
                                                            <Text style={[styles.courseDetailText, { color: colors.textSecondary }]}>Full-time</Text>
                                                        </View>
                                                    </View>

                                                    <View style={[styles.courseDivider, { backgroundColor: colors.border }]} />

                                                    {/* Tuition Row */}
                                                    <View style={styles.tuitionRowCompact}>
                                                        <View>
                                                            <Text style={[styles.tuitionLabelCompact, { color: colors.textSecondary }]}>Annual Tuition</Text>
                                                            <Text style={[styles.tuitionValueCompact, { color: colors.primary }]}>{course.fee || "Varies"}</Text>
                                                        </View>
                                                        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        });
                    })()
                ) : (
                    <View style={[styles.noPhotosBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.noPhotosText, { color: colors.textSecondary }]}>
                            {courseSearch === "" ? "No courses listed. Check university website." : "No matching courses found"}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderGallery = () => {
        const photos = uniData?.photos || [];
        if (photos.length === 0) {
            return (
                <View style={[styles.noPhotosBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="images-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.noPhotosText, { color: colors.textSecondary }]}>No campus photos available</Text>
                </View>
            );
        }

        return (
            <View style={styles.tabContent}>
                <View style={styles.galleryGrid}>
                    {photos.map((photo, idx) => (
                        <TouchableOpacity
                            key={photo.id || idx}
                            style={styles.galleryItem}
                            onPress={() => setActivePhotoUrl(photo.url || photo.url_thumbnail || null)}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: photo.url || photo.url_thumbnail }}
                                style={styles.galleryImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
                <ScrollView showsVerticalScrollIndicator={false} alwaysBounceVertical={false}>
                    {/* Banner Skeleton */}
                    <View style={{ height: 280, width: "100%", position: "relative" }}>
                        <Skeleton width="100%" height={280} borderRadius={0} />
                        <View style={{ position: "absolute", top: 40, left: 20 }}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                        </View>
                        <View style={{ position: "absolute", top: 40, right: 20 }}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                        </View>
                    </View>

                    {/* Details Skeleton */}
                    <View style={{ padding: 20 }}>
                        {/* Name/Title */}
                        <Skeleton width="70%" height={28} borderRadius={6} style={{ marginBottom: 12 }} />
                        <Skeleton width="40%" height={16} borderRadius={4} style={{ marginBottom: 20 }} />

                        {/* Two Cards side-by-side */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
                            <View style={{ width: "48%", height: 180, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, justifyContent: "space-between" }}>
                                <View>
                                    <Skeleton width={32} height={32} borderRadius={16} style={{ marginBottom: 12 }} />
                                    <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                                    <Skeleton width="60%" height={14} borderRadius={4} />
                                </View>
                                <Skeleton width="100%" height={36} borderRadius={18} />
                            </View>
                            <View style={{ width: "48%", height: 180, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, justifyContent: "space-between" }}>
                                <View>
                                    <Skeleton width={32} height={32} borderRadius={16} style={{ marginBottom: 12 }} />
                                    <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                                    <Skeleton width="60%" height={14} borderRadius={4} />
                                </View>
                                <Skeleton width="100%" height={36} borderRadius={18} />
                            </View>
                        </View>

                        {/* Tab controls */}
                        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                            <Skeleton width={80} height={36} borderRadius={18} />
                            <Skeleton width={80} height={36} borderRadius={18} />
                            <Skeleton width={80} height={36} borderRadius={18} />
                        </View>

                        {/* Tab content placeholder */}
                        <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 16 }} />
                        <Skeleton width="100%" height={80} borderRadius={16} />
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
            <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
                alwaysBounceVertical={false}
                contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
            >
                {/* Banner Section */}
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: details.image }} style={styles.bannerImage} />
                    <LinearGradient
                        colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
                        style={StyleSheet.absoluteFillObject}
                    />

                     <View style={[styles.bannerHeader, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity style={styles.headerCircleBtn} onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/(tabs)/explore"); } }}>
                            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFillObject} />
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerRightBtns}>
                            <TouchableOpacity style={styles.headerCircleBtn} onPress={handleShare}>
                                <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFillObject} />
                                <Ionicons name="share-social-outline" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerCircleBtn} onPress={toggleShortlist}>
                                <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFillObject} />
                                <Ionicons
                                    name={isShortlisted ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isShortlisted ? "#FF3B30" : "white"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.headerCircleBtn}
                                onPress={() => router.push("/(tabs)/profile")}
                            >
                                <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFillObject} />
                                <ProfileAvatar size={40} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.bannerBottomInfo}>
                        <Text style={styles.uniTitle}>{details.title}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={16} color="white" />
                            <Text style={styles.locationText}>{details.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Sticky Tab Bar */}
                <View style={[styles.tabBarWrapper, { backgroundColor: colors.background }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        <View style={[styles.tabInnerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {TABS.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[
                                        styles.tabItem,
                                        selectedTab === tab && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setSelectedTab(tab)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        { color: selectedTab === tab ? "#FFFFFF" : colors.textSecondary }
                                    ]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Tab Content Area */}
                <View style={styles.mainContent}>
                    {selectedTab === "Estimates" && renderEstimates()}
                    {selectedTab === "Overview" && renderOverview()}
                    {selectedTab === "Gallery" && renderGallery()}
                    {selectedTab === "Courses & Fees" && renderCourses()}
                </View>


            </ScrollView>

            {/* Full-screen Image Viewer Modal */}
            <Modal
                visible={!!activePhotoUrl}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setActivePhotoUrl(null)}
            >
                <TouchableOpacity
                    style={styles.viewerOverlay}
                    activeOpacity={1}
                    onPress={() => setActivePhotoUrl(null)}
                >
                    <TouchableOpacity
                        style={styles.viewerCloseBtn}
                        onPress={() => setActivePhotoUrl(null)}
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                    {activePhotoUrl && (
                        <Image
                            source={{ uri: activePhotoUrl }}
                            style={styles.viewerImage}
                            resizeMode="contain"
                        />
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    categoryHeaderCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    categoryHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    categoryHeaderTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    categoryHeaderSub: {
        fontSize: 12,
        marginTop: 2,
    },
    mapContainer: {
        height: 200,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        marginTop: 12,
        marginBottom: 24,
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    directionsButton: {
        position: "absolute",
        bottom: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    directionsButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 12,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 6,
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    dropdownMenu: {
        position: "absolute",
        top: 58,
        right: 0,
        width: 140,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 999,
        overflow: "hidden",
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: "500",
    },
    container: {
        flex: 1,
    },
    bannerContainer: {
        height: 250,
        width: "100%",
        position: "relative",
        backgroundColor: "#0F172A",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    bannerHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    headerCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    headerRightBtns: {
        flexDirection: "row",
        gap: 8,
    },
    profileBtnImage: {
        width: "100%",
        height: "100%",
    },
    bannerBottomInfo: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    uniTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: "white",
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: "white",
        fontWeight: "600",
        opacity: 0.9,
    },
    tabBarWrapper: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    tabScroll: {
        alignItems: "center",
    },
    tabInnerContainer: {
        flexDirection: "row",
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 4,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "700",
    },
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    tabContent: {
        flex: 1,
    },
    estimateCard: {
        borderRadius: 16,
        padding: 18,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 16,
    },
    estimateLabel: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    estimateValue: {
        fontSize: 26,
        fontWeight: "900",
        marginBottom: 8,
    },
    costBar: {
        height: 8,
        width: "100%",
        borderRadius: 4,
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: 16,
    },
    costSegment: {
        height: "100%",
    },
    costLegend: {
        flexDirection: "row",
        gap: 16,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontWeight: "600",
    },
    chancesCard: {
        borderRadius: 16,
        padding: 18,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 20,
    },
    chancesTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 16,
    },
    circularProgress: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 4,
        borderColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    circularFill: {
        position: "absolute",
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 4,
        borderColor: "#EF4444",
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
    },
    percentageText: {
        fontSize: 15,
        fontWeight: "900",
    },
    admissionLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 8,
    },
    chancesDescription: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 20,
    },
    completeEstimateBtn: {
        height: 52,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    completeEstimateBtnText: {
        fontSize: 14,
        fontWeight: "800",
    },
    circularInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        marginTop: 14,
    },
    sectionIconBox: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    contentSectionTitle: {
        fontSize: 16,
        fontWeight: "800",
    },
    overviewTextCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 20,
    },
    overviewText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "500",
    },
    notesBox: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    notesLabel: {
        fontSize: 10,
        fontWeight: "800",
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    notesText: {
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    highlightItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 10,
        gap: 10,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    highlightText: {
        fontSize: 13,
        fontWeight: "700",
        flex: 1,
    },
    keyFactsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 4,
    },
    factCard: {
        width: (width - 40 - 12) / 2,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: StyleSheet.hairlineWidth,
    },
    factIconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    factLabel: {
        fontSize: 10,
        fontWeight: "800",
        marginBottom: 4,
    },
    factValue: {
        fontSize: 14,
        fontWeight: "900",
    },
    scholarshipCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 12,
    },
    scholarshipHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
        gap: 10,
    },
    scholarshipName: {
        flex: 1,
        fontSize: 14,
        fontWeight: "800",
    },
    scholarshipValue: {
        fontSize: 15,
        fontWeight: "900",
    },
    scholarshipElig: {
        fontSize: 12,
        marginBottom: 4,
        lineHeight: 16,
    },
    scholarshipNotes: {
        fontSize: 11,
        fontStyle: "italic",
        marginBottom: 10,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    typeBadgeText: {
        fontSize: 9,
        fontWeight: "800",
    },
    noScholarshipBox: {
        padding: 16,
        borderRadius: 14,
        borderStyle: "dashed",
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 20,
        alignItems: "center",
    },
    noScholarshipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    rankingGlobalCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
    },
    globalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
        zIndex: 10,
    },
    medalIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    globalRatingTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "white",
    },
    globalRatingSub: {
        fontSize: 12,
        color: "white",
        opacity: 0.8,
        fontWeight: "600",
    },
    globalRanksRow: {
        flexDirection: "row",
        gap: 12,
        zIndex: 10,
    },
    rankSubCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    rankAgency: {
        fontSize: 9,
        fontWeight: "800",
        color: "white",
        opacity: 0.9,
        marginBottom: 4,
    },
    rankNumber: {
        fontSize: 24,
        fontWeight: "900",
        color: "white",
        marginBottom: 2,
    },
    rankScope: {
        fontSize: 13,
        fontWeight: "800",
        color: "white",
    },
    courseSearchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 16,
    },
    courseInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "600",
    },
    courseCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
    },
    courseTopRow: {
        marginBottom: 6,
    },
    categoryTag: {
        alignSelf: "flex-start",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryTagText: {
        fontSize: 9,
        fontWeight: "700",
    },
    courseName: {
        fontSize: 15,
        fontWeight: "800",
        lineHeight: 20,
        marginBottom: 10,
    },
    courseDetails: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 10,
    },
    courseDetailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    courseDetailText: {
        fontSize: 12,
        fontWeight: "500",
    },
    courseDivider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },
    tuitionRowCompact: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tuitionLabelCompact: {
        fontSize: 10,
        fontWeight: "600",
        marginBottom: 2,
    },
    tuitionValueCompact: {
        fontSize: 16,
        fontWeight: "900",
    },
    noPhotosBox: {
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    noPhotosText: {
        fontSize: 13,
        fontWeight: "600",
    },
    galleryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingTop: 4,
    },
    galleryItem: {
        width: (width - 40 - 10) / 2,
        height: 125,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#F1F5F9",
    },
    galleryImage: {
        width: "100%",
        height: "100%",
    },
    viewerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    viewerCloseBtn: {
        position: "absolute",
        top: Platform.OS === "ios" ? 60 : 40,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
    },
    viewerImage: {
        width: width,
        height: height * 0.7,
    },
});
