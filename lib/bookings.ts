// lib/bookings.ts - Updated with delete functionality
import { supabase } from "./supabase";
import { Booking, BookingWithEvent } from '../types/database';

export async function createBooking(eventId: string, clerkUserId: string): Promise<Booking> {
  if (!clerkUserId) throw new Error("User not authenticated");

  // Check if user already booked this event
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", clerkUserId)
    .single();

  if (existingBooking) {
    throw new Error("You have already booked this event");
  }

  // Start transaction
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([
      {
        event_id: eventId,
        user_id: clerkUserId,
      },
    ])
    .select()
    .single();

  if (bookingError) throw bookingError;

  // Update event booked_count
  const { data: event } = await supabase
    .from('events')
    .select('booked_count')
    .eq('id', eventId)
    .single();

  if (event) {
    await supabase
      .from('events')
      .update({ booked_count: event.booked_count + 1 })
      .eq('id', eventId);
  }

  return booking as Booking;
}

export async function deleteBooking(bookingId: string, clerkUserId: string): Promise<void> {
  if (!clerkUserId) throw new Error("User not authenticated");

  // Get booking details first
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("event_id, user_id")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  // Verify the booking belongs to the user
  if (booking.user_id !== clerkUserId) {
    throw new Error("Unauthorized: You can only delete your own bookings");
  }

  // Delete the booking
  const { error: deleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("user_id", clerkUserId); // Extra safety check

  if (deleteError) throw deleteError;

  // Update event booked_count
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

export async function getUserBookings(clerkUserId: string): Promise<BookingWithEvent[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      events (*)
    `)
    .eq("user_id", clerkUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BookingWithEvent[];
}

export async function checkUserBooking(eventId: string, clerkUserId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Booking | null;
}

export async function getBookingById(bookingId: string, clerkUserId: string): Promise<BookingWithEvent | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      events (*)
    `)
    .eq("id", bookingId)
    .eq("user_id", clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as BookingWithEvent | null;
}