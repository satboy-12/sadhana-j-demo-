# HER HEALTH JOURNEY – Native Android Application

## 1. Project Overview
- **Language**: Java 17 / 21
- **Platform**: Native Android SDK (Min SDK: 26, Target SDK: 34)
- **UI Architecture**: XML Layouts, Material Design 3, Fragment-based Bottom Navigation
- **Networking**: Retrofit 2 + OkHttp 3 + Gson
- **Security**: Android Keystore via `EncryptedSharedPreferences`
- **Offline Storage**: Room Database for draft caching and offline sync

---

## 2. Opening in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, Koala, or Ladybug).
2. Click **Open** and navigate to `HER_HEALTH_JOURNEY/android`.
3. Allow Gradle to sync dependencies.

---

## 3. Configuring API Base URL

In `android/app/src/main/java/com/herhealthjourney/android/api/ApiClient.java`:
- **For Android Emulator**: `http://10.0.2.2:8080/`
- **For Physical Device (Local Wi-Fi)**: `http://<your-computer-ip>:8080/`
- **For Production (Render)**: `https://her-health-journey.onrender.com/`

---

## 4. Building Debug & Release APKs

### Debug APK (Internal Testing)
Run via terminal inside the `android/` directory:
```bash
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Signed Release APK (Client Delivery)
1. In Android Studio, go to **Build** → **Generate Signed Bundle / APK...**
2. Choose **APK** → **Next**.
3. Select or create your release Keystore file.
4. Select build variant **release** and signature versions **V1 & V2**.
5. Click **Create**.
The output APK is generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 5. Installing on a Physical Device
1. Enable **Developer Options** and **USB Debugging** on the Android device.
2. Connect device via USB.
3. Install directly using adb:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

