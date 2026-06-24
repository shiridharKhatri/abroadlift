import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? `http://10.0.2.2:5052/api` : `http://localhost:5052/api`;
const API_KEY = "vl0i3A4W7DxG1fJohzI2qmbedgp4EAYT";

const getHeaders = (extraHeaders?: Record<string, string>) => ({
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
  ...extraHeaders,
});

export interface UniversityResult {
  id: string | number;
  name: string;
  location: string;
  tuition: string | number;
  acceptanceRate: number;
  website: string;
  country: string;
  levels?: string[];
  // Fallbacks for the UI formatting
  course?: string;
  image?: string;
  logo?: string;
  rank?: string;
  duration?: string;
  tuitionValue?: number;
  admissionChance?: string;
  matchRating?: string;
  city?: string;
  recommended?: boolean;
}

export interface UniversityDetail extends UniversityResult {
  description?: string;
  type?: string;
  established?: string;
  campus?: string;
  students?: string;
  ranking_world?: number | string;
  ranking_national?: number | string;
  courses?: { name: string; category: string; level: string[]; fee?: string | number }[];
  scholarships?: {
    name: string;
    type?: string;
    value: string;
    eligibility?: string;
    notes?: string;
  }[];
  notes?: string;
  photos?: { id?: string | number; url: string; url_thumbnail?: string }[];
  address?: string;
  province?: string;
  postal_code?: string;
  coop_participating?: boolean;
  pgwp_participating?: boolean;
  cost_of_living?: string | number;
  currency?: string;
}

import { fetchWorqnowUniversities, getWorqnowUniversityDetail } from './worqnow';

// Mock in-memory store for profile updates during the session
let mockProfileStore: any = {
  name: "John Doe",
  username: "@johndoe",
  email: "john.doe@abroadlift.com",
  phoneE164: "+1234567890",
  profileImage: null,
  country: "",
  flag: "",
  studyLevel: "",
  fieldOfStudy: "",
  recentAcademicField: "",
  cgpa: "",
  englishLevel: "",
  score: "",
  testType: "IELTS",
  passoutYear: "",
  yearlyBudget: "",
  intake: "",
  scholarshipNeeded: false,
  selectedUniversities: [],
  onboardingComplete: false,
};

export const login = async (phoneE164: string, otp: string): Promise<any> => {
  console.log("[Mock API] login called for:", phoneE164);
  // Return mock successful auth
  return {
    token: "dummy-jwt-token-for-testing",
    user: {
      id: "mock-user-123",
      name: mockProfileStore.name,
      username: mockProfileStore.username,
      email: mockProfileStore.email,
      phoneE164: phoneE164,
      profileImage: mockProfileStore.profileImage,
      country: mockProfileStore.country,
      flag: mockProfileStore.flag,
      studyLevel: mockProfileStore.studyLevel,
      fieldOfStudy: mockProfileStore.fieldOfStudy,
      selectedUniversities: [],
      onboardingComplete: mockProfileStore.onboardingComplete,
      profile: {
        nationality: mockProfileStore.country,
        currentCountry: mockProfileStore.country,
        degreeLevel: mockProfileStore.studyLevel,
        gpa: mockProfileStore.cgpa ? parseFloat(mockProfileStore.cgpa) : 0,
        englishScore: mockProfileStore.score ? parseFloat(mockProfileStore.score) : 0,
        fieldOfStudy: mockProfileStore.fieldOfStudy,
        testType: mockProfileStore.testType,
        recentAcademicField: mockProfileStore.recentAcademicField,
        passoutYear: mockProfileStore.passoutYear,
        intake: mockProfileStore.intake,
        englishLevel: mockProfileStore.englishLevel,
        yearlyBudget: mockProfileStore.yearlyBudget ? parseFloat(mockProfileStore.yearlyBudget) : 0,
        scholarshipNeeded: mockProfileStore.scholarshipNeeded,
        onboardingComplete: mockProfileStore.onboardingComplete,
      }
    }
  };
};

export const requestOtp = async (phoneData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string }): Promise<any> => {
  console.log("[Mock API] requestOtp called for:", phoneData);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    sent: true,
    channel: "sms"
  };
};

