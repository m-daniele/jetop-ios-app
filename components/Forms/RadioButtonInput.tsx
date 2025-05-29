import { Controller } from "react-hook-form";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';
import React from 'react';

const RadioButtonInput = ({
  control,
  placeholder,
  required,
  label,
  name,
  options,
}: {
  control: any;
  placeholder?: string;
  required?: boolean;
  label: string;
  name: string;
  options: { label: string; value: string }[];
}) => {
  const Option = ({
    label,
    value,
    onChange,
    isSelected,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isSelected: boolean;
  }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onChange(value);
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.optionWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {isSelected ? (
            <LinearGradient
              colors={['#a855f7', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.option}
            >
              <Check size={14} color="white" style={styles.checkIcon} />
              <Text style={[styles.optionText, styles.selectedText]}>
                {label}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.unselectedOption}>
              <BlurView intensity={20} tint="dark" style={styles.optionBlur}>
                <View style={styles.optionInner}>
                  <Text style={styles.optionText}>{label}</Text>
                </View>
              </BlurView>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Controller
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {placeholder && (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <Option
                key={option.value}
                label={option.label}
                value={option.value}
                onChange={onChange}
                isSelected={value === option.value}
              />
            ))}
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}
        </View>
      )}
      name={name}
      rules={{ required: required && "This field is required" }}
    />
  );
};

export default RadioButtonInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  required: {
    color: '#ef4444',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: -4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  optionWrapper: {
    borderRadius: 12,
  },
  unselectedOption: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionBlur: {
    borderRadius: 12,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionInner: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  checkIcon: {
    marginRight: -4,
  },
  errorContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
});