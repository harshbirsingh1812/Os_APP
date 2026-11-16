# ⏱️ TimeBuddy Pro – Advanced Android Time Management Application

> A modern, sophisticated, and offline-first Android time management application built with **React Native** and **Expo**.

![TimeBuddy Dark Mode](C:/Users/HP/.gemini/antigravity/brain/6362fb06-0dc5-4258-af55-be26c525eb10/timebuddy_hero_dark.png)

---

## 🌟 What's New in TimeBuddy Pro

1. **⏱️ Integrated Pomodoro Focus Timer**:
   - Tap the stopwatch icon on any task to launch a dedicated 25-minute Pomodoro session (with 15m Sprint and 5m Break presets).
   - Real-time digital circular countdown with Play, Pause, and Reset controls.
   - Automatically tracks daily completed focus sessions (`🔥 Focus` streak).
2. **🌓 Deep OLED Dark Mode**:
   - One-tap toggle between a crisp minimalist Light Theme and a deep OLED Slate Dark Theme (`#0B0F19`).
   - Theme choice is automatically saved and remembered across app launches.
3. **🏷️ Category System**:
   - Tag tasks with custom icons and color badges:
     - 📚 **Study** (Purple)
     - 💼 **Work** (Blue)
     - 🏋️ **Health** (Green)
     - 🏠 **Personal** (Amber)
4. **🔍 Instant Live Search**:
   - Tap the search icon to filter tasks dynamically in real time by title, category, or time.
5. **🔀 Smart Multi-Sorting**:
   - Instant 1-tap reordering by **Recent** (newest first), **Priority** (High $\rightarrow$ Low), or **Time** (chronological).
6. **📤 Native Daily Summary Sharing**:
   - One-tap button in the header formats and shares today's productivity report via WhatsApp, Email, or clipboard using Android's native share sheet.

---

## 📖 Core Features

- **🌅 Smart "My Day" Dashboard**:
  - Time-aware dynamic greeting (*"Good Morning! ☀️"*, *"Good Afternoon! 🌤️"*, *"Good Evening! 🌙"*).
  - Real-time localized date display.
  - Visual progress bar that animates as tasks are completed or modified.
  - Metric counters for **Total**, **Completed**, and **Pending** tasks with daily completion percentage.
- **🎯 Task Management**:
  - **Add Tasks**: Assign title, category, planned time presets, and priority.
  - **Edit Tasks**: Modify any existing task with prefilled values.
  - **Delete Tasks**: Safe removal with a native Android confirmation prompt.
  - **Toggle Completion**: Tap any task's checkbox to mark it done with strikethrough styling.
- **🚦 Priority System**: High (Red), Medium (Amber), Low (Green).
- **🔍 Filter Views**: Instant filtering between **All**, **Pending**, and **Completed** with live counter badges.
- **💾 Offline Persistence**: Powered by `@react-native-async-storage/async-storage` for reliable local data storage.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (0.88.1)** | Mobile application framework |
| **Expo (SDK 58)** | Development platform and native tooling |
| **JavaScript (ES6+)** | Functional components and React Hooks (`useState`, `useEffect`, `useMemo`, `useRef`) |
| **AsyncStorage** | Local persistent storage |
| **Expo Vector Icons** | Ionicons icon set |
| **Android SDK (API 34)** | Target platform running on Google Pixel 7 AVD |

---

## 📁 Project Directory Structure

```text
app_2/
├── App.js                   # Complete application logic, UI components, & styles
├── app.json                 # Expo project configuration (app name, icon, package)
├── package.json             # Project dependencies and run scripts
├── index.js                 # Entrypoint registering App with Expo
├── assets/                  # App icons and adaptive splash images
├── README.md                # Project documentation and quick-start guide
├── ARCHITECTURE.md          # Technical architecture and data flow diagrams
├── GETTING_STARTED.md       # Beginner guide and customization walkthrough
└── run_timebuddy.bat        # 1-Click launcher script
```

---

## 🚀 Quick Start Guide

### 1. Launch with the 1-Click Desktop Shortcut
Double click:
📁 **`C:\Users\HP\OneDrive\Desktop\Run_TimeBuddy.bat`**

### 2. Or Launch from PowerShell
```powershell
# 1. Start the emulator
emulator -avd Pixel_7_API_34

# 2. Start TimeBuddy
cd C:\Users\HP\OneDrive\Desktop\app_2
npx expo start --android
```

---

## 📄 Documentation Links

- [ARCHITECTURE.md](file:///c:/Users/HP/OneDrive/Desktop/app_2/ARCHITECTURE.md) – Detailed system architecture, component breakdown, and data flow.
- [GETTING_STARTED.md](file:///c:/Users/HP/OneDrive/Desktop/app_2/GETTING_STARTED.md) – Step-by-step code explanation and guide to customizing TimeBuddy.
- [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) – Main application source code.
