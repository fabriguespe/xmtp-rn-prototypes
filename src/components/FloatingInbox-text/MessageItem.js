import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export const MessageItem = ({message, senderAddress, client}) => {
  const renderMessage = () => {
    try {
      if (message?.content().length > 0) {
        return <Text style={styles.renderedMessage}>{message?.content()}</Text>;
      }
    } catch {
      return message?.fallback ? (
        message?.fallback
      ) : (
        <Text style={styles.renderedMessage}>{message?.content()}</Text>
      );
    }
  };

  const isSender = senderAddress === client?.address;

  return (
    <View
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}>
      <View style={styles.messageContent}>
        {renderMessage()}
        <View style={styles.footer}>
          <Text style={styles.timeStamp}>
            {`${new Date(message.sent).getHours()}:${String(
              new Date(message.sent).getMinutes(),
            ).padStart(2, '0')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContent: {
    backgroundColor: 'lightblue',
    padding: 10,
    alignSelf: 'flex-start',
    textAlign: 'left',
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  renderedMessage: {
    fontSize: 12,
    padding: 0,
  },
  senderMessage: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    width: '100%',
  },
  receiverMessage: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeStamp: {
    fontSize: 8,
    color: 'grey',
  },
});
