import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DatePickerInput from 'components/features/DatePickerInput';
import LocationPicker from 'components/features/LocationPicker';
import { createEvent } from 'lib/events';
import { router, Stack } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { ChevronLeft, Calendar, MapPin, Users, Type, FileText, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEventScreen() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [maxGuests, setmaxGuests] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventLocation, setEventLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | undefined>();

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be authenticated to create events');
      return;
    }

    if (!title.trim() || !maxGuests.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const maxGuestsNum = parseInt(maxGuests);
    if (isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid number of guests');
      return;
    }

    setLoading(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: date.toISOString(),
        max_guests: maxGuestsNum
      }, user.id);

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setDate(new Date());
      setmaxGuests('');
      
    } catch (error) {
      const errorMessage = (error instanceof Error && error.message) ? error.message : 'Error creating event';
      Alert.alert('Error', errorMessage);
    }
    setLoading(false);
  };

  if (!isLoaded) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.gradient}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>You must be logged in to create events</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BlurView intensity={50} tint="dark" style={styles.backButtonBlur}>
                <ChevronLeft size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
          ),
        }}
      />
      
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Create Event</Text>
              <Text style={styles.subtitle}>
                Bring people together ✨{'\n'}
                Fill in the details below
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Type size={14} color="rgba(255,255,255,0.6)" /> Event Title *
                </Text>
                <BlurView intensity={20} tint="dark" style={styles.inputBlurContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Give your event a catchy name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                  />
                </BlurView>
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <FileText size={14} color="rgba(255,255,255,0.6)" /> Description
                </Text>
                <BlurView intensity={20} tint="dark" style={styles.inputBlurContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What's your event about?"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                </BlurView>
              </View>

              {/* Location Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <MapPin size={14} color="rgba(255,255,255,0.6)" /> Location
                </Text>
                <LocationPicker
                  value={eventLocation}
                  onLocationChange={setEventLocation}
                  placeholder="Where's it happening?"
                />
              </View>

              {/* Date Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Calendar size={14} color="rgba(255,255,255,0.6)" /> Date & Time *
                </Text>
                <DatePickerInput
                  value={date}
                  onDateChange={handleDateChange}
                  placeholder="When's the event?"
                  minimumDate={new Date()}
                />
              </View>

              {/* Max Guests Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Users size={14} color="rgba(255,255,255,0.6)" /> Max Guests *
                </Text>
                <BlurView intensity={20} tint="dark" style={styles.inputBlurContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="How many people can join?"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={maxGuests}
                    onChangeText={setmaxGuests}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </BlurView>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.submitButtonContainer}
              >
                <LinearGradient
                  colors={loading ? ['#6b7280', '#4b5563'] : ['#a855f7', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Sparkles color="white" size={24} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              * Required fields
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  backButton: {
    marginLeft: 10,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  inputBlurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  customPicker: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 16,
    padding: 16,
  },
  submitButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
});