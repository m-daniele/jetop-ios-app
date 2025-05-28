import QRCode from "react-native-qrcode-svg";
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from "react";
import { BookingWithEvent } from '../../types/database';
import { useUser } from "@clerk/clerk-expo";

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [booking, setBooking] = useState<BookingWithEvent | null>(null);

  useEffect(() => {
    if (user && id) {
      loadBooking();
    }
  }, [user, id]);

  const loadBooking = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (*)
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setBooking(data as BookingWithEvent);
    }
  };

  if (!booking || !user) return <Text>Loading...</Text>;

  const qrValue = `${user.id}_${booking.id}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{booking.events.title}</Text>
      <Text style={styles.subtitle}>Your Booking</Text>
      
      <View style={styles.qrContainer}>
        <QRCode value={qrValue} size={200} />
      </View>
      
      <Text style={styles.info}>
        Booked on: {new Date(booking.created_at).toLocaleDateString()}
      </Text>
      <Text style={styles.info}>
        Event Date: {new Date(booking.events.date).toLocaleDateString()}
      </Text>
      {booking.events.location && (
        <Text style={styles.info}>
          Location: {booking.events.location}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  qrContainer: {
    marginVertical: 30,
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#555',
  },
});