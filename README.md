# RN Example for IOS

### Prerequisites

- Node.js
- npm or Yarn
- React Native CLI
- Xcode (for iOS)

### Installation Steps

#### 1. Initialize React Native Project

If you haven't already created a React Native project, start by initializing one:

```bash
npx react-native init xmtprn
```

#### 2. Install Expo Modules

Install the latest Expo modules:

```bash
npx install-expo-modules@latest
```

#### 3. Install XMTP React Native SDK

Install the XMTP React Native SDK using npm:

```bash
npm install @xmtp/react-native-sdk
```

#### 4. Update Podfile for iOS

Update the Podfile to set the minimum iOS platform. Open the `Podfile` in your iOS directory and modify the platform line:

```ruby
platform :ios, '16.0'
```

#### 5. Update Xcode Target

Ensure your Xcode project's target is updated to iOS 16.0 or higher.

#### 6. Add Babel Plugin

Install the Babel plugin required for the XMTP SDK:

```bash
npm add @babel/plugin-proposal-export-namespace-from
```

#### 7. Configure Babel

Update your Babel configuration. Open your `babel.config.js` and add the plugin:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    // ... other plugins
  ],
};
```

#### 8. Install iOS Pods

Navigate to the iOS directory and install the necessary pods:

```bash
cd ios && pod install && cd ..
```

#### 9. Start the Application

Finally, start your React Native application:

```bash
npm run ios
```

# XMTP React Native Integration Guide - Final Update

Great to hear that you've resolved the issue with a different solution. Let's update the troubleshooting section of this README to include the solution that worked for you.

## Troubleshooting

### Resolving the 'atob' Reference Error

If you encounter the error `ReferenceError: Property 'atob' doesn't exist, js engine: hermes`, it's typically due to the absence of the `atob` function in the Hermes JavaScript engine used by React Native. This issue can be resolved by polyfilling the `atob` and `btoa` functions using the `@react-native-anywhere/polyfill-base64` package.

#### Using `@react-native-anywhere/polyfill-base64`

1. **Install the Package:**

   To add the necessary polyfill, install `@react-native-anywhere/polyfill-base64`:

   ```bash
   npm install @react-native-anywhere/polyfill-base64
   ```

2. **Import the Polyfill:**

   In the entry point of your application, such as `index.js`, import the polyfill:

   ```javascript
   import '@react-native-anywhere/polyfill-base64';

   // Now you can use btoa and atob in your application
   ```
