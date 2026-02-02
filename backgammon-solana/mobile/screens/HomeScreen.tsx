import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../context/WalletProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { publicKey } = useWallet();

    return (
        <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>SOLANA TABLA PRO</Text>
                    <Text style={styles.subtitle}>Web3 Backgammon on Solana</Text>

                    {publicKey && (
                        <View style={styles.walletInfo}>
                            <Text style={styles.walletLabel}>Connected Wallet:</Text>
                            <Text style={styles.walletAddress}>
                                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.menuGrid}>
                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('Game' as never)}
                    >
                        <Text style={styles.menuIcon}>🎲</Text>
                        <Text style={styles.menuTitle}>Quick Match</Text>
                        <Text style={styles.menuDesc}>Find an opponent and play for SOL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('SinglePlayer' as never)}
                    >
                        <Text style={styles.menuIcon}>🤖</Text>
                        <Text style={styles.menuTitle}>vs AI</Text>
                        <Text style={styles.menuDesc}>Practică contra robotel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('Tournament' as never)}
                    >
                        <Text style={styles.menuIcon}>🏆</Text>
                        <Text style={styles.menuTitle}>Tournaments</Text>
                        <Text style={styles.menuDesc}>Compete in brackets for big prizes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('NFTMarketplace' as never)}
                    >
                        <Text style={styles.menuIcon}>🎨</Text>
                        <Text style={styles.menuTitle}>NFT Marketplace</Text>
                        <Text style={styles.menuDesc}>Custom boards & avatars</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                    >
                        <Text style={styles.menuIcon}>📊</Text>
                        <Text style={styles.menuTitle}>Leaderboard</Text>
                        <Text style={styles.menuDesc}>Top players & rankings</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>1,247</Text>
                        <Text style={styles.statLabel}>Active Players</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>45 SOL</Text>
                        <Text style={styles.statLabel}>Prize Pool</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>2,891</Text>
                        <Text style={styles.statLabel}>Games Played</Text>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        marginTop: 5,
    },
    walletInfo: {
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
    },
    walletLabel: {
        fontSize: 12,
        color: '#aaa',
    },
    walletAddress: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginTop: 3,
    },
    menuGrid: {
        flex Wrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    menuCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    menuIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    menuDesc: {
        fontSize: 12,
        color: '#aaa',
        textAlign: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        paddingVertical: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00d4ff',
    },
    statLabel: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 5,
    },
});
