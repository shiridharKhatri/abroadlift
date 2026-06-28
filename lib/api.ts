
const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 15000) => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  const response = await Promise.race([
    fetch(url, options),
    timeoutPromise,
  ]);
  return response;
};


const getApiBaseUrl = () => {
  return "https://api.abroadlift.com/api";
};

const API_BASE_URL = getApiBaseUrl();
const API_KEY = "vl0i3A4W7DxG1fJohzI2qmbedgp4EAYT";

const getHeaders = (extraHeaders?: Record<string, string>) => ({
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
  ...extraHeaders,
});

const getCampusImage = (name: string): string => {
  const campusImages = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a91?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1607237138185-eedd996e5b00?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % campusImages.length;
  return campusImages[index];
};

const parseTuitionInfo = (tuitionVal: any, countryName: string): { tuition: string; tuitionValue: number } => {
  let tuitionValue = 0;
  let tuitionString = "N/A";

  if (typeof tuitionVal === 'number') {
    tuitionValue = tuitionVal;
    tuitionString = `$${tuitionVal.toLocaleString()} / yr`;
  } else if (typeof tuitionVal === 'string' && tuitionVal.trim() !== "") {
    const clean = tuitionVal.replace(/[^0-9.]/g, '');
    const parsed = parseInt(clean, 10);
    if (!isNaN(parsed) && parsed > 0) {
      tuitionValue = parsed;
      tuitionString = tuitionVal.includes('/') ? tuitionVal : `${tuitionVal} / yr`;
    }
  }

  return { tuition: tuitionString, tuitionValue };
};

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
  console.log("Calling live login API for:", phoneE164);
  const response = await fetch(`https://abroadlift.com/api/auth/mobile/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneE164, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to login');
  return data;
};

export const requestOtp = async (phoneData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string }): Promise<any> => {
  console.log("Calling live requestOtp API:", phoneData);
  const response = await fetch(`https://abroadlift.com/api/auth/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phoneData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to request OTP');
  return data;
};

