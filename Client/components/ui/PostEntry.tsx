import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Avatar } from './Avatar';
import { Heart, Feather } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface PostEntryProps {
  id: string;
  authorName?: string;
  authorImage?: string;
  isAnonymous?: boolean;
  content: string;
  timestamp: string;
  likeCount: number;
  isLiked?: boolean;
  onRelate?: () => void;
  onLike?: () => void;
  onPress?: () => void;
}

const triggerLightHaptic = async () => {
  try {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (e) {
    // Catch silent errors on unsupported devices / simulators
  }
};

export function PostEntry({
  authorName,
  authorImage,
  isAnonymous,
  content,
  timestamp,
  likeCount,
  isLiked = false,
  onRelate,
  onLike,
  onPress,
}: PostEntryProps) {
  const likeScale = useRef(new Animated.Value(1)).current;
  const relateScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    triggerLightHaptic();
    likeScale.setValue(0.6);
    Animated.spring(likeScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (onLike) onLike();
  };

  const handleRelate = () => {
    triggerLightHaptic();
    relateScale.setValue(0.6);
    Animated.spring(relateScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (onRelate) onRelate();
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <View className="flex-row items-center mb-4">
        <Avatar 
          imageUri={authorImage}
          name={authorName}
          isAnonymous={isAnonymous}
          size={36}
        />
        <View className="ml-3">
          <Text className="font-sans font-semibold text-ink text-sm">
            {isAnonymous ? 'Anonymous' : authorName}
          </Text>
          <Text className="font-sans text-inkMuted text-xs mt-0.5">
            {timestamp}
          </Text>
        </View>
      </View>

      <Text 
        className={`text-ink mb-5 leading-7 ${isAnonymous ? 'font-mono text-[15px]' : 'font-serif text-[16px]'}`}
      >
        {content}
      </Text>

      {/* Hairline Divider inside card */}
      <View className="h-[1px] bg-border mb-3" />

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity 
          className="flex-row items-center py-1 pr-3"
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Heart 
              size={18} 
              color={isLiked ? "#B3542E" : "#6E6659"} 
              fill={isLiked ? "#B3542E" : "transparent"} 
              strokeWidth={1.5} 
            />
          </Animated.View>
          <Text className={`font-sans text-sm ml-2 ${isLiked ? 'text-seal font-medium' : 'text-inkMuted'}`}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-1 pl-3"
          onPress={handleRelate}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: relateScale }] }}>
            <Feather size={16} color="#B3542E" strokeWidth={2} />
          </Animated.View>
          <Text className="font-serif italic text-seal ml-2" style={{ fontSize: 14 }}>
            Relate to this
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
