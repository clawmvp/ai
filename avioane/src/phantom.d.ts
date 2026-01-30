/* Phantom Wallet (Solana) - tipuri pentru window.phantom */
interface PhantomProvider {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>
  disconnect: () => Promise<void>
  on: (event: string, callback: (...args: unknown[]) => void) => void
  publicKey: { toBase58: () => string } | null
}

interface Window {
  phantom?: { solana?: PhantomProvider }
  solana?: PhantomProvider
}
