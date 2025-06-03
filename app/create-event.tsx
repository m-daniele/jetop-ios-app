// app/create-event.tsx - Unified Create/Edit Event Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image 
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { useForm, Controller } from 'react-hook-form';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Type, 
  FileText, 
  Sparkles, 
  Camera, 
  X,
  Save
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Import common components
import {
  SafeGradientView,
  HeaderSection,
  BlurCard,
  ActionButton,
  IconButton,
  FormInput
} from '../components/common';

// Import custom components
import DatePickerInput from '../components/features/DatePickerInput';
import LocationPicker from '../components/features/LocationPicker';

// Import API and utilities
import { createEvent, updateEvent, getEventById } from '../lib/events';
import { supabase } from '../lib/supabase';
import { theme } from 'theme/theme';

interface FormData {
  title: string;
  description: string;
  date: Date;
  maxGuests: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  imageUrl?: string;
}

export default function CreateEventScreen() {
  const { user, isLoaded } = useUser();
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const isEditMode = mode === 'edit' && id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      maxGuests: '',
      location: undefined,
      imageUrl: undefined,
    }
  });

  // Load event data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadEventData();
    }
  }, [isEditMode, id]);

  const loadEventData = async () => {
    try {
      
      const event = await getEventById(id!);
      
      // Check if user is the owner
      if (event.owner_id !== user?.id) {
        Alert.alert('Error', 'You can only edit your own events');
        router.back();
        return;
      }

      // Set form values
      setValue('title', event.title);
      setValue('description', event.description || '');
      setValue('date', new Date(event.date));
      setValue('maxGuests', event.max_guests.toString());
      
      if (event.location) {
        try {
          const locationData = typeof event.location === 'string' 
            ? JSON.parse(event.location) 
            : event.location;
          setValue('location', locationData);
        } catch (error) {
          console.error('Error parsing location:', error);
        }
      }

      if (event.image_url) {
        setImageUri(event.image_url);
        setValue('imageUrl', event.image_url);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event data');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
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
    setValue('imageUrl', undefined);
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { decode } = await import('base64-arraybuffer');
      const arrayBuffer = decode(base64);

      const { data, error } = await supabase.storage
        .from('events')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

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

  const onSubmit = async (data: FormData) => {
    if (!user) {
      Alert.alert('Error', 'You must be authenticated to create events');
      return;
    }

    const maxGuestsNum = parseInt(data.maxGuests);
    if (isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid number of guests');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = data.imageUrl;
      
      // Upload new image if changed
      if (imageUri && !imageUri.startsWith('http')) {
        const uploadedUrl = await uploadImageToSupabase(imageUri);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      // Prepare location data
      const locationData = data.location ? JSON.stringify({
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address || ''
      }) : '';

      const eventData = {
        title: data.title.trim(),
        description: data.description.trim(),
        location: locationData,
        date: data.date.toISOString(),
        max_guests: maxGuestsNum,
        image_url: imageUrl,
      };

      if (isEditMode && id) {
        await updateEvent(id, eventData, user.id);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        await createEvent(eventData, user.id);
        Alert.alert('Success', 'Event created successfully');
      }
      
      router.back();
    } catch (error: any) {
      const errorMessage = error.message || `Error ${isEditMode ? 'updating' : 'creating'} event`;
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || initialLoading) {
    return (
      <SafeGradientView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.purple} />
        </View>
      </SafeGradientView>
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
            <IconButton
              icon={ChevronLeft}
              onPress={() => router.back()}
              style={styles.backButton}
              blur
            />
          ),
        }}
      />
      
      <SafeGradientView edges={['bottom']}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <HeaderSection
              title={isEditMode ? 'Edit Event' : 'Create Event'}
              subtitle={isEditMode ? 'Update your event details' : 'Host something amazing'}
            />

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Event Image Picker */}
              <FormInput label="Event Photo">
                {imageUri ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.eventImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                      <BlurCard style={styles.removeImageBlur}>
                        <X color="white" size={16} />
                      </BlurCard>
                    </TouchableOpacity>
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    <BlurCard style={styles.imagePickerContainer}>
                      <Camera color={theme.colors.text.muted} size={32} />
                      <Text style={styles.imagePickerText}>Tap to add event photo</Text>
                      <Text style={styles.imagePickerSubtext}>16:9 ratio recommended</Text>
                    </BlurCard>
                  </TouchableOpacity>
                )}
              </FormInput>

              {/* Title Input */}
              <Controller
                control={control}
                name="title"
                rules={{ required: 'Event title is required' }}
                render={({ field: { onChange, value } }) => (
                  <FormInput 
                    label="Event Title" 
                    required
                    error={errors.title?.message}
                  >
                    <BlurCard style={styles.inputCard}>
                      <TextInput
                        style={styles.input}
                        placeholder="Give your event a catchy name"
                        placeholderTextColor={theme.colors.text.disabled}
                        value={value}
                        onChangeText={onChange}
                        keyboardAppearance='dark'
                        maxLength={100}
                      />
                    </BlurCard>
                  </FormInput>
                )}
              />

              {/* Description Input */}
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <FormInput label="Description">
                    <BlurCard style={styles.inputCard}>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's your event about?"
                        placeholderTextColor={theme.colors.text.disabled}
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={4}
                        keyboardAppearance='dark'
                        maxLength={500}
                        textAlignVertical="top"
                      />
                    </BlurCard>
                  </FormInput>
                )}
              />

              {/* Location Picker */}
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <FormInput label="Location">
                    <LocationPicker
                      value={value}
                      onLocationChange={onChange}
                      placeholder="Where's it happening?"
                    />
                  </FormInput>
                )}
              />

              {/* Date Picker */}
              <Controller
                control={control}
                name="date"
                rules={{ required: 'Date is required' }}
                render={({ field: { onChange, value } }) => (
                  <FormInput 
                    label="Date & Time" 
                    required
                    error={errors.date?.message}
                  >
                    <DatePickerInput
                      value={value}
                      onDateChange={onChange}
                      placeholder="When's the event?"
                      minimumDate={new Date()}
                    />
                  </FormInput>
                )}
              />

              {/* Max Guests Input */}
              <Controller
                control={control}
                name="maxGuests"
                rules={{ 
                  required: 'Number of guests is required',
                  pattern: {
                    value: /^\d+$/,
                    message: 'Please enter a valid number'
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <FormInput 
                    label="Max Guests" 
                    required
                    error={errors.maxGuests?.message}
                  >
                    <BlurCard style={styles.inputCard}>
                      <TextInput
                        style={styles.input}
                        placeholder="How many people can join?"
                        placeholderTextColor={theme.colors.text.disabled}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        keyboardAppearance='dark'
                        maxLength={4}
                      />
                    </BlurCard>
                  </FormInput>
                )}
              />

              {/* Submit Button */}
              <View style={styles.submitButtonContainer}>
                <ActionButton
                  title={
                    uploadingImage ? 'Uploading...' : 
                    loading ? (isEditMode ? 'Updating...' : 'Creating...') : 
                    (isEditMode ? 'Update Event' : 'Add Event')
                  }
                  onPress={handleSubmit(onSubmit)}
                  icon={isEditMode ? Save : Sparkles}
                  loading={loading || uploadingImage}
                  disabled={loading || uploadingImage}
                  variant="primary"
                />
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              * Required fields
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeGradientView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  backButton: {
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    gap: theme.spacing.xs,
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  removeImageBlur: {
    padding: theme.spacing.xs,
    backgroundColor: 'rgba(220,38,38,0.8)',
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
    borderRadius: theme.borderRadius.lg,
  },
  imagePickerContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.ui.border,
  },
  imagePickerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  imagePickerSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  inputCard: {
    padding: 0,
    overflow: 'hidden',
  },
  input: {
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.ui.blurBg,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButtonContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});