import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {FloatingInbox} from './src/components/FloatingInbox-text/index.js';
import {Client} from '@xmtp/react-native-sdk';

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <FloatingInbox env="production" />
    </SafeAreaView>
  );
}

export default App;
