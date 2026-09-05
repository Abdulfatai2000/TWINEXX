import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { ListTodo, KeyRound } from 'lucide-react-native';

// Onboarding & Auth Screens
import WelcomeSlides from './src/screens/WelcomeSlides';
import QuestionScreenA from './src/screens/QuestionScreenA';
import QuestionScreenB from './src/screens/QuestionScreenB';
import FinalOnboardingScreen from './src/screens/FinalOnboardingScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';

// Main App Screens
import HomeScreen from './src/screens/HomeScreen';
import MyPinScreen from './src/screens/MyPinScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Onboarding + Login/Signup)
const AuthStack = ({ initialRouteName }) => (
  <Stack.Navigator 
    initialRouteName={initialRouteName}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="WelcomeSlides" component={WelcomeSlides} />
    <Stack.Screen name="QuestionScreenA" component={QuestionScreenA} />
    <Stack.Screen name="QuestionScreenB" component={QuestionScreenB} />
    <Stack.Screen name="FinalOnboardingScreen" component={FinalOnboardingScreen} />
    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
      },
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Tasks') {
          return <ListTodo size={size} color={color} />;
        } else if (route.name === 'My PIN') {
          return <KeyRound size={size} color={color} />;
        }
      },
    })}
  >
    <Tab.Screen name="Tasks" component={HomeScreen} />
    <Tab.Screen name="My PIN" component={MyPinScreen} />
  </Tab.Navigator>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialAuthRoute, setInitialAuthRoute] = useState('WelcomeSlides');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check onboarding status
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('@twinix_onboarding_completed');
        if (completed === 'true') {
          setInitialAuthRoute('LoginScreen');
        }
      } catch (e) {
        console.error('Failed to load onboarding status', e);
      } finally {
        setIsReady(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <AuthStack initialRouteName={initialAuthRoute} />
      )}
    </NavigationContainer>
  );
}
