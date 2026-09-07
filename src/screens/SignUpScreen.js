import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

const SignUpScreen = ({ navigation }) => {
  const { signUp } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create the Clerk user
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });

      if (result.status === 'complete') {
        // Sync to MongoDB (auto-creates user doc with PIN)
        try {
          await authAPI.syncUser();
        } catch (syncErr) {
          console.warn('MongoDB sync warning:', syncErr);
        }
      } else {
        console.warn('Sign up incomplete:', result.status);
      }
    } catch (e) {
      console.error('Sign up error', e);
      if (e.errors?.[0]?.code === 'form_identifier_in_use' ||
          e.errors?.[0]?.code === 'email_address_already_exists' ||
          e.errors?.[0]?.code === 'form_identifier_exists') {
        setError('This email is already in use.');
      } else if (e.errors?.[0]?.code === 'form_password_length_too_short') {
        setError('Password must be at least 6 characters.');
      } else if (e.errors?.[0]?.code === 'form_email_address_invalid' ||
                 e.errors?.[0]?.code === 'form_email_address_invalid_format') {
        setError('Invalid email address.');
      } else {
        setError(e.errors?.[0]?.message || e.message || 'Failed to sign up.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start your accountability journey.</Text>

          {error ? <Text style={styles.errorTextMain}>{error}</Text> : null}

          <InputField
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? "Creating account..." : "Sign Up"}
              onPress={handleSignUp}
            />
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Log In</Text></Text>
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

export default SignUpScreen;