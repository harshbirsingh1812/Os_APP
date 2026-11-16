import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@timebuddy_tasks_v1';

// Initial sample tasks for first-time launch
const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Review daily priorities & plan schedule',
    time: '09:00 AM',
    priority: 'High',
    completed: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Team standup and project update',
    time: '11:30 AM',
    priority: 'Medium',
    completed: false,
    createdAt: Date.now() - 1800000,
  },
  {
    id: '3',
    title: 'Complete TimeBuddy Android build',
    time: '03:00 PM',
    priority: 'High',
    completed: false,
    createdAt: Date.now() - 900000,
  },
  {
    id: '4',
    title: 'Evening walk & unwind',
    time: '06:30 PM',
    priority: 'Low',
    completed: false,
    createdAt: Date.now(),
  },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Pending' | 'Completed'

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium'); // 'Low' | 'Medium' | 'High'
  const [titleError, setTitleError] = useState('');

  // Load tasks on startup
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks on changes
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        setTasks(Array.isArray(parsed) ? parsed : []);
      } else {
        // First run: load default beginner-friendly tasks
        setTasks(DEFAULT_TASKS);
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
      Alert.alert('Storage Notice', 'Could not load saved tasks. Starting fresh.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
      Alert.alert('Save Error', 'Changes could not be saved to local storage.');
    }
  };

  // Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! ☀️';
    if (hour < 17) return 'Good Afternoon! 🌤️';
    return 'Good Evening! 🌙';
  }, []);

  // Formatted Date
  const formattedDate = useMemo(() => {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return now.toLocaleDateString(undefined, options);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, percentage };
  }, [tasks]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    if (activeFilter === 'Pending') {
      return tasks.filter((t) => !t.completed);
    }
    if (activeFilter === 'Completed') {
      return tasks.filter((t) => t.completed);
    }
    return tasks;
  }, [tasks, activeFilter]);

  // Task Actions
  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const openAddModal = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskTime('10:00 AM');
    setTaskPriority('Medium');
    setTitleError('');
    setModalVisible(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskTime(task.time || '');
    setTaskPriority(task.priority || 'Medium');
    setTitleError('');
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required');
      return;
    }

    const assignedTime = taskTime.trim() || 'Anytime';

    if (editingTaskId) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? { ...task, title: trimmedTitle, time: assignedTime, priority: taskPriority }
            : task
        )
      );
    } else {
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        title: trimmedTitle,
        time: assignedTime,
        priority: taskPriority,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setModalVisible(false);
  };

  const handleDeleteTask = (task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
          },
        },
      ]
    );
  };

  const getPriorityColors = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
      case 'Low':
        return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
      case 'Medium':
      default:
        return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Main Container */}
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.appTitle}>TimeBuddy</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress & Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>My Day Progress</Text>
              <Text style={styles.cardSubtitle}>
                {stats.completed} of {stats.total} tasks completed
              </Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{stats.percentage}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, stats.percentage))}%` },
              ]}
            />
          </View>

          {/* Stat Pills */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {['All', 'Pending', 'Completed'].map((filter) => {
            const count =
              filter === 'All'
                ? stats.total
                : filter === 'Pending'
                ? stats.pending
                : stats.completed;
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {filter} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const priorityColors = getPriorityColors(item.priority);
            return (
              <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                {/* Complete Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted,
                  ]}
                  onPress={() => handleToggleComplete(item.id)}
                  activeOpacity={0.7}
                >
                  {item.completed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Task Details */}
                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitleText,
                      item.completed && styles.taskTitleCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  <View style={styles.taskMetaRow}>
                    {/* Time Pill */}
                    <View style={styles.timePill}>
                      <Ionicons name="time-outline" size={12} color="#64748B" />
                      <Text style={styles.timePillText}>{item.time}</Text>
                    </View>

                    {/* Priority Pill */}
                    <View
                      style={[
                        styles.priorityPill,
                        { backgroundColor: priorityColors.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          { color: priorityColors.text },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions: Edit & Delete */}
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditModal(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDeleteTask(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeFilter === 'Completed'
                    ? 'checkmark-circle-outline'
                    : 'calendar-outline'
                }
                size={54}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'Completed'
                  ? 'Complete tasks to see them tracked here.'
                  : activeFilter === 'Pending'
                  ? 'Great job! You have cleared all pending tasks.'
                  : 'Tap the "+" button below to plan your day.'}
              </Text>
            </View>
          }
        />

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Add / Edit Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTaskId ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Task Title Input */}
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={[styles.textInput, titleError ? styles.inputError : null]}
                placeholder="e.g. Finish quarterly report"
                placeholderTextColor="#94A3B8"
                value={taskTitle}
                onChangeText={(text) => {
                  setTaskTitle(text);
                  if (titleError) setTitleError('');
                }}
                autoFocus={true}
              />
              {titleError ? (
                <Text style={styles.errorText}>{titleError}</Text>
              ) : null}

              {/* Planned Time Input */}
              <Text style={styles.inputLabel}>Planned Time</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 10:30 AM or Anytime"
                placeholderTextColor="#94A3B8"
                value={taskTime}
                onChangeText={setTaskTime}
              />

              {/* Quick Time Selector Chips */}
              <View style={styles.quickTimeRow}>
                {['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.quickTimeChip,
                      taskTime === preset && styles.quickTimeChipSelected,
                    ]}
                    onPress={() => setTaskTime(preset)}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        taskTime === preset && styles.quickTimeTextSelected,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority Selector */}
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelectorRow}>
                {[
                  { label: 'Low', color: '#059669', bg: '#D1FAE5' },
                  { label: 'Medium', color: '#D97706', bg: '#FEF3C7' },
                  { label: 'High', color: '#DC2626', bg: '#FEE2E2' },
                ].map((item) => {
                  const isSelected = taskPriority === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.priorityOption,
                        { borderColor: isSelected ? item.color : '#E2E8F0' },
                        isSelected && { backgroundColor: item.bg },
                      ]}
                      onPress={() => setTaskPriority(item.label)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          { color: isSelected ? item.color : '#475569' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveTask}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 90,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    opacity: 0.85,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxCompleted: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  timePillText: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  quickTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  quickTimeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  quickTimeChipSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  quickTimeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  quickTimeTextSelected: {
    color: '#6366F1',
    fontWeight: '700',
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    elevation: 2,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
