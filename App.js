import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, Platform } from 'react-native';
import { ClerkProvider, useAuth, useSession } from '@clerk/clerk-expo';
import { ListTodo, KeyRound, Crown } from 'lucide-react-native';

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
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import IncomingScreen from './src/screens/IncomingScreen';
import ConnectionsScreen from './src/screens/ConnectionsScreen';

// Subscription context
import { SubscriptionProvider } from './src/context/SubscriptionContext';

import { CLERK_PUBLISHABLE_KEY } from './src/config';
import { setAuthToken } from './src/utils/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Auth Stack (Onboarding + Login/Signup) ────────────────────────────────
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

// ── Main Tab Navigator ────────────────────────────────────────────────────
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
        } else if (route.name === 'Account') {
          return <Crown size={size} color={color} />;
        }
      },
    })}
  >
    <Tab.Screen name="Tasks" component={HomeScreen} />
    <Tab.Screen name="My PIN" component={MyPinScreen} />
    <Tab.Screen name="Account" component={SubscriptionScreen} />
  </Tab.Navigator>
);

// ── Root App Stack (tabs + modal screens) ─────────────────────────────────
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen
      name="Paywall"
      component={PaywallScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen name="Connect" component={ConnectScreen} />
    <Stack.Screen name="Incoming" component={IncomingScreen} />
    <Stack.Screen name="Connections" component={ConnectionsScreen} />
  </Stack.Navigator>
);

// ── Token Syncer ──────────────────────────────────────────────────────────
// Fetches the Clerk JWT and feeds it to the API client.
const TokenSyncer = ({ children }) => {
  const { session, isSignedIn } = useSession();

  useEffect(() => {
    let mounted = true;

    const syncToken = async () => {
      if (!isSignedIn || !session) {
        setAuthToken(null);
        return;
      }
      try {
        const token = await session.getToken();
        if (mounted) {
          setAuthToken(token);
        }
      } catch (e) {
        console.error('TokenSyncer: Error getting token:', e);
        if (mounted) {
          setAuthToken(null);
        }
      }
    };

    syncToken();

    return () => {
      mounted = false;
    };
  }, [session, isSignedIn]);

  return children;
};

// ── Auth State Handler ────────────────────────────────────────────────────
const AuthStateHandler = ({ initialAuthRoute }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const [clerkError, setClerkError] = useState(null);

  useEffect(() => {
    // Safety timeout: if Clerk doesn't load within 10 seconds, show helpful error
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setClerkError(
          'Clerk initialization timeout. This may indicate a network issue or misconfigured Clerk key. Check the browser console for details.'
        );
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (clerkError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 12, textAlign: 'center' }}>
          Authentication Error
        </Text>
        <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22, textAlign: 'center', marginBottom: 24 }}>
          {clerkError}
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          Please check your CLERK_PUBLISHABLE_KEY in src/config/index.js
        </Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 16, fontSize: 12, color: '#9CA3AF' }}>
          Initializing Clerk...
        </Text>
      </View>
    );
  }

  return isSignedIn ? <AppStack /> : <AuthStack initialRouteName={initialAuthRoute} />;
};

// ── Root Component ────────────────────────────────────────────────────────
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialAuthRoute, setInitialAuthRoute] = useState('WelcomeSlides');

  useEffect(() => {
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

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // Validation: Check if Clerk publishable key is present and not a placeholder
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.includes('PLACEHOLDER')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginBottom: 12, textAlign: 'center' }}>
          Missing Clerk Configuration
        </Text>
        <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22, textAlign: 'center' }}>
          CLERK_PUBLISHABLE_KEY is not configured or contains a placeholder.
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, textAlign: 'center' }}>
          Update src/config/index.js with your real Clerk publishable key from the Clerk Dashboard.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <TokenSyncer>
        <SubscriptionProvider>
          <NavigationContainer>
            <AuthStateHandler initialAuthRoute={initialAuthRoute} />
          </NavigationContainer>
        </SubscriptionProvider>
      </TokenSyncer>
    </ClerkProvider>
  );
}