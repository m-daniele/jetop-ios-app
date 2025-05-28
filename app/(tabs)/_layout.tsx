import { Link, Tabs } from 'expo-router';
import { View } from 'react-native';
import { HeaderButton } from 'components/navigation/HeaderButton';
import {CalendarRange, House, CircleUserRound,Dices,Cpu} from "lucide-react-native" 

// Custom component for circular tab icons
import { ReactNode } from 'react';

type CircularTabIconProps = {
  children: ReactNode;
  focused: boolean;
};

const CircularTabIcon = ({ children, focused }: CircularTabIconProps) => (
  <View
    style={{
      width: 60,
      height: 50,
      borderRadius: 25,
      backgroundColor: focused ? '#D1CFC8' : 'transparent',
      justifyContent: 'space-around',
      alignItems: 'center',
      minHeight: 44, 
      minWidth: 44,
    }}
  >
    {children}
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: '', // Nessun titolo
        headerTransparent: true, // Header opaco (mantiene lo spazio)
        headerShown: true, // Mantiene l'header visibile per lo spacing
        // se lo metto qui funziona solo su tab one e non sulle altre
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          height: 70,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 45,
          marginHorizontal: 30,
          marginBottom: 40,
          position: 'absolute',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          justifyContent: 'space-around',
          paddingHorizontal: 20,
          paddingVertical: 15,
        },
        tabBarItemStyle: { 
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 16,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <House color={focused ? 'black' : 'grey'}  size={24} />
            </CircularTabIcon>
          ),
          headerRight: () => (
            <Link href="/profile" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <CalendarRange color={focused ? 'black' : 'grey'}  size={24} />
            </CircularTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <Dices color={focused ? 'black' : 'grey'}  size={24} />
            </CircularTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="nickname-generator"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <Cpu color={focused ? 'black' : 'grey'}  size={24} />
            </CircularTabIcon>
          ),
        }}
      /> 
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <CircleUserRound color={focused ? 'black' : 'grey'}  size={24} />
            </CircularTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}