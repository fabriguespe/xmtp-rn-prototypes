import React from 'react';
import {SafeAreaView} from 'react-native';

import {FloatingInbox} from './src/components/FloatingInbox-text/index.js';
import {MessageContainer} from './src/components/FloatingInbox-text/MessageContainer';

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <FloatingInbox />
    </SafeAreaView>
  );
}

export default App;
