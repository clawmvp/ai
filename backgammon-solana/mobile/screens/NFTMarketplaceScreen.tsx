import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface NFTItem {
    id: string;
    name: string;
    type: 'board' | 'avatar';
    price: number;
    image: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    owned: boolean;
}

export default function NFTMarketplaceScreen() {
    const [selectedCategory, setSelectedCategory] = useState<'board' | 'avatar'>('board');
    const [previewItem, setPreviewItem] = useState<NFTItem | null>(null);

    const nftItems: NFTItem[] = [
        {
            id: '1',
            name: 'Walnut Classic',
            type: 'board',
            price: 0.5,
            image: '🪵',
            rarity: 'common',
            owned: false,
        },
        {
            id: '2',
            name: 'Marble Luxury',
            type: 'board',
            price: 2.0,
            image: '⚪',
            rarity: 'rare',
            owned: false,
        },
        {
            id: '3',
            name: 'Cyberpunk Neon',
            type: 'board',
            price: 5.0,
            image: '🌈',
            rarity: 'epic',
            owned: false,
        },
        {
            id: '4',
            name: 'Golden Dragon',
            type: 'board',
            price: 15.0,
            image: '🐉',
            rarity: 'legendary',
            owned: false,
        },
    ];

    const filteredItems = nftItems.filter(item => item.type === selectedCategory);

    const renderNFTCard = (item: NFTItem) => (
        <TouchableOpacity
            key={item.id}
            style={styles.nftCard}
            onPress={() => setPreviewItem(item)}
        >
            <View style={styles.nftImageContainer}>
                <Text style={styles.nftImage}>{item.image}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                    <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.nftInfo}>
                <Text style={styles.nftName}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.priceValue}>{item.price} SOL</Text>
                </View>

                {item.owned ? (
                    <View style={styles.ownedBadge}>
                        <Text style={styles.ownedText}>✓ OWNED</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>BUY NOW</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>NFT Marketplace</Text>
                <Text style={styles.headerSubtitle}>Customize your game</Text>
            </View>

            <View style={styles.categoryTabs}>
                <TouchableOpacity
                    style={[styles.categoryTab, selectedCategory === 'board' && styles.activeCategoryTab]}
                    onPress={() => setSelectedCategory('board')}
                >
                    <Text style={[styles.categoryText, selectedCategory === 'board' && styles.activeCategoryText]}>
                        🎲 Boards
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.categoryTab, selectedCategory === 'avatar' && styles.activeCategoryTab]}
                    onPress={() => setSelectedCategory('avatar')}
                >
                    <Text style={[styles.categoryText, selectedCategory === 'avatar' && styles.activeCategoryText]}>
                        👤 Avatars
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.nftGrid}>
                {filteredItems.map(renderNFTCard)}
            </ScrollView>

            {/* Preview Modal */}
            <Modal
                visible={previewItem !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewItem(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalImage}>{previewItem?.image}</Text>
                        <Text style={styles.modalTitle}>{previewItem?.name}</Text>
                        <Text style={styles.modalRarity}>
                            {previewItem?.rarity.toUpperCase()}
                        </Text>
                        <Text style={styles.modalPrice}>{previewItem?.price} SOL</Text>

                        <TouchableOpacity
                            style={styles.modalBuyButton}
                            onPress={() => {
                                // Handle purchase
                                setPreviewItem(null);
                            }}
                        >
                            <Text style={styles.modalBuyText}>PURCHASE NFT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setPreviewItem(null)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'common':
            return '#aaa';
        case 'rare':
            return '#4169e1';
        case 'epic':
            return '#9370db';
        case 'legendary':
            return '#ffd700';
        default:
            return '#666';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 5,
    },
    categoryTabs: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    categoryTab: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeCategoryTab: {
        backgroundColor: 'rgba(0,212,255,0.2)',
        borderColor: '#00d4ff',
    },
    categoryText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    activeCategoryText: {
        color: '#00d4ff',
    },
    nftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-around',
    },
    nftCard: {
        width: '45%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    nftImageContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 10,
    },
    nftImage: {
        fontSize: 60,
    },
    rarityBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    rarityText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
    },
    nftInfo: {
        alignItems: 'center',
    },
    nftName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,
    },
    priceLabel: {
        color: '#888',
        fontSize: 12,
    },
    priceValue: {
        color: '#00d4ff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buyButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ownedBadge: {
        backgroundColor: '#00ff88',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    ownedText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#00d4ff',
    },
    modalImage: {
        fontSize: 100,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    modalRarity: {
        fontSize: 14,
        color: '#ffd700',
        marginBottom: 15,
    },
    modalPrice: {
        fontSize: 20,
        color: '#00d4ff',
        fontWeight: 'bold',
        marginBottom: 25,
    },
    modalBuyButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
    },
    modalBuyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        paddingVertical: 10,
    },
    modalCloseText: {
        color: '#888',
        fontSize: 14,
    },
});