export const verifySignupOtp = async (verifyData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string; otp: string }): Promise<any> => {
  console.log("[Mock API] verifySignupOtp called:", verifyData);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    token: "dummy-jwt-token-for-testing",
    user: {
      id: "mock-user-123",
      name: "New Student",
      username: "@student",
      phoneE164: verifyData.phoneE164 || "+1234567890",
      selectedUniversities: [],
      onboardingComplete: false
    }
  };
};

export const register = async (userData: any): Promise<any> => {
  console.log("[Mock API] register called:", userData);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Update mock in-memory store
  mockProfileStore = {
    ...mockProfileStore,
    ...userData,
  };

  return {
    token: "dummy-jwt-token-for-testing",
    user: {
      id: "mock-user-123",
      name: mockProfileStore.name,
      username: mockProfileStore.username,
      email: mockProfileStore.email,
      phoneE164: mockProfileStore.phoneE164,
      profileImage: mockProfileStore.profileImage,
      country: mockProfileStore.country,
      flag: mockProfileStore.flag,
      studyLevel: mockProfileStore.studyLevel,
      fieldOfStudy: mockProfileStore.fieldOfStudy,
      selectedUniversities: [],
    }
  };
};

export const getProfile = async (token: string): Promise<any> => {
  console.log("[Mock API] getProfile called with token:", token);
  return {
    profile: {
      nationality: mockProfileStore.country,
      currentCountry: mockProfileStore.country,
      degreeLevel: mockProfileStore.studyLevel,
      gpa: mockProfileStore.cgpa ? parseFloat(mockProfileStore.cgpa) : null,
      englishScore: mockProfileStore.score ? parseFloat(mockProfileStore.score) : null,
      fieldOfStudy: mockProfileStore.fieldOfStudy,
      testType: mockProfileStore.testType,
      recentAcademicField: mockProfileStore.recentAcademicField,
      passoutYear: mockProfileStore.passoutYear,
      intake: mockProfileStore.intake,
      englishLevel: mockProfileStore.englishLevel,
      yearlyBudget: mockProfileStore.yearlyBudget ? parseFloat(mockProfileStore.yearlyBudget) : null,
      scholarshipNeeded: mockProfileStore.scholarshipNeeded,
      onboardingComplete: mockProfileStore.onboardingComplete,
    },
    user: {
      id: "mock-user-123",
      name: mockProfileStore.name,
      username: mockProfileStore.username,
      email: mockProfileStore.email,
      phoneE164: mockProfileStore.phoneE164,
      profileImage: mockProfileStore.profileImage,
      selectedUniversities: mockProfileStore.selectedUniversities || [],
      onboardingComplete: mockProfileStore.onboardingComplete,
    }
  };
};

export const updateProfile = async (userData: any, token: string): Promise<any> => {
  console.log("[Mock API] updateProfile called:", userData);
  
  mockProfileStore = {
    ...mockProfileStore,
    ...userData,
  };

  return {
    success: true,
    profile: {
      nationality: mockProfileStore.country,
      currentCountry: mockProfileStore.country,
      degreeLevel: mockProfileStore.studyLevel,
      gpa: mockProfileStore.cgpa ? parseFloat(mockProfileStore.cgpa) : null,
      englishScore: mockProfileStore.score ? parseFloat(mockProfileStore.score) : null,
      fieldOfStudy: mockProfileStore.fieldOfStudy,
      testType: mockProfileStore.testType,
      recentAcademicField: mockProfileStore.recentAcademicField,
      passoutYear: mockProfileStore.passoutYear,
      intake: mockProfileStore.intake,
      englishLevel: mockProfileStore.englishLevel,
      yearlyBudget: mockProfileStore.yearlyBudget ? parseFloat(mockProfileStore.yearlyBudget) : null,
      scholarshipNeeded: mockProfileStore.scholarshipNeeded,
      onboardingComplete: mockProfileStore.onboardingComplete,
    }
  };
};

const ABROADLIFT_API_BASE = API_BASE_URL;

