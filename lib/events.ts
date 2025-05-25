import { supabase } from "./supabase";

export async function getEvents() {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return data;
}

export async function createEvent(event: {
  title: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  owner_id?: string;
}) {
  const { error } = await supabase.from("events").insert([event]);
  if (error) throw error;
}

