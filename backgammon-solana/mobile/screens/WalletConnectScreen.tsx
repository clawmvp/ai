import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useWallet } from '../context/WalletProvider';

export default function WalletConnectScreen({ navigation }: any) {
    const { connect } = useWallet();
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            await connect();
            navigation.replace('Home');
        } catch (error) {
            console.error('Connection failed:', error);
            alert('Failed to connect wallet. Please try again.');
        } finally {
            setConnecting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>🎲</Text>
                <Text style={styles.title}>SOLANA TABLA PRO</Text>
                <Text style={styles.subtitle}>Web3 Backgammon on Solana Mobile</Text>

                <View style={styles.features}>
                    <FeatureItem icon="🔒" title="Provably Fair" desc="On-chain dice rolls" />
                    <FeatureItem icon="💰" title="Real Stakes" desc="Bet SOL, win rewards" />
                    <FeatureItem icon="🏆" title="Tournaments" desc="Compete globally" />
                    <FeatureItem icon="🎨" title="NFT Skins" desc="Custom boards & avatars" />
                </View>

                <TouchableOpacity
                    style={styles.connectButton}
                    onPress={handleConnect}
                    disabled={connecting}
                >
                    <Text style={styles.buttonText}>
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.hint}>
                    Supports Phantom, Solflare, and all MWA wallets
                </Text>
            </View>
        </View>
    );
}

function FeatureItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        alignItems: 'center',
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 40,
    },
    features: {
        width: '100%',
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    featureIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    featureTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    featureDesc: {
        color: '#aaa',
        fontSize: 12,
    },
    connectButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 50,
        paddingVertical: 18,
        borderRadius: 30,
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    hint: {
        color: '#666',
        fontSize: 11,
        marginTop: 20,
    },
});
