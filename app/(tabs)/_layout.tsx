import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, GlassContainerCard, canUseGlassEffect } from '../../components/GlassCard';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const THEME = {
  primary: "#33BFFF",
  textDark: "#111827",
  textGray: "#94A3B8",
  bgLight: "#FFFFFF",
};

const TAB_COUNT = 4;
const PADDING_HORIZ = 16;
const FULL_WIDTH = width - 40;
const USABLE_WIDTH = FULL_WIDTH - (PADDING_HORIZ * 2);
const SLOT_WIDTH = USABLE_WIDTH / TAB_COUNT;
const PILL_WIDTH = 50;
const PILL_HEIGHT = 40;

const springConfig = {
  damping: 16,
  stiffness: 250,
  mass: 0.8,
};

function TabItem({ route, index, state, navigation, colors }: any) {
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

  let iconName = 'home-outline';
  if (route.name === 'explore') iconName = isFocused ? 'home' : 'home-outline';
  if (route.name === 'search') iconName = isFocused ? 'search' : 'search-outline';
  if (route.name === 'recent') iconName = isFocused ? 'heart' : 'heart-outline';
  if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

  const activeValue = useSharedValue(isFocused ? 1 : 0);
  
  useEffect(() => {
    activeValue.value = withSpring(isFocused ? 1 : 0, { damping: 16, stiffness: 250, mass: 0.8 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 1 + (activeValue.value * 0.15) }],
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconWrapper, iconStyle]}>
        <Ionicons 
          name={iconName as any} 
          size={22} 
          color={isFocused ? colors.primary : colors.textSecondary} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();
  const useGlass = canUseGlassEffect();

  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, springConfig);
  }, [state.index]);

  const pillStyle = useAnimatedStyle(() => {
    const activeTabCenter = PADDING_HORIZ + activeIndex.value * SLOT_WIDTH + SLOT_WIDTH / 2;
    const expandedTranslateX = activeTabCenter - PILL_WIDTH / 2;
    return {
      transform: [{ translateX: expandedTranslateX }],
    };
  });

  const tabContent = state.routes.map((route: any, index: number) => {
    return <TabItem 
      key={route.key} 
      route={route} 
      index={index} 
      state={state} 
      navigation={navigation} 
      colors={colors}
    />;
  });

  const renderContent = () => (
    <>
      <Animated.View style={[styles.activePill, pillStyle]}>
        <BlurView 
          intensity={80} 
          tint={isDark ? "dark" : "light"} 
          style={StyleSheet.absoluteFillObject} 
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.primary, opacity: 0.25 }]} />
      </Animated.View>
      
      <View style={styles.tabItemsOverlay}>
        {tabContent}
      </View>
    </>
  );

  return (
    <View style={styles.absoluteContainer}>
      {useGlass ? (
        <GlassContainerCard 
          spacing={0} 
          style={[styles.bottomTabContainer, styles.glassTabContainer, { shadowColor: isDark ? "#000" : colors.primary }]}
        >
          <GlassCard glassEffectStyle="clear" style={StyleSheet.absoluteFillObject} />
          {renderContent()}
        </GlassContainerCard>
      ) : (
        <BlurView 
          intensity={60} 
          tint={isDark ? "dark" : "light"}
          style={[
            styles.bottomTabContainer,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.70)',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
              shadowColor: isDark ? "#000" : colors.textSecondary,
            }
          ]}
        >
          {renderContent()}
        </BlurView>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={props => <CustomTabBar {...props} />} 
      screenOptions={{ 
        headerShown: false,
        tabBarTransparent: true,
      }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="recent" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomTabContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabItemsOverlay: {
    flexDirection: 'row',
    width: FULL_WIDTH,
    paddingHorizontal: PADDING_HORIZ,
    height: "100%",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: SLOT_WIDTH,
    height: PILL_HEIGHT,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  activePill: {
    position: "absolute",
    top: 10, // (60 - 40) / 2 = 10
    left: 0,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassTabContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
