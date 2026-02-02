import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Tournament {
    id: string;
    name: string;
    entryFee: number;
    prizePool: number;
    participants: number;
    maxParticipants: number;
    startTime: string;
    status: 'open' | 'ongoing' | 'completed';
}

export default function TournamentScreen() {
    const [tournaments, setTournaments] = useState<Tournament[]>([
        {
            id: '1',
            name: 'Weekend Warriors',
            entryFee: 0.1,
            prizePool: 2.5,
            participants: 18,
            maxParticipants: 32,
            startTime: '2h 15m',
            status: 'open',
        },
        {
            id: '2',
            name: 'High Rollers',
            entryFee: 1.0,
            prizePool: 12.0,
            participants: 7,
            maxParticipants: 16,
            startTime: '45m',
            status: 'open',
        },
        {
            id: '3',
            name: 'Quick Fire',
            entryFee: 0.05,
            prizePool: 0.8,
            participants: 256,
            maxParticipants: 256,
            startTime: 'In Progress',
            status: 'ongoing',
        },
    ]);

    const [selectedTab, setSelectedTab] = useState<'open' | 'ongoing' | 'completed'>('open');

    const filteredTournaments = tournaments.filter(t => t.status === selectedTab);

    const renderTournament = ({ item }: { item: Tournament }) => (
        <TouchableOpacity style={styles.tournamentCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.tournamentName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Entry Fee</Text>
                        <Text style={styles.infoValue}>{item.entryFee} SOL</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Prize Pool</Text>
                        <Text style={styles.infoValue}>{item.prizePool} SOL</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Participants</Text>
                        <Text style={styles.infoValue}>
                            {item.participants}/{item.maxParticipants}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Starts In</Text>
                        <Text style={styles.infoValue}>{item.startTime}</Text>
                    </View>
                </View>
            </View>

            {item.status === 'open' && (
                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>JOIN TOURNAMENT</Text>
                </TouchableOpacity>
            )}

            {item.status === 'ongoing' && (
                <TouchableOpacity style={styles.spectateButton}>
                    <Text style={styles.spectateButtonText}>VIEW BRACKET</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'open' && styles.activeTab]}
                    onPress={() => setSelectedTab('open')}
                >
                    <Text style={[styles.tabText, selectedTab === 'open' && styles.activeTabText]}>
                        Open
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'ongoing' && styles.activeTab]}
                    onPress={() => setSelectedTab('ongoing')}
                >
                    <Text style={[styles.tabText, selectedTab === 'ongoing' && styles.activeTabText]}>
                        Ongoing
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
                    onPress={() => setSelectedTab('completed')}
                >
                    <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
                        Completed
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTournaments}
                renderItem={renderTournament}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tournaments found</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'open':
            return '#00ff88';
        case 'ongoing':
            return '#ffaa00';
        case 'completed':
            return '#888';
        default:
            return '#666';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#00d4ff',
    },
    tabText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#00d4ff',
    },
    listContent: {
        padding: 15,
    },
    tournamentCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 15,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    tournamentName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBody: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    joinButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    spectateButton: {
        backgroundColor: 'rgba(255,170,0,0.2)',
        borderWidth: 1,
        borderColor: '#ffaa00',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    spectateButtonText: {
        color: '#ffaa00',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        paddingVertical: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
});
