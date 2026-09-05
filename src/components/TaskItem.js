import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trash2, Circle } from 'lucide-react-native';

const TaskItem = ({ task, onToggleStatus, onDelete }) => {
  const isDone = task.status === 'done';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onToggleStatus(task.id, task.status)} style={styles.checkboxContainer}>
        {isDone ? (
          <View style={styles.checkedCircle}>
            <Check size={16} color="#FFFFFF" />
          </View>
        ) : (
          <Circle size={24} color="#D1D5DB" />
        )}
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDone && styles.titleDone]}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={[styles.description, isDone && styles.descriptionDone]}>
            {task.description}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  descriptionDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
});

export default TaskItem;
