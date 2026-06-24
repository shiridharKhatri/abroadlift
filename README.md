# ✈️ AbroadLift Mobile

AbroadLift is a comprehensive, meticulously crafted React Native (Expo) application designed to facilitate international student enrollment. The platform provides a seamless, premium experience for students aspiring to study abroad, featuring elegant glassmorphic UI elements, intuitive authentication onboarding, and a rich dynamic dashboard to explore top-ranked universities, global programs, and trending study destinations.

---

## ✨ Key Features

### 🔐 Authentication & Onboarding
- **Login Bypassing**: Quick jump directly to the dashboard upon successful login.
- **Progressive Setup Flow**: A guided step-by-step onboarding procedure exclusively activated during the initial registration process:
  - Country Selection (`/setup/country`)
  - English Proficiency Assessment (`/setup/english-test`)
  - Financial/Budget Planning (`/setup/financial`)
  - Features smooth progression UI with animated transitions and customizable skip utilities.

### 🧭 Native Tab Dashboard
A high-performance native tab navigation experience (`app/(tabs)`) containing:
- **Home Dashboard**: A comprehensive directory featuring a location selector, hero banners, popular destination hubs, degree filters, and horizontally scrollable university cards.
- **Search**: Advanced category browsing.
- **Saved**: Bookmarked universities for fast future reference.
- **Profile**: Account management and personal settings.

### 🏛️ Detailed Internal Routing
- **University Profiles** (`/university/[id]`): In-depth view of individual universities, showcasing acceptance rates, tuition costs, gallery headers, and course lists with a sticky "Apply Now" bottom action bar.
- **Category Listings** (`/category/[name]`): Highly reusable dynamic search results page that filters effectively by destination, degree format, or trending field.

---

## 🛠️ Technology Stack & Dependencies

### Core Architecture
- **Framework**: [React Native](https://reactnative.dev) (Cross-platform mobile framework) & [Expo](https://expo.dev/) (SDK for React Native).
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) - Leveraging advanced file-based routing mechanism for intuitive screen navigation, dynamic routes (`[id]`, `[name]`), and nested layouts (`(tabs)`).
- **Runtime**: Utilizes the modern **Hermes Engine** for optimized JS execution and faster app loading.

### UI & Styling Ecosystem
- **Styling Engine**: React Native's built-in `StyleSheet` interface, extending a heavily customized, constant-driven design system centered around glassmorphic layouts and our signature Teal (`#1A8A99`) branding.
- **Typography & Assets**: Uses native system font weights dynamically scaling between visual hierarchy (Bold headers, medium descriptions, gray accents).
- **Vector Icons**: Powered by `@expo/vector-icons`, deeply integrating `Feather`, `Ionicons`, and `MaterialCommunityIcons` suites for crisp imagery under all device pixel densities.

### API & Data Fetching (Planned)
- Designed to integrate with standard remote REST APIs or GraphQL clients in upcoming phases with dedicated React hooks.

---

## 🚀 Getting Started & Prerequisites

### System Prerequisites
To run this project locally, ensure you have the following software installed on your development machine:
1. **Node.js**: Minimum version `v18.x` or higher (LTS recommended).
2. **Package Manager**: npm (bundled with Node) or Yarn.
3. **Mobile Environment Setup**:
   - **For iOS**: macOS with Xcode 15+ installed (required to run the iOS Simulator).
   - **For Android**: Android Studio installed along with a configured Android Virtual Device (AVD).
4. **Physical Device Testing**: Requires the **Expo Go** application installed from the App Store (iOS) or Play Store (Android).

### Installation

1. Navigate to the client directory:
   ```bash
   cd phoneClient
   ```
2. Install necessary project dependencies securely using npm:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:
```bash
npx expo start
```

* After setup, press `i` to launch on the iOS simulator, `a` for Android, or scan the QR code utilizing the Expo Go app directly on your physical smartphone.

---

## 📂 Architecture Overview

```text
abroadLift/phoneClient/
├── app/
│   ├── _layout.tsx           # Global app navigator (Headers safely suppressed)
│   ├── index.tsx             # Auth Welcome landing module
│   ├── login.tsx             # Login interface directly hooking to dashboard
│   ├── register.tsx          # Registration interface routing to onboarding flow
│   ├── (tabs)/               # Protected Bottom Tab Grouping 
│   │   ├── _layout.tsx       # Custom, heavily stylized bottom tab structure
│   │   ├── explore.tsx       # Global Home Experience / Discover Dashboard
│   │   ├── search.tsx        # Directory querying
│   │   ├── saved.tsx         # User's bookmarked repository
│   │   └── profile.tsx       # Account specifics
│   ├── setup/                # Registration Configuration Progression
│   │   ├── country.tsx
│   │   ├── english-test.tsx
│   │   └── financial.tsx
│   ├── university/           # Standalone Object Schemas
│   │   └── [id].tsx          # Dynamic University Analysis Route
│   └── category/             # Results Architecture
│       └── [name].tsx        # Parameterized dynamic sorting view
├── assets/                   
```

---

*Engineered globally to redefine how ambitious students discover the world's best institutions.*
