import React from 'react';
import { View, Text, Image } from 'react-native';
import { HelpCircle } from 'lucide-react-native';

interface AvatarProps {
  imageUri?: string;
  name?: string;
  isAnonymous?: boolean;
  size?: number;
}

export function Avatar({ imageUri, name, isAnonymous, size = 40 }: AvatarProps) {
  const radius = size / 2;

  if (isAnonymous) {
    return (
      <View 
        className="bg-border items-center justify-center"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <HelpCircle size={size * 0.6} color="#6E6659" />
      </View>
    );
  }

  if (imageUri) {
    return (
      <Image 
        source={{ uri: imageUri }} 
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View 
      className="bg-accent items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Text className="text-white font-sans font-medium" style={{ fontSize: size * 0.45 }}>
        {initial}
      </Text>
    </View>
  );
}
