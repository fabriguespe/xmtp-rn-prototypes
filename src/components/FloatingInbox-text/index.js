import React, {useState, useEffect} from 'react';
import {Client} from '@xmtp/react-native-sdk';
import {ethers} from 'ethers';
import {ConversationContainer} from './ConversationContainer';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const styles = StyleSheet.create({
  uContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  logoutBtnContainer: {
    padding: 10, // adjust as needed
  },
  logoutBtn: {
    position: 'absolute',
    top: 10,
    right: 5,
    textDecoration: 'none',
    color: '#000',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 10,
  },
  widgetHeader: {
    padding: 2,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'none',
    borderWidth: 0,
    width: 'auto',
    margin: 0,
  },
  conversationHeaderH4: {
    margin: 0,
    padding: 4,
    fontSize: 14, // Increased font size
  },
  backButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 14, // Increased font size
  },
  widgetContent: {
    flexGrow: 1,
  },
  xmtpContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  btnXmtp: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#000',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
  },
});

export function FloatingInbox({wallet, env, onLogout}) {
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [client, setClient] = useState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const initialIsOnNetwork =
        (await AsyncStorage.getItem('isOnNetwork')) === 'true' || false;
      const initialIsConnected =
        ((await AsyncStorage.getItem('isConnected')) && wallet === 'true') ||
        false;

      setIsOnNetwork(initialIsOnNetwork);
      setIsConnected(initialIsConnected);
    })();
  }, []);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState();

  useEffect(() => {
    if (wallet) {
      setSigner(wallet);
      setIsConnected(true);
    }
    if (client && !isOnNetwork) {
      setIsOnNetwork(true);
    }
    if (signer && isOnNetwork && isConnected) {
      initXMTP();
    }
  }, [wallet, isOnNetwork, isConnected]);

  useEffect(() => {
    AsyncStorage.setItem('isOnNetwork', isOnNetwork.toString());
    AsyncStorage.setItem('isConnected', isConnected.toString());
  }, [isConnected, isOnNetwork]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        console.log('Your address', await getAddress(signer));
        setIsConnected(true);
      } catch (error) {
        console.error('User rejected request', error);
      }
    } else {
      console.error('Metamask not found');
    }
  };

  const getAddress = async signer => {
    try {
      if (signer && typeof signer.getAddress === 'function') {
        return await signer.getAddress();
      } else if (signer && typeof signer.getAddresses === 'function') {
        //viem
        const [address] = await signer.getAddresses();
        return address;
      } else if (signer.address) {
        return signer.address;
      } else return null;
    } catch (e) {
      console.log(e);
    }
  };

  const createNewWallet = async () => {
    try {
      const client = await Client.createRandom('dev');
      const rnSDKAddress = await client.address;
      console.log('rnSDKAddress', rnSDKAddress);
      setIsConnected(true);
      setSigner(client);
      setClient(client);
      setIsOnNetwork(true);
    } catch (error) {
      console.error('Error creating new wallet', error);
    }
  };

  const handleLogout = async () => {
    setIsConnected(false);
    setSigner(null);
    setIsOnNetwork(false);
    setClient(null);
    setSelectedConversation(null);
    const address = await getAddress(signer);
    console.log('wipe', address);
    AsyncStorage.removeItem('isOnNetwork');
    AsyncStorage.removeItem('isConnected');
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const startFromPrivateKey = async () => {
    try {
      const privateKey =
        '67633be8c32db5414951db4a9ea9734b1214f8f5ca15d6b16818c0b4ee864653';

      const infuraProvider = new ethers.InfuraProvider(
        'mainnet',
        'b1528436726c44f0a6c739baf91e04fb',
      );
      const signer = new ethers.Wallet(privateKey, infuraProvider);
      setSigner(signer);
      setIsConnected(true);
    } catch (error) {
      console.error('Error creating new wallet', error);
    }
  };
  const initXmtpWithKeys = async function () {
    try {
      if (!signer) {
        handleLogout();
        return;
      }
      let address = await getAddress(signer);
      let keys = await loadKeys(address);
      const clientOptions = {
        env: env ? env : getEnv(),
      };
      console.log(keys, address);
      if (!keys) {
        console.log(signer);
        const xmtp = await Client.create(signer);
        keys = await Client.exportKeyBundle();
        console.log(keys);
        storeKeys(address, keys);
        setClient(xmtp);
        setIsOnNetwork(!!xmtp.address);
      } else {
        const xmtp = await Client.createFromKeyBundle(keys, clientOptions.env);
        setClient(xmtp);
        setIsOnNetwork(!!xmtp.address);
      }
    } catch (error) {
      console.error('Error initializing XMTP with keys', error);
    }
  };

  const initXMTP = async function () {
    try {
      if (!signer) {
        handleLogout();
        return;
      }
      const clientOptions = {
        env: env ? env : getEnv(),
      };
      console.log(signer);
      const xmtp = await Client.create(signer, clientOptions.env);
      console.log('pasa');
      setClient(xmtp);
      setIsOnNetwork(!!xmtp.address);
    } catch (error) {
      console.error('Error initializing XMTP with keys', error);
    }
  };
  return (
    <View style={{flex: 1}}>
      <View style={styles.uContainer}>
        {isConnected && (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtnContainer}>
            <Text style={styles.logoutBtn}>Logout</Text>
          </TouchableOpacity>
        )}
        {isConnected && isOnNetwork && (
          <View style={styles.widgetHeader}>
            <View style={styles.conversationHeader}>
              {isOnNetwork && selectedConversation && (
                <Button
                  title="←"
                  onPress={() => {
                    setSelectedConversation(null);
                  }}
                  style={styles.backButton}
                />
              )}
              <Text style={styles.conversationHeaderH4}>Conversations</Text>
            </View>
          </View>
        )}
        <View style={styles.widgetContent}>
          {!isConnected && (
            <View style={styles.xmtpContainer}>
              <Button
                title="Connect Wallet"
                onPress={connectWallet}
                style={styles.btnXmtp}
              />
              <Text style={styles.label} onPress={createNewWallet}>
                or create new one
              </Text>
              <Text style={styles.label} onPress={startFromPrivateKey}>
                or start from key
              </Text>
            </View>
          )}
          {isConnected && !isOnNetwork && (
            <View style={styles.xmtpContainer}>
              <Button
                title="Connect to XMTP"
                onPress={initXMTP}
                style={styles.btnXmtp}
              />
            </View>
          )}
          {isConnected && isOnNetwork && client && (
            <ConversationContainer
              client={client}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const ENCODING = 'binary';

export const getEnv = () => {
  // "dev" | "production" | "local"
  return typeof process !== 'undefined' && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV
    : 'production';
};
export const buildLocalStorageKey = walletAddress => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : '';
};

export const loadKeys = async walletAddress => {
  const val = await AsyncStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = async (walletAddress, keys) => {
  await AsyncStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = async walletAddress => {
  await AsyncStorage.removeItem(buildLocalStorageKey(walletAddress));
};
