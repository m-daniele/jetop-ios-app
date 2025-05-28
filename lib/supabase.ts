import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // disable WebSocket support for React Native
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});

// If you need realtime, use polling instead of WebSocket
export const enableRealtimePolling = () => {
  // Alternative implementation for realtime without WebSocket
  setInterval(async () => {
    // Polling logic here if needed
  }, 5000);
};