import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from 'lib/events';
import { router } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";

export default function CreateEventScreen() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxGuests, setmaxGuests] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleSubmit = async () => {
    // Validate user authentication
    if (!user) {
      Alert.alert('Error', 'You must be authenticated to create events');
      return;
    }

    // Validate required fields
    if (!title.trim() || !maxGuests.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate max guests
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
      }, user.id); // Pass Clerk user ID

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
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Error creating event';
      Alert.alert('Error', errorMessage);
    }
    setLoading(false);
  };

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>You must be logged in to create events</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Event</Text>
      <Text style={styles.subtitle}>Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}!</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Event title *"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        maxLength={200}
      />
      
      {/* Date Picker Field */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Date: {formatDate(date)} 
        </Text>
      </TouchableOpacity>
      
      {/* iOS Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          style={styles.datePicker}
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Max guests *"
        value={maxGuests}
        onChangeText={setmaxGuests}
        keyboardType="numeric"
        maxLength={4}
      />
      
      <Button
        title={loading ? "Creating..." : "Create Event"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
    color: '#d32f2f',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  datePicker: {
    marginBottom: 16,
  },
});