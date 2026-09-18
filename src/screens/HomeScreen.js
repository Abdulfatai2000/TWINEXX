import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { TaskService } from '../services';
import { isLocalMode } from '../config/dev';
import TaskItem from '../components/TaskItem';
import PrimaryButton from '../components/PrimaryButton';
import { Plus } from 'lucide-react-native';

const HomeScreen = () => {
  const { userId, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!isSignedIn || !userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const userTasks = await TaskService.getTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('HomeScreen: Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, isSignedIn]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !userId) return;

    try {
      const task = await TaskService.createTask(userId, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
      });
      setTasks((prev) => [task, ...prev]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setModalVisible(false);
    } catch (error) {
      console.error('HomeScreen: Error adding task:', error);
      Alert.alert('Error', 'Could not add task. Please try again.');
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    if (!userId) return;

    try {
      const newStatus = currentStatus === 'done' ? 'pending' : 'done';
      const updatedTask = await TaskService.updateTask(userId, taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error('HomeScreen: Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!userId) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TaskService.deleteTask(userId, taskId);
              setTasks((prev) => prev.filter((t) => t.id !== taskId));
            } catch (error) {
              console.error('HomeScreen: Error deleting task:', error);
              Alert.alert('Error', 'Could not delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteTask}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one to get started!</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (Optional)"
              value={newTaskDesc}
              onChangeText={setNewTaskDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="Add Task"
                onPress={handleAddTask}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    padding: 16,
    marginRight: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
  },
});

export default HomeScreen;