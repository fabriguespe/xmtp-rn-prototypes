import React, {useState} from 'react';
import {SafeAreaView, Button} from 'react-native';
import {FloatingInbox as Floating1} from './src/components/FloatingInbox-text/index.js';
import {FloatingInbox as Floating2} from './src/components/FloatingInbox-consent/index.js';
import {XmtpProvider} from '@xmtp/react-native-sdk';

function App() {
  const [view, setView] = useState(null);

  return (
    <SafeAreaView style={{flex: 1}}>
      <XmtpProvider>
        {!view && (
          <>
            <Button
              title="Inbox Text"
              onPress={() => setView('inbox1' as any)}
            />
            <Button
              title="Inbox Consent"
              onPress={() => setView('inbox2' as any)}
            />
            <Button
              title="Inbox Consent"
              onPress={() => setView('inbox3' as any)}
            />
          </>
        )}
        {view === 'inbox1' && <Floating1 />}
        {view === 'inbox2' && <Floating2 />}
        {view === 'inbox3' && <FloatingInbox />}
      </XmtpProvider>
    </SafeAreaView>
  );
}

export default App;