export const getScholarships = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${ABROADLIFT_API_BASE}/scholarships`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Failed to load scholarships:", error);
    return [];
  }
};

export const saveStudentEvaluation = async (profileData: any): Promise<any> => {
  try {
    const response = await fetch(`${ABROADLIFT_API_BASE}/profiles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: profileData.name || "Jane Doe",
        gpa: parseFloat(profileData.cgpa || profileData.gpa || "80"),
        english_score: parseFloat(profileData.score || profileData.english_score || "6.5"),
        gap_years: parseInt(profileData.gap_years || "0"),
        backlogs: parseInt(profileData.backlogs || "0"),
        work_experience: parseInt(profileData.work_experience || "0"),
        available_funds: parseFloat(profileData.yearlyBudget || profileData.available_funds || "25000"),
        sponsor_type: profileData.sponsor_type || "parents"
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to save evaluation');
    return data;
  } catch (error) {
    console.error("Save Evaluation Error:", error);
    throw error;
  }
};

const normalizeCountry = (country: string): string => {
  const c = country.toLowerCase().trim();
  if (c === "usa" || c === "us" || c === "united states" || c === "united states of america") return "usa";
  if (c === "uk" || c === "gb" || c === "united kingdom" || c === "great britain") return "uk";
  if (c === "canada" || c === "ca") return "canada";
  if (c === "germany" || c === "de") return "germany";
  if (c === "australia" || c === "au") return "australia";
  if (c === "india" || c === "in") return "india";
  if (c === "japan" || c === "jp") return "japan";
  if (c === "france" || c === "fr") return "france";
  if (c === "italy" || c === "it") return "italy";
  if (c === "korea" || c === "kr" || c === "south korea") return "korea";
  if (c === "nether" || c === "nl" || c === "netherlands" || c === "holland") return "nether";
  if (c === "brazil" || c === "br") return "brazil";
  return c;
};

export const searchUniversities = async (query: string, countries: string = "All"): Promise<UniversityResult[]> => {
  try {
    const res = await fetch(`${ABROADLIFT_API_BASE}/schools?limit=100`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    const schools = result.data || [];

    const mapped: UniversityResult[] = schools.map((s: any) => {
      const countryName = s.country || "USA";
      return {
        id: String(s.id || s.school_id || s._id),
        name: s.name || "Unknown University",
        location: s.location || s.city || countryName,
        tuition: s.tuition || s.average_fees || "$25,000 / yr",
        acceptanceRate: s.acceptanceRate || s.acceptance_rate || 65,
        website: s.website || "",
        country: countryName,
        levels: s.levels || ["Bachelors", "Masters"],
        image: s.banner?.url || s.logo?.url || s.image || s.image_url || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
        logo: s.logo?.url || s.logo?.url_thumbnail || "",
        rank: s.rank || s.ranking || "N/A",
      };
    });

    let filtered = mapped;
    if (countries !== "All") {
      const targetCountryNorm = normalizeCountry(countries);
      filtered = mapped.filter(u => normalizeCountry(u.country) === targetCountryNorm);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q)
      );
    }

    return filtered;
  } catch (error: any) {
    console.log(`[API Search] Rate limited or offline (${error.message || error}), using local Worqnow fallback.`);
    const countryToFetch = countries === "All" ? "uk" : countries.toLowerCase();
    const results = await fetchWorqnowUniversities(countryToFetch);

    let filtered = results;
    if (query) {
      const q = query.toLowerCase();
      filtered = results.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
      );
    }

    return processResults(filtered, countries);
  }
};

