import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../app/context/UserContext';

interface ProfileAvatarProps {
  size: number;
  color?: string;
  style?: ViewStyle | ViewStyle[];
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size, color = "#CBD5E1", style }) => {
  const { userData } = useUser();

  if (userData.profileImage) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Image
          source={{ uri: userData.profileImage }}
          style={styles.image as ImageStyle}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <Ionicons 
      name="person-circle" 
      size={size} 
      color={color} 
      style={style as any} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
