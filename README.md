# JEToP app

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/jetop-ios-app)
[![iOS](https://img.shields.io/badge/iOS-14.0+-green.svg)](https://developer.apple.com/ios/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-61DAFB.svg)](https://reactnative.dev/)

Event management platform for JEurs university team challenge - **iOS Only**

## 📑 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
- [Development](#development)
  - [Running the App](#running-the-app)
  - [Project Structure](#project-structure)
  - [Key Components](#key-components)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Build for iOS](#build-for-ios)
  - [App Configuration](#app-configuration)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Debug Database Connection](#debug-database-connection)
- [Contributing](#contributing)
  - [Code Style](#code-style)
- [Team & Challenge Info](#team--challenge-info)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/jetop-ios-app.git
cd jetop-ios-app
npm install

# Run with npm
npm expo start

# Or bun
bunx expo
```

## Overview

Simple event app for university team members to create, discover, and attend events with QR.

### Features

- **Event Management**: Create/edit events with location and capacity limits
- **Smart Booking**: Real-time availability and QR codes
- **Social Features**: User profiles and AI username generation
- **Fun Extras**: Dice roller for games and activities

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React Native + Expo | iOS development |
| Auth | Clerk | User authentication |
| Backend | Supabase | Database + real-time updates |
| AI | OpenAI API | Username generation |
| State | Zustand | App state management |

## Getting Started

### Requirements

- **iOS 14.0+** 
- **Node.js 18+**
- **Xcode 14+** (for development)
- **Expo CLI**: `npm install -g expo-cli`

### Environment Setup

Create `.env` file:

```env
# Required
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Optional
EXPO_PUBLIC_OPENAI_API_KEY=sk-xxx
```

### Database Setup

Run in Supabase SQL Editor:

```sql
-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB,
  date TIMESTAMPTZ NOT NULL,
  owner_id TEXT NOT NULL,
  max_guests INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Basic policies (users can read all events, manage their own)
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Users manage own events" ON events FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users manage own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);
```

## Development

### Running the App

```bash
npm expo start              # Development server
npm run ios            # iOS Simulator
npm expo start -- --clear   # Clear cache
```

### Project Structure

```
jetop-ios-app/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Authentication flow
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/            # Main app navigation
│   │   ├── events.tsx     # Events list
│   │   ├── create.tsx     # Create event
│   │   ├── bookings.tsx   # My bookings
│   │   └── profile.tsx    # User profile
│   ├── event/
│   │   └── [id].tsx       # Event details
│   ├── _layout.tsx        # Root layout with auth
│   └── +not-found.tsx     # 404 page
├── components/            
│   ├── common/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── events/            # Event-specific components
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   └── QRGenerator.tsx
│   ├── features/          # Feature-specific components
│   │   ├── DiceRoller.tsx
│   │   └── MapPicker.tsx
│   └── templates/         # Screen layout templates
├── lib/                   # Core services
│   ├── supabase.ts        # Database client
│   ├── events.ts          # Event CRUD operations
│   ├── bookings.ts        # Booking operations
│   └── ai.ts              # AI service (OpenAI)
├── store/                 # State management
│   ├── dice.ts            # Dice game state
│   └── auth.ts            # Auth state
├── theme/                 
│   └── theme.ts           # Design system
├── types/                 
│   ├── database.ts        # Supabase types
│   └── common.ts          # Shared types
├── utils/                 
│   ├── cache.ts           # Token management
│   ├── validation.ts      # Form validation
│   └── helpers.ts         # Utility functions
├── hooks/                 # Custom React hooks
│   ├── useEvents.ts
│   ├── useBookings.ts
│   └── useAuth.ts
```

### Key Components

```typescript
// Event operations
export async function createEvent(data: CreateEventInput, userId: string): Promise<Event>
export async function getUpcomingEvents(): Promise<Event[]>
export async function bookEvent(eventId: string, userId: string): Promise<void>

// Main types
interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  owner_id: string;
  max_guests: number;
  booked_count: number;
  location?: { latitude: number; longitude: number; address?: string };
  image_url?: string;
}
```

## Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run lint          # Check code style
```

## Deployment

### Build for iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build:configure
eas build --platform ios --profile production

# For testing on device
eas build --platform ios --profile preview
```

### App Configuration

```json
// app.json (key settings)
{
  "expo": {
    "name": "JEToP",
    "slug": "jetop-ios",
    "platforms": ["ios"],
    "ios": {
      "bundleIdentifier": "com.jetop.university",
      "deploymentTarget": "14.0"
    }
  }
}
```

## Troubleshooting

### Common Issues

```bash
# Build problems
rm -rf node_modules .expo
npm install
npm start -- --clear

# Simulator issues
xcrun simctl erase all

# Check logs
npx react-native log-ios
```

### Debug Database Connection

```typescript
// Test in app
const { data, error } = await supabase.from('events').select('count(*)');
console.log('DB test:', { data, error });
```

## Contributing

This is a university team challenge project! To contribute:

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `npm test`
4. Commit: `git commit -m "feat: add my feature"`
5. Push and create PR

### Code Style

- Use TypeScript for all files
- Follow ESLint rules: `npm run lint`
- Write tests for new features

## Team & Challenge Info

**Team**: JEToP
**Challenge**: Mobile Event Management App  
**Platform**: iOS Only  
**Timeline**: IT area Challenge 2025  

---

**Built with** 💜 **for the JEToP**
