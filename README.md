# 531 Strength

This app allows you to track strength training workouts (following the 5/3/1 paradigm). To get started with the app, follow the steps below to set up your development environment and run the app on a physical device or emulator.

---

<div align="center">
  <img src="assets/home-screenshot.png" width="25%" alt="Screenshot of the homepage">
</div>

---

## Prerequisites

Before running the app, ensure you have the following tools installed:

- **Node.js** (version 14 or higher)
- **Expo CLI** (Local version recommended)
- **Android Studio** (for running an Android emulator)
- **Expo Go** app (for testing on your physical device)

---

## Step 1: Install Node.js

First, ensure that **Node.js** is installed on your machine. If you don’t have it yet, download and install it from the official website:

- [Download Node.js](https://nodejs.org/)

## Step 2: Set Up Expo CLI

Expo is a framework for building React Native apps, and it's used to easily run and test your app on both physical devices and emulators.

## Step 3: Set Up Android Studio (For Emulators)

### 3.1 Install Android Studio

If you don’t already have **Android Studio** installed, download and install it from the official website:

- [Download Android Studio](https://developer.android.com/studio)

Make sure to install the following components during the setup:

- **Android SDK**
- **Android Emulator**
- **Platform-tools**

### 3.2 Configure Environment Variables

1. **Set the `ANDROID_HOME` environment variable** to point to your Android SDK location. The default location is usually:

```
C:\Users\<YourUsername>\AppData\Local\Android\Sdk
```

2. **Update `PATH` to include SDK tools** (on Windows):

- Open **Environment Variables** settings.
- Add the following paths to the **Path** system variable:

  ```
  C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools
  C:\Users\<YourUsername>\AppData\Local\Android\Sdk\tools
  C:\Users\<YourUsername>\AppData\Local\Android\Sdk\tools\bin
  ```

---

## Step 4: Enable Developer Options on Your Android Device

If you want to run the app on a **physical Android device**, follow these steps to enable **USB debugging**:

1. **Enable Developer Options**:

- Go to **Settings > About phone**.
- Tap **Build number** 7 times to unlock Developer options.

2. **Enable USB Debugging**:

- Go to **Settings > Developer options**.
- Enable **USB debugging**.

3. **Connect the device via USB** and authorize it when prompted on the phone.

---

## Step 5: Start an Android Emulator (If Using Emulator)

1. Open **Android Studio**.
2. Go to **Tools > AVD Manager** (Android Virtual Device Manager).
3. Select or create a new virtual device (e.g., Pixel 4).
4. Start the emulator by clicking the **play button**.

---

## Step 6: Run the App on a Device or Emulator

### 6.1 Start Expo Development Server

In your project directory, run the following command:

```bash
npx expo start
```

This will open a new tab in your browser with the Expo Dev Tools, providing options to open the app on different platforms. It will also print a QR code in your terminal.

### 6.2 Run on a Physical Device (with Expo Go)

- Ensure you have the **Expo Go app** installed on your Android or iOS physical device.
- With the development server (`npx expo start`) running:
  - **Android:** Scan the QR code displayed in your terminal or on the Expo Dev Tools page using your phone's camera.
  - **iOS:** Use the built-in QR code scanner in the Camera app, or scan it from within the Expo Go app.
- The app will automatically load in Expo Go.

### 6.3 Run on an Android Emulator

- Ensure an Android emulator is running (see Step 5).
- With the development server (`npx expo start`) running, press `a` in your terminal. The app will build and open on the running emulator.

### 6.4 Run on the Web

- With the development server (`npx expo start`) running, press `w` in your terminal.
- Alternatively, you can run the following command directly:

  ```bash
  npx expo start --web
  ```

- This will open your app in your default web browser (e.g., Chrome, Firefox).
