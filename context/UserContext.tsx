import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, updateProfile as apiUpdateProfile } from '../lib/api';

type UserData = {
  id?: string;
  name: string;
  username: string;
  email?: string;
  profileImage: string | null;
  country: string;
  flag: string;
  studyLevel: string;
  fieldOfStudy: string;
  recentAcademicField?: string;
  cgpa?: string;
  englishLevel?: string;
  score?: string;
  testType?: string;
  passoutYear?: string;
  yearlyBudget?: string;
  intake?: string;
  scholarshipNeeded?: boolean;
  selectedUniversities: any[];
  onboardingComplete?: boolean;
  admissionProb?: number | null;
  visaSuccessProb?: number | null;
};

type UserContextType = {
  userData: UserData;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneE164: string, otp: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  selectUniversity: (uni: any) => void;
};

const DEFAULT_USER_DATA: UserData = {
  name: "New Student",
  username: "@student",
  profileImage: null,
  country: "",
  flag: "",
  studyLevel: "",
  fieldOfStudy: "",
  recentAcademicField: "",
  cgpa: "",
  englishLevel: "",
  score: "",
  testType: "",
  passoutYear: "",
  yearlyBudget: "",
  intake: "",
  scholarshipNeeded: false,
  selectedUniversities: [],
  onboardingComplete: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, _setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@auth_token');
        const storedUser = await AsyncStorage.getItem('@user_data');

        if (storedToken) {
          setToken(storedToken);

          // First, restore local data immediately so routing has something to check
          const storedObj = storedUser ? JSON.parse(storedUser) : DEFAULT_USER_DATA;
          _setUserData(storedObj);

          if (storedToken !== "dummy-jwt-token-for-testing") {
            // Refresh user data from server — AWAIT so isLoading stays true until done
            try {
              const { getProfile } = require('../lib/api');
              const data = await getProfile(storedToken);
              const profile = data.profile || {};
              const dbSelectedUnis = (data.matchingRecords || []).map((rec: any) => {
                const match = rec.matchData || {};
                return {
                  id: String(match.id || rec.id),
                  name: match.name,
                  course: match.course || "MSc Computer Science",
                  location: `${match.city || ""}, ${match.country || ""}`.toUpperCase(),
                  image: match.image || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
                  rank: match.rank || `#${match.rankingWorld || "100"} Global`,
                  duration: match.duration || "1 Year",
                  tuition: match.tuition || `$${(match.tuitionFee || 20000).toLocaleString()} / yr`,
                  tuitionValue: match.tuitionFee || 20000,
                  acceptanceRate: match.acceptanceRate || 62,
                  admissionChance: rec.admissionChance || "Moderate",
                  country: match.country,
                  city: match.city
                };
              });

              const refreshedUser = {
                ...storedObj,
                ...data,
                // Preserve the locally-stored destination country;
                // only use backend fields as a last-resort fallback
                country: storedObj.country || profile.nationality || profile.currentCountry || "",
                studyLevel: storedObj.studyLevel || profile.degreeLevel || "",
                cgpa: profile.gpa ? String(profile.gpa) : (storedObj.cgpa || ""),
                score: profile.englishScore ? String(profile.englishScore) : (storedObj.score || ""),
                fieldOfStudy: storedObj.fieldOfStudy || profile.fieldOfStudy || "",
                testType: storedObj.testType || profile.testType || "",
                recentAcademicField: storedObj.recentAcademicField || profile.recentAcademicField || "",
                passoutYear: storedObj.passoutYear || profile.passoutYear || "",
                intake: storedObj.intake || profile.intake || "",
                englishLevel: storedObj.englishLevel || profile.englishLevel || "",
                yearlyBudget: storedObj.yearlyBudget || (profile.yearlyBudget ? String(profile.yearlyBudget) : ""),
                scholarshipNeeded: storedObj.scholarshipNeeded ?? profile.scholarshipNeeded ?? false,
                onboardingComplete: storedObj.onboardingComplete || data.user?.onboardingComplete || profile.onboardingComplete || false,
                selectedUniversities: dbSelectedUnis.length > 0
                  ? dbSelectedUnis
                  : (storedObj.selectedUniversities || []),
                admissionProb: profile.admissionProb ?? null,
                visaSuccessProb: profile.visaSuccessProb ?? null,
              };
              _setUserData(refreshedUser);
              await AsyncStorage.setItem('@user_data', JSON.stringify(refreshedUser));
            } catch (e: any) {
              console.warn("Profile refresh failed (using local data):", e);
              // storedObj already set above — user sees local data
            }
          }
        } else if (storedUser) {
          _setUserData(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error loading auth data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Login handler
  const login = async (phoneE164: string, otp: string) => {

    try {
      const data = await apiLogin(phoneE164, otp);
      // data: { user, token }
      const incomingUser = data.user;
      const profile = incomingUser.profile || {};

      const dbSelectedUnis = (incomingUser.matchingRecords || []).map((rec: any) => {
        const match = rec.matchData || {};
        return {
          id: String(match.id || rec.id),
          name: match.name,
          course: match.course || "MSc Computer Science",
          location: `${match.city || ""}, ${match.country || ""}`.toUpperCase(),
          image: match.image || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
          rank: match.rank || `#${match.rankingWorld || "100"} Global`,
          duration: match.duration || "1 Year",
          tuition: match.tuition || `$${(match.tuitionFee || 20000).toLocaleString()} / yr`,
          tuitionValue: match.tuitionFee || 20000,
          acceptanceRate: match.acceptanceRate || 62,
          admissionChance: rec.admissionChance || "Moderate",
          country: match.country,
          city: match.city
        };
      });

      const mappedUser = {
        ...userData,
        ...incomingUser,
        // Preserve locally-selected destination country; backend nationality is a fallback
        country: userData.country || profile.nationality || profile.currentCountry || "",
        studyLevel: userData.studyLevel || profile.degreeLevel || "",
        cgpa: profile.gpa ? String(profile.gpa) : userData.cgpa,
        score: profile.englishScore ? String(profile.englishScore) : userData.score,
        fieldOfStudy: userData.fieldOfStudy || profile.fieldOfStudy || "",
        testType: userData.testType || profile.testType || "",
        recentAcademicField: userData.recentAcademicField || profile.recentAcademicField || "",
        passoutYear: userData.passoutYear || profile.passoutYear || "",
        intake: userData.intake || profile.intake || "",
        englishLevel: userData.englishLevel || profile.englishLevel || "",
        yearlyBudget: userData.yearlyBudget || (profile.yearlyBudget ? String(profile.yearlyBudget) : ""),
        scholarshipNeeded: userData.scholarshipNeeded ?? profile.scholarshipNeeded ?? false,
        onboardingComplete: userData.onboardingComplete || incomingUser.onboardingComplete || profile.onboardingComplete || false,
        selectedUniversities: dbSelectedUnis.length > 0
          ? dbSelectedUnis
          : (userData.selectedUniversities || []),
        admissionProb: profile.admissionProb ?? null,
        visaSuccessProb: profile.visaSuccessProb ?? null,
      };

      setToken(data.token);
      _setUserData(mappedUser);

      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      throw error;
    }
  };

  // Register handler
  const register = async (signUpData: any) => {
    try {
      const data = await apiRegister(signUpData);

      if (data.token) {
        setToken(data.token);
        await AsyncStorage.setItem('@auth_token', data.token);
      }

      const registeredUser = {
        ...DEFAULT_USER_DATA,
        ...data.user,
        onboardingComplete: data.user?.onboardingComplete ?? false,
      };

      _setUserData(prev => ({
        ...prev,
        ...registeredUser,
      }));
      await AsyncStorage.setItem('@user_data', JSON.stringify(registeredUser));

      return registeredUser;
    } catch (error) {
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setToken(null);
      _setUserData(DEFAULT_USER_DATA);
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');

      // Redirect to landing page
      router.replace("/");
    } catch (e) {
      console.error("Error during logout:", e);
    }
  };

  // Wrapper for setUserData that also saves to AsyncStorage
  const setUserData = async (data: UserData | ((prev: UserData) => UserData)) => {
    try {
      _setUserData(prev => {
        const newData = typeof data === 'function' ? data(prev) : data;

        AsyncStorage.setItem('@user_data', JSON.stringify(newData)).catch(e =>
          console.error("Error saving user data to storage:", e)
        );

        if (token && token !== "dummy-jwt-token-for-testing") {
          apiUpdateProfile(newData, token).catch(e =>
            console.warn("Background profile sync error (using local data):", e.message || e)
          );
        }

        return newData;
      });
    } catch (e) {
      console.error("Error saving user data:", e);
    }
  };

  const selectUniversity = (uni: any) => {
    setUserData(prev => ({
      ...prev,
      selectedUniversities: [uni, ...prev.selectedUniversities.filter(u => u.id !== uni.id)],
      onboardingComplete: true,
    }));
  };

  return (
    <UserContext.Provider value={{
      userData,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      setUserData,
      selectUniversity
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
