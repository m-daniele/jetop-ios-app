// lib/events.ts - Enhanced version
import { supabase } from './supabase';
import { Booking, BookingWithEvent, Event } from '../types/database';

export async function getUpcomingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEventById(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(
  eventData: {
    title: string;
    description?: string;
    location?: string;
    date: string;
    max_guests: number;
    image_url?: string;
  },
  userId: string
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...eventData,
      owner_id: userId,
      booked_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(
  id: string,
  eventData: {
    title?: string;
    description?: string;
    location?: string;
    date?: string;
    max_guests?: number;
    image_url?: string;
  },
  userId: string
): Promise<Event> {
  // First check if user is the owner
  const { data: event } = await supabase
    .from('events')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (event?.owner_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own events');
  }

  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string, userId: string): Promise<void> {
  // Check if user is the owner
  const { data: event } = await supabase
    .from('events')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (event?.owner_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own events');
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function subscribeToEventUpdates(
  eventId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`event-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToAllEvents(callback: (payload: any) => void) {
  return supabase
    .channel('events-all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      callback
    )
    .subscribe();
}


export async function createBooking(eventId: string, userId: string): Promise<Booking> {
  // Check if already booked
  const existing = await checkUserBooking(eventId, userId);
  if (existing) {
    throw new Error('You have already booked this event');
  }

  // Check available spots
  const { data: event } = await supabase
    .from('events')
    .select('max_guests, booked_count')
    .eq('id', eventId)
    .single();

  if (!event || event.booked_count >= event.max_guests) {
    throw new Error('No spots available');
  }

  // Start transaction
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      event_id: eventId,
      user_id: userId,
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  // Update event count
  const { error: updateError } = await supabase
    .from('events')
    .update({ booked_count: event.booked_count + 1 })
    .eq('id', eventId);

  if (updateError) {
    // Rollback booking if count update fails
    await supabase.from('bookings').delete().eq('id', booking.id);
    throw updateError;
  }

  return booking;
}

export async function deleteBooking(bookingId: string, userId: string): Promise<void> {
  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('event_id, user_id')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.user_id !== userId) {
    throw new Error('Booking not found or unauthorized');
  }

  // Delete booking
  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (deleteError) throw deleteError;

  // Update event count
  const { data: event } = await supabase
    .from('events')
    .select('booked_count')
    .eq('id', booking.event_id)
    .single();

  if (event && event.booked_count > 0) {
    await supabase
      .from('events')
      .update({ booked_count: event.booked_count - 1 })
      .eq('id', booking.event_id);
  }
}

export async function checkUserBooking(
  eventId: string,
  userId: string
): Promise<Booking | null> {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  return data;
}

export async function getBookingByEventAndUser(
  eventId: string,
  userId: string
): Promise<BookingWithEvent | null> {
  const { data } = await supabase
    .from('bookings')
    .select(`
      *,
      events (*)
    `)
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  return data;
}