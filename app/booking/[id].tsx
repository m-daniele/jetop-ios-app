import React, { useEffect, useState } from 'react';
import QRCode from "react-native-qrcode-svg";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { BookingWithEvent } from '../../types/database';
import { useUser } from "@clerk/clerk-expo";
import { ChevronLeft, Calendar, MapPin, Ticket } from 'lucide-react-native';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const [booking, setBooking] = useState<BookingWithEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user && id) {
      loadBooking();
    }
  }, [isLoaded, user, id]);

  const loadBooking = async () => {
    try {
      // Check if id is valid
      if (!id || id === 'null' || id === 'undefined') {
        console.error('Invalid booking ID:', id);
        setLoading(false);
        return;
      }

      // First, get the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (bookingError || !bookingData) {
        console.error('Booking error:', bookingError);
        setLoading(false);
        return;
      }

      // Then get the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', bookingData.event_id)
        .single();

      if (eventError || !eventData) {
        console.error('Event error:', eventError);
        setLoading(false);
        return;
      }

      // Combine them
      const combinedData: BookingWithEvent = {
        ...bookingData,
        events: eventData
      };

      setBooking(combinedData);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayAddress = (location: any): string => {
    if (!location) return 'TBA';
    
    try {
      const locationData = typeof location === 'string' 
        ? JSON.parse(location) 
        : location;
      
      if (locationData.address) {
        return locationData.address;
      }
    } catch (error) {
      if (typeof location === 'string') {
        return location;
      }
    }
    
    return 'Location set';
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

  if (!booking || !user) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.gradient}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const qrValue = `${user.id}_${booking.id}`;

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
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Ticket size={40} color="#a855f7" />
              <Text style={styles.title}>Your Ticket</Text>
              <Text style={styles.eventTitle}>{booking.events.title}</Text>
            </View>

            {/* QR Code Card */}
            <View style={styles.ticketCard}>
              <BlurView intensity={20} tint="dark" style={styles.qrCard}>
                <View style={styles.qrWrapper}>
                  <View style={styles.qrContainer}>
                    <QRCode 
                      value={qrValue} 
                      size={200} 
                      color="#000"
                      backgroundColor="#fff"
                    />
                  </View>
                  <Text style={styles.qrLabel}>Show this at the event</Text>
                </View>

                {/* Ticket Details */}
                <View style={styles.ticketDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="rgba(255,255,255,0.6)" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Event Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(booking.events.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.detailValue}>
                        {new Date(booking.events.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>

                  {booking.events.location && (
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="rgba(255,255,255,0.6)" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>
                          {getDisplayAddress(booking.events.location)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Booking Info */}
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingId}>Booking ID: {booking.id.slice(0, 8)}</Text>
                  <Text style={styles.bookingDate}>
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
    marginBottom: 20,
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
  backButtonAlt: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: 10,
  },
  ticketCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  qrCard: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  ticketDetails: {
    gap: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  bookingInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
});