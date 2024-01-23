import React, {useState, useEffect} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {View, Text, TextInput, Button, TouchableOpacity} from 'react-native';
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10, // Add padding here
    margin: 20,
  },
  removeIcon: {
    marginLeft: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});

export const GroupChatInfo = ({selectedConversation}) => {
  // Add a new state for the participant to be added
  const [newParticipant, setNewParticipant] = useState('');
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
        {
          text: 'OK',
          onPress: () => {
            selectedConversation.removeMember(participant);
            setMembers(Array.from(selectedConversation.listMembers()));
          },
        },
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
    Alert.alert(
      'Confirmation',
      'Are you sure you want to leave the group chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            selectedConversation.removeMember(client.address);
            setMembers(Array.from(selectedConversation.listMembers()));
          },
        },
      ],
    );
  };

  const addParticipant = () => {
    Alert.alert(
      'Confirmation',
      `Are you sure you want to add ${newParticipant} to the group chat?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            selectedConversation.addMember(newParticipant);
            setMembers(Array.from(selectedConversation.listMembers()));
            setNewParticipant(''); // Clear the input
          },
        },
      ],
    );
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
      <TextInput
        style={styles.input}
        onChangeText={setNewParticipant}
        value={newParticipant}
        placeholder="Add a participant"
      />
      <Button title="Add Participant" onPress={addParticipant} />

      <Button title="Leave" onPress={leaveGroupChat} />
    </View>
  );
};
