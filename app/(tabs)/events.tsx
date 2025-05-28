import { useEffect, useState } from "react";
import { Button, Text, SafeAreaView} from "react-native";
import { getEvents } from "lib/events";
import { createBooking } from "~/lib/bookings";

export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <SafeAreaView className="p-4">
      <><Text className="mb-4 text-lg ">Event List compare qui</Text></>
      {events.map((e) => (
        <Text key={e.id} className="mb-4 text-lg">
          {e.title} - {e.date}
          <Button title="Prenota" onPress={() => createBooking(e.id)} />
        </Text>
      ))}
    </SafeAreaView>
  );
}