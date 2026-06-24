import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const THEME = {
  primary: "#33BFFF",
  textDark: "#111827",
  textGray: "#6B7280",
  bgLight: "#FFFFFF",
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bottomTabContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
             navigation.navigate(route.name);
          }
        };

        let iconName = 'home';
        if (route.name === 'explore') iconName = 'home';
        if (route.name === 'search') iconName = 'search';
        if (route.name === 'recent') iconName = 'clock';
        if (route.name === 'profile') iconName = 'user';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isFocused ? (
              <View style={styles.tabIconActiveBg}>
                <Feather name={iconName as any} size={20} color="white" />
              </View>
            ) : (
              <View style={styles.iconWrapper}>
                <Feather name={iconName as any} size={24} color={THEME.primary} />
              </View>
            )}
            <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="explore"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="search"
        options={{ 
          title: 'Search',
          href: null // Hides from tab bar but keeps route accessible if needed
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{ title: 'Recent' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomTabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.bgLight,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
  },
  tabIconActiveBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: THEME.textDark,
    fontWeight: "600",
  },
});