export const getUniversityDetails = async (id: string, country: string): Promise<UniversityDetail | null> => {
  try {
    const res = await fetch(`${ABROADLIFT_API_BASE}/schools/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    const s = result.data || result;

    let schoolCourses: any[] = [];
    try {
      const progRes = await fetch(`${ABROADLIFT_API_BASE}/programs/school/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (progRes.ok) {
        const progResult = await progRes.json();
        const programsList = Array.isArray(progResult) ? progResult : (progResult.data || []);
        schoolCourses = programsList.map((p: any) => ({
          name: p.name || p.title,
          category: p.category || p.level_text || p.level || "General",
          level: p.level_text ? [p.level_text] : (p.level ? [p.level] : ["Bachelors", "Masters"]),
          fee: p.tuition ? `$${parseFloat(p.tuition).toLocaleString()}/yr` : (p.fee || s.tuition || s.average_fees || "$25,000 / yr"),
          description: p.description || "",
          other_fees: p.other_fees || [],
          coop_participating: p.coop_participating ?? false,
          pgwp_participating: p.pgwp_participating ?? false,
          application_fee: p.application_fee || "",
          delivery_method: p.delivery_method || "",
          length_breakdown: p.length_breakdown || "",
          language_of_instruction: p.language_of_instruction || "",
          requirements: p.requirements || null,
        }));
      }
    } catch (e) {
      console.error("Error fetching school programs:", e);
    }

    const countryName = s.country || country || "USA";
    return {
      id: String(s.id || s.school_id || s._id),
      name: s.name || "Unknown University",
      location: s.location || s.city || countryName,
      tuition: s.tuition || s.average_fees || "$25,000 / yr",
      acceptanceRate: s.acceptanceRate || s.acceptance_rate || 65,
      website: s.website || "",
      country: countryName,
      levels: s.levels || ["Bachelors", "Masters"],
      image: s.banner?.url || s.logo?.url || s.image || s.image_url || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
      rank: s.school_rank || s.rank || s.ranking || "N/A",
      description: s.description || s.about || `The ${s.name} is a renowned institution.`,
      type: s.type || s.institution_type || "Public University",
      established: s.established || s.founded_in || "N/A",
      campus: s.campus || "Main Campus",
      students: s.total_number_of_students || s.students || "10,000+",
      ranking_world: s.school_rank || s.ranking_world || s.rank || "N/A",
      ranking_national: s.ranking_national || "N/A",
      courses: schoolCourses,
      scholarships: s.scholarships || [],
      photos: s.photos || [],
      address: s.address || "",
      province: s.province || "",
      postal_code: s.postal_code || "",
      coop_participating: s.coop_participating ?? false,
      pgwp_participating: s.pgwp_participating ?? false,
      cost_of_living: s.cost_of_living || "",
      currency: s.currency || "USD"
    };
  } catch (error) {
    console.error("Error fetching details from AbroadLift API, falling back to local Worqnow:", error);
    const actualCountry = (country === "undefined" || !country) ? "uk" : country;
    const data = await getWorqnowUniversityDetail(id, actualCountry);
    if (!data) return null;

    const processed = processResults([data], actualCountry)[0];

    return {
      ...processed,
      description: data.description || `The ${data.name} is a renowned institution located in ${data.city || data.region || country}. It offers a wide range of academic programs and is known for its commitment to excellence in research and teaching.`,
      type: data.is_russell_group ? "Russell Group / Research" : (data.type || "Public Research"),
      established: data.established || "N/A",
      campus: data.campus || (data.city ? `${data.city} Campus` : "Contact University"),
      students: data.students || "10,000+",
      ranking_world: data.ranking_world || "N/A",
      ranking_national: data.ranking_national || "N/A",
      courses: data.courses?.map(c => ({
        ...c,
        fee: processed.tuition
      })) || [],
      scholarships: data.scholarships || [],
      notes: (data as any).notes || ""
    };
  }
};

