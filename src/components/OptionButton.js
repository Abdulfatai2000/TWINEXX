import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

const OptionButton = ({ title, isSelected, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSelected && styles.buttonSelected,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {title}
      </Text>
      {isSelected && <Check size={20} color="#000000" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // gray-100
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#E5E7EB', // gray-200
    borderColor: '#000000',
  },
  text: {
    color: '#374151', // gray-700
    fontSize: 16,
    fontWeight: '500',
  },
  textSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default OptionButton;
