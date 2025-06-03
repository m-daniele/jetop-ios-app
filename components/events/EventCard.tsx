// components/events/EventCard.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Edit3,
  Trash2 
} from 'lucide-react-native';


import { Event } from '../../types/database';
import { getDisplayAddress } from '../../utils/getDisplayAddress';
import { checkUserBooking } from '../../lib/bookings';

interface EventCardProps {
  event: Event;
  userId: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  userId, 
  onPress, 
  onEdit,
  onDelete,
  isOwner 
}) => {
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [localBookedCount, setLocalBookedCount] = useState(event.booked_count);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    checkIfBooked();
  }, []);

  useEffect(() => {
    setLocalBookedCount(event.booked_count);
  }, [event.booked_count]);

  const checkIfBooked = async () => {
    try {
      const booking = await checkUserBooking(event.id, userId);
      setIsBooked(!!booking);
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
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
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete?.();
            });
          }
        }
      ]
    );
  };

  const availableSpots = event.max_guests - localBookedCount;
  const isSoldOut = availableSpots <= 0;
  const spotsPercentage = (localBookedCount / event.max_guests) * 100;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <BlurView intensity={20} tint="dark" style={styles.eventCard}>
          {/* Event Image */}
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
                  })} at {new Date(event.date).toLocaleTimeString('en-US', {
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
                    {getDisplayAddress(event.location)}
                  </Text>
                </View>
              )}
              
              {/* Guests */}
              <View style={styles.detailRow}>
                <Users size={12} color="rgba(255,255,255,0.5)" />
                <Text style={styles.detailText}>
                  {availableSpots}/{event.max_guests} spots
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  eventDetails: {
    gap: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
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
});