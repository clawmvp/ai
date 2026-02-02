import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Board3D from '../components/Board3D';
import Dice3D from '../components/Dice3D';
import { useWallet } from '../context/WalletProvider';
import { useConnection } from '../context/ConnectionProvider';
import { io, Socket } from 'socket.io-client';

export default function GameScreen() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    const [board, setBoard] = useState<number[]>(initializeBoard());
    const [dice1, setDice1] = useState(1);
    const [dice2, setDice2] = useState(1);
    const [diceRolled, setDiceRolled] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [opponentConnected, setOpponentConnected] = useState(false);

    useEffect(() => {
        // Connect to multiplayer backend
        const newSocket = io('wss://tabla-backend.railway.app', {  // Placeholder URL
            query: { publicKey: publicKey?.toBase58() },
        });

        newSocket.on('connect', () => {
            console.log('Connected to game server');
        });

        newSocket.on('opponent_connected', () => {
            setOpponentConnected(true);
        });

        newSocket.on('opponent_move', (data: any) => {
            handleOpponentMove(data);
        });

        newSocket.on('dice_rolled', (data: { dice1: number, dice2: number }) => {
            setDice1(data.dice1);
            setDice2(data.dice2);
            setDiceRolled(true);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [publicKey]);

    function initializeBoard(): number[] {
        const board = new Array(28).fill(0);

        // Standard backgammon starting position
        board[0] = 2;
        board[11] = 5;
        board[16] = 3;
        board[18] = 5;
        board[23] = -2;
        board[12] = -5;
        board[7] = -3;
        board[5] = -5;

        return board;
    }

    const handleRollDice = () => {
        if (diceRolled) {
            Alert.alert('Already Rolled', 'You must make a move first');
            return;
        }

        setIsRolling(true);

        setTimeout(() => {
            const newDice1 = Math.floor(Math.random() * 6) + 1;
            const newDice2 = Math.floor(Math.random() * 6) + 1;

            setDice1(newDice1);
            setDice2(newDice2);
            setDiceRolled(true);
            setIsRolling(false);

            // Broadcast to opponent
            socket?.emit('roll_dice', { dice1: newDice1, dice2: newDice2 });
        }, 1500);
    };

    const handlePointClick = (pointIndex: number) => {
        if (!diceRolled) {
            Alert.alert('Roll Dice First', 'You must roll the dice before moving');
            return;
        }

        if (selectedPoint === null) {
            // Select source point
            if (board[pointIndex] > 0) {  // Player 1's checker
                setSelectedPoint(pointIndex);
            } else {
                Alert.alert('Invalid Selection', 'Select your own checker');
            }
        } else {
            // Make move
            const from = selectedPoint;
            const to = pointIndex;

            // Validate move with dice values
            const distance = Math.abs(to - from);
            if (distance !== dice1 && distance !== dice2) {
                Alert.alert('Invalid Move', `Move must match dice values: ${dice1} or ${dice2}`);
                setSelectedPoint(null);
                return;
            }

            // Execute move
            const newBoard = [...board];
            newBoard[from] -= 1;
            newBoard[to] += 1;
            setBoard(newBoard);

            // Broadcast move
            socket?.emit('make_move', { from, to });

            // Reset turn
            setSelectedPoint(null);
            setDiceRolled(false);
            setCurrentTurn('player2');
        }
    };

    const handleOpponentMove = (data: { from: number, to: number }) => {
        const newBoard = [...board];
        newBoard[data.from] += 1;  // Opponent uses negative values
        newBoard[data.to] -= 1;
        setBoard(newBoard);
        setCurrentTurn('player1');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>You</Text>
                    <View style={[styles.indicator, currentTurn === 'player1' && styles.activeIndicator]} />
                </View>

                <View style={styles.connectionStatus}>
                    <Text style={styles.statusText}>
                        {opponentConnected ? '🟢 Opponent Connected' : '🔴 Waiting for opponent...'}
                    </Text>
                </View>

                <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>Opponent</Text>
                    <View style={[styles.indicator, currentTurn === 'player2' && styles.activeIndicator]} />
                </View>
            </View>

            <Board3D board={board} onPointClick={handlePointClick} />

            <View style={styles.controls}>
                <Dice3D
                    value1={dice1}
                    value2={dice2}
                    onRoll={handleRollDice}
                    isRolling={isRolling}
                />

                <TouchableOpacity
                    style={[styles.rollButton, diceRolled && styles.disabledButton]}
                    onPress={handleRollDice}
                    disabled={diceRolled}
                >
                    <Text style={styles.buttonText}>
                        {isRolling ? 'Rolling...' : diceRolled ? 'Make Your Move' : 'Roll Dice'}
                    </Text>
                </TouchableOpacity>

                {selectedPoint !== null && (
                    <Text style={styles.selectedText}>
                        Selected point: {selectedPoint} - Click destination
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    playerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    indicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#555',
    },
    activeIndicator: {
        backgroundColor: '#00ff00',
    },
    connectionStatus: {
        alignItems: 'center',
    },
    statusText: {
        color: '#aaa',
        fontSize: 12,
    },
    controls: {
        padding: 20,
        alignItems: 'center',
        gap: 15,
    },
    rollButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#555',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedText: {
        color: '#00ff00',
        fontSize: 14,
    },
});
