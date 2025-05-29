// components/forms/TextInput.tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View, TextInput as RNTextInput } from 'react-native';

const TextInput = ({
  control,
  placeholder,
  required,
  label,
  name,
}: {
  control: any;
  placeholder?: string;
  required?: boolean;
  label: string;
  name: string;
}) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          <RNTextInput
            style={[styles.input, error && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
      name={name}
      rules={{ required: required && `${label} is required` }}
    />
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});