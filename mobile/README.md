# วิธีการติดตั้งละรันแอพ MobileApp

### สื่งที่ต้องมีก่อนติดตั้ง
1. node.js version 20 (ลง [nvm](https://github.com/coreybutler/nvm-windows/releases) ด้วย ใน Assets ของ version ล่าสุดเลือก nvm-setup.exe )
2. android studio

### ติดตั้งโปรเจค
```sh
npm install
```

### เปิด emulator ใน android studio เตรียมไว้
ต้องเล่นผ่าน emulator หรือเครื่องจริงเท่านั้น

### เช็คความพร้อมในการรันโปรเจค
```sh
npx react-native doctor
```
ถ้ามีไม่ครบอาจจะไม่สามารถรันโปรเจคได้ สามารถถาม ChatGpt เพื่อติดตั้งได้
ตัวอย่างที่สามารถรันได้
- ✓ Adb - Required to verify if the android device is attached correctly
- ✓ JDK - Required to compile Java code
- ✓ Android Studio - Required for building and installing your app on Android
- ✓ ANDROID_HOME - Environment variable that points to your Android SDK installation
- ✓ Gradlew - Build tool required for Android builds
- ✖ Android SDK - Required for building and installing your app on Android
    - Versions found: N/A
    - Version supported: 35.0.0

### รันโปรเจค
```sh
npm run android
```

- จะมี terminal เด้งขึ้นมาใช้สำหรับดูสถานะของแอพและรับคำสั่งจาก dev โดยคำสั่งพื้นฐาน
    - กดปุ่ม r จะรีแอพ เอาไว้ให้รีแอพตอนที่มี ui เปลี่ยน หรือแอพค้าง
    - กดปุ่ม j เปิด dev tool เหมือนของเว็บใช้อ่าน log และดู style

### ถ้าแอพ crash หรือแดง
ปิด terminal และปัดแอพทิ้ง พิมพ์คำสั่งรันใหม่ได้เลย

### Google Authentication
ตอนนี้โปรเจคยังไม่ได้ติดตั้ง google-services.json ซึ่งเป็น file ที่ได้จาก firebase ดังนั้นจึงยังไม่สามารถ signin ได้ เอา google-services.json มาใส่ด้วย
- อ้างอิงจาก lib ที่ใช้ [@react-native-google-signin](https://react-native-google-signin.github.io/docs/setting-up/android)