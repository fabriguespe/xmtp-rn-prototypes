import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

export const MessageInput = ({onSendMessage}) => {
  const [newMessage, setNewMessage] = useState('');
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    newMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    messageInputField: {
      flexGrow: 1,
      padding: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      fontSize: 18,
    },
    sendButton: {
      padding: 5,
      marginLeft: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 14,
    },
  });
  const handleInputChange = text => {
    setNewMessage(text);
  };

  const handleSend = () => {
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.newMessageContainer}>
        <TextInput
          style={styles.messageInputField}
          value={newMessage}
          onChangeText={handleInputChange}
          placeholder="Type your message..."
        />
        <Button style={styles.sendButton} onPress={handleSend} title="Send" />
      </View>
    </View>
  );
};
