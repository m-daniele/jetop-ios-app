export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  owner_id?: string;
  created_at: string;
  max_guests: number;
  booked_count: number;
  image_url?: string;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  events?: Event;
}

export interface BookingWithEvent extends Booking {
  events: Event;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  max_guests: number;
  owner_id?: string;
  image_url?: string;
}