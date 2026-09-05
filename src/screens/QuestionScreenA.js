import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import OptionButton from '../components/OptionButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPTIONS = [
  { id: 'fellowship', title: 'Fellowship accountability' },
  { id: 'tech', title: 'Learning a tech skill' },
  { id: 'both', title: 'Both' },
];

const QuestionScreenA = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleNext = async () => {
    try {
      if (selectedOption) {
        await AsyncStorage.setItem('@twinix_reason', selectedOption);
      }
      navigation.navigate('QuestionScreenB');
    } catch (e) {
      console.error('Error saving reason', e);
      navigation.navigate('QuestionScreenB');
    }
  };

  const handleSkip = () => {
    navigation.navigate('QuestionScreenB');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What brings you here?</Text>
        <Text style={styles.subtitle}>
          Tell us your primary goal so we can tailor your experience.
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

export default QuestionScreenA;
