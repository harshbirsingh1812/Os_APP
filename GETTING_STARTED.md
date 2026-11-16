# 🚀 TimeBuddy – Beginner's Guide & Walkthrough

Welcome to **TimeBuddy**! If you are new to React Native, mobile app development, or Android emulators, this guide will walk you through how everything works step-by-step.

---

## 1. How Mobile Apps Work with React Native & Expo

When you build with **React Native**:
1. You write standard **JavaScript** code using React components (`<View>`, `<Text>`, `<TouchableOpacity>`).
2. The **Metro Bundler** packages your code into a single bundle.
3. React Native translates your components into real, native Android UI widgets (like `android.widget.TextView`, `android.view.ViewGroup`).
4. You get real native performance without having to write native Java or Kotlin code!

---

## 2. Tour of the Project Files

Open your project folder at `C:\Users\HP\OneDrive\Desktop\app_2`:

- **[App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js)**: The heart of the app. All user interfaces, task logic, modals, progress calculations, and styles live here.
- **[app.json](file:///c:/Users/HP/OneDrive/Desktop/app_2/app.json)**: Configuration file for Expo. Sets the app name, orientation, package name (`com.timebuddy.app`), and icons.
- **[package.json](file:///c:/Users/HP/OneDrive/Desktop/app_2/package.json)**: Lists all installed packages (`react`, `react-native`, `expo`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`).
- **[assets/](file:///c:/Users/HP/OneDrive/Desktop/app_2/assets)**: Contains the app icon and launcher graphics.

---

## 3. Code Walkthrough: How [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) Works

Let's look at the key parts of the code:

### A. The React Hooks (State Management)
```javascript
const [tasks, setTasks] = useState([]);
const [activeFilter, setActiveFilter] = useState('All');
const [modalVisible, setModalVisible] = useState(false);
```
- `tasks`: An array holding all your task objects. Whenever you add or complete a task, `setTasks(...)` updates this list and tells React to redraw the screen.
- `activeFilter`: Keeps track of whether the user clicked "All", "Pending", or "Completed".
- `modalVisible`: Controls whether the "Add / Edit Task" popup is visible or hidden.

### B. Persistent Local Storage (AsyncStorage)
```javascript
// Runs once when the app boots:
useEffect(() => {
  loadTasks();
}, []);

// Runs whenever tasks change:
useEffect(() => {
  if (!isLoading) {
    saveTasks(tasks);
  }
}, [tasks, isLoading]);
```
- When you first open the app, `loadTasks()` reads the saved tasks from device memory.
- Whenever you add, edit, or check off a task, `saveTasks(tasks)` immediately saves the updated list to local storage so nothing is lost if you close the app.

### C. Automatic Math & Progress Calculation (`useMemo`)
```javascript
const stats = useMemo(() => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, pending, percentage };
}, [tasks]);
```
- Automatically calculates the total count, completed count, pending count, and percentage.
- The progress bar width updates dynamically:
  ```javascript
  style={[styles.progressBarFill, { width: `${stats.percentage}%` }]}
  ```

---

## 4. How to Customize TimeBuddy (Try These Fun Edits!)

All edits take effect instantly thanks to **Fast Refresh** — just edit [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) and save!

### 🎨 Change the Accent Color
Want to try an Emerald Green or Ocean Blue theme?
1. Open [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js).
2. Search for `#6366F1` (the primary purple accent).
3. Replace it with:
   - Ocean Blue: `#2563EB`
   - Emerald Green: `#10B981`
   - Warm Amber: `#F59E0B`
4. Save the file and watch the app update on your emulator instantly!

### 🕒 Add More Quick-Time Presets
In [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) around line 430:
```javascript
{['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'].map((preset) => ...
```
You can add `'08:00 PM'` or `'Anytime'` to the array.

---

## 5. Daily Development Workflow

When working on your app day-to-day:

1. **Start Emulator**:
   ```powershell
   emulator -avd Pixel_7_API_34
   ```
2. **Start Dev Server**:
   ```powershell
   cd C:\Users\HP\OneDrive\Desktop\app_2
   npx expo start --android
   ```
3. **Make code changes** in [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) and see the results live in real time!

