import { supabase } from "./supabase";
import { Event, CreateEventInput } from '../types/database';

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Event;
}

export async function createEvent(event: CreateEventInput, clerkUserId: string): Promise<Event> {
  if (!clerkUserId) throw new Error("User not authenticated");

  const eventData: CreateEventInput = {
    ...event,
    owner_id: clerkUserId // Use Clerk user ID
  };

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw new Error(error.message || 'Failed to create event');
  }

  if (!data) {
    throw new Error('No data returned from database');
  }

  return data;
}
export async function getUpcomingEvents(): Promise<Event[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte('date', now)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as Event[];
}

export async function getEventsByOwner(clerkUserId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq('owner_id', clerkUserId)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as Event[];
}