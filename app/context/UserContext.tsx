import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, updateProfile as apiUpdateProfile } from '../../lib/api';

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

          if (storedToken !== "dummy-jwt-token-for-testing") {
            // NEW: Refresh user data from server if we have a token
            const { getProfile } = require('../../lib/api');
            getProfile(storedToken).then((data: any) => {
              const profile = data.profile || {};
              const refreshedUser = {
                ...(storedUser ? JSON.parse(storedUser) : DEFAULT_USER_DATA),
                ...data,
                country: profile.nationality || profile.currentCountry || "",
                studyLevel: profile.degreeLevel || "",
                cgpa: profile.gpa ? String(profile.gpa) : "",
                score: profile.englishScore ? String(profile.englishScore) : "",
                fieldOfStudy: profile.fieldOfStudy || "",
                testType: profile.testType || "",
                recentAcademicField: profile.recentAcademicField || "",
                passoutYear: profile.passoutYear || "",
                intake: profile.intake || "",
                englishLevel: profile.englishLevel || "",
                yearlyBudget: profile.yearlyBudget ? String(profile.yearlyBudget) : "",
                scholarshipNeeded: profile.scholarshipNeeded ?? false,
                onboardingComplete: data.user?.onboardingComplete ?? profile.onboardingComplete ?? (storedUser ? JSON.parse(storedUser).onboardingComplete : false),
                selectedUniversities: data.user?.selectedUniversities || (storedUser ? JSON.parse(storedUser).selectedUniversities : []) || [],
              };
              _setUserData(refreshedUser);
              AsyncStorage.setItem('@user_data', JSON.stringify(refreshedUser));
            }).catch((e: any) => console.error("Profile refresh error:", e));
          } else if (storedUser) {
            _setUserData(JSON.parse(storedUser));
          }
        }
        if (storedUser && !storedToken) _setUserData(JSON.parse(storedUser));
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

      const mappedUser = {
        ...userData,
        ...incomingUser,
        country: profile.nationality || profile.currentCountry || userData.country,
        studyLevel: profile.degreeLevel || userData.studyLevel,
        cgpa: profile.gpa ? String(profile.gpa) : userData.cgpa,
        score: profile.englishScore ? String(profile.englishScore) : userData.score,
        fieldOfStudy: profile.fieldOfStudy || userData.fieldOfStudy,
        testType: profile.testType || userData.testType,
        recentAcademicField: profile.recentAcademicField || userData.recentAcademicField,
        passoutYear: profile.passoutYear || userData.passoutYear,
        intake: profile.intake || userData.intake,
        englishLevel: profile.englishLevel || userData.englishLevel,
        yearlyBudget: profile.yearlyBudget ? String(profile.yearlyBudget) : userData.yearlyBudget,
        scholarshipNeeded: profile.scholarshipNeeded ?? userData.scholarshipNeeded,
        onboardingComplete: incomingUser.onboardingComplete ?? profile.onboardingComplete ?? false,
        selectedUniversities: incomingUser.selectedUniversities || userData.selectedUniversities || [],
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
            console.error("Sync error:", e)
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
