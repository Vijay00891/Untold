import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-headings font-inter-medium mb-1.5">{label}</Text>}
      <TextInput 
        className={`bg-white border border-borders rounded-xl px-4 py-3 text-headings font-inter ${error ? 'border-notifications' : ''} ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-notifications font-inter text-sm mt-1">{error}</Text>}
    </View>
  );
}
