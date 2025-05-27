import { Link, Tabs } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { View } from 'react-native';
import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { CalendarDays, MapPin } from "lucide-react-native" 

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
    }}
  >
    {children}
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
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
          paddingVertical: 30,
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
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <CalendarDays color="#000" size={20} />
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
        name="game"
        options={{
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <Ionicons 
                name="game-controller-outline" 
                size={28} 
                color={focused ? 'black' : 'grey'} 
              />
            </CircularTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <Ionicons 
                name="person-circle-outline" 
                size={28} 
                color={focused ? 'black' : 'grey'} 
              />
            </CircularTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="nickname-generator"
        options={{
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <CircularTabIcon focused={focused}>
              <Ionicons 
                name="aperture-outline" 
                size={28} 
                color={focused ? 'black' : 'grey'} 
              />
            </CircularTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}