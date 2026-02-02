import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

interface Board3DProps {
    board: number[];  // 28-element array with checker positions
    onPointClick?: (pointIndex: number) => void;
}

// Wood texture for the table
function WoodenTable() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[12, 8]} />
            <meshStandardMaterial
                color="#8B4513"
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
    );
}

// Individual backgammon point (triangle)
function Point({ position, color, isOccupied, checkerCount, onPointClick, index }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    return (
        <group position={position}>
            {/* Triangle point */}
            <mesh
                ref={meshRef}
                rotation={[0, 0, 0]}
                onClick={() => onPointClick?.(index)}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <coneGeometry args={[0.3, 1.5, 3]} />
                <meshStandardMaterial
                    color={hovered ? (color === 'dark' ? '#555555' : '#eeeeee') : (color === 'dark' ? '#333333' : '#dddddd')}
                />
            </mesh>

            {/* Render checkers on this point */}
            {Array.from({ length: Math.abs(checkerCount) }).map((_, i) => (
                <Checker
                    key={i}
                    position={[0, 0.2 + (i * 0.4), 0]}
                    color={checkerCount > 0 ? '#8B0000' : '#F5F5DC'}  // Red for player 1, beige for player 2
                />
            ))}
        </group>
    );
}

// Checker piece (disc)
function Checker({ position, color }: { position: [number, number, number], color: string }) {
    return (
        <mesh position={position}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
            <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.1}
            />
        </mesh>
    );
}

// Full backgammon board
function BackgammonBoard({ board, onPointClick }: Board3DProps) {
    const points = [];

    // Generate 24 points (12 on each side)
    for (let i = 0; i < 24; i++) {
        const isTopRow = i < 12;
        const x = ((i % 12) - 5.5) * 0.7;  // Space points horizontally
        const z = isTopRow ? 2.5 : -2.5;
        const rotation = isTopRow ? 0 : Math.PI;

        // Alternate colors
        const color = (i % 2 === 0) ? 'dark' : 'light';

        points.push(
            <Point
                key={i}
                index={i}
                position={[x, 0, z]}
                color={color}
                checkerCount={board[i] || 0}
                onPointClick={onPointClick}
            />
        );
    }

    return (
        <group>
            <WoodenTable />

            {/* Board frame */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[11, 0.2, 7]} />
                <meshStandardMaterial color="#654321" />
            </mesh>

            {/* Bar (middle divider) */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.3, 0.3, 7]} />
                <meshStandardMaterial color="#2F4F4F" />
            </mesh>

            {points}
        </group>
    );
}

// Main component
export default function Board3D({ board, onPointClick }: Board3DProps) {
    return (
        <View style={styles.container}>
            <Canvas
                camera={{ position: [0, 8, 8], fov: 50 }}
                style={styles.canvas}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <spotLight position={[-10, 10, -5]} intensity={0.5} />

                <BackgammonBoard board={board} onPointClick={onPointClick} />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={15}
                />
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    canvas: {
        width: width,
        height: height * 0.7,
    },
});
