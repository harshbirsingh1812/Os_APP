# ⏱️ TimeBuddy – Android Time Management Application

> A modern, beginner-friendly, and offline-first Android time management application built with **React Native** and **Expo**.

![TimeBuddy Preview](C:/Users/HP/.gemini/antigravity/brain/6362fb06-0dc5-4258-af55-be26c525eb10/timebuddy_final.png)

---

## 📖 Overview

**TimeBuddy** helps you plan your day, stay focused, and track your daily productivity with ease. It runs completely offline using local device storage, requiring no login, no backend server, and no internet connection.

### ✨ Key Features

- **🌅 Smart "My Day" Dashboard**:
  - Time-aware dynamic greeting (*"Good Morning! ☀️"*, *"Good Afternoon! 🌤️"*, *"Good Evening! 🌙"*).
  - Real-time localized date display.
  - Visual progress bar that animates as tasks are completed or modified.
  - Metric counters for **Total**, **Completed**, and **Pending** tasks with daily completion percentage.
- **🎯 Task Management**:
  - **Add Tasks**: Assign a title, planned time (or quick preset), and priority.
  - **Edit Tasks**: Modify any existing task with prefilled values.
  - **Delete Tasks**: Safe removal with a native Android confirmation prompt.
  - **Toggle Completion**: Tap any task's checkbox to mark it done with strikethrough styling.
- **🚦 Priority System**:
  - **High** (Soft Rose tag `#DC2626`)
  - **Medium** (Soft Amber tag `#D97706`)
  - **Low** (Soft Emerald tag `#059669`)
- **🔍 Filter Views**:
  - Instant filtering between **All**, **Pending**, and **Completed** tasks, each with live badge counters.
- **💾 Offline Persistence**:
  - Uses `@react-native-async-storage/async-storage` to preserve all tasks automatically across restarts.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (0.88.1)** | Mobile application framework |
| **Expo (SDK 58)** | Development platform and native tooling |
| **JavaScript (ES6+)** | Functional components and React Hooks (`useState`, `useEffect`, `useMemo`) |
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
└── GETTING_STARTED.md       # Beginner guide and customization walkthrough
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure your environment has:
- **Node.js** (LTS v24+) & **npm**
- **Android SDK** & **Android Emulator** (`Pixel_7_API_34`)

### 1. Launch the Android Emulator
In PowerShell:
```powershell
emulator -avd Pixel_7_API_34
```
*(If the command is not recognized in an old terminal, run `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")` or reopen PowerShell).*

### 2. Start TimeBuddy
Navigate to this project folder and run:
```powershell
cd C:\Users\HP\OneDrive\Desktop\app_2
npx expo start --android
```

Expo will automatically:
1. Connect to the running Pixel 7 emulator.
2. Launch the **Expo Go** environment.
3. Bundle and display **TimeBuddy** on your screen!

---

## ⌨️ Helpful Emulator Shortcuts

While the app is running in the emulator:
- Press **`r`** in the Metro terminal to reload the app.
- Press **`m`** in the Metro terminal to open the developer menu.
- Press **`a`** to reopen on Android if disconnected.

---

## 📄 Documentation Links

- [ARCHITECTURE.md](file:///c:/Users/HP/OneDrive/Desktop/app_2/ARCHITECTURE.md) – Detailed system architecture, component breakdown, and data flow.
- [GETTING_STARTED.md](file:///c:/Users/HP/OneDrive/Desktop/app_2/GETTING_STARTED.md) – Step-by-step code explanation and guide to customizing TimeBuddy.
- [App.js](file:///c:/Users/HP/OneDrive/Desktop/app_2/App.js) – Main application source code.

