import React from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  bottom?: number;
  right?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  size = 64,
  backgroundColor = 'rebeccapurple',
  iconColor = 'white',
  bottom = 150,
  right = 30,
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const fabStyles = [
    styles.fab,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor,
      bottom,
      right,
      transform: [{ scale: scaleAnim }],
    },
  ];

  const touchableStyles = [
    styles.fabTouchable,
    {
      borderRadius: size / 2,
    },
  ];

  const iconStyles = [
    styles.fabIcon,
    {
      color: iconColor,
      fontSize: size * 0.9,
      lineHeight: size,
    },
  ];

  return (
    <Animated.View style={fabStyles}>
      <TouchableOpacity
        style={touchableStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={iconStyles}>{icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 50,
    color: 'white',
    fontWeight: 'light',
    lineHeight: 55, 
  },
});