export const verifySignupOtp = async (verifyData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string; otp: string }): Promise<any> => {
  console.log("Calling live verifySignupOtp API:", verifyData);
  const response = await fetch(`https://abroadlift.com/api/auth/verify-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verifyData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to verify OTP');
  return data;
};

export const register = async (userData: any): Promise<any> => {
  console.log("Calling live register API:", userData);
  const response = await fetch(`https://abroadlift.com/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      countryDialCode: userData.countryDialCode,
      phoneNumber: userData.phoneNumber,
      prefersWhatsApp: userData.prefersWhatsApp ?? true,
      nationality: userData.country,
      currentCountry: userData.country,
      gpa: userData.cgpa,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to register');
  return data;
};

export const getProfile = async (token: string): Promise<any> => {
  console.log("Calling live getProfile API");
  const response = await fetch(`https://abroadlift.com/api/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to get profile');
  return data;
};

export const updateProfile = async (userData: any, token: string): Promise<any> => {
  console.log("Calling live updateProfile API");

  const payload = {
    name: userData.name,
    email: userData.email,
    nationality: userData.country,
    currentCountry: userData.country,
    degreeLevel: userData.studyLevel,
    gpa: userData.cgpa ? parseFloat(userData.cgpa) : null,
    englishScore: userData.score ? parseFloat(userData.score) : null,
    fieldOfStudy: userData.fieldOfStudy,
    testType: userData.testType,
    recentAcademicField: userData.recentAcademicField,
    passoutYear: userData.passoutYear,
    intake: userData.intake,
    englishLevel: userData.englishLevel,
    yearlyBudget: userData.yearlyBudget ? parseFloat(userData.yearlyBudget) : null,
    scholarshipNeeded: userData.scholarshipNeeded,
    onboardingComplete: userData.onboardingComplete,
    selectedUniversities: userData.selectedUniversities
  };

  const response = await fetch(`https://abroadlift.com/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
};

export const getMatch = async (token: string): Promise<any> => {
  try {
    const res = await fetch(`https://abroadlift.com/api/match`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to load match:", error);
    return null;
  }
};

export const getMatches = async (params: { countries?: string; budget?: number; degreeLevel?: string; field?: string }): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.countries) queryParams.append("countries", params.countries);
    if (params.budget) queryParams.append("budget", String(params.budget));
    if (params.degreeLevel) queryParams.append("degreeLevel", params.degreeLevel);
    if (params.field) queryParams.append("field", params.field);

    const res = await fetch(`https://abroadlift.com/api/matches?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data || result || [];
  } catch (error) {
    console.error("Failed to load matches:", error);
    return [];
  }
};

export const saveMatch = async (token: string, matchData: any, formData?: any): Promise<any> => {
  try {
    const res = await fetch(`https://abroadlift.com/api/matches/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        formData: formData || {},
        matchData: matchData
      }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to save match:", error);
    throw error;
  }
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

export const getAvailableCountries = async (): Promise<{ id: string; name: string; code: string; flag: string }[]> => {
  try {
    const res = await fetchWithTimeout(`https://abroadlift.com/api/schools?allCountries=true`, {
      method: "GET",
      headers: getHeaders(),
    }, 15000);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    const list = result.data || [];

    const flagMap: Record<string, string> = {
      "US": "🇺🇸", "USA": "🇺🇸",
      "GB": "🇬🇧", "UK": "🇬🇧",
      "CA": "🇨🇦", "CANADA": "🇨🇦",
      "AU": "🇦🇺", "AUSTRALIA": "🇦🇺",
      "DE": "🇩🇪", "GERMANY": "🇩🇪",
      "FR": "🇫🇷", "FRANCE": "🇫🇷",
      "JP": "🇯🇵", "JAPAN": "🇯🇵",
      "IT": "🇮🇹", "ITALY": "🇮🇹",
      "KR": "🇰🇷", "KOREA": "🇰🇷", "SOUTH KOREA": "🇰🇷",
      "IN": "🇮🇳", "INDIA": "🇮🇳",
      "NL": "🇳🇱", "NETHERLANDS": "🇳🇱", "NETHER": "🇳🇱",
      "BR": "🇧🇷", "BRAZIL": "🇧🇷"
    };

    return list.map((c: any) => {
      const code = String(c.code).toUpperCase();
      const flag = flagMap[code] || flagMap[String(c.name).toUpperCase()] || "🏳️";
      return {
        id: String(c.name).toLowerCase(),
        name: c.name,
        code: code === "UK" ? "gb" : (code === "USA" ? "us" : code.toLowerCase()),
        flag: flag
      };
    });
  } catch (error) {
    console.error("Failed to load available countries:", error);
    return [
      { id: "usa", name: "USA", code: "us", flag: "🇺🇸" },
      { id: "uk", name: "UK", code: "gb", flag: "🇬🇧" },
      { id: "canada", name: "Canada", code: "ca", flag: "🇨🇦" },
      { id: "korea", name: "Korea", code: "kr", flag: "🇰🇷" },
      { id: "nether", name: "Nether", code: "nl", flag: "🇳🇱" },
      { id: "brazil", name: "Brazil", code: "br", flag: "🇧🇷" },
      { id: "germany", name: "Germany", code: "de", flag: "🇩🇪" },
      { id: "india", name: "India", code: "in", flag: "🇮🇳" },
      { id: "australia", name: "Australia", code: "au", flag: "🇦🇺" },
      { id: "france", name: "France", code: "fr", flag: "🇫🇷" },
      { id: "japan", name: "Japan", code: "jp", flag: "🇯🇵" },
      { id: "italy", name: "Italy", code: "it", flag: "🇮🇹" },
    ];
  }
};

const normalizeCountry = (country: any): string => {
  if (!country || typeof country !== "string") return "";
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

let cachedSchools: UniversityResult[] | null = null;

export const searchUniversities = async (query: string, countries: string = "All"): Promise<UniversityResult[]> => {
  try {
    if (!cachedSchools) {
      const res = await fetchWithTimeout(`${ABROADLIFT_API_BASE}/schools?limit=1500`, {
        method: "GET",
        headers: getHeaders(),
      }, 15000);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      const schools = result.data || [];

      cachedSchools = schools.map((s: any) => {
        const countryName = s.country || "USA";
        const tInfo = parseTuitionInfo(s.tuition || s.average_fees, countryName);
        return {
          id: String(s.id || s.school_id || s._id),
          name: s.name || "Unknown University",
          location: s.location || s.city || countryName,
          tuition: tInfo.tuition,
          tuitionValue: tInfo.tuitionValue,
          acceptanceRate: s.acceptanceRate || s.acceptance_rate || 65,
          website: s.website || "",
          country: countryName,
          levels: s.levels || ["Bachelors", "Masters"],
          image: s.banner?.url || s.logo?.url || s.image || s.image_url || getCampusImage(s.name || "University"),
          logo: s.logo?.url || s.logo?.url_thumbnail || "",
          rank: s.rank || s.ranking || "N/A",
        };
      });
    }

    if (!cachedSchools) {
      return [];
    }

    let filtered = cachedSchools;
    if (countries !== "All") {
      const targetCountryNorm = normalizeCountry(countries);
      filtered = cachedSchools.filter(u => normalizeCountry(u.country) === targetCountryNorm);
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
    console.warn("[API Search] Failed to fetch from AbroadLift API:", error.message || error);
    return [];
  }
};

export const getUniversityDetails = async (id: string, country: string): Promise<UniversityDetail | null> => {
  try {
    const res = await fetchWithTimeout(`${ABROADLIFT_API_BASE}/schools/${id}`, {
      method: "GET",
      headers: getHeaders(),
    }, 8000);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    const s = result.data || result;

    let schoolCourses: any[] = [];
    try {
      const progRes = await fetchWithTimeout(`${ABROADLIFT_API_BASE}/programs/school/${id}`, {
        method: "GET",
        headers: getHeaders(),
      }, 8000);
      if (progRes.ok) {
        const progResult = await progRes.json();
        const programsList = Array.isArray(progResult) ? progResult : (progResult.data || []);
        schoolCourses = programsList.map((p: any) => ({
          name: p.name || p.title,
          category: p.category || p.level_text || p.level || "General",
          level: p.level_text ? [p.level_text] : (p.level ? [p.level] : ["Bachelors", "Masters"]),
          fee: p.tuition ? `$${parseFloat(p.tuition).toLocaleString()}/yr` : (p.fee || s.tuition || s.average_fees || "N/A"),
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
      console.warn("Error fetching school programs:", e);
    }

    const countryName = s.country || country || "USA";
    const tInfo = parseTuitionInfo(s.tuition || s.average_fees, countryName);
    let finalTuition = tInfo.tuition;
    let finalTuitionValue = tInfo.tuitionValue;

    if (schoolCourses.length > 0) {
      const tuitions = schoolCourses
        .map(c => {
          if (c.fee) {
            const clean = String(c.fee).replace(/[^0-9.]/g, '');
            const parsed = parseFloat(clean);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        })
        .filter(t => t > 0);

      if (tuitions.length > 0) {
        const sum = tuitions.reduce((acc, val) => acc + val, 0);
        finalTuitionValue = Math.round(sum / tuitions.length);
        finalTuition = `$${finalTuitionValue.toLocaleString()} / yr`;
      }
    }

    return {
      id: String(s.id || s.school_id || s._id),
      name: s.name || "Unknown University",
      location: s.location || s.city || countryName,
      tuition: finalTuition,
      tuitionValue: finalTuitionValue,
      acceptanceRate: s.acceptanceRate || s.acceptance_rate || 65,
      website: s.website || "",
      country: countryName,
      levels: s.levels || ["Bachelors", "Masters"],
      image: s.banner?.url || s.logo?.url || s.image || s.image_url || getCampusImage(s.name || "University"),
      logo: s.logo?.url || s.logo?.url_thumbnail || s.logo || "",
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
    console.warn("[API Details] Failed to fetch details from AbroadLift API:", error);
    return null;
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
      image: getCampusImage(res.name || "University"), // Default image
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
        if (Array.isArray(c.level)) {
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
    const response = await fetch(`https://abroadlift.com/api/cost-of-living?countryCode=${countryCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.warn(`Cost of living API returned status ${response.status} for ${countryCode}`);
      return null;
    }
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching cost of living:", error);
    return null;
  }
};

export const getRelocationIndex = async (countryCode: string): Promise<any> => {
  try {
    const response = await fetch(`https://abroadlift.com/api/relocation-index?countryCode=${countryCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.warn(`Relocation index API returned status ${response.status} for ${countryCode}`);
      return null;
    }
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching relocation index:", error);
    return null;
  }
};

export const getVisaStatus = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`https://abroadlift.com/api/visa`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch visa rate checks");
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching visa rate checks:", error);
    return null;
  }
};

export const checkVisa = async (
  token: string,
  visaData: {
    nationality: string;
    destination: string;
    degreeLevel: string;
    fundsAvailable: number;
    ieltsScore: number;
    pastRejections: boolean;
  }
): Promise<any> => {
  try {
    const response = await fetch(`https://abroadlift.com/api/visa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(visaData),
    });
    if (!response.ok) throw new Error("Failed to run visa check");
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error running visa check:", error);
    throw error;
  }
};

export const getVisaGuidance = async (countryCode: string): Promise<any> => {
  try {
    const response = await fetch(`https://abroadlift.com/api/visa-guidance?countryCode=${countryCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch visa guidance");
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching visa guidance:", error);
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
