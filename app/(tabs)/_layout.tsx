import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, GlassContainerCard, canUseGlassEffect } from '../../components/GlassCard';

const THEME = {
  primary: "#33BFFF",
  textDark: "#111827",
  textGray: "#94A3B8",
  bgLight: "#FFFFFF",
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const useGlass = canUseGlassEffect();

  const tabContent = state.routes.map((route: any, index: number) => {
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
    if (route.name === 'recent') iconName = 'heart';
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
        {useGlass && isFocused && (
          <GlassCard
            glassEffectStyle="clear"
            isInteractive={true}
            style={styles.activeTabBubble}
          />
        )}
        <View style={styles.iconWrapper}>
          <Feather 
            name={iconName as any} 
            size={22} 
            color={isFocused ? colors.primary : colors.textSecondary} 
          />
        </View>
        <Text style={[
          styles.tabText, 
          { color: colors.textSecondary },
          isFocused && styles.tabTextActive,
          isFocused && { color: colors.primary }
        ]}>
          {label}
        </Text>
        {isFocused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    );
  });

  // Use native Liquid Glass on iOS 26+
  if (useGlass) {
    return (
      <GlassContainerCard 
        spacing={6} 
        style={[
          styles.bottomTabContainer,
          styles.glassTabContainer,
        ]}
      >
        {/* Main Tab Background */}
        <GlassCard
          glassEffectStyle="clear"
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Tab Items Layout Overlay */}
        <View style={styles.tabItemsOverlay}>
          {tabContent}
        </View>
      </GlassContainerCard>
    );
  }

  // Fallback: BlurView for older iOS / Android
  return (
    <BlurView 
      intensity={50} 
      tint={colors.tabBlur}
      style={[
        styles.bottomTabContainer,
        {
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.25)' : colors.tabBg,
          borderColor: colors.tabBorder,
        }
      ]}
    >
      {tabContent}
    </BlurView>
  );
}

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={props => <CustomTabBar {...props} />} 
      screenOptions={{ 
        headerShown: false,
        tabBarTransparent: true,
      } as any}
    >
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
        options={{ title: 'Saved' }}
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
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    overflow: "hidden",
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
    bottom: -4,
  },
  glassTabContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  activeTabBubble: {
    position: 'absolute',
    top: -6,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: -1,
  },
  tabItemsOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 28,
  },
});
