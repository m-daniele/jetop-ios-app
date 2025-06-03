// app/event-details.tsx - Refactored Event Details with Unsubscribe
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Alert, 
  Linking, 
  Platform,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  QrCode, 
  Sparkles, 
  Info, 
  ExternalLink,
  XCircle,
  Edit3,
  Trash2
} from 'lucide-react-native';

// Import common components
import {
  SafeGradientView,
  BlurCard,
  ActionButton,
  IconButton
} from '../components/common';

// Import API functions
import { getEventById, deleteEvent, subscribeToEventUpdates } from '../lib/events';
import { createBooking, checkUserBooking, deleteBooking } from '../lib/bookings';
import { Event } from '../types/database';
import { theme } from 'theme/theme';
import { getDisplayAddress } from '../utils/getDisplayAddress';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (isLoaded && id) {
      loadEventDetails();
    }
  }, [isLoaded, id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const subscription = subscribeToEventUpdates(id, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setEvent(payload.new as Event);
      } else if (payload.eventType === 'DELETE') {
        Alert.alert('Event Deleted', 'This event has been deleted');
        router.back();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const eventData = await getEventById(id);
      setEvent(eventData);
      
      if (user?.id) {
        const booking = await checkUserBooking(id, user.id);
        if (booking) {
          setIsBooked(true);
          setBookingId(booking.id);
        }
      }

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
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
      router.push(`/booking/${bookingId}`);
      return;
    }
    
    if (event.booked_count >= event.max_guests) {
      Alert.alert('Error', 'No more spots available');
      return;
    }
    
    setActionLoading(true);
    try {
      const booking = await createBooking(event.id, user.id);
      setIsBooked(true);
      setBookingId(booking.id);
      
      // Update local event count
      setEvent(prev => prev ? { ...prev, booked_count: prev.booked_count + 1 } : null);
      
      // Navigate to QR code
      router.push(`/booking/${booking.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Booking failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribe = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel your booking for this event?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            if (!bookingId || !user?.id) return;
            
            setActionLoading(true);
            try {
              await deleteBooking(bookingId, user.id);
              setIsBooked(false);
              setBookingId(null);
              
              // Update local event count
              setEvent(prev => prev ? { 
                ...prev, 
                booked_count: Math.max(0, prev.booked_count - 1) 
              } : null);
              
              Alert.alert('Success', 'Your booking has been cancelled');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/create-event', params: { id: event?.id, mode: 'edit' } });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!event || !user?.id) return;
            
            setActionLoading(true);
            try {
              await deleteEvent(event.id, user.id);
              Alert.alert('Success', 'Event deleted successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete event');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const openMaps = () => {
    if (!event?.location) return;
    
    let locationData: any;
    try {
      locationData = typeof event.location === 'string' 
        ? JSON.parse(event.location) 
        : event.location;
    } catch (error) {
      locationData = { address: event.location };
    }
    
    if (locationData.latitude && locationData.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?ll=${locationData.latitude},${locationData.longitude}&q=${encodeURIComponent(locationData.address || 'Event Location')}`,
        android: `geo:${locationData.latitude},${locationData.longitude}?q=${encodeURIComponent(locationData.address || 'Event Location')}`,
      });
      
      Linking.canOpenURL(url as string).then((supported) => {
        if (supported) {
          Linking.openURL(url as string);
        } else {
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`;
          Linking.openURL(webUrl);
        }
      });
    } else if (locationData.address) {
      const encodedAddress = encodeURIComponent(locationData.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  if (!isLoaded || loading) {
    return (
      <SafeGradientView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.purple} />
        </View>
      </SafeGradientView>
    );
  }

  if (!user || !event) {
    return (
      <SafeGradientView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeGradientView>
    );
  }

  const isOwner = event.owner_id === user.id;
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
            <IconButton
              icon={ChevronLeft}
              onPress={() => router.back()}
              style={styles.backButton}
              blur
            />
          ),
          headerRight: () => isOwner ? (
            <View style={styles.headerActions}>
              <IconButton
                icon={Edit3}
                onPress={handleEdit}
                size={40}
                iconSize={20}
                blur
                style={styles.editButton}
              />
              <IconButton
                icon={Trash2}
                onPress={handleDelete}
                size={40}
                iconSize={20}
                blur
                style={styles.deleteButton}
              />
            </View>
          ) : null,
        }}
      />
      
      <SafeGradientView edges={['bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero Image */}
            {event.image_url ? (
              <Image source={{ uri: event.image_url }} style={styles.heroImage} />
            ) : (
              <LinearGradient
                colors={[...theme.colors.primary.gradient]}
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
                <BlurCard style={styles.statCard}>
                  <Calendar size={20} color={theme.colors.primary.purple} />
                  <Text style={styles.statLabel}>Date</Text>
                  <Text style={styles.statValue}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </BlurCard>

                <BlurCard style={styles.statCard}>
                  <Users size={20} color={theme.colors.primary.purple} />
                  <Text style={styles.statLabel}>Spots</Text>
                  <Text style={styles.statValue}>{availableSpots} left</Text>
                </BlurCard>

                <TouchableOpacity 
                  onPress={openMaps}
                  disabled={!event.location}
                  activeOpacity={0.8}
                >
                  <BlurCard style={StyleSheet.flatten([styles.statCard, event.location && styles.clickableCard])}>
                    <MapPin size={20} color={theme.colors.primary.purple} />
                    <Text style={styles.statLabel}>Venue</Text>
                    <Text style={styles.statValue} numberOfLines={1}>
                      {(() => {
                        const address = getDisplayAddress(event.location).split(',')[0];
                        return address.length > 8 ? address.substring(0, 8) + '...' : address;
                      })()}
                    </Text>
                    {event.location && (
                      <ExternalLink
                        size={12}
                        color={theme.colors.text.muted}
                        style={styles.linkIcon}
                      />
                    )}
                  </BlurCard>
                </TouchableOpacity>
              </View>

              {/* Description */}
              {event.description && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Info size={18} color={theme.colors.text.muted} />
                    <Text style={styles.sectionTitle}>About</Text>
                  </View>
                  <BlurCard style={styles.descriptionCard}>
                    <Text style={styles.description}>{event.description}</Text>
                  </BlurCard>
                </View>
              )}

              {/* Event Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Event Details</Text>
                
                <BlurCard style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color={theme.colors.text.muted} />
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
                      <MapPin size={16} color={theme.colors.text.muted} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={[styles.detailValue, styles.locationText]}>
                          {getDisplayAddress(event.location)}
                        </Text>
                      </View>
                      <ExternalLink size={14} color={theme.colors.text.muted} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.detailRow}>
                    <Users size={16} color={theme.colors.text.muted} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Capacity</Text>
                      <Text style={styles.detailValue}>
                        {event.booked_count} / {event.max_guests} attendees
                      </Text>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <Animated.View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(spotsPercentage, 100)}%`,
                                backgroundColor: isSoldOut 
                                  ? theme.colors.status.error 
                                  : theme.colors.primary.purple,
                              }
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </BlurCard>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <BlurCard style={styles.bottomCard}>
            <View style={styles.bottomContent}>
              {!isOwner && (
                <>
                  {isBooked ? (
                    <View style={styles.bookedActions}>
                      <ActionButton
                        title="View QR Code"
                        onPress={handleBooking}
                        icon={QrCode}
                        loading={actionLoading}
                        disabled={actionLoading}
                        variant="secondary"
                        style={styles.actionButton}
                      />
                      <ActionButton
                        title="Cancel Booking"
                        onPress={handleUnsubscribe}
                        icon={XCircle}
                        loading={actionLoading}
                        disabled={actionLoading}
                        variant="danger"
                        style={styles.actionButton}
                      />
                    </View>
                  ) : (
                    <ActionButton
                      title={isSoldOut ? 'Sold Out' : 'Book Now'}
                      onPress={handleBooking}
                      icon={Sparkles}
                      loading={actionLoading}
                      disabled={actionLoading || isSoldOut}
                      variant="primary"
                    />
                  )}
                </>
              )}
              
              {isOwner && (
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerText}>You're hosting this event</Text>
                  <Text style={styles.attendeeCount}>
                    {event.booked_count} {event.booked_count === 1 ? 'attendee' : 'attendees'} registered
                  </Text>
                </View>
              )}
            </View>
          </BlurCard>
        </View>
      </SafeGradientView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  backButton: {
    marginLeft: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.ui.border,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  scrollContent: {
    paddingBottom: 120,
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
    padding: theme.spacing.lg,
    marginTop: -30,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  clickableCard: {
    position: 'relative',
  },
  linkIcon: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  descriptionCard: {
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
  detailsCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  locationText: {
    color: theme.colors.primary.purple,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.ui.border,
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
  bottomCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  bottomContent: {
    padding: theme.spacing.md,
  },
  bookedActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  ownerInfo: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ownerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  attendeeCount: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});