const processResults = (results: any[], searchCountry: string): UniversityResult[] => {
  if (!results) return [];
  return results.map((res: any) => {
    // WorqNow uses 'code' as the unique ID
    const uniqueId = res.code || res.id || `temp-${Math.random().toString(36).substr(2, 9)}`;

    // Attempt to extract numerical tuition
    let tuitionValue = 35000;
    if (typeof res.tuition === 'number') {
      tuitionValue = res.tuition;
    } else if (typeof res.tuition === 'string') {
      const match = res.tuition.replace(/[^0-9.]/g, '');
      if (match) tuitionValue = parseInt(match, 10);
    }

    // Attempt to map acceptance rate to chance string
    let chance = "Moderate";
    const rate = res.acceptanceRate || 50;
    if (rate >= 60) chance = "High";
    else if (rate <= 30) chance = "Low";

    // Fallback country name if API doesn't provide it
    const displayCountry = res.country || (searchCountry && searchCountry !== "All" ? searchCountry : "Global");

    return {
      id: String(uniqueId),
      name: res.name || "Unknown University",
      course: res.course || "Various Courses", // API returns institutions, not specific courses
      location: res.location || (res.city ? `${res.city}, ${displayCountry}` : `Various Locations, ${displayCountry}`),
      image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800", // Default image
      rank: res.ranking_world ? `#${res.ranking_world} Global` : (res.rank || "N/A"),
      duration: "Check Website",
      tuition: (() => {
        if (typeof res.tuition === 'number') return `$${res.tuition.toLocaleString()} / yr`;
        if (res.tuition && res.tuition !== "Check Website") return res.tuition;

        // Regional Averages (USD)
        const country = (res.country || searchCountry || "").toUpperCase();
        if (country.includes("USA") || country.includes("UNITED STATES")) return "$35,000 / yr";
        if (country.includes("UK") || country.includes("UNITED KINGDOM") || country.includes("GB")) return "$22,000 / yr";
        if (country.includes("CANADA") || country === "CA") return "$20,000 / yr";
        if (country.includes("AUSTRALIA") || country === "AU") return "$26,000 / yr";
        if (country.includes("GERMANY") || country === "DE") return "$2,500 / yr";
        if (country.includes("IRELAND") || country === "IE") return "$18,000 / yr";

        return "$20,000 / yr"; // Global fallback
      })(),
      tuitionValue: (() => {
        if (typeof res.tuition === 'number') return res.tuition;
        const mappedStr = res.tuition || "";
        const match = mappedStr.replace(/[^0-9]/g, '');
        if (match) return parseInt(match, 10);

        // Match the same logic as above for the numeric value
        const country = (res.country || searchCountry || "").toUpperCase();
        if (country.includes("USA") || country.includes("UNITED STATES")) return 35000;
        if (country.includes("UK") || country.includes("UNITED KINGDOM") || country.includes("GB")) return 22000;
        if (country.includes("CANADA") || country === "CA") return 20000;
        if (country.includes("AUSTRALIA") || country === "AU") return 26000;
        if (country.includes("GERMANY") || country === "DE") return 2500;

        return 20000;
      })(),
      acceptanceRate: rate,
      admissionChance: chance,
      matchRating: "4.0",
      country: displayCountry,
      city: res.city || res.location?.split(',')[0] || "",
      recommended: false,
      website: res.website || "",
      levels: res.courses?.reduce((acc: string[], c: any) => {
        if (c.level) {
          c.level.forEach((l: string) => {
            const normalized = l.toLowerCase();
            if (normalized.includes("bachelor") && !acc.includes("Bachelors")) acc.push("Bachelors");
            if ((normalized.includes("master") || normalized.includes("pg")) && !acc.includes("Masters")) acc.push("Masters");
          });
        }
        return acc;
      }, []) || ["Bachelors", "Masters"], // Default to both if unknown
      ...res // Allow overrides if API changes
    };
  });
};

