import { supabase } from "./supabase";

export async function createBooking(eventId: string) {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;

  if (!user_id) throw new Error("Utente non autenticato");

  const { error } = await supabase.from("bookings").insert([
    {
      event_id: eventId,
      user_id,
    },
  ]);

  if (error) throw error;
}