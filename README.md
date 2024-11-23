# TouchGrass

## Overview
**TouchGrass** is a mobile application built with React Native and Expo that encourages users to be active by tracking their steps, logging walking/running sessions, setting fitness goals, and earning achievements. The app features a modern and interactive UI with support for tracking and displaying user progress.

## Features
- **Step Tracking**: Counts user steps during a session.
- **Session Logging**: Saves details of each session including step count, duration, and completion timestamp.
- **Goal Setting**: Allows users to set step goals and track their progress over time.
- **Achievements**: Motivates users with achievements that unlock as goals and tasks are completed.
- **Interactive UI**: Engaging and visually appealing interface.

## Prerequisites
Before you get started, make sure you have the following installed:
- **Node.js** (version 14.x or newer)
- **npm** or **yarn** (comes with Node.js)
- **Expo CLI**: Install Expo CLI globally by running:
  npm install -g expo-cli

## Installation

1. **Clone the Repository**:
   git clone https://github.com/your-username/TouchGrass.git
   cd TouchGrass

2. **Install Dependencies**:
   npm install
   # or
   yarn install

3. **Run the Development Server**:
   expo start

## Running the App

1. **With an Emulator**:
   - **Android**: Run the app using Android Studio's emulator by pressing “a” in the terminal to automatically launch android emulator (assuming it’s installed)
   - **iOS**: Run the app using the iOS simulator (macOS only).
   
   expo run:android
   # or
   expo run:ios

2. **With a Physical Device**:
   - Download the **Expo Go** app from the App Store or Google Play Store.
   - Scan the QR code displayed in your terminal or browser after running `expo start`.

## Project Structure
.
├── assets                # App assets (images, icons, etc.)
├── components            # Reusable components for the app
├── screens               # Main screens like Run, Log, Achievements
├── navigation            # Navigation configuration
├── App.js                # Main entry point
└── app.json              # Expo configuration file

## Configuration
Ensure your `app.json` file is set up with the necessary permissions and plugins for a smooth experience:
{
  "expo": {
    "name": "TouchGrass",
    "slug": "TouchGrass",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACTIVITY_RECOGNITION",
        "VIBRATE"
      ]
    }
  }
}

## Key Features Explanation

### Step Tracking
The app uses the `expo-sensors` package to track steps during a session. Ensure your device allows step tracking and has the necessary permissions.

### Logging and Achievements
**AsyncStorage** is used to save and retrieve session logs and completed achievements. This ensures data persistence between app uses.

## Dependencies
- **expo**: For building and running the app.
- **react-native**: Core framework for developing native apps.
- **expo-sensors**: For step counting and pedometer functionality.
- **@react-native-async-storage/async-storage**: For storing session and achievement data.
- **expo-notifications**: For handling notifications (optional, if using notification features).

## Potential Issues

### Common Errors
- **Plugin Errors**: Ensure all dependencies are compatible with your Expo SDK version.
- **Step Tracking on Emulator**: Some step-tracking features may not function on emulators. Use a physical device for full functionality.
- **Step Tracking on Android**: The Expo pedometer module is not currently supported on Android devices, so step tracking is not functional on Android. However, every other part of the app is still functional and each screen can be viewed.

## License
This project is licensed under the [MIT License](LICENSE).

## Contributions
Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/your-username/TouchGrass/issues).



