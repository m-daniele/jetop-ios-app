// components/events/EventStats.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react-native';
import { BlurCard } from '../common';
import { Event } from '../../types/database';
import { theme } from 'theme/theme';
import { getDisplayAddress } from '../../utils/getDisplayAddress';

interface EventStatsProps {
  event: Event;
  onLocationPress?: () => void;
}

export const EventStats: React.FC<EventStatsProps> = ({ event, onLocationPress }) => {
  const availableSpots = event.max_guests - event.booked_count;

  return (
    <View style={styles.container}>
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
        onPress={onLocationPress}
        disabled={!event.location}
        activeOpacity={0.8}
      >
        <BlurCard style={event.location ? { ...styles.statCard, ...styles.clickableCard } : styles.statCard}>
          <MapPin size={20} color={theme.colors.primary.purple} />
          <Text style={styles.statLabel}>Venue</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {getDisplayAddress(event.location).split(',')[0]}
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
  );
};

const styles = StyleSheet.create({
  container: {
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
});