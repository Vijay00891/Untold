import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger';
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({ variant = 'primary', title, icon, children, className = '', disabled, ...props }: ButtonProps) {
  let bgClass = '';
  let textClass = '';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-accent hover:bg-accentHover border border-accent';
      textClass = 'text-white';
      break;
    case 'secondary':
      bgClass = 'bg-card hover:bg-border/30 border border-border';
      textClass = 'text-ink';
      break;
    case 'danger':
      bgClass = 'bg-transparent border border-seal';
      textClass = 'text-seal';
      break;
  }

  const disabledClass = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`min-h-[48px] rounded-xl flex-row items-center justify-center px-4 ${bgClass} ${disabledClass} ${className}`}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon && <View className="mr-3 items-center justify-center">{icon}</View>}
      {children || (
        <Text className={`font-sans font-medium text-center text-base ${textClass}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
