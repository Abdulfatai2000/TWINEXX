import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import OptionButton from '../components/OptionButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPTIONS = [
  { id: 'be_mentored', title: 'Be mentored' },
  { id: 'mentor_others', title: 'Mentor others' },
  { id: 'both', title: 'Both' },
];

const QuestionScreenB = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleNext = async () => {
    try {
      if (selectedOption) {
        await AsyncStorage.setItem('@twinix_role_intent', selectedOption);
      }
      navigation.navigate('FinalOnboardingScreen');
    } catch (e) {
      console.error('Error saving role intent', e);
      navigation.navigate('FinalOnboardingScreen');
    }
  };

  const handleSkip = () => {
    navigation.navigate('FinalOnboardingScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your role?</Text>
        <Text style={styles.subtitle}>
          Are you looking for a mentor, or do you want to mentor someone?
        </Text>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => (
            <OptionButton
              key={option.id}
              title={option.title}
              isSelected={selectedOption === option.id}
              onPress={() => setSelectedOption(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Next" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

export default QuestionScreenB;
