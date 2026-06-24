const fs = require('fs');
const filePath = 'c:/Projects/fishtail/abroadLift/phoneClient/app/(tabs)/explore.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the country selection map and replace the onPress logic
const target = /onPress\(\) => \{\s+setUserData\(\{ \.\.\.userData, countryContent: c\.name, flag: c\.flag \}\);\s+setModalStep\('options'\);\s+\}/;
const replacement = `onPress={() => {
                            setShowPlanModal(false);
                            setModalStep('options');
                            router.push({
                              pathname: "/search",
                              params: { 
                                pendingCountry: c.name, 
                                pendingFlag: c.flag 
                              }
                            });
                          }}`;

// Wait, the regex might fail if there are minor differences. 
// Let's use a more robust one based on line numbers? 
// No, I'll just use a simpler regex for the setUserData line.

content = content.replace(/setUserData\(\{ \.\.\.userData, country: c\.name, flag: c\.flag \}\);/g, 'setShowPlanModal(false); setModalStep(\'options\'); router.push({ pathname: "/search", params: { pendingCountry: c.name, pendingFlag: c.flag } });');

fs.writeFileSync(filePath, content);
console.log('Update complete');
