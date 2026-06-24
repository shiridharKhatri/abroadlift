import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? `${process.env.EXPO_PUBLIC_API_URL}/api` : `http://192.168.1.68:3000/api`;
// Fallback local IP for Expo Go on physical device if neither of the above works:
// const API_BASE_URL = 'http://192.168.1.68:3000/api';

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
}

import { fetchWorqnowUniversities, getWorqnowUniversityDetail, WorqnowUniversity } from './worqnow';

export const login = async (phoneE164: string, otp: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneE164, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const requestOtp = async (phoneData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phoneData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to request OTP');
    return data;
  } catch (error) {
    console.error("Request OTP Error:", error);
    throw error;
  }
};

export const verifySignupOtp = async (verifyData: { phoneE164?: string; countryDialCode?: string; phoneNumber?: string; otp: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-signup-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'OTP Verification failed');
    return data;
  } catch (error) {
    console.error("OTP Verification Error:", error);
    throw error;
  }
};

export const register = async (userData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (response.status === 200 && data.existingUser) {
        // Handle existing user (OTP already sent)
        return data;
    }
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const getProfile = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch profile");
    return data;
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    throw error;
  }
};

export const updateProfile = async (userData: any, token: string): Promise<any> => {
  try {
    // Map mobile field names to backend field names if they differ
    const payload = {
      ...userData,
      nationality: userData.country,
      currentCountry: userData.country,
      degreeLevel: userData.studyLevel,
      gpa: userData.cgpa,
      englishScore: userData.score,
    };

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Profile update failed");
    return data;
  } catch (error) {
    console.error("Profile Update Error:", error);
    throw error;
  }
};

export const searchUniversities = async (query: string, countries: string = "All"): Promise<UniversityResult[]> => {

  try {
    // If "All" countries, we'll default to a popular one or a list for demo
    // The web client usually specifies a country.
    const countryToFetch = countries === "All" ? "uk" : countries.toLowerCase();
    
    console.log(`[API Search] Redirecting search to direct WorqNow client for ${countryToFetch}...`);
    const results: WorqnowUniversity[] = await fetchWorqnowUniversities(countryToFetch);
    
    let filtered = results;
    if (query) {
      const q = query.toLowerCase();
      filtered = results.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.city?.toLowerCase().includes(q)
      );
    }

    return processResults(filtered, countries);
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
};

export const getUniversityDetails = async (id: string, country: string): Promise<UniversityDetail | null> => {
  try {
    // Basic guard for when 'country' arrives as a string "undefined"
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
  } catch (error) {
    console.error("Error fetching university details:", error);
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
