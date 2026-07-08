import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// Conditionally import GlassView - it may not exist on all platforms
let GlassView: any = null;
let GlassContainer: any = null;
let isLiquidGlassAvailable: (() => boolean) | null = null;
let isGlassEffectAPIAvailable: (() => boolean) | null = null;

try {
  const glassEffect = require('expo-glass-effect');
  GlassView = glassEffect.GlassView;
  GlassContainer = glassEffect.GlassContainer;
  isLiquidGlassAvailable = glassEffect.isLiquidGlassAvailable;
  isGlassEffectAPIAvailable = glassEffect.isGlassEffectAPIAvailable;
} catch (e) {
  // expo-glass-effect not available on this platform
}

export type GlassStyle = 'clear' | 'regular' | 'none';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Glass effect style - 'regular' (default), 'clear', or 'none' */
  glassEffectStyle?: GlassStyle;
  /** Tint color for the glass effect */
  tintColor?: string;
  /** Whether the glass effect should respond to interactions */
  isInteractive?: boolean;
  /** Fallback background color when glass is not available */
  fallbackColor?: string;
  /** Blur intensity for fallback BlurView (0-100) */
  fallbackBlurIntensity?: number;
  /** Blur tint for fallback */
  fallbackBlurTint?: 'light' | 'dark' | 'default';
  /** If true, uses BlurView as fallback instead of solid color */
  useBlurFallback?: boolean;
}

/**
 * Checks if the liquid glass effect is available on this device/platform.
 * Returns true only on iOS 26+ with the glass API available.
 */
export function canUseGlassEffect(): boolean {
  if (Platform.OS !== 'ios') return false;
  if (!isLiquidGlassAvailable || !isGlassEffectAPIAvailable) return false;
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/**
 * A reusable component that renders iOS 26 Liquid Glass effect when available,
 * with graceful fallback to BlurView or a solid View on unsupported platforms.
 */
export function GlassCard({
  children,
  style,
  glassEffectStyle = 'regular',
  tintColor,
  isInteractive = false,
  fallbackColor,
  fallbackBlurIntensity = 60,
  fallbackBlurTint = 'light',
  useBlurFallback = false,
}: GlassCardProps) {
  const glassAvailable = canUseGlassEffect();

  // Use native GlassView when available on iOS 26+
  if (glassAvailable && GlassView) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
      >
        {children}
      </GlassView>
    );
  }

  // Fallback: Use BlurView for a frosted glass-like effect
  if (useBlurFallback && Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={fallbackBlurIntensity}
        tint={fallbackBlurTint}
        style={style}
      >
        {children}
      </BlurView>
    );
  }

  // Final fallback: plain View with optional background color
  return (
    <View style={[style, fallbackColor ? { backgroundColor: fallbackColor } : undefined]}>
      {children}
    </View>
  );
}

/**
 * GlassContainer wrapper - combines multiple glass views for a merged effect.
 * Falls back to a regular View on unsupported platforms.
 */
interface GlassContainerCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  spacing?: number;
}

export function GlassContainerCard({
  children,
  style,
  spacing,
}: GlassContainerCardProps) {
  const glassAvailable = canUseGlassEffect();

  if (glassAvailable && GlassContainer) {
    return (
      <GlassContainer style={style} spacing={spacing}>
        {children}
      </GlassContainer>
    );
  }

  return <View style={style}>{children}</View>;
}

export default GlassCard;
