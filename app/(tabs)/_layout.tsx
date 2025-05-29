import { Link, Tabs } from 'expo-router';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CalendarRange, House, CircleUserRound, Dices, Cpu } from "lucide-react-native";
import { ReactNode, useEffect, useRef } from 'react';

type CircularTabIconProps = {
  children: ReactNode;
  focused: boolean;
};

const CircularTabIcon = ({ children, focused }: CircularTabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Glow effect when focused */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 56,
            height: 56,
            borderRadius: 28,
            opacity: opacityAnim,
          }}
        >
          <LinearGradient
            colors={['#a855f7', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              opacity: 0.8,
            }}
          />
        </Animated.View>
        
        {/* Icon container */}
        <View
          style={{
            backgroundColor: focused ? 'transparent' : 'rgba(255,255,255,0.1)',
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
        headerTransparent: true,
        headerShown: true,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 35,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(15,12,41,0.7)',
                  flex: 1,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 35,
                }}
              />
            </BlurView>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 80,
          borderRadius: 35,
          marginHorizontal: 20,
          marginBottom: 30,
          position: 'absolute',
          elevation: 0,
          shadowColor: '#a855f7',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarItemStyle: { 
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 21,
          paddingBottom: 12,
        },
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircularTabIcon focused={focused}>
              <CalendarRange 
                color={focused ? '#ffffff' : 'rgba(255,255,255,0.6)'} 
                size={24} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </CircularTabIcon>
          ),
        }}
      />
      
      <Tabs.Screen
        name="game"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircularTabIcon focused={focused}>
              <Dices 
                color={focused ? '#ffffff' : 'rgba(255,255,255,0.6)'} 
                size={24} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </CircularTabIcon>
          ),
        }}
      />
      
      <Tabs.Screen
        name="nickname-generator"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircularTabIcon focused={focused}>
              <Cpu 
                color={focused ? '#ffffff' : 'rgba(255,255,255,0.6)'} 
                size={24} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </CircularTabIcon>
          ),
        }}
      /> 
      
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircularTabIcon focused={focused}>
              <CircleUserRound 
                color={focused ? '#ffffff' : 'rgba(255,255,255,0.6)'} 
                size={24} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </CircularTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}