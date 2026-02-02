import React, { createContext, useContext, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

interface WalletContextState {
    publicKey: PublicKey | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

    const connect = useCallback(async () => {
        try {
            const result = await transact(async (wallet) => {
                const authorization = await wallet.authorize({
                    cluster: 'devnet',
                    identity: {
                        name: 'Solana Tabla Pro',
                        uri: 'https://solanatabla.pro',
                        icon: 'favicon.ico',
                    },
                });

                return {
                    publicKey: new PublicKey(authorization.accounts[0].address),
                    authToken: authorization.auth_token,
                };
            });

            setPublicKey(result.publicKey);
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }, []);

    const disconnect = useCallback(() => {
        setPublicKey(null);
    }, []);

    const signTransaction = useCallback(async (transaction: any) => {
        if (!publicKey) throw new Error('Wallet not connected');

        return await transact(async (wallet) => {
            const signedTransactions = await wallet.signTransactions({
                transactions: [transaction],
            });

            return signedTransactions[0];
        });
    }, [publicKey]);

    return (
        <WalletContext.Provider value={{ publicKey, connect, disconnect, signTransaction }}>
            {children}
        </WalletContext.Provider>
    );
};
