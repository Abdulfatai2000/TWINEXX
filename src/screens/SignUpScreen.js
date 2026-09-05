import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { generateUniquePin } from '../utils/pinGenerator';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({ navigation }) => {
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
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Generate unique PIN
      const pin = await generateUniquePin();

      // 3. Create Firestore User Document
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: name,
        email: email,
        pin: pin,
        subscription_status: 'free',
        subscription_expires_at: null,
        createdAt: serverTimestamp(),
      });

      // No need to navigate manually, App.js auth listener will redirect if we set it up properly,
      // but we might not have it setup yet so let's navigate to Main for safety (or it will happen automatically in App.js)

    } catch (e) {
      console.error('Sign up error', e);
      if (e.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(e.message || 'Failed to sign up.');
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
