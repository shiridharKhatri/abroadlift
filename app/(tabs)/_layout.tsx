import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const THEME = {
  primary: "#33BFFF",
  textDark: "#111827",
  textGray: "#94A3B8",
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
            <View style={styles.iconWrapper}>
              <Feather 
                name={iconName as any} 
                size={22} 
                color={isFocused ? THEME.primary : THEME.textGray} 
              />
            </View>
            <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>
              {label}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
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
          href: null 
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
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    width: 60,
    position: "relative",
  },
  iconWrapper: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  tabText: {
    fontSize: 10.5,
    color: THEME.textGray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: THEME.primary,
    fontWeight: "700",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.primary,
    position: "absolute",
    bottom: -6,
  },
});
