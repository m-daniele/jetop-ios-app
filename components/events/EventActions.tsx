// components/events/EventActions.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QrCode, XCircle, Sparkles } from 'lucide-react-native';
import { BlurCard, ActionButton } from '../common';
import { theme } from 'theme/theme';

interface EventActionsProps {
  isOwner: boolean;
  isBooked: boolean;
  isSoldOut: boolean;
  loading: boolean;
  attendeeCount?: number;
  onBook: () => void;
  onViewQR: () => void;
  onCancel: () => void;
}

export const EventActions: React.FC<EventActionsProps> = ({
  isOwner,
  isBooked,
  isSoldOut,
  loading,
  attendeeCount = 0,
  onBook,
  onViewQR,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <BlurCard style={styles.card}>
        <View style={styles.content}>
          {!isOwner && (
            <>
              {isBooked ? (
                <BookedActions 
                  loading={loading}
                  onViewQR={onViewQR}
                  onCancel={onCancel}
                />
              ) : (
                <BookingAction 
                  isSoldOut={isSoldOut}
                  loading={loading}
                  onBook={onBook}
                />
              )}
            </>
          )}
          
          {isOwner && (
            <OwnerInfo attendeeCount={attendeeCount} />
          )}
        </View>
      </BlurCard>
    </View>
  );
};

// Sub-components
const BookedActions = ({ 
  loading, 
  onViewQR, 
  onCancel 
}: { 
  loading: boolean; 
  onViewQR: () => void; 
  onCancel: () => void;
}) => (
  <View style={styles.bookedActions}>
    <ActionButton
      title="View QR Code"
      onPress={onViewQR}
      icon={QrCode}
      loading={loading}
      disabled={loading}
      variant="secondary"
      style={styles.actionButton}
    />
    <ActionButton
      title="Cancel Booking"
      onPress={onCancel}
      icon={XCircle}
      loading={loading}
      disabled={loading}
      variant="danger"
      style={styles.actionButton}
    />
  </View>
);

const BookingAction = ({ 
  isSoldOut, 
  loading, 
  onBook 
}: { 
  isSoldOut: boolean; 
  loading: boolean; 
  onBook: () => void;
}) => (
  <ActionButton
    title={isSoldOut ? 'Sold Out' : 'Book Now'}
    onPress={onBook}
    icon={Sparkles}
    loading={loading}
    disabled={loading || isSoldOut}
    variant="primary"
  />
);

const OwnerInfo = ({ attendeeCount }: { attendeeCount: number }) => (
  <View style={styles.ownerInfo}>
    <Text style={styles.ownerText}>You're hosting this event</Text>
    <Text style={styles.attendeeCount}>
      {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'} registered
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  content: {
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