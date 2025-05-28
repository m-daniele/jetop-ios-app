import { supabase } from "./supabase";
import { Booking, BookingWithEvent } from '../types/database';
import { useUser } from "@clerk/clerk-expo";

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

  const { data, error } = await supabase.from("bookings").insert([
    {
      event_id: eventId,
      user_id: clerkUserId, // Use Clerk user ID
    },
  ]).select().single();

  if (error) throw error;
  return data as Booking;
}

export async function getUserBookings(clerkUserId: string): Promise<BookingWithEvent[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      events (*)
    `)
    .eq("user_id", clerkUserId);

  if (error) throw error;
  return data as BookingWithEvent[];
}

export async function checkUserBooking(eventId: string, clerkUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}