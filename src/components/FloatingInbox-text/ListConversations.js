import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export const ListConversations = ({searchTerm, client, selectConversation}) => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  const styles = StyleSheet.create({
    conversationListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      backgroundColor: '#f0f0f0',
      padding: 10,
    },
    conversationDetails: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '75%',
      marginLeft: 10,
    },
    conversationName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    messagePreview: {
      fontSize: 14,
      color: '#666',
    },
    conversationTimestamp: {
      fontSize: 12,
      color: '#999',
      width: '25%',
      textAlign: 'right',
    },
  });

  useEffect(() => {
    let isMounted = true;
    let stream;
    const fetchAndStreamConversations = async () => {
      setLoading(true);
      const allConversations = await client.conversations.list();

      const sortedConversations = allConversations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      if (isMounted) {
        setConversations(sortedConversations);
      }
      setLoading(false);
      stream = await client.conversations.stream();
      for await (const conversation of stream) {
        console.log(
          `New conversation started with ${conversation.peerAddress}`,
        );
        if (isMounted) {
          setConversations(prevConversations => {
            const newConversations = [...prevConversations, conversation];
            return newConversations.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          });
        }
        break;
      }
    };

    fetchAndStreamConversations();

    return () => {
      isMounted = false;
      if (stream) {
        stream.return();
      }
    };
  }, []);

  const filteredConversations = conversations.filter(
    conversation =>
      conversation?.peerAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      conversation?.peerAddress !== client.address,
  );
  return (
    <View>
      {filteredConversations.map((conversation, index) => (
        <TouchableOpacity
          key={index}
          style={styles.conversationListItem}
          onPress={() => {
            selectConversation(conversation);
          }}>
          <View style={styles.conversationDetails}>
            <Text style={styles.conversationName}>
              {conversation.peerAddress.substring(0, 6) +
                '...' +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 4,
                )}
            </Text>
            <Text style={styles.messagePreview}>jeje</Text>
          </View>
          <Text style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getRelativeTimeLabel = dateString => {
  const diff = new Date() - new Date(dateString);
  const diffMinutes = Math.floor(diff / 1000 / 60);
  const diffHours = Math.floor(diff / 1000 / 60 / 60);
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
};
