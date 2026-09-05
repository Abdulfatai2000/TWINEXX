import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const PinDisplay = ({ pin }) => {
  const copyToClipboard = async () => {
    if (pin) {
      await Clipboard.setStringAsync(pin);
      // Feedback could be added here (e.g., Toast)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pinText}>{pin || '------'}</Text>
      <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
        <Copy size={20} color="#4B5563" />
        <Text style={styles.copyText}>Copy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 32,
    borderRadius: 16,
    width: '100%',
    marginVertical: 24,
  },
  pinText: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#000000',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  copyText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
});

export default PinDisplay;
