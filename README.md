# JEToP Mobile App

A React Native application built with Expo Router implementing event management, gaming functionality, and AI-powered nickname generation with comprehensive authentication and database integration.

## Features

**Event Management**
- Browse and book upcoming events
- Create events with date/time selection
- QR code generation for bookings
- Real-time availability tracking

**Gaming**
- Configurable dice rolling game
- State persistence across sessions

**AI Integration**
- Nickname generation using Ollama
- Direct username integration

**User Management**
- Social authentication (Google, Facebook, Apple)
- Profile completion workflow
- Secure user data handling

## Tech Stack

- **Frontend**: React Native with Expo Router
- **Authentication**: Clerk SDK
- **Database**: Supabase (PostgreSQL)
- **AI**: Ollama REST API
- **State Management**: Zustand + React Hook Form
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: File-based routing with Expo Router

## Architecture

### Project Structure
```
app/
├── (auth)/                 # Authentication screens and layout
├── (tabs)/                # Main app navigation tabs
├── booking/[id].tsx       # Dynamic booking details
├── create-event.tsx       # Event creation form
└── _layout.tsx           # Root app configuration

lib/
├── supabase.ts           # Database client
├── events.ts             # Event operations
├── bookings.ts           # Booking logic
└── ollama.ts             # AI integration

components/
├── forms/                # Reusable form components
├── ui/                   # UI components
└── navigation/           # Navigation components
```

### Authentication Flow
The app uses Clerk for authentication with a custom onboarding process:

```typescript
// Redirect logic based on user state
if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
  return <Redirect href="/(auth)/complete-your-account" />;
}
```

Users authenticate via social providers, then complete their profile before accessing the main application.

### Database Schema
```sql
-- Core tables
events {
  id, title, description, location, date, 
  max_guests, booked_count, created_by
}

bookings {
  id, event_id, user_id, created_at
}
```

Row Level Security policies ensure users can only access appropriate data.

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
git clone <repository-url>
cd jetop-app
npm install
```

### Environment Configuration
Create `.env` file:
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_OLLAMA_URL=your_ollama_endpoint
```

### Service Setup

**Clerk Authentication**
1. Create Clerk application
2. Configure OAuth providers (Google, Facebook, Apple)
3. Set up custom user metadata fields

**Supabase Database**
1. Create new Supabase project
2. Run database migrations for events and bookings tables
3. Configure Row Level Security policies

**Ollama AI**
1. Install Ollama locally or deploy to server
2. Ensure API endpoint is accessible
3. Configure model for nickname generation

### Development
```bash
npx expo start          # Start development server
npx expo run:ios        # Run on iOS
npx expo run:android    # Run on Android
```

## Key Implementation Details

### Event Booking System
Events use optimistic updates for better UX:
```typescript
const handleBooking = async () => {
  // Optimistic update
  event.booked_count += 1;
  setIsBooked(true);
  
  try {
    await createBooking(event.id, userId);
  } catch (error) {
    // Rollback on error
    event.booked_count -= 1;
    setIsBooked(false);
  }
};
```

### State Management
Global state uses Zustand for simplicity:
```typescript
const useDiceStore = create((set) => ({
  diceCount: 1,
  setDiceCount: (count) => set({ diceCount: count }),
}));
```

### AI Integration
Nickname generation with error handling:
```typescript
export const generateNicknames = async (prompt: string) => {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({ model: 'llama2', prompt, stream: false })
  });
  
  if (!response.ok) throw new Error('Generation failed');
  return parseNicknames(await response.json());
};
```

## Performance Considerations

- FlatList virtualization for event lists
- React.memo for expensive list items
- Optimistic updates for better perceived performance
- Database indexing on frequently queried fields
- Proper error boundaries for crash prevention

## Useful Links
- [Ollama API](https://github.com/m-daniele/ollama-api.git)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
