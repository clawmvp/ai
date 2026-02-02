import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import * as THREE from 'three';

interface Dice3DProps {
    value1: number;
    value2: number;
    onRoll?: () => void;
    isRolling?: boolean;
}

// Single die component
function Die({ value, position, isRolling }: { value: number, position: [number, number, number], isRolling: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current && isRolling) {
            // Tumbling animation
            meshRef.current.rotation.x += delta * 10;
            meshRef.current.rotation.y += delta * 8;
            meshRef.current.rotation.z += delta * 6;
        } else if (meshRef.current && !isRolling) {
            // Snap to final rotation based on value
            const rotations: { [key: number]: [number, number, number] } = {
                1: [0, 0, 0],
                2: [Math.PI / 2, 0, 0],
                3: [0, 0, -Math.PI / 2],
                4: [0, 0, Math.PI / 2],
                5: [-Math.PI / 2, 0, 0],
                6: [Math.PI, 0, 0],
            };

            const [x, y, z] = rotations[value] || [0, 0, 0];
            meshRef.current.rotation.x = x;
            meshRef.current.rotation.y = y;
            meshRef.current.rotation.z = z;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color="white"
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Pip dots - simplified representation */}
            {getDots(value).map((dotPos, i) => (
                <mesh key={i} position={dotPos}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            ))}
        </group>
    );
}

// Get dot positions for each die face
function getDots(value: number): [number, number, number][] {
    const offset = 0.51;  // Slightly outside the die surface

    const patterns: { [key: number]: [number, number, number][] } = {
        1: [[0, 0, offset]],
        2: [[-0.25, 0.25, offset], [0.25, -0.25, offset]],
        3: [[-0.25, 0.25, offset], [0, 0, offset], [0.25, -0.25, offset]],
        4: [[-0.25, 0.25, offset], [0.25, 0.25, offset], [-0.25, -0.25, offset], [0.25, -0.25, offset]],
        5: [[-0.25, 0.25, offset], [0.25, 0.25, offset], [0, 0, offset], [-0.25, -0.25, offset], [0.25, -0.25, offset]],
        6: [[-0.25, 0.3, offset], [0.25, 0.3, offset], [-0.25, 0, offset], [0.25, 0, offset], [-0.25, -0.3, offset], [0.25, -0.3, offset]],
    };

    return patterns[value] || [];
}

// Surface for dice to roll on
function DiceSurface() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[6, 4]} />
            <meshStandardMaterial color="#228B22" roughness={0.9} />
        </mesh>
    );
}

export default function Dice3D({ value1, value2, onRoll, isRolling = false }: Dice3DProps) {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: (e, gestureState) => {
                pan.flattenOffset();

                // Detect drag gesture for rolling
                if (Math.abs(gestureState.dy) > 50) {
                    onRoll?.();
                }

                // Reset position
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                    ]
                }
            ]}
            {...panResponder.panHandlers}
        >
            <Canvas
                camera={{ position: [0, 3, 5], fov: 50 }}
                shadows
                style={styles.canvas}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                <DiceSurface />

                <Die value={value1} position={[-1.2, 1, 0]} isRolling={isRolling} />
                <Die value={value2} position={[1.2, 1, 0]} isRolling={isRolling} />
            </Canvas>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 150,
    },
    canvas: {
        width: '100%',
        height: '100%',
    },
});
