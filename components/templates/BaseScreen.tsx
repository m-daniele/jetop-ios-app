// components/templates/BaseScreen.tsx
import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../GradientBackground';
import { LoadingView } from 'components/common/LoadingView';
import { ErrorView } from 'components/common/ErrorView';
import { sharedStyles } from '../../styles/shared';

interface BaseScreenProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
  refreshing = false,
  onRefresh,
  scrollable = true,
  keyboardAvoiding = false,
  contentContainerStyle,
  safeAreaEdges = ['top', 'bottom'],
}) => {
  const content = () => {
    if (loading) {
      return <LoadingView />;
    }
    
    if (error) {
      return <ErrorView message={error} onRetry={onRetry} />;
    }
    
    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={[sharedStyles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }
    
    return <>{children}</>;
  };
  
  const screenContent = (
    <GradientBackground>
      <SafeAreaView style={sharedStyles.container} edges={safeAreaEdges}>
        {content()}
      </SafeAreaView>
    </GradientBackground>
  );
  
  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={sharedStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      >
        {screenContent}
      </KeyboardAvoidingView>
    );
  }
  
  return screenContent;
};