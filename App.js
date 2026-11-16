import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@timebuddy_tasks_v1';
const THEME_KEY = '@timebuddy_theme_v1';
const SESSIONS_KEY = '@timebuddy_sessions_v1';

// Available Task Categories
const CATEGORIES = [
  { id: 'Study', label: 'Study', icon: 'book-outline', color: '#8B5CF6', lightBg: '#EDE9FE', darkBg: 'rgba(139, 92, 246, 0.2)' },
  { id: 'Work', label: 'Work', icon: 'briefcase-outline', color: '#3B82F6', lightBg: '#DBEAFE', darkBg: 'rgba(59, 130, 246, 0.2)' },
  { id: 'Health', label: 'Health', icon: 'fitness-outline', color: '#10B981', lightBg: '#D1FAE5', darkBg: 'rgba(16, 185, 129, 0.2)' },
  { id: 'Personal', label: 'Personal', icon: 'person-outline', color: '#F59E0B', lightBg: '#FEF3C7', darkBg: 'rgba(245, 158, 11, 0.2)' },
];

// Initial starter tasks
const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Review daily priorities & plan schedule',
    time: '09:00 AM',
    priority: 'High',
    category: 'Study',
    completed: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Team standup and project update',
    time: '11:30 AM',
    priority: 'Medium',
    category: 'Work',
    completed: false,
    createdAt: Date.now() - 1800000,
  },
  {
    id: '3',
    title: 'Complete TimeBuddy Android build',
    time: '03:00 PM',
    priority: 'High',
    category: 'Work',
    completed: false,
    createdAt: Date.now() - 900000,
  },
  {
    id: '4',
    title: 'Evening workout & unwind',
    time: '06:30 PM',
    priority: 'Low',
    category: 'Health',
    completed: false,
    createdAt: Date.now(),
  },
];

export default function App() {
  // Theme State ('light' | 'dark')
  const [themeMode, setThemeMode] = useState('light');
  const isDark = themeMode === 'dark';

  // Core Task State
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Pending' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'priority' | 'time'
  const [showSearch, setShowSearch] = useState(false);
  const [focusSessionsCount, setFocusSessionsCount] = useState(0);

  // Modal State (Add / Edit)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Study');
  const [titleError, setTitleError] = useState('');

  // Pomodoro Timer State
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timerDuration, setTimerDuration] = useState(25 * 60); // 25 mins in seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  // Dynamic Theme Colors
  const theme = useMemo(() => {
    return isDark
      ? {
          bg: '#0B0F19',
          card: '#1E293B',
          cardBorder: '#334155',
          text: '#F8FAFC',
          textMuted: '#94A3B8',
          subtext: '#64748B',
          primary: '#818CF8',
          primaryLight: 'rgba(129, 140, 248, 0.15)',
          chipBg: '#334155',
          chipText: '#CBD5E1',
          inputBg: '#0F172A',
          inputBorder: '#334155',
          divider: '#334155',
          checkboxBorder: '#475569',
        }
      : {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardBorder: '#F1F5F9',
          text: '#0F172A',
          textMuted: '#64748B',
          subtext: '#94A3B8',
          primary: '#6366F1',
          primaryLight: '#EEF2FF',
          chipBg: '#E2E8F0',
          chipText: '#475569',
          inputBg: '#F8FAFC',
          inputBorder: '#E2E8F0',
          divider: '#F1F5F9',
          checkboxBorder: '#CBD5E1',
        };
  }, [isDark]);

  // Load data on startup
  useEffect(() => {
    loadAllData();
  }, []);

  // Save tasks on mutation
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  // Timer countdown hook
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const loadAllData = async () => {
    try {
      const [savedTasks, savedTheme, savedSessions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(SESSIONS_KEY),
      ]);

      if (savedTasks !== null) {
        const parsed = JSON.parse(savedTasks);
        setTasks(Array.isArray(parsed) ? parsed : []);
      } else {
        setTasks(DEFAULT_TASKS);
      }

      if (savedTheme) setThemeMode(savedTheme);
      if (savedSessions) setFocusSessionsCount(parseInt(savedSessions, 10) || 0);
    } catch (e) {
      console.error('Error loading data:', e);
      setTasks(DEFAULT_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setThemeMode(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextTheme);
    } catch (e) {
      console.error('Error saving theme:', e);
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
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, percentage };
  }, [tasks]);

  // Priority Weights
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  // Filtered & Sorted Task List
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by Completion
    if (activeFilter === 'Pending') {
      result = result.filter((t) => !t.completed);
    } else if (activeFilter === 'Completed') {
      result = result.filter((t) => t.completed);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.time && t.time.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'time') {
        return (a.time || '').localeCompare(b.time || '');
      }
      // default: recent
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [tasks, activeFilter, searchQuery, sortBy]);

  // Task Actions
  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const openAddModal = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskTime('10:00 AM');
    setTaskPriority('Medium');
    setTaskCategory('Study');
    setTitleError('');
    setModalVisible(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskTime(task.time || '');
    setTaskPriority(task.priority || 'Medium');
    setTaskCategory(task.category || 'Study');
    setTitleError('');
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    const trimmed = taskTitle.trim();
    if (!trimmed) {
      setTitleError('Task title is required');
      return;
    }

    const assignedTime = taskTime.trim() || 'Anytime';

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: trimmed,
                time: assignedTime,
                priority: taskPriority,
                category: taskCategory,
              }
            : t
        )
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: trimmed,
        time: assignedTime,
        priority: taskPriority,
        category: taskCategory,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setModalVisible(false);
  };

  const handleDeleteTask = (task) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setTasks((prev) => prev.filter((t) => t.id !== task.id)),
      },
    ]);
  };

  // Pomodoro Handlers
  const openTimerForTask = (task) => {
    setActiveTimerTask(task);
    setTimerDuration(25 * 60);
    setTimeLeft(25 * 60);
    setIsTimerRunning(false);
    setTimerModalVisible(true);
  };

  const selectTimerPreset = (minutes) => {
    const secs = minutes * 60;
    setTimerDuration(secs);
    setTimeLeft(secs);
    setIsTimerRunning(false);
  };

  const handleTimerComplete = async () => {
    const updatedSessions = focusSessionsCount + 1;
    setFocusSessionsCount(updatedSessions);
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, updatedSessions.toString());
    } catch (e) {
      console.error(e);
    }

    Alert.alert(
      '🎉 Focus Session Complete!',
      `Great focus on "${activeTimerTask ? activeTimerTask.title : 'Task'}"! Total sessions today: ${updatedSessions}`,
      [
        {
          text: 'Mark Task Done',
          onPress: () => {
            if (activeTimerTask) handleToggleComplete(activeTimerTask.id);
            setTimerModalVisible(false);
          },
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const formatTimerSeconds = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Share Daily Summary
  const handleShareSummary = async () => {
    try {
      const summaryLines = [
        `⏱️ TimeBuddy Daily Report (${formattedDate})`,
        `Progress: ${stats.completed}/${stats.total} tasks completed (${stats.percentage}%)`,
        `🔥 Focus Sessions: ${focusSessionsCount}`,
        '',
        'Tasks:',
        ...tasks.map(
          (t) =>
            `${t.completed ? '✅' : '⏳'} ${t.title} [${t.priority}] (${t.time})`
        ),
      ];

      await Share.share({
        message: summaryLines.join('\n'),
      });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', text: '#EF4444' };
      case 'Low':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', text: '#10B981' };
      case 'Medium':
      default:
        return { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', text: '#F59E0B' };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greetingText, { color: theme.primary }]}>
              {greeting}
            </Text>
            <Text style={[styles.appTitle, { color: theme.text }]}>TimeBuddy</Text>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {formattedDate}
            </Text>
          </View>

          {/* Header Action Buttons */}
          <View style={styles.headerActions}>
            {/* Search Toggle */}
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
              onPress={() => setShowSearch(!showSearch)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showSearch ? 'close' : 'search'}
                size={18}
                color={theme.primary}
              />
            </TouchableOpacity>

            {/* Quick Share Summary */}
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
              onPress={handleShareSummary}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={18} color={theme.primary} />
            </TouchableOpacity>

            {/* Dark / Light Mode Toggle */}
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#F59E0B' : theme.primary}
              />
            </TouchableOpacity>

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.headerAddBtn, { backgroundColor: theme.primary }]}
              onPress={openAddModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Search Bar (Toggled) */}
        {showSearch && (
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by title, category, or time..."
              placeholderTextColor={theme.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Progress & Overview Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                My Day Progress
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                {stats.completed} of {stats.total} tasks completed
              </Text>
            </View>
            <View
              style={[styles.percentageBadge, { backgroundColor: theme.primaryLight }]}
            >
              <Text style={[styles.percentageText, { color: theme.primary }]}>
                {stats.percentage}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.min(100, Math.max(0, stats.percentage))}%`,
                },
              ]}
            />
          </View>

          {/* Stat Pills & Productivity Streak */}
          <View style={[styles.statsRow, { borderTopColor: theme.divider }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                Completed
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                Pending
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                🔥 {focusSessionsCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                Focus
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Chips & Sorting Control Row */}
        <View style={styles.controlRow}>
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
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.chipBg,
                    },
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.chipText,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {filter} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sort Selector Button */}
          <TouchableOpacity
            style={[
              styles.sortBtn,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
            onPress={() => {
              const nextSort =
                sortBy === 'recent'
                  ? 'priority'
                  : sortBy === 'priority'
                  ? 'time'
                  : 'recent';
              setSortBy(nextSort);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={14} color={theme.primary} />
            <Text style={[styles.sortBtnText, { color: theme.primary }]}>
              {sortBy === 'priority'
                ? 'Priority'
                : sortBy === 'time'
                ? 'Time'
                : 'Recent'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const priorityStyle = getPriorityStyle(item.priority);
            const categoryObj =
              CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];

            return (
              <View
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                  item.completed && {
                    backgroundColor: isDark ? '#141D2E' : '#F8FAFC',
                    opacity: 0.8,
                  },
                ]}
              >
                {/* Complete Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: theme.checkboxBorder },
                    item.completed && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => handleToggleComplete(item.id)}
                  activeOpacity={0.7}
                >
                  {item.completed && (
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Task Content */}
                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitleText,
                      { color: theme.text },
                      item.completed && [
                        styles.taskTitleCompleted,
                        { color: theme.subtext },
                      ],
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  {/* Task Meta Row */}
                  <View style={styles.taskMetaRow}>
                    {/* Time Pill */}
                    <View
                      style={[
                        styles.timePill,
                        { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={11}
                        color={theme.textMuted}
                      />
                      <Text
                        style={[styles.timePillText, { color: theme.textMuted }]}
                      >
                        {item.time}
                      </Text>
                    </View>

                    {/* Category Pill */}
                    <View
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isDark
                            ? categoryObj.darkBg
                            : categoryObj.lightBg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={categoryObj.icon}
                        size={10}
                        color={categoryObj.color}
                      />
                      <Text
                        style={[
                          styles.categoryPillText,
                          { color: categoryObj.color },
                        ]}
                      >
                        {categoryObj.label}
                      </Text>
                    </View>

                    {/* Priority Pill */}
                    <View
                      style={[
                        styles.priorityPill,
                        { backgroundColor: priorityStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          { color: priorityStyle.text },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.taskActions}>
                  {/* Focus Timer Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionIconBtn,
                      { backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() => openTimerForTask(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="timer-outline" size={15} color={theme.primary} />
                  </TouchableOpacity>

                  {/* Edit Button */}
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openEditModal(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="pencil-outline" size={16} color={theme.primary} />
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleDeleteTask(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
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
                    : searchQuery
                    ? 'search-outline'
                    : 'calendar-outline'
                }
                size={54}
                color={theme.subtext}
              />
              <Text style={[styles.emptyTitle, { color: theme.textMuted }]}>
                {searchQuery
                  ? 'No matching tasks'
                  : activeFilter === 'Completed'
                  ? 'No completed tasks yet'
                  : activeFilter === 'Pending'
                  ? 'All tasks completed!'
                  : 'No tasks for today'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                {searchQuery
                  ? 'Try searching with a different keyword.'
                  : 'Tap the "+" button below to plan your day.'}
              </Text>
            </View>
          }
        />

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= MODAL 1: ADD / EDIT TASK ================= */}
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingTaskId ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Task Title */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                Task Title *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: titleError ? '#EF4444' : theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. Finish chemistry assignment"
                placeholderTextColor={theme.subtext}
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

              {/* Category Selector */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                Category
              </Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = taskCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        {
                          borderColor: isSelected ? cat.color : theme.inputBorder,
                          backgroundColor: isSelected
                            ? isDark
                              ? cat.darkBg
                              : cat.lightBg
                            : theme.inputBg,
                        },
                      ]}
                      onPress={() => setTaskCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={14}
                        color={isSelected ? cat.color : theme.textMuted}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            color: isSelected ? cat.color : theme.textMuted,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Planned Time */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                Planned Time
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. 10:30 AM or Anytime"
                placeholderTextColor={theme.subtext}
                value={taskTime}
                onChangeText={setTaskTime}
              />

              {/* Quick Time Preset Chips */}
              <View style={styles.quickTimeRow}>
                {['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '08:00 PM'].map(
                  (preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.quickTimeChip,
                        {
                          backgroundColor:
                            taskTime === preset
                              ? theme.primaryLight
                              : theme.inputBg,
                          borderColor:
                            taskTime === preset
                              ? theme.primary
                              : theme.inputBorder,
                        },
                      ]}
                      onPress={() => setTaskTime(preset)}
                    >
                      <Text
                        style={[
                          styles.quickTimeText,
                          {
                            color:
                              taskTime === preset
                                ? theme.primary
                                : theme.textMuted,
                            fontWeight: taskTime === preset ? '700' : '500',
                          },
                        ]}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Priority Selector */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                Priority
              </Text>
              <View style={styles.prioritySelectorRow}>
                {[
                  { label: 'Low', color: '#10B981', bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' },
                  { label: 'Medium', color: '#F59E0B', bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' },
                  { label: 'High', color: '#EF4444', bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' },
                ].map((item) => {
                  const isSelected = taskPriority === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.priorityOption,
                        {
                          borderColor: isSelected ? item.color : theme.inputBorder,
                          backgroundColor: isSelected ? item.bg : theme.inputBg,
                        },
                      ]}
                      onPress={() => setTaskPriority(item.label)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          {
                            color: isSelected ? item.color : theme.textMuted,
                            fontWeight: isSelected ? '700' : '600',
                          },
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
                style={[styles.cancelBtn, { backgroundColor: theme.inputBg }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
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

      {/* ================= MODAL 2: POMODORO FOCUS TIMER ================= */}
      <Modal
        visible={timerModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setIsTimerRunning(false);
          setTimerModalVisible(false);
        }}
      >
        <View style={styles.timerModalOverlay}>
          <View
            style={[
              styles.timerCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.timerCloseBtn}
              onPress={() => {
                setIsTimerRunning(false);
                setTimerModalVisible(false);
              }}
            >
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>

            <Text style={[styles.timerBadge, { color: theme.primary }]}>
              ⏱️ POMODORO FOCUS
            </Text>

            {/* Focused Task Title */}
            <Text
              style={[styles.timerTaskTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              {activeTimerTask ? activeTimerTask.title : 'Deep Work Session'}
            </Text>

            {/* Large Countdown Display */}
            <View
              style={[
                styles.timerDisplayCircle,
                {
                  borderColor: theme.primary,
                  backgroundColor: theme.primaryLight,
                },
              ]}
            >
              <Text style={[styles.timerDigits, { color: theme.primary }]}>
                {formatTimerSeconds(timeLeft)}
              </Text>
              <Text style={[styles.timerStatusSub, { color: theme.textMuted }]}>
                {isTimerRunning ? 'STAY FOCUSED' : 'READY'}
              </Text>
            </View>

            {/* Duration Presets */}
            <View style={styles.timerPresetRow}>
              {[
                { label: '25m Focus', mins: 25 },
                { label: '15m Sprint', mins: 15 },
                { label: '5m Break', mins: 5 },
              ].map((p) => {
                const isSelected = timerDuration === p.mins * 60;
                return (
                  <TouchableOpacity
                    key={p.mins}
                    style={[
                      styles.timerPresetChip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.inputBg,
                      },
                    ]}
                    onPress={() => selectTimerPreset(p.mins)}
                  >
                    <Text
                      style={[
                        styles.timerPresetText,
                        { color: isSelected ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Control Buttons (Play/Pause & Reset) */}
            <View style={styles.timerControlsRow}>
              {/* Reset */}
              <TouchableOpacity
                style={[
                  styles.timerResetBtn,
                  { backgroundColor: theme.inputBg },
                ]}
                onPress={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(timerDuration);
                }}
              >
                <Ionicons name="refresh" size={20} color={theme.textMuted} />
              </TouchableOpacity>

              {/* Start / Pause */}
              <TouchableOpacity
                style={[
                  styles.timerPlayBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isTimerRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.timerPlayBtnText}>
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 16 : 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    elevation: 1,
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 3,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 2,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 22,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 12,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 90,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  timePillText: {
    fontSize: 10,
    marginLeft: 3,
    fontWeight: '500',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  priorityPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  categoryOptionText: {
    fontSize: 11,
    marginLeft: 4,
  },
  quickTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 4,
  },
  quickTimeChip: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  quickTimeText: {
    fontSize: 11,
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityOptionText: {
    fontSize: 13,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timerCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
  },
  timerCloseBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 6,
  },
  timerBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  timerTaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  timerDisplayCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerDigits: {
    fontSize: 38,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerStatusSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  timerPresetRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timerPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  timerPresetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timerResetBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timerPlayBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  timerPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});
