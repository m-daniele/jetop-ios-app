// components/events/EventDetailsSection.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react-native';
import { BlurCard } from '../common';
import { Event } from '../../types/database';
import { theme } from 'theme/theme';
import { getDisplayAddress } from '../../utils/getDisplayAddress';

interface EventDetailsSectionProps {
  event: Event;
  onLocationPress?: () => void;
}

export const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({ 
  event,  
  onLocationPress 
}) => {
  const isSoldOut = event.booked_count >= event.max_guests;
  const spotsPercentage = (event.booked_count / event.max_guests) * 100;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Event Details</Text>
      
      <BlurCard style={styles.detailsCard}>
        {/* Date & Time */}
        <DetailRow 
          icon={Calendar}
          label="Date & Time"
          value={
            <>
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
            </>
          }
        />

        {/* Location */}
        {event.location && (
          <TouchableOpacity 
            style={styles.detailRow} 
            onPress={onLocationPress}
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

        {/* Capacity */}
        <View style={styles.detailRow}>
          <Users size={16} color={theme.colors.text.muted} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Capacity</Text>
            <Text style={styles.detailValue}>
              {event.booked_count} / {event.max_guests} attendees
            </Text>
            <CapacityProgress 
              percentage={spotsPercentage} 
              isSoldOut={isSoldOut} 
            />
          </View>
        </View>
      </BlurCard>
    </View>
  );
};

// Sub-components
interface DetailRowProps {
  icon: React.ComponentType<any>;
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon: Icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon size={16} color={theme.colors.text.muted} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      {value}
    </View>
  </View>
);

const CapacityProgress = ({ percentage, isSoldOut }: { percentage: number; isSoldOut: boolean }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isSoldOut 
              ? theme.colors.status.error 
              : theme.colors.primary.purple,
          }
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  detailsCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
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
});