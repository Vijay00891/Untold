import React from 'react';
import { View, Platform, ViewProps } from 'react-native';

export function Card({ className = '', children, ...props }: ViewProps) {
  // Use string concatenation for platform-specific shadow classes because NativeWind
  // might not reliably parse conditional object classes for elevation.
  const shadowClass = Platform.OS === 'web' ? 'shadow-sm' : 'elevation-2';
  
  return (
    <View 
      className={`bg-card border border-border rounded-2xl p-4 ${shadowClass} ${className}`}
      style={Platform.OS !== 'web' ? { elevation: 2 } : {}} // Fallback for native elevation
      {...props}
    >
      {children}
    </View>
  );
}
