const fs = require('fs');
const filePath = 'c:/Projects/fishtail/abroadLift/phoneClient/app/(tabs)/search.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add API import
content = content.replace(
  'import { ProfileAvatar } from "../../components/ProfileAvatar";',
  'import { ProfileAvatar } from "../../components/ProfileAvatar";\nimport { searchUniversities, UniversityResult } from "../../lib/api";\nimport { ActivityIndicator } from "react-native";'
);

// 2. Remove MATCHED_UNIVERSITIES array
content = content.replace(/const MATCHED_UNIVERSITIES = \[[\s\S]*?\];/m, '');

// 3. Update component hook and useMemo
const hookLogic = `
  const [dynamicUniversities, setDynamicUniversities] = useState<UniversityResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnis = async () => {
      setLoading(true);
      const data = await searchUniversities(searchQuery, selectedCountry);
      setDynamicUniversities(data);
      setLoading(false);
    };
    const t = setTimeout(fetchUnis, 500);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCountry]);

  const filteredUniversities = useMemo(() => {
    return dynamicUniversities.filter(uni => {
      // Search matching is now handled mostly by backend, but we keep it for fallback
      const matchesSearch = 
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase());
`;

content = content.replace(/const filteredUniversities = useMemo\(\(\) => \{\s+return MATCHED_UNIVERSITIES\.filter\(uni => \{\s+\/\/ Search matching\s+const matchesSearch = \s+uni\.name\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\|\s+uni\.course\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\|\s+uni\.location\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\);/m, hookLogic);

// 4. Update the scrollView to show loading spinner
const loadingJSX = `
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 50 }}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={{ marginTop: 10, color: THEME.textGray }}>Matching Universities...</Text>
          </View>
        ) : filteredUniversities.length > 0 ? (
`;

content = content.replace(/\{filteredUniversities\.length > 0 \? \(/, loadingJSX);

// Add missing closing tag for the new loading ternary condition
content = content.replace(
  /<\/View>\s+\)\}\s+<\/ScrollView>/,
  '</View>\n        )}        \n      </ScrollView>'
);

fs.writeFileSync(filePath, content);
console.log('search.tsx updated!');
