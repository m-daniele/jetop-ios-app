import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { createBooking, checkUserBooking } from 'lib/bookings';
import { getUpcomingEvents } from 'lib/events';
import { Event } from 'types/database';
import { router } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { FloatingActionButton } from 'components/ui/FloatingActionButton';

interface EventItemProps {
  event: Event;
  userId: string;
}

const EventItem: React.FC<EventItemProps> = ({ event, userId }) => {
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    checkIfBooked();
  }, []);

  const checkIfBooked = async () => {
    try {
      const booked = await checkUserBooking(event.id, userId);
      setIsBooked(booked);
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const handleBooking = async () => {
    if (isBooked) return;
    
    if (event.booked_count >= event.max_guests) {
      Alert.alert('Error', 'No more spots available');
      return;
    }
    
    setLoading(true);
    try {
      const booking = await createBooking(event.id, userId);
      setIsBooked(true);
      
      event.booked_count += 1;
      
      Alert.alert(
        'Success', 
        'Event booked successfully!',
        [
          {
            text: 'View QR Code',
            onPress: () => router.push(`/booking/${booking.id}`)
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Booking failed');
    }
    setLoading(false);
  };

  const availableSpots = event.max_guests - event.booked_count;
  const isSoldOut = availableSpots <= 0;

  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      {event.description && (
        <Text style={styles.eventDescription}>{event.description}</Text>
      )}
      <Text style={styles.eventDate}>
        📅 {new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
      {event.location && (
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
      )}
      <Text style={styles.eventGuests}>
        👥 Available spots: {availableSpots}/{event.max_guests}
      </Text>
      
      <View style={styles.buttonContainer}>
        {isBooked ? (
          <TouchableOpacity style={styles.bookedButton} disabled>
            <Text style={styles.bookedButtonText}>✓ Booked</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.bookButton,
              (loading || isSoldOut) && styles.disabledButton
            ]}
            onPress={handleBooking}
            disabled={loading || isSoldOut}
          >
            <Text style={styles.bookButtonText}>
              {loading ? "Booking..." : isSoldOut ? "Sold Out" : "Book Now"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function EventsScreen() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoaded) {
      loadEvents();
    }
  }, [isLoaded]);

  const loadEvents = async () => {
    try {
      const data = await getUpcomingEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventItem event={item} userId={user?.id || ''} />
  );

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  if (!isLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Authentication error</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Available Events</Text>
      <Text style={styles.welcomeText}>Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!</Text>
      
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadEvents}
      />
      
      <FloatingActionButton onPress={handleCreateEvent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  eventGuests: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookedButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
});