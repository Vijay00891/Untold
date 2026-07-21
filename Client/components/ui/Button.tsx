import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, Platform } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger';
  title: string;
}

export function Button({ variant = 'primary', title, className = '', disabled, ...props }: ButtonProps) {
  let bgClass = '';
  let textClass = '';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-accent hover:bg-accentHover border border-accent';
      textClass = 'text-white';
      break;
    case 'secondary':
      bgClass = 'bg-transparent border border-border';
      textClass = 'text-ink';
      break;
    case 'danger':
      // The user didn't specify a new color for danger in the new palette, 
      // but 'seal' (#B3542E) could work for destructive actions if needed, 
      // or we can fall back to a simple outlined red. I'll use seal outline.
      bgClass = 'bg-transparent border border-seal';
      textClass = 'text-seal';
      break;
  }

  const disabledClass = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`min-h-[44px] rounded-xl flex-row items-center justify-center px-4 ${bgClass} ${disabledClass} ${className}`}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text className={`font-sans font-medium text-center text-sm ${textClass}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