export const getCostOfLiving = async (countryCode: string): Promise<any> => {
  try {
    const rawUrl = process.env.EXPO_PUBLIC_COST_ESTIMSTION_API;
    // Handle the potential open quote in .env
    const url = rawUrl?.startsWith('"') ? rawUrl.substring(1) : rawUrl;

    if (!url) {
      console.warn("Cost of living API URL not found in env");
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch cost of living");

    const json = await response.json();
    const data = json.data || [];

    const normalization: Record<string, string> = {
      "USA": "US", "UNITED STATES": "US",
      "UK": "GB", "UNITED KINGDOM": "GB", "GREAT BRITAIN": "GB",
      "CANADA": "CA", "CAN": "CA",
      "AUSTRALIA": "AU", "AUS": "AU",
      "GERMANY": "DE", "GER": "DE",
      "INDIA": "IN", "IND": "IN",
      "IRELAND": "IE", "IRL": "IE",
    };

    const upperCountry = countryCode.toUpperCase();
    const targetCode = (normalization[upperCountry] || countryCode).toUpperCase();

    let countryData = data.find((d: any) => d.country_code?.toUpperCase() === targetCode);

    // Fallback GB/UK
    if (!countryData && targetCode === "GB") countryData = data.find((d: any) => d.country_code?.toUpperCase() === "UK");
    if (!countryData && targetCode === "UK") countryData = data.find((d: any) => d.country_code?.toUpperCase() === "GB");

    return countryData;
  } catch (error) {
    console.error("Error fetching cost of living:", error);
    return null;
  }
};

export const getRelocationIndex = async (countryCode: string): Promise<any> => {
  try {
    const url = process.env.EXPO_PUBLIC_QOI_API;
    if (!url) {
      console.warn("Relocation Index (QOI) API URL not found in env");
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch relocation index");

    const json = await response.json();
    const data = json.data || [];

    const normalization: Record<string, string> = {
      "USA": "US", "UNITED STATES": "US",
      "UK": "GB", "UNITED KINGDOM": "GB", "GREAT BRITAIN": "GB",
      "CANADA": "CA", "CAN": "CA",
      "AUSTRALIA": "AU", "AUS": "AU",
      "GERMANY": "DE", "GER": "DE",
      "INDIA": "IN", "IND": "IN",
      "IRELAND": "IE", "IRL": "IE",
    };

    const upperCountry = countryCode.toUpperCase();
    const targetCode = (normalization[upperCountry] || countryCode).toLowerCase();

    let countryData = data.find((d: any) => d.country_code?.toLowerCase() === targetCode);

    // Fallback GB/UK
    if (!countryData && targetCode === "gb") countryData = data.find((d: any) => d.country_code?.toLowerCase() === "uk");
    if (!countryData && targetCode === "uk") countryData = data.find((d: any) => d.country_code?.toLowerCase() === "gb");

    return countryData;
  } catch (error) {
    console.error("Error fetching relocation index:", error);
    return null;
  }
};
export const calculateAcceptanceChance = (user: any, uni: any) => {
  if (!user || !uni) return { score: 50, label: "Moderate" };

  const gpa = parseFloat(user.cgpa || "0");
  const engScore = parseFloat(user.score || "0");

  // 1. Normalize Academic Data
  let gpaNorm = 0.5; // Default middle
  if (gpa > 0) {
    gpaNorm = gpa / 4.0;
    if (gpa > 4.5) gpaNorm = gpa / 10.0;
  }

  let engNorm = 0.6; // Default middle
  if (engScore > 0) {
    engNorm = engScore / 9.0;
  }

  // 2. Base University Probability (Historical)
  // Most good universities have acceptance rates between 15% and 60%
  const baseProb = uni.acceptanceRate || 45;

  // 3. Calculation with high sensitivity to GPA/English
  // We want user details to significantly shift the base admission rate
  let prob = baseProb;

  // GPA can shift it by +/- 30%
  prob += (gpaNorm - 0.75) * 40;

  // English can shift it by +/- 15%
  prob += (engNorm - 0.7) * 20;

  // 4. Ranking Multiplier (Harder for higher ranked)
  const rankStr = uni.rank || "";
  const rankVal = parseInt(rankStr.replace(/[^0-9]/g, ""));
  if (!isNaN(rankVal)) {
    if (rankVal < 100) prob -= 15;
    else if (rankVal < 500) prob -= 5;
  }

  // 5. Add a small 'jitter' based on unique ID so they all look different even if data is similar
  const jitter = (String(uni.id).charCodeAt(0) % 7) - 3; // -3 to +3
  prob += jitter;

  const finalScore = Math.min(95, Math.max(5, Math.round(prob)));

  let label = "Moderate";
  if (finalScore >= 80) label = "Safe";
  else if (finalScore >= 65) label = "Good";
  else if (finalScore < 45) label = "Reach";

  return { score: finalScore, label };
};
