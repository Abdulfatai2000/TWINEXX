import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Session is established; ClerkProvider will re-render App.js
        // and the AuthStateHandler will switch to AppStack.
      } else {
        // E.g. requires MFA or email verification — handle if needed
        console.warn('Login incomplete:', result.status);
      }
    } catch (e) {
      console.error('Login error', e);
      // Clerk error codes differ from Firebase; show a generic message
      if (e.errors?.[0]?.code === 'form_identifier_unrecognized' ||
          e.errors?.[0]?.code === 'form_password_incorrect') {
        setError('Invalid email or password.');
      } else {
        setError(e.errors?.[0]?.message || e.message || 'Failed to log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevReset = async () => {
    try {
      await AsyncStorage.removeItem('@twinix_onboarding_completed');
      await AsyncStorage.removeItem('@twinix_reason');
      await AsyncStorage.removeItem('@twinix_role_intent');
      Alert.alert('Success', 'Storage cleared. Reload app to test onboarding again.');
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your progress.</Text>

          {error ? <Text style={styles.errorTextMain}>{error}</Text> : null}

          <InputField
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? "Logging in..." : "Log In"}
              onPress={handleLogin}
            />
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.devButton} onPress={handleDevReset}>
            <Text style={styles.devButtonText}>[DEV] Reset Onboarding Flag</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 32,
  },
  errorTextMain: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  linkButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  linkText: {
    color: '#4B5563',
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: '#000000',
  },
  devButton: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  devButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default LoginScreen;