import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DatePickerInput from 'components/features/DatePickerInput';
import LocationPicker from 'components/features/LocationPicker';
import { createEvent } from 'lib/events';
import { router, Stack } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { ChevronLeft, Calendar, MapPin, Users, Type, FileText, Sparkles, Camera, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from 'lib/supabase'; // Assicurati di avere il client Supabase

export default function CreateEventScreen() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [maxGuests, setmaxGuests] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventLocation, setEventLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | undefined>();

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const pickImage = async () => {
    try {
      // Richiedi permessi
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      // Apri image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Aspect ratio per eventi
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Genera un nome file unico
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      // Leggi il file come base64 usando Expo FileSystem
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Converti base64 in ArrayBuffer (richiesto per React Native)
      const { decode } = await import('base64-arraybuffer');
      const arrayBuffer = decode(base64);

      // Carica su Supabase Storage
      const { data, error } = await supabase.storage
        .from('events') // Nome del bucket su Supabase
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Ottieni l'URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
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
    let imageUrl = null;
    
    // Se c'è un'immagine, caricala prima
    if (imageUri) {
      imageUrl = await uploadImageToSupabase(imageUri);
      if (!imageUrl) {
        setLoading(false);
        return; // Interrompi se il caricamento dell'immagine fallisce
      }
    }

    // Prepare location data
    // Store location as JSON string with latitude, longitude, and address
    const locationData = eventLocation ? JSON.stringify({
      latitude: eventLocation.latitude,
      longitude: eventLocation.longitude,
      address: eventLocation.address || ''
    }) : '';

    await createEvent({
      title: title.trim(),
      description: description.trim(),
      location: locationData, // Now passing the structured location as JSON string
      date: date.toISOString(),
      max_guests: maxGuestsNum,
      image_url: imageUrl ?? undefined
    }, user.id);
    
    router.back();
    
    // Reset form
    setTitle('');
    setDescription('');
    setEventLocation(undefined); // Reset the structured location
    setDate(new Date());
    setmaxGuests('');
    setImageUri(null);
    
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
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Event Image Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Camera size={14} color="rgba(255,255,255,0.6)" /> Event Photo
                </Text>
                
                {imageUri ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.eventImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                      <BlurView intensity={50} tint="dark" style={styles.removeImageBlur}>
                        <X color="white" size={16} />
                      </BlurView>
                    </TouchableOpacity>
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    <BlurView intensity={20} tint="dark" style={styles.imagePickerContainer}>
                      <Camera color="rgba(255,255,255,0.6)" size={32} />
                      <Text style={styles.imagePickerText}>Tap to add event photo</Text>
                      <Text style={styles.imagePickerSubtext}>16:9 ratio recommended</Text>
                    </BlurView>
                  </TouchableOpacity>
                )}
              </View>

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
                disabled={loading || uploadingImage}
                activeOpacity={0.8}
                style={styles.submitButtonContainer}
              >
                <LinearGradient
                  colors={(loading || uploadingImage) ? ['#6b7280', '#4b5563'] : ['#5000ce', '#6900a3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {(loading || uploadingImage) ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Sparkles color="white" size={20} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {uploadingImage ? 'Uploading...' : loading ? 'Creating...' : 'Add Event'}
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
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  formSection: {
    gap: 10,
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
  // Nuovi stili per l'image picker
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  removeImageBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.3)',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  imagePickerContainer: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
    fontWeight: '500',
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
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
    fontWeight: '500',
    color: 'white',
    letterSpacing: 0.5,
    paddingVertical: 0,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
});