// app/(tabs)/index.tsx - Fixed with correct imports
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import { Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the EventCard component
import { EventCard } from '../../components/events/EventCard';

// Import API functions
import { getUpcomingEvents, deleteEvent, subscribeToAllEvents } from '../../lib/events';
import { Event } from '../../types/database';

export default function EventsScreen() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load events on mount and focus
  useFocusEffect(
    useCallback(() => {
      if (isLoaded && user) {
        loadEvents();
      }
    }, [isLoaded, user])
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToAllEvents((payload) => {
      handleRealtimeUpdate(payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setEvents(prev => [payload.new as Event, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setEvents(prev => prev.map(event => 
        event.id === payload.new.id ? payload.new as Event : event
      ));
    } else if (payload.eventType === 'DELETE') {
      setEvents(prev => prev.filter(event => event.id !== payload.old.id));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-details", params: { id: eventId } });
  };

  const handleEventEdit = (eventId: string) => {
    router.push({ pathname: "/create-event", params: { id: eventId, mode: 'edit' } });
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId, user!.id);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      Alert.alert('Success', 'Event deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete event');
    }
  };

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard 
      event={item} 
      userId={user?.id || ''} 
      isOwner={item.host_id === user?.id}
      onPress={() => handleEventPress(item.id)}
      onEdit={() => handleEventEdit(item.id)}
      onDelete={() => handleEventDelete(item.id)}
    />
  );

  if (!isLoaded) {
    return (
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.gradient}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.gradient}
      >
        <View style={styles.centerContainer}>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>
              Welcome back, {user.firstName || 'there'}!
            </Text>
          </View>

          {/* Events List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#ffffff"
                  colors={["#ffffff"]}
                />
              }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
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
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
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
    marginBottom: 100,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});