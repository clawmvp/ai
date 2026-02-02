import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ConnectionProvider } from './context/ConnectionProvider';
import { WalletProvider } from './context/WalletProvider';

// Screens
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import TournamentScreen from './screens/TournamentScreen';
import WalletConnectScreen from './screens/WalletConnectScreen';
import NFTMarketplaceScreen from './screens/NFTMarketplaceScreen';
import SinglePlayerScreen from './screens/SinglePlayerScreen';

const Stack = createStackNavigator();

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <ConnectionProvider>
      <WalletProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a2e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            {!walletConnected ? (
              <Stack.Screen
                name="WalletConnect"
                component={WalletConnectScreen}
                options={{ title: 'Connect Wallet' }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ title: 'Solana Tabla Pro' }}
                />
                <Stack.Screen
                  name="Game"
                  component={GameScreen}
                  options={{ title: 'Play Table' }}
                />
                <Stack.Screen
                  name="Tournament"
                  component={TournamentScreen}
                  options={{ title: 'Tournaments' }}
                />
                <Stack.Screen
                  name="NFTMarketplace"
                  component={NFTMarketplaceScreen}
                  options={{ title: 'NFT Marketplace' }}
                />
                <Stack.Screen
                  name="SinglePlayer"
                  component={SinglePlayerScreen}
                  options={{ title: 'vs AI' }}
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </WalletProvider>
    </ConnectionProvider>
  );
}
