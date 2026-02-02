import React, { createContext, useContext, useMemo } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

interface ConnectionContextState {
    connection: Connection;
    endpoint: string;
}

const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);

export function useConnection(): ConnectionContextState {
    return useContext(ConnectionContext);
}

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use devnet for development, mainnet-beta for production
    const endpoint = __DEV__ ? clusterApiUrl('devnet') : 'https://api.mainnet-beta.solana.com';

    const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

    return (
        <ConnectionContext.Provider value={{ connection, endpoint }}>
            {children}
        </ConnectionContext.Provider>
    );
};
