import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinalOnboardingScreen = ({ navigation }) => {
  
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@twinix_onboarding_completed', 'true');
      navigation.navigate('SignUpScreen');
    } catch (e) {
      console.error('Error saving onboarding flag', e);
      navigation.navigate('SignUpScreen');
    }
  };

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('@twinix_onboarding_completed', 'true');
      navigation.navigate('LoginScreen');
    } catch (e) {
      console.error('Error saving onboarding flag', e);
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Join TWINIX today and turn your goals into reality with the power of accountability.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Get Started" 
          onPress={handleGetStarted} 
          style={styles.primaryButton}
        />
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default FinalOnboardingScreen;
