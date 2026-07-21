import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  text: string;
  className?: string;
}

export function Badge({ text, className = '' }: BadgeProps) {
  return (
    <View 
      className={`bg-seal px-2 py-0.5 items-center justify-center ${className}`}
      style={{
        borderRadius: 4, // More of a folded ribbon / tag shape than a standard pill
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
      }}
    >
      <Text className="text-white font-sans font-medium text-[10px] tracking-wider uppercase">
        {text}
      </Text>
    </View>
  );
}
