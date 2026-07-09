import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Text,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// ─────────────────────────── Layout constants ───────────────────────────────
const TAB_COUNT      = 4;
const BAR_PADDING    = 6;          // inner padding between pill and container edge
const FULL_WIDTH     = width - 40; // 20px margin each side
const SLOT_WIDTH     = FULL_WIDTH / TAB_COUNT;
const PILL_W         = SLOT_WIDTH - BAR_PADDING * 2;
const PILL_H         = 48;         // container height = 60, 6px top/bottom gap
const BAR_HEIGHT     = 60;
const BAR_RADIUS     = 30;
const PILL_RADIUS    = 24;
const BLUE           = '#33BFFF';

const SPRING = { damping: 18, stiffness: 260, mass: 0.75 };

// ─────────────────────────── Tab meta ────────────────────────────────────────
const TAB_META: Record<string, { icon: string; activeIcon: string; label: string }> = {
  explore: { icon: 'home-outline',   activeIcon: 'home',   label: 'Explore' },
  search:  { icon: 'search-outline', activeIcon: 'search', label: 'Search'  },
  recent:  { icon: 'heart-outline',  activeIcon: 'heart',  label: 'Recent'  },
  profile: { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
};

// ─────────────────────────── Single Tab Item ─────────────────────────────────
function TabItem({
  route, index, state, navigation, isDark,
}: any) {
  const isFocused = state.index === index;
  const meta = TAB_META[route.name] ?? { icon: 'ellipse-outline', activeIcon: 'ellipse', label: route.name };

  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, SPRING);
  }, [isFocused]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + scale.value * 0.08 }],
  }));

  const onPress = () => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  // Active → white icon on blue pill; Inactive → muted
  const iconColor = isFocused ? '#FFFFFF' : (isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.30)');

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabContent, contentStyle]}>
        <Ionicons
          name={(isFocused ? meta.activeIcon : meta.icon) as any}
          size={22}
          color={iconColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────── Custom Tab Bar ───────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const { isDark } = useTheme();

  // Shared values for sliding pill
  const pillX       = useSharedValue(state.index * SLOT_WIDTH + BAR_PADDING);
  const isDragging  = useSharedValue(false);
  const dragOffset  = useSharedValue(0);

  // Hold-expand effect: pill width slightly grows on press
  const pillScale   = useSharedValue(1);
  const pillOpacity = useSharedValue(1);

  // Track the "true" tab index so we can navigate on gesture end
  const lastSnapIndex = useSharedValue(state.index);

  const activeTabIndex = useSharedValue(state.index);

  // Always sync pill on tab change (tap OR gesture end)
  useEffect(() => {
    const targetX = state.index * SLOT_WIDTH + BAR_PADDING;
    pillX.value = withSpring(targetX, SPRING);
    activeTabIndex.value = state.index;
  }, [state.index]);

  // Navigate helper (called from worklet via runOnJS)
  const navigateTo = (index: number) => {
    const route = state.routes[Math.max(0, Math.min(index, TAB_COUNT - 1))];
    if (index !== state.index) navigation.navigate(route.name);
    else {
      // Snap back to same position cleanly
      pillX.value = withSpring(state.index * SLOT_WIDTH + BAR_PADDING, SPRING);
    }
  };

  // Pan gesture — draggable from anywhere on the bar
  const pan = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      isDragging.value = true;
      // Anchor drag to the current snapped tab position
      dragOffset.value = activeTabIndex.value * SLOT_WIDTH + BAR_PADDING;
      pillX.value = dragOffset.value;
      pillScale.value = withSpring(0.94, { damping: 14, stiffness: 300 });
    })
    .onUpdate((e) => {
      const rawX  = dragOffset.value + e.translationX;
      const minX  = BAR_PADDING;
      const maxX  = FULL_WIDTH - PILL_W - BAR_PADDING;
      pillX.value = Math.max(minX, Math.min(rawX, maxX));
    })
    .onEnd(() => {
      isDragging.value = false;
      pillScale.value  = withSpring(1, { damping: 14, stiffness: 300 });

      // Snap to nearest tab centre
      const centerX   = pillX.value + PILL_W / 2;
      const snapIndex = Math.round((centerX - SLOT_WIDTH / 2) / SLOT_WIDTH);
      const clamped   = Math.max(0, Math.min(snapIndex, TAB_COUNT - 1));
      const snapX     = clamped * SLOT_WIDTH + BAR_PADDING;
      pillX.value     = withSpring(snapX, SPRING);
      runOnJS(navigateTo)(clamped);
    });

  // Pill animated style
  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pillX.value },
      { scale: pillScale.value },
    ],
    opacity: pillOpacity.value,
  }));

  // ── Colors ──
  const barBg       = isDark ? 'rgba(18, 18, 28, 0.75)' : 'rgba(255,255,255,0.50)';
  const barBorder   = isDark ? 'rgba(51,191,255,0.18)' : 'rgba(255,255,255,0.75)';
  const pillBorder  = 'rgba(255,255,255,0.35)';
  const shadowColor = isDark ? '#000' : '#0a4f6e';

  return (
    <GestureHandlerRootView style={[styles.outerContainer, { shadowColor }]}>
      {/* ── Frosted Glass Container ── */}
      <BlurView
        intensity={isDark ? 55 : 40}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.barContainer,
          {
            backgroundColor: barBg,
            borderColor: barBorder,
          },
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={StyleSheet.absoluteFillObject}>
            {/* ── Sliding Blue Glass Pill ── */}
            <Animated.View style={[styles.pill, pillStyle]}>
              {/* Solid blue base */}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: BLUE, borderRadius: PILL_RADIUS }]} />
              {/* Frosted glass shimmer on top */}
              <BlurView
                intensity={20}
                tint="light"
                style={[StyleSheet.absoluteFillObject, { borderRadius: PILL_RADIUS }]}
              />
              {/* White inner ring for the glass pop */}
              <View style={[styles.pillInnerBorder, { borderColor: pillBorder }]} />
            </Animated.View>

            {/* ── Tab Items (icons + labels) ── */}
            <View style={styles.tabRow} pointerEvents="box-none">
              {state.routes.map((route: any, index: number) => (
                <TabItem
                  key={route.key}
                  route={route}
                  index={index}
                  state={state}
                  navigation={navigation}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        </GestureDetector>
      </BlurView>
    </GestureHandlerRootView>
  );
}

// ─────────────────────────── Tab Layout ──────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarTransparent: true }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="recent" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─────────────────────────── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 18,
    left: 20,
    right: 20,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    // Drop shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
  barContainer: {
    width: '100%',
    height: '100%',
    borderRadius: BAR_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  tabItem: {
    width: SLOT_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    top: (BAR_HEIGHT - PILL_H) / 2,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
    zIndex: 0,
  },
  pillInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
  },
});
