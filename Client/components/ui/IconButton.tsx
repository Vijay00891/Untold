import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
  icon: any; // Lucide icon component
  size?: number;
  color?: string;
  isActive?: boolean;
}

export function IconButton({ icon: Icon, size = 20, color, isActive, className = '', ...props }: IconButtonProps) {
  const iconColor = color || (isActive ? '#8B5A62' : '#6E6659');

  return (
    <TouchableOpacity
      className={`min-w-[44px] min-h-[44px] items-center justify-center ${className}`}
      activeOpacity={0.7}
      {...props}
    >
      <Icon size={size} color={iconColor} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}
