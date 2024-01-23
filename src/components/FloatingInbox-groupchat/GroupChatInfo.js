import React, {useState, useEffect} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {View, Text, Button, TouchableOpacity} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberText: {
    textAlign: 'center',
  },
  removeIcon: {
    marginLeft: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});

export const GroupChatInfo = ({selectedConversation}) => {
  const {client, setClient} = useXmtp();
  const handleRemoveMember = participant => {
    Alert.alert(
      'Confirmation',
      `Are you sure you want to remove ${participant} from the group chat?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => removeMember(participant)},
      ],
    );
  };
  const [members, setMembers] = useState(
    Array.from(selectedConversation.listMembers()).filter(
      member => member !== client.address,
    ),
  );

  useEffect(() => {
    setMembers(
      Array.from(selectedConversation.listMembers()).filter(
        member => member !== client.address,
      ),
    );
  }, [selectedConversation]);

  const leaveGroupChat = () => {
    selectedConversation.removeMember(client.address);
    setMembers(Array.from(selectedConversation.listMembers()));
  };

  const removeMember = participant => {
    selectedConversation.removeMember(participant);
    setMembers(Array.from(selectedConversation.listMembers()));
  };

  return (
    <View>
      <Text style={styles.title}>Group Chat Info</Text>

      <Text style={{textAlign: 'center'}}>Members:</Text>
      {Array.from(selectedConversation.listMembers()).map(participant => (
        <View key={participant} style={styles.memberContainer}>
          <Text style={styles.memberText}>{participant}</Text>
          <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => handleRemoveMember(participant)}>
            <Text style={styles.removeIcon}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Button title="Leave" onPress={leaveGroupChat} />
    </View>
  );
};
