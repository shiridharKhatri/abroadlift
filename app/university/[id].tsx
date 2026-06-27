import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
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
import { getCostOfLiving, getUniversityDetails, UniversityDetail } from "../../lib/api";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

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
    const [loading, setLoading] = useState(true);
    const [isUniDescriptionExpanded, setIsUniDescriptionExpanded] = useState(false);
    const [uniData, setUniData] = useState<UniversityDetail | null>(null);
    const [costData, setCostData] = useState<any>(null);
    const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

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
        const totalNpr = (tuitionUsd + livingUsd) * USD_TO_NPR;

        const fmtNpr = (v: number) => {
            if (v >= 100000) return `NPR ${(v / 100000).toFixed(1)} Lakhs`;
            return `NPR ${v.toLocaleString()}`;
        };

        return (
            <View style={styles.tabContent}>
                <View style={[styles.estimateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>ESTIMATED TOTAL COST / YR</Text>
                    <Text style={[styles.estimateValue, { color: colors.text }]}>{fmtNpr(totalNpr)}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, fontWeight: "600" }}>
                        Approx. ${(tuitionUsd + livingUsd).toLocaleString()} USD
                    </Text>
                    <View style={[styles.costBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.costSegment, { width: `${(tuitionUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: '#6366F1' }]} />
                        <View style={[styles.costSegment, { width: `${(livingUsd / (tuitionUsd + livingUsd) * 100).toFixed(0)}%` as any, backgroundColor: '#FBBF24' }]} />
                        <View style={[styles.costSegment, { width: '5%', backgroundColor: '#10B981' }]} />
                    </View>
                    <View style={styles.costLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Tuition</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Living</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Other</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.chancesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.chancesTitle, { color: colors.text }]}>Your Chances</Text>
                    <View style={styles.chancesVisual}>
                        <View style={[styles.circularProgress, { borderColor: colors.border }]}>
                            <View style={[styles.circularFill, { transform: [{ rotate: '45deg' }] }]} />
                            <View style={[styles.circularInner, { backgroundColor: colors.background }]}>
                                <Text style={[styles.percentageText, { color: colors.text }]}>12%</Text>
                            </View>
                        </View>
                        <Text style={[styles.admissionLabel, { color: colors.textSecondary }]}>Admission</Text>
                    </View>
                    <Text style={[styles.chancesDescription, { color: colors.textSecondary }]}>
                        Based on your profile, you have a <Text style={{ fontWeight: '800', color: colors.text }}>low chance</Text> of admission. Improve your test scores to increase odds.
                    </Text>
                    <TouchableOpacity
                        style={[styles.completeEstimateBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push({
                            pathname: "/university/cost-breakdown",
                            params: { id: id, country: currentCountry }
                        })}
                    >
                        <Text style={[styles.completeEstimateBtnText, { color: "#FFFFFF" }]}>Get Complete Cost Breakdown</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.completeEstimateBtn,
                            {
                                backgroundColor: "transparent",
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                marginTop: 12
                            }
                        ]}
                        onPress={() => router.push({
                            pathname: "/university/compare",
                            params: { id1: id, country1: currentCountry }
                        })}
                    >
                        <Text style={[styles.completeEstimateBtnText, { color: colors.primary }]}>Compare with another University</Text>
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
                    <View style={[styles.sectionIconBox, { backgroundColor: colors.border }]}>
                        <Ionicons name="book-outline" size={18} color={colors.primary} />
                    </View>
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
                                size={16}
                                color={colors.primary}
                                style={{ marginLeft: 4 }}
                            />
                        </TouchableOpacity>
                    )}
                    {uniData?.notes && (
                        <View style={[styles.notesBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>ADMISSION NOTES</Text>
                            <Text style={[styles.notesText, { color: colors.text }]}>{uniData.notes}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconBox, { backgroundColor: colors.border }]}>
                        <Ionicons name="star-outline" size={18} color="#FBBF24" />
                    </View>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Highlights</Text>
                </View>
                {details.ranking_world && details.ranking_world !== "N/A" && details.ranking_world !== "0" && (
                    <View style={styles.highlightItem}>
                        <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                            <Ionicons name="ribbon-outline" size={12} color="#FBBF24" />
                        </View>
                        <Text style={[styles.highlightText, { color: colors.text }]}>QS World Ranking: #{details.ranking_world}</Text>
                    </View>
                )}
                {details.ranking_national && details.ranking_national !== "N/A" && details.ranking_national !== "0" && (
                    <View style={styles.highlightItem}>
                        <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                            <Ionicons name="ribbon-outline" size={12} color="#FBBF24" />
                        </View>
                        <Text style={[styles.highlightText, { color: colors.text }]}>National Ranking: #{details.ranking_national}</Text>
                    </View>
                )}
                <View style={styles.highlightItem}>
                    <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                        <Ionicons name="school-outline" size={12} color={colors.primary} />
                    </View>
                    <Text style={[styles.highlightText, { color: colors.text }]}>{details.type || "Higher Education Institution"}</Text>
                </View>
                <View style={styles.highlightItem}>
                    <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                        <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                    </View>
                    <Text style={[styles.highlightText, { color: colors.text }]}>Established in {details.established !== "N/A" ? details.established : "N/A"}</Text>
                </View>
                <View style={styles.highlightItem}>
                    <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                        <Ionicons name="people-outline" size={12} color={colors.primary} />
                    </View>
                    <Text style={[styles.highlightText, { color: colors.text }]}>
                        {(() => {
                            const count = details.students;
                            if (!count) return "10,000+ Students";
                            if (typeof count === "number" || !isNaN(Number(count))) {
                                return `${Number(count).toLocaleString()} Students`;
                            }
                            return `${count} Students`;
                        })()}
                    </Text>
                </View>
                {uniData?.address && (
                    <View style={styles.highlightItem}>
                        <View style={[styles.checkCircle, { backgroundColor: colors.border }]}>
                            <Ionicons name="location-outline" size={12} color={colors.primary} />
                        </View>
                        <Text style={[styles.highlightText, { color: colors.text }]}>Address: {uniData.address}</Text>
                    </View>
                )}

                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconBox, { backgroundColor: colors.border }]}>
                        <Ionicons name="gift-outline" size={18} color="#FBBF24" />
                    </View>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Scholarships</Text>
                </View>

                {uniData?.scholarships && uniData.scholarships.length > 0 ? (
                    uniData.scholarships.map((s, idx) => (
                        <View key={idx} style={[styles.scholarshipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.scholarshipHeader}>
                                <Text style={[styles.scholarshipName, { color: colors.text }]}>{s.name}</Text>
                                <Text style={[styles.scholarshipValue, { color: colors.primary }]}>{s.value}</Text>
                            </View>
                            {s.eligibility && (
                                <Text style={[styles.scholarshipElig, { color: colors.textSecondary }]}>
                                    <Text style={{ fontWeight: '700', color: colors.text }}>Eligibility: </Text>{s.eligibility}
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
                        <Text style={[styles.noScholarshipText, { color: colors.textSecondary }]}>Check university website for latest scholarships.</Text>
                    </View>
                )}

                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconBox, { backgroundColor: colors.border }]}>
                        <Ionicons name="business-outline" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.contentSectionTitle, { color: colors.text }]}>Key Facts</Text>
                </View>
                <View style={styles.keyFactsGrid}>
                    <View style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.factIconBox, { backgroundColor: colors.border }]}>
                            <MaterialCommunityIcons name="office-building" size={20} color="#BF90FF" />
                        </View>
                        <Text style={[styles.factLabel, { color: colors.textSecondary }]}>TYPE</Text>
                        <Text style={[styles.factValue, { color: colors.text }]}>{details.type}</Text>
                    </View>
                    <View style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.factIconBox, { backgroundColor: colors.border }]}>
                            <Ionicons name="time-outline" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.factLabel, { color: colors.textSecondary }]}>ESTABLISHED</Text>
                        <Text style={[styles.factValue, { color: colors.text }]}>{details.established}</Text>
                    </View>
                    <View style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.factIconBox, { backgroundColor: colors.border }]}>
                            <Ionicons name="location-outline" size={20} color="#F43F5E" />
                        </View>
                        <Text style={[styles.factLabel, { color: colors.textSecondary }]}>CAMPUS</Text>
                        <Text style={[styles.factValue, { color: colors.text }]}>{details.campus}</Text>
                    </View>
                    <View style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.factIconBox, { backgroundColor: colors.border }]}>
                            <Ionicons name="people-outline" size={20} color="#10B981" />
                        </View>
                        <Text style={[styles.factLabel, { color: colors.textSecondary }]}>STUDENTS</Text>
                        <Text style={[styles.factValue, { color: colors.text }]}>{details.students}</Text>
                    </View>
                </View>
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

        // Filter the courses based on search text
        const filtered = rawCourses.filter(c =>
            c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
            (c.category && c.category.toLowerCase().includes(courseSearch.toLowerCase()))
        );

        return (
            <View style={styles.tabContent}>
                <View style={[styles.courseSearchWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search Courses..."
                        style={[styles.courseInput, { color: colors.text }]}
                        placeholderTextColor={colors.textSecondary}
                        value={courseSearch}
                        onChangeText={setCourseSearch}
                    />
                </View>

                {filtered.length > 0 ? (
                    filtered.map((course: any, idx) => (
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
                            {/* Category Badge at the top left */}
                            <View style={styles.courseTopRow}>
                                <View style={[styles.categoryTag, { backgroundColor: colors.primary + "15" }]}>
                                    <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                                        {(course.category || "General").toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Course Title taking full width */}
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
                    ))
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
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerRightBtns}>
                            <TouchableOpacity style={styles.headerCircleBtn} onPress={handleShare}>
                                <Ionicons name="share-social-outline" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerCircleBtn} onPress={toggleShortlist}>
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
                <View style={[styles.tabBarWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        {TABS.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tabItem,
                                    selectedTab === tab && { borderBottomColor: colors.primary }
                                ]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: colors.textSecondary },
                                    selectedTab === tab && { color: colors.primary }
                                ]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
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
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    bannerContainer: {
        height: 220,
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
        backgroundColor: "rgba(255,255,255,0.2)",
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
        bottom: 16,
        left: 20,
    },
    uniTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "white",
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
        opacity: 0.9,
    },
    tabBarWrapper: {
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    tabScroll: {
        paddingHorizontal: 12,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    activeTabItem: {
        borderBottomColor: THEME.blue,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#94A3B8",
    },
    activeTabText: {
        color: THEME.blue,
    },
    mainContent: {
        padding: 16,
    },
    tabContent: {
        flex: 1,
    },
    estimateCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#F1F5F9",
        marginBottom: 16,
    },
    estimateLabel: {
        fontSize: 12,
        fontWeight: "800",
        color: "#94A3B8",
        letterSpacing: 1,
        marginBottom: 12,
    },
    estimateValue: {
        fontSize: 24,
        fontWeight: "900",
        color: THEME.textDark,
        marginBottom: 12,
    },
    costBar: {
        height: 10,
        width: "100%",
        backgroundColor: "#F1F5F9",
        borderRadius: 5,
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: 20,
    },
    costSegment: {
        height: "100%",
    },
    costLegend: {
        flexDirection: "row",
        gap: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    chancesCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    chancesTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: THEME.textDark,
        marginBottom: 12,
    },
    chancesVisual: {
        alignItems: "center",
        marginBottom: 24,
    },
    circularProgress: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 4,
        borderColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    circularFill: {
        position: "absolute",
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 4,
        borderColor: "#EF4444",
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
    },
    percentageText: {
        fontSize: 14,
        fontWeight: "900",
        color: THEME.textDark,
    },
    admissionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#94A3B8",
        marginTop: 8,
    },
    chancesDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 24,
    },
    completeEstimateBtn: {
        backgroundColor: "#EFF6FF",
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    completeEstimateBtnText: {
        fontSize: 15,
        fontWeight: "800",
        color: THEME.blue,
    },
    circularInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 8,
    },
    sectionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    contentSectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: THEME.textDark,
    },
    overviewTextCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginBottom: 28,
    },
    overviewText: {
        fontSize: 14,
        lineHeight: 24,
        color: "#475569",
        fontWeight: "500",
    },
    notesBox: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: THEME.orange,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    notesText: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "600",
        lineHeight: 20,
    },
    highlightItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginBottom: 12,
        gap: 12,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    highlightText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
    },
    keyFactsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginTop: 8,
    },
    factCard: {
        width: (width - 64) / 2,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    factIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    factLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#94A3B8",
        marginBottom: 4,
    },
    factValue: {
        fontSize: 15,
        fontWeight: "900",
        color: THEME.textDark,
    },
    scholarshipCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginBottom: 16,
    },
    scholarshipHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
        gap: 12,
    },
    scholarshipName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "800",
        color: THEME.textDark,
    },
    scholarshipValue: {
        fontSize: 16,
        fontWeight: "900",
        color: THEME.green,
    },
    scholarshipElig: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 6,
        lineHeight: 18,
    },
    scholarshipNotes: {
        fontSize: 12,
        color: "#94A3B8",
        fontStyle: "italic",
        marginBottom: 12,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    noScholarshipBox: {
        padding: 20,
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        marginBottom: 24,
        alignItems: "center",
    },
    noScholarshipText: {
        fontSize: 13,
        color: "#94A3B8",
        fontWeight: "600",
    },
    rankingGlobalCard: {
        backgroundColor: THEME.blue,
        borderRadius: 32,
        padding: 28,
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
    },
    globalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 32,
        zIndex: 10,
    },
    medalIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    globalRatingTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "white",
    },
    globalRatingSub: {
        fontSize: 14,
        color: "white",
        opacity: 0.8,
        fontWeight: "600",
    },
    globalRanksRow: {
        flexDirection: "row",
        gap: 16,
        zIndex: 10,
    },
    rankSubCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    rankAgency: {
        fontSize: 10,
        fontWeight: "800",
        color: "white",
        opacity: 0.9,
        marginBottom: 6,
    },
    rankNumber: {
        fontSize: 28,
        fontWeight: "900",
        color: "white",
        marginBottom: 2,
    },
    rankScope: {
        fontSize: 16,
        fontWeight: "800",
        color: "white",
    },
    ribbonOverlay: {
        position: "absolute",
        right: -20,
        bottom: -20,
        opacity: 0.4,
    },
    nationalRankCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        gap: 20,
    },
    nationalIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    nationalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    nationalLabel: {
        fontSize: 13,
        fontWeight: "800",
        color: "#64748B",
    },
    tierBadge: {
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    tierText: {
        fontSize: 11,
        fontWeight: "800",
        color: THEME.blue,
    },
    nationalValue: {
        fontSize: 24,
        fontWeight: "900",
        color: THEME.textDark,
    },
    nationalSub: {
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "600",
    },
    courseSearchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    courseInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: "600",
        color: THEME.textDark,
    },
    courseCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    courseTopRow: {
        marginBottom: 8,
    },
    categoryTag: {
        alignSelf: "flex-start",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryTagText: {
        fontSize: 10,
        fontWeight: "700",
        color: THEME.secondary,
    },
    courseName: {
        fontSize: 16,
        fontWeight: "800",
        color: THEME.textDark,
        lineHeight: 22,
        marginBottom: 12,
    },
    courseDetails: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    courseDetailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    courseDetailText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748B",
    },
    courseDivider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    tuitionRowCompact: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tuitionLabelCompact: {
        fontSize: 11,
        fontWeight: "600",
        color: "#94A3B8",
        marginBottom: 2,
    },
    tuitionValueCompact: {
        fontSize: 18,
        fontWeight: "900",
        color: THEME.secondary,
    },
    bottomActionWrap: {
        paddingHorizontal: 24,
        marginTop: 10,
        marginBottom: 20,
    },
    shortlistBtn: {
        backgroundColor: THEME.blue,
        height: 64,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    shortlistBtnText: {
        color: "white",
        fontSize: 18,
        fontWeight: "900",
    },
    shortlistActiveBtn: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    shortlistActiveBtnText: {
        color: THEME.textDark,
    },
    noPhotosBox: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    noPhotosText: {
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "600",
    },
    galleryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        paddingTop: 8,
    },
    galleryItem: {
        width: (width - 44) / 2,
        height: 140,
        borderRadius: 16,
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
        width: 44,
        height: 44,
        borderRadius: 22,
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
