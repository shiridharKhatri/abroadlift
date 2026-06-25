import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

interface SkeletonProps {
  width?: any;
  height?: any;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const sharedAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.7,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(sharedAnimation).start();
  }, [pulseAnim]);

  const baseColor = isDark ? "#2C2C2E" : "#E2E8F0";

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};
