import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { createBooking, checkUserBooking } from 'lib/bookings';
import { getUpcomingEvents } from 'lib/events';
import { Event } from 'types/database';
import { router, Stack } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Users, Plus, Sparkles } from 'lucide-react-native';

interface EventItemProps {
  event: Event;
  userId: string;
  onPress: () => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, userId, onPress }) => {
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

  const availableSpots = event.max_guests - event.booked_count;
  const isSoldOut = availableSpots <= 0;
  const spotsPercentage = (event.booked_count / event.max_guests) * 100;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={20} tint="dark" style={styles.eventCard}>
        {/* Event Image - Smaller height */}
        {event.image_url && (
          <Image source={{ uri: event.image_url }} style={styles.eventImage} />
        )}
        
        <View style={styles.eventContent}>
          {/* Title and Status in same row */}
          <View style={styles.titleRow}>
            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
            {isBooked && (
              <View style={styles.bookedBadge}>
                <Sparkles size={10} color="white" />
                <Text style={styles.bookedText}>Booked</Text>
              </View>
            )}
          </View>
          
          {/* Event Details - Compact */}
          <View style={styles.eventDetails}>
            {/* Date */}
            <View style={styles.detailRow}>
              <Calendar size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.detailText}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            
            {/* Location */}
            {event.location && (
              <View style={styles.detailRow}>
                <MapPin size={12} color="rgba(255,255,255,0.5)" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {event.location.split(',')[0]}
                </Text>
              </View>
            )}
            
            {/* Guests */}
            <View style={styles.detailRow}>
              <Users size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.detailText}>
                {availableSpots}/{event.max_guests}
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={isSoldOut ? ['#ef4444', '#dc2626'] : ['#5000ce', '#6900a3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${spotsPercentage}%` }]}
              />
            </View>
            {isSoldOut && !isBooked && (
              <Text style={styles.soldOutText}>Sold Out</Text>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function EventsScreen() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
     // Pause for refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-details", params: { id: eventId } });
  };

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventItem 
      event={item} 
      userId={user?.id || ''} 
      onPress={() => handleEventPress(item.id)}
    />
  );

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
          <Text style={styles.errorText}>You must be logged in to view events</Text>
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
        }}
      />
      
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>
              Welcome back, {user.firstName || 'there'}!
            </Text>
          </View>

          {/* Events List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#a855f7" />
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="white"
                  colors={["white"]}
                />
              }
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No events available</Text>
                  <Text style={styles.emptySubtext}>Be the first to create one!</Text>
                </View>
              }
            />
          )}

          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={handleCreateEvent}
            activeOpacity={0.8}
            style={styles.fab}
          >
            <LinearGradient
              colors={['#5000ce', '#6900a3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Plus color="white" size={24} />
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  eventCard: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 8,
    marginBottom : 3,
  },
  eventDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
    lineHeight: 18,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  bookedText: {
    fontSize: 10,
    color: '#a855f7',
    fontWeight: '600',
  },
  soldOutText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom:100,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});