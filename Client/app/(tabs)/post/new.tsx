import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import { usePostStore } from '../../../store/usePostStore';

export default function NewPostScreen() {
  const router = useRouter();
  const createPost = usePostStore((state) => state.createPost);

  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const characterLimit = 2000;
  const isOverLimit = content.length > characterLimit;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const result = await createPost(content.trim(), isAnonymous);
    setSubmitting(false);
    if (result) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 h-14 bg-navbar border-b border-border flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="min-w-[60px]" activeOpacity={0.7} disabled={submitting}>
            <Text className="text-inkMuted font-sans font-medium text-base">Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">New Post</Text>
          <View className="min-w-[60px] items-end" />
        </View>

        <View className="flex-1 p-4 bg-background">
          <TextInput
            style={{ fontFamily: 'Lora', fontSize: 18 }}
            className={`flex-1 text-ink text-left bg-transparent p-4 min-h-[120px] leading-relaxed`}
            placeholder="What do you want to say?"
            placeholderTextColor="#6E6659"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            editable={!submitting}
            autoFocus
          />
          
          <View className="flex-row justify-end items-center mt-2 px-2">
            <Text className={`font-sans text-xs ${isOverLimit ? 'text-seal' : 'text-inkMuted'}`}>
              {content.length}/{characterLimit}
            </Text>
          </View>
        </View>

        <View className="bg-background p-4 pb-20 border-t border-border">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-ink text-sm font-sans font-medium">Post anonymously</Text>
              <Text className="text-inkMuted font-sans text-xs mt-1">Your name and photo stay hidden.</Text>
            </View>
            <Toggle 
              value={isAnonymous}
              onValueChange={setIsAnonymous}
            />
          </View>
          
          <Button 
            title={submitting ? "Publishing..." : "Publish"} 
            onPress={handleSubmit} 
            disabled={!canSubmit} 
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
