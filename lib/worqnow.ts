/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WorqNow Education API Client
 * Docs: https://api.worqnow.ai
 */

const BASE_URL = "https://api.worqnow.ai/education";

const FEE_BAND_USD: Record<string, number> = {
  low: 8_000,
  medium: 16_000,
  high: 26_000,
  very_high: 45_000,
};

export interface WorqnowUniversity {
  id?: string;
  code: string;
  name: string;
  city?: string;
  region?: string;
  website?: string;
  international_fee_band?: string;
  estimatedFeeUSD?: number;
  ranking_world?: number;
  ranking_national?: number;
  courses?: { name: string; category: string; level: string[] }[];
  scholarships?: { name: string; value: string }[];
  is_russell_group?: boolean;
  description?: string;
  type?: string;
  established?: string;
  campus?: string;
  students?: string;
}

const universityCache: Record<string, WorqnowUniversity[]> = {};

const COUNTRY_MAP: Record<string, string> = {
  "australia": "au",
  "canada": "ca",
  "germany": "de",
  "ireland": "ie",
  "netherlands": "nl",
  "uk": "uk",
  "gb": "uk",
  "united kingdom": "uk",
  "united states": "usa",
  "usa": "usa",
  "us": "usa"
};

export async function fetchWorqnowUniversities(
  countryCode: string,
): Promise<WorqnowUniversity[]> {
  const normalizedCountry = countryCode.toLowerCase();
  const mappedCode = COUNTRY_MAP[normalizedCountry] || normalizedCountry;
  
  // Return from memory if already loaded
  if (universityCache[mappedCode]) {
    console.log(`[WorqNow API] Cache HIT for ${mappedCode.toUpperCase()} (${universityCache[mappedCode].length} items)`);
    return universityCache[mappedCode];
  }

  const apiKey = process.env.EXPO_PUBLIC_WORQNOW_API_KEY;
  const url = `${BASE_URL}/${mappedCode}/universities`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only attach auth header if a key is configured and not just a placeholder
  if (apiKey && apiKey !== "your_worqnow_api_key_here") {
    headers["Authorization"] = `Bearer ${apiKey}`;
    headers["x-api-key"] = apiKey;
  }

  console.log(`[WorqNow API] Requesting ${mappedCode.toUpperCase()}...`);
  console.log(`[WorqNow API] URL: ${url}`);
  console.log(`[WorqNow API] Headers:`, JSON.stringify({ ...headers, Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined }, null, 2));

  try {
    const response = await fetch(url, { method: "GET", headers });

    console.log(`[WorqNow API] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.warn(`[WorqNow API] Request failed for ${countryCode}`);
      return [];
    }

    const data = await response.json();
    
    // Log a small sample of the raw result
    console.log(`[WorqNow API] Raw Data Received:`, JSON.stringify(data).substring(0, 300) + "...");

    const list: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    console.log(`[WorqNow API] Found ${list.length} universities.`);
    if (list.length > 0) {
      console.log(`[WorqNow API] Sample Result (First Item):`, JSON.stringify(list[0], null, 2));
    }

    const transformed = list.map((u: any) => ({
      ...u,
      estimatedFeeUSD: FEE_BAND_USD[u.international_fee_band] ?? 0,
    }));

    universityCache[mappedCode] = transformed;
    return transformed;
  } catch (error: any) {
    console.error(`[WorqNow API] ERROR for ${countryCode}:`, error?.message || error);
    return [];
  }
}


export async function getWorqnowUniversityDetail(
  id: string,
  countryString?: string
): Promise<WorqnowUniversity | null> {
  const apiKey = process.env.EXPO_PUBLIC_WORQNOW_API_KEY;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (apiKey && apiKey !== "your_worqnow_api_key_here") {
    headers["Authorization"] = `Bearer ${apiKey}`;
    headers["x-api-key"] = apiKey;
  }

  if (countryString) {
    const normalizedCountry = countryString.toLowerCase();
    const code = COUNTRY_MAP[normalizedCountry] || normalizedCountry;
    const url = `${BASE_URL}/${code}/universities/${id}`;
    
    console.log(`[WorqNow API] Requesting Detail for ID: ${id}`);
    console.log(`[WorqNow API] URL: ${url}`);

    try {
      const res = await fetch(url, { method: "GET", headers });
      
      console.log(`[WorqNow API] Detail Status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        console.log(`[WorqNow API] Detail Data Received:`, JSON.stringify(data, null, 2));
        const uni = data.data || data;
        return {
          ...uni,
          estimatedFeeUSD: FEE_BAND_USD[uni.international_fee_band] ?? 0,
        };
      }
    } catch (e: any) {
      console.warn(`[WorqNow API] Detail Fetch Error for ${id}:`, e?.message || e);
    }
  }

  // Fallback to searching lists if direct fetch fails or country is unknown
  console.log(`[WorqNow API] Triggering fallback list search for ID: ${id}`);
  // Use unique codes for fallback from the official provided list
  const fallbackCountries = ["au", "ca", "de", "ie", "nl", "uk", "usa"];
  const allResults = await Promise.all(
    fallbackCountries.map(c => fetchWorqnowUniversities(c))
  );

  for (const unis of allResults) {
    const found = unis.find(u => 
      u.code === id || 
      u.name === id || 
      String((u as any).id) === id
    );
    if (found) {
      console.log(`[WorqNow API] Found match in list search: ${found.name}`);
      return found;
    }
  }
  
  console.log(`[WorqNow API] No university found for ID: ${id}`);
  return null;
}

