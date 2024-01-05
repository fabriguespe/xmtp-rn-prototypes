import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {View, Text, Button, ScrollView, Alert} from 'react-native';

export const MessageContainer = ({
  conversation,
  client,
  searchTerm,
  selectConversation,
}) => {
  const isFirstLoad = useRef(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(
    conversation.consentState === 'unknown',
  );

  const updateMessages = (prevMessages, newMessage) => {
    const doesMessageExist = prevMessages.some(
      existingMessage => existingMessage.id === newMessage.id,
    );

    if (!doesMessageExist) {
      return [...prevMessages, newMessage];
    }

    return prevMessages;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (conversation && conversation.peerAddress && isFirstLoad.current) {
        setIsLoading(true);
        const initialMessages = await conversation?.messages();

        let updatedMessages = [];
        initialMessages.forEach(message => {
          updatedMessages = updateMessages(updatedMessages, message);
        });

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    };

    fetchMessages();
  }, [conversation]);

  // Function to handle the acceptance of a contact
  const handleAccept = async () => {
    // Allow the contact
    await client.contacts.allow([conversation.peerAddress]);
    // Hide the popup
    setShowPopup(false);
    // Refresh the consent list
    await client.contacts.refreshConsentList();
    // Log the acceptance
    console.log('accepted', conversation.peerAddress);
  };

  // Function to handle the blocking of a contact
  const handleBlock = async () => {
    // Block the contact
    await client.contacts.deny([conversation.peerAddress]);
    // Hide the popup
    setShowPopup(false);
    // Refresh the consent list
    await client.contacts.refreshConsentList();
    // Log the blocking
    console.log('denied', conversation.peerAddress);
  };
  const startMessageStream = async () => {
    let stream = await conversation.streamMessages();
    for await (const message of stream) {
      setMessages(prevMessages => {
        return updateMessages(prevMessages, message);
      });
    }
  };

  useEffect(() => {
    if (conversation && conversation.peerAddress) {
      startMessageStream();
    }
  }, [conversation]);

  const handleSendMessage = async newMessage => {
    if (!newMessage.trim()) {
      Alert.alert('Empty message');
      return;
    }
    if (conversation && conversation.peerAddress) {
      await conversation.send(newMessage);
    } else if (conversation) {
      const conv = await client.conversations.newConversation(searchTerm);
      selectConversation(conv);
      await conv.send(newMessage);
    }
  };

  return (
    <View style={{flex: 1}}>
      {isLoading ? (
        <Text>Loading messages...</Text>
      ) : (
        <>
          <ScrollView>
            {messages.slice().map(message => {
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
          </ScrollView>
          {showPopup ? (
            <View>
              <Text>Do you trust this contact?</Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button title="Accept" onPress={handleAccept} color="blue" />
                <Button title="Block" onPress={handleBlock} color="red" />
              </View>
            </View>
          ) : null}
          <MessageInput
            onSendMessage={msg => {
              handleSendMessage(msg);
            }}
          />
        </>
      )}
    </View>
  );
};
