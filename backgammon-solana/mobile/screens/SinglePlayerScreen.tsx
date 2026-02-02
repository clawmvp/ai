import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type DifficultyLevel = 'beginner' | 'medium' | 'hard';

export default function SinglePlayerScreen() {
    const navigation = useNavigation();
    const [showDifficultyModal, setShowDifficultyModal] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

    const startAIGame = (difficulty: DifficultyLevel) => {
        setSelectedDifficulty(difficulty);
        setShowDifficultyModal(false);

        // Navigate to game screen with AI mode
        navigation.navigate('Game', {
            mode: 'ai',
            difficulty: difficulty
        });
    };

    const getDifficultyInfo = (level: DifficultyLevel) => {
        switch (level) {
            case 'beginner':
                return {
                    icon: '🟢',
                    description: 'Face mișcări aleatoare, perfect pentru începători',
                    color: '#00ff88'
                };
            case 'medium':
                return {
                    icon: '🟡',
                    description: 'Strategie medie, folosește tactici de bază',
                    color: '#ffaa00'
                };
            case 'hard':
                return {
                    icon: '🔴',
                    description: 'Foarte inteligent, blochează și lovește strategic',
                    color: '#ff4444'
                };
        }
    };

    return (
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🤖 Joacă contra AI</Text>
                <Text style={styles.subtitle}>Alege dificultatea și începe jocul</Text>
            </View>

            <View style={styles.content}>
                {(['beginner', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
                    const info = getDifficultyInfo(level);
                    return (
                        <TouchableOpacity
                            key={level}
                            style={[styles.difficultyCard, { borderColor: info.color }]}
                            onPress={() => startAIGame(level)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.difficultyIcon}>{info.icon}</Text>
                                <Text style={styles.difficultyName}>
                                    {level === 'beginner' && 'ÎNCEPĂTOR'}
                                    {level === 'medium' && 'MEDIU'}
                                    {level === 'hard' && 'GREU'}
                                </Text>
                            </View>

                            <Text style={styles.difficultyDescription}>{info.description}</Text>

                            <View style={[styles.playButton, { backgroundColor: info.color }]}>
                                <Text style={styles.playButtonText}>JOACĂ ACUM</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Sfaturi:</Text>
                    <Text style={styles.infoText}>
                        • Începător: Ideal pentru a învăța regulile{'\n'}
                        • Mediu: Bun pentru practică{'\n'}
                        • Greu: Pregătește-te pentru multiplayer!
                    </Text>
                </View>

                <View style={styles.statsBox}>
                    <Text style={styles.statsTitle}>📊 Statistici vs AI</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Victorii</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Înfrângeri</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0%</Text>
                            <Text style={styles.statLabel}>Win Rate</Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 25,
        alignItems: 'center',
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    difficultyCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    difficultyIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    difficultyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    difficultyDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 15,
        lineHeight: 20,
    },
    playButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    playButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: 'rgba(0,212,255,0.1)',
        borderRadius: 15,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,212,255,0.3)',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00d4ff',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 22,
    },
    statsBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00d4ff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },
});
