# Story Generation Android App

An Android application for generating and managing interactive stories with AI-generated images, optimized for the Onn Surf 7 tablet.

## Development Environment
- Android Studio Hedgehog (2023.1.1)
- Kotlin 1.9.21
- Gradle 8.1.4
- JDK 17
- NDK (for TensorFlow Lite)

## Target Device Specifications (Onn Surf 7)
- Screen: 7-inch 1024x600
- RAM: 2GB
- Storage: 32GB
- Android Version: 11
- CPU: Quad-core

## Architecture

### Data Layer
- Local Storage
  - Room Database (stories, images, settings)
  - File Storage (ML models, image cache, temp files)
  - DataStore (preferences, app state, API keys)
- Remote Storage
  - OpenAI client
  - Mistral client
  - Image generation service

### Domain Layer
- Story Generation
  - Online/Offline generation
  - Story management
- Image Management
  - Generation and caching
  - Gallery management
- Text-to-Speech
- Settings Management

### Presentation Layer
- Jetpack Compose UI
- ViewModels
- UI States

## Key Features
- Story Generation System
  - Online (OpenAI) and Offline (Mistral) modes
  - Content filtering and age-appropriate content
- Image Generation System
  - API integration
  - Efficient caching
- Text-to-Speech
- Parent Controls

## Performance Optimization
- Memory Management
- Storage Optimization
- Battery Optimization

## Security
- Secure API key storage
- Local data protection
- Network security

## Building the Project
```bash
# Clone the repository
git clone [repository-url]

# Open in Android Studio
1. Open Android Studio
2. File -> Open -> Select project directory
3. Wait for Gradle sync to complete

# Build the project
./gradlew build

# Run tests
./gradlew test
```

## Testing
- Unit Tests: JUnit, Mockk, Turbine, Truth
- Integration Tests: Espresso, Compose Testing
- Performance Testing: Firebase Performance

## Project Structure
```
app/
├── src/
│   ├── main/
│   │   ├── java/com/example/androidapp/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   ├── presentation/
│   │   │   └── di/
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   ├── test/
│   └── androidTest/
├── build.gradle
└── proguard-rules.pro
```

## Requirements
- Android Studio Hedgehog or newer
- JDK 17
- Android SDK 34
- Minimum Android version: 11 (API 30)
- Device/emulator with Google Play Services

## License
[License details]
