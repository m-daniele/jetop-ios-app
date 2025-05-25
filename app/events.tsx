import { useEffect, useState } from "react";
import { Text, ScrollView } from "react-native";
import { getEvents } from "lib/events";

export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <ScrollView className="p-4">
      {events.map((e) => (
        <Text key={e.id} className="mb-4 text-lg">
          {e.title} - {e.date}
        </Text>
      ))}
    </ScrollView>
  );
}