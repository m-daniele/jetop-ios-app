// components/common/IconButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';
import { theme } from 'theme/theme';

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  blur?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onPress,
  size = 40,
  iconSize = 20,
  color = 'white',
  backgroundColor = 'rgba(255,255,255,0.1)',
  blur = true,
  style,
}) => {
  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (blur) {
    return (
      <TouchableOpacity onPress={onPress} style={[buttonStyle, style]}>
        <BlurView
          intensity={50}
          tint="dark"
          style={[styles.blurContainer, buttonStyle]}
        >
          <Icon size={iconSize} color={color} />
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        buttonStyle,
        { backgroundColor },
        style,
      ]}
    >
      <Icon size={iconSize} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});