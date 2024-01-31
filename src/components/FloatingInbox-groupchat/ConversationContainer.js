import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {MessageContainer} from './MessageContainer';
import {ListConversations} from './ListConversations';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';

const styles = StyleSheet.create({
  conversations: {
    height: '100%',
  }, // Your existing styles
  addressListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addressText: {
    marginLeft: 10,
  },
  conversationList: {
    padding: 0,
    margin: 0,
    listStyle: 'none',
    overflowY: 'scroll',
  },
  conversationListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0,
    border: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginTop: 0,
    transition: 'background-color 0.3s ease',
  },
  conversationDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '75%',
    marginLeft: 10,
    overflow: 'hidden',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagePreview: {
    fontSize: 8,
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  conversationTimestamp: {
    fontSize: 8,
    color: '#999',
    width: '25%',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  createNewButton: {
    border: 1,
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    fontSize: 8,
    height: 10,
    minWidth: 10, // Adjust the width as needed
    minHeight: 10, // Adjust the height as needed
  },
  peerAddressInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
  },
});

export const ConversationContainer = ({
  selectedConversation,
  setSelectedConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {client} = useXmtp();
  const [peerAddress, setPeerAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [conversationFound, setConversationFound] = useState(false);
  const [createNew, setCreateNew] = useState(false);

  const openConversation = async conversation => {
    setSelectedConversation(conversation);
  };

  const isValidEthereumAddress = address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearchChange = async e => {
    setCreateNew(false);
    setConversationFound(false);
    setSearchTerm(e);
    console.log('handleSearchChange', e);
    setMessage('Searching...');
    const addressInput = e;
    const isEthDomain = /\.eth$/.test(addressInput);
    let resolvedAddress = addressInput;
    if (isEthDomain) {
      setLoadingResolve(true);
      try {
        const provider = new ethers.providers.CloudflareProvider();
        resolvedAddress = await provider.resolveName(resolvedAddress);
      } catch (error) {
        console.log(error);
        setMessage('Error resolving address');
        setCreateNew(false);
      } finally {
        setLoadingResolve(false);
      }
    }
    if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
      processEthereumAddress(resolvedAddress);
      setSearchTerm(resolvedAddress);
    } else {
      setMessage('Invalid Ethereum address');
      setPeerAddress(null);
      setCreateNew(false);
      //setCanMessage(false);
    }
    setFoundAddresses(prev => prev.filter(item => item.isSelected));
  };

  const processEthereumAddress = async address => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage('No self messaging allowed');
      setCreateNew(false);
      setCanMessage(false);
    } else {
      const canMessageStatus = await client?.canMessage(address);
      if (canMessageStatus) {
        setPeerAddress(address);
        setCanMessage(true);
        setMessage(null);
        setCreateNew(true);
        addFoundAddress(address);
      } else {
        setCanMessage(false);
        setMessage('Address is not on the network ❌');
        setCreateNew(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={{textAlign: 'center', fontSize: 'small'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const [groupChatAddresses, setGroupChatAddresses] = useState(new Set());
  const [foundAddresses, setFoundAddresses] = useState([]);

  const createGroupChat = () => {
    const selectedAddresses = foundAddresses
      .filter(item => item.isSelected)
      .map(item => item.address);

    if (selectedAddresses.length > 0) {
      setSelectedConversation({
        groupChatAddresses: new Set(selectedAddresses),
        isGroupChat: true,
      });
      clearSearch();
    } else {
      // Handle the case where no addresses are selected (optional)
      console.log('No addresses selected for the group chat.');
    }
  };
  const clearSearch = () => {
    setFoundAddresses([]);
    setSearchTerm('');
  };
  // Function to handle adding a new found address
  const addFoundAddress = address => {
    console.log('addFoundAddress', address);
    setFoundAddresses(prev => {
      // Check if the address is already in the list to avoid duplicates
      const isAddressAlreadyAdded = prev.some(item => item.address === address);
      if (!isAddressAlreadyAdded) {
        return [...prev, {address, isSelected: false}];
      }
      return prev;
    });
  };

  // Function to toggle the selection state of an address
  const toggleAddressSelection = index => {
    setFoundAddresses(prev =>
      prev.map((item, idx) =>
        idx === index ? {...item, isSelected: !item.isSelected} : item,
      ),
    );
  };

  const toggleAddressButton = (isSelected, toggleFunction) => (
    <Button
      title={isSelected ? '✅' : '﹢'}
      onPress={toggleFunction}
      color={isSelected ? 'green' : 'blue'}
    />
  );

  const createConversation = () => {
    const selectedAddress = foundAddresses.find(item => item.isSelected);
    if (selectedAddress) {
      setSelectedConversation(selectedAddress.address);
      clearSearch();
    }
  };

  useEffect(() => {
    console.log(
      'Selected conversation changed:',
      foundAddresses.length,
      selectedConversation,
    );
    // Additional logic to handle the change can be added here
  }, [selectedConversation, foundAddresses]); // Dependency array includes conversation, so this runs every time conversation changes

  return (
    <>
      {!selectedConversation && (
        <View style={styles.conversationList}>
          <TextInput
            type="text"
            placeholder="Enter a 0x wallet or ENS address"
            value={searchTerm}
            editable
            onChangeText={text => handleSearchChange(text)}
            style={styles.peerAddressInput}
          />
          {loadingResolve && searchTerm && <Text>Resolving address...</Text>}
          {foundAddresses.map((item, index) => (
            <View key={index} style={styles.addressListItem}>
              {toggleAddressButton(item.isSelected, () =>
                toggleAddressSelection(index),
              )}
              <Text style={styles.addressText}>
                {item.address.substring(0, 6) +
                  '...' +
                  item.address.substring(item.address.length - 4)}
              </Text>
            </View>
          ))}
          {searchTerm.length > 0 && message && conversationFound !== true && (
            <Text style={{textAlign: 'center'}}>{message}</Text>
          )}
          <ListConversations
            searchTerm={searchTerm}
            selectConversation={openConversation}
            onConversationFound={state => {
              setConversationFound(state);
              if (state === true) setCreateNew(false);
            }}
          />
          {foundAddresses.filter(item => item.isSelected).length === 1 && (
            <Button
              title="Create new conversation"
              style={styles.createNewButton}
              onPress={createConversation}
            />
          )}
          {foundAddresses.filter(item => item.isSelected).length > 1 && (
            <Button
              title="Create group chat 👨‍👩‍👧‍👧"
              style={styles.createNewButton}
              onPress={createGroupChat}
            />
          )}
        </View>
      )}

      {selectedConversation && (
        <MessageContainer
          conversation={selectedConversation}
          selectConversation={openConversation}
          groupChatAddresses={groupChatAddresses}
        />
      )}
    </>
  );
};
