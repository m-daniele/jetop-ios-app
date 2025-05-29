import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, MapPin, Users, QrCode, Sparkles, Info, ExternalLink } from 'lucide-react-native';
import { getEventById } from 'lib/events';
import { createBooking, checkUserBooking } from 'lib/bookings';
import { Event } from 'types/database';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, isLoaded } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && id) {
      loadEventDetails();
    }
  }, [isLoaded, id]);

  const loadEventDetails = async () => {
    try {
      const eventData = await getEventById(id as string);
      setEvent(eventData);
      
      if (user?.id) {
        const booking = await checkUserBooking(id as string, user.id);
        setIsBooked(!!booking);
        setBookingId(booking && typeof booking === 'object' && 'id' in booking ? (booking as { id: string }).id : null);
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Unable to load event details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

 const handleBooking = async () => {
  if (!user?.id || !event) return;
  
  if (isBooked && bookingId) {
    // Navigate to QR code - make sure bookingId is not null
    router.push(`/booking/${bookingId}`);
    return;
  }
  
  if (event.booked_count >= event.max_guests) {
    Alert.alert('Error', 'No more spots available');
    return;
  }
  
  setBookingLoading(true);
  try {
    const booking = await createBooking(event.id, user.id);
    setIsBooked(true);
    setBookingId(booking.id);
    
    // Update local event count
    setEvent(prev => prev ? { ...prev, booked_count: prev.booked_count + 1 } : null);
    
    // Navigate to the QR code page immediately after booking
    router.push(`/booking/${booking.id}`);
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Booking failed');
  }
  setBookingLoading(false);
};

  const openMaps = () => {
    if (!event?.location) {
      console.log('No location available');
      return;
    }
    
    console.log('Opening maps for location:', event.location);
    
    // Parse location if it's stored as JSON string
    let locationData: any;
    try {
      locationData = typeof event.location === 'string' 
        ? JSON.parse(event.location) 
        : event.location;
    } catch (error) {
      console.error('Error parsing location:', error);
      // If parsing fails, try to use it as a plain address
      locationData = { address: event.location };
    }
    
    // Build the maps query
    let mapsQuery = '';
    if (locationData.latitude && locationData.longitude) {
      // Use coordinates if available
      mapsQuery = `${locationData.latitude},${locationData.longitude}`;
      
      // Platform-specific URLs with coordinates
      const url = Platform.select({
        ios: `maps:0,0?ll=${locationData.latitude},${locationData.longitude}&q=${encodeURIComponent(locationData.address || 'Event Location')}`,
        android: `geo:${locationData.latitude},${locationData.longitude}?q=${encodeURIComponent(locationData.address || 'Event Location')}`,
      });
      
      console.log('Maps URL:', url);
      
      Linking.canOpenURL(url as string).then((supported) => {
        console.log('Can open URL:', supported);
        if (supported) {
          Linking.openURL(url as string);
        } else {
          // Fallback to Google Maps web with coordinates
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`;
          console.log('Opening web URL:', webUrl);
          Linking.openURL(webUrl);
        }
      }).catch(error => {
        console.error('Error opening maps:', error);
        // Direct fallback to web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`;
        Linking.openURL(webUrl);
      });
    } else if (locationData.address) {
      // Use address if no coordinates
      const encodedAddress = encodeURIComponent(locationData.address);
      const url = Platform.select({
        ios: `maps:0,0?q=${encodedAddress}`,
        android: `geo:0,0?q=${encodedAddress}`,
      });
      
      Linking.canOpenURL(url as string).then((supported) => {
        if (supported) {
          Linking.openURL(url as string);
        } else {
          // Fallback to Google Maps web
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
      }).catch(error => {
        console.error('Error opening maps:', error);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
      });
    }
  };

  if (!isLoaded || loading) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      </LinearGradient>
    );
  }

  if (!user || !event) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.gradient}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </LinearGradient>
    );
  }

  // Helper function to get display address
  const getDisplayAddress = (location: any): string => {
    if (!location) return 'TBA';
    
    try {
      const locationData = typeof location === 'string' 
        ? JSON.parse(location) 
        : location;
      
      if (locationData.address) {
        return locationData.address;
      } else if (locationData.latitude && locationData.longitude) {
        return `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
      }
    } catch (error) {
      // If parsing fails, return the location as is
      if (typeof location === 'string') {
        return location;
      }
    }
    
    return 'Location set';
  };

  const availableSpots = event.max_guests - event.booked_count;
  const isSoldOut = availableSpots <= 0;
  const spotsPercentage = (event.booked_count / event.max_guests) * 100;

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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={styles.heroImage} />
          ) : (
            <LinearGradient
              colors={['#5000ce', '#6900a3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroPlaceholder}
            >
              <Sparkles size={48} color="white" />
            </LinearGradient>
          )}

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.title}>{event.title}</Text>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCardWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.statCard}>
                  <Calendar size={20} color="#a855f7" />
                  <Text style={styles.statLabel}>Date</Text>
                  <Text style={styles.statValue}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </BlurView>
              </View>

              <View style={styles.statCardWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.statCard}>
                  <Users size={20} color="#a855f7" />
                  <Text style={styles.statLabel}>Spots</Text>
                  <Text style={styles.statValue}>{availableSpots} left</Text>
                </BlurView>
              </View>

              <TouchableOpacity 
                style={styles.statCardWrapper}
                onPress={openMaps}
                disabled={!event.location}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} tint="dark" style={[styles.statCard, event.location && styles.clickableCard]}>
                  <MapPin size={20} color="#a855f7" />
                  <Text style={styles.statLabel}>Venue</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {getDisplayAddress(event.location).split(',')[0]}
                  </Text>
                  {event.location && <ExternalLink size={12} color="rgba(255,255,255,0.4)" style={styles.linkIcon} />}
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Description */}
            {event.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={18} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.sectionTitle}>About</Text>
                </View>
                <View style={styles.descriptionCardWrapper}>
                  <BlurView intensity={20} tint="dark" style={styles.descriptionCard}>
                    <Text style={styles.description}>{event.description}</Text>
                  </BlurView>
                </View>
              </View>
            )}

            {/* Event Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              
              <View style={styles.detailsCardWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="rgba(255,255,255,0.6)" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.detailValue}>
                        {new Date(event.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>

                  {event.location && (
                    <TouchableOpacity 
                      style={styles.detailRow} 
                      onPress={openMaps}
                      activeOpacity={0.8}
                    >
                      <MapPin size={16} color="rgba(255,255,255,0.6)" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={[styles.detailValue, styles.locationText]}>
                          {getDisplayAddress(event.location)}
                        </Text>
                      </View>
                      <ExternalLink size={14} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  )}

                  <View style={styles.detailRow}>
                    <Users size={16} color="rgba(255,255,255,0.6)" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Capacity</Text>
                      <Text style={styles.detailValue}>
                        {event.booked_count} / {event.max_guests} attendees
                      </Text>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <LinearGradient
                            colors={isSoldOut ? ['#ef4444', '#dc2626'] : ['#5000ce', '#6900a3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${spotsPercentage}%` }]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <BlurView intensity={80} tint="dark" style={styles.bottomBlur}>
            <TouchableOpacity
              onPress={handleBooking}
              disabled={bookingLoading || (isSoldOut && !isBooked)}
              activeOpacity={0.8}
              style={styles.actionButtonContainer}
            >
              <LinearGradient
                colors={
                  isBooked 
                    ? ['#a855f7', '#9333ea']
                    : (bookingLoading || isSoldOut) 
                      ? ['#6b7280', '#4b5563'] 
                      : ['#5000ce', '#6900a3']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isBooked ? (
                  <>
                    <QrCode color="white" size={20} />
                    <Text style={styles.actionButtonText}>View QR Code</Text>
                  </>
                ) : (
                  <>
                    <Sparkles color="white" size={20} />
                    <Text style={styles.actionButtonText}>
                      {isSoldOut ? 'Sold Out' : 'Book Now'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",   
    marginBottom: 20,
  },
  container: {
    width: "80%",
    backgroundColor: "#007AFF",
    flexDirection: "row",
    borderRadius: 25,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    padding: 15,
    fontWeight: "medium",
    color: "white",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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
  heroImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    marginTop: -30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statCardWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statCard: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  clickableCard: {
    position: 'relative',
  },
  linkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  descriptionCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  descriptionCard: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
  },
  detailsCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop:15,
  },
  detailsCard: {
    padding: 20,
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  locationText: {
    color: '#a855f7',
    textDecorationLine: 'underline',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBlur: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonContainer: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    marginLeft:40,
    marginRight:40,
    borderRadius: 30,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5,
  },
});