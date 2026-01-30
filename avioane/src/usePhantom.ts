import { useState, useCallback, useEffect } from 'react'

export function usePhantom() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const provider = typeof window !== 'undefined' ? (window.phantom?.solana ?? window.solana) : undefined

  const connect = useCallback(async () => {
    if (!provider) {
      setError('Phantom wallet nu este instalat. Instalează extensia Phantom.')
      return
    }
    setIsConnecting(true)
    setError(null)
    try {
      const res = await provider.connect()
      const key = res.publicKey.toBase58()
      setPublicKey(key)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conectare eșuată')
      setPublicKey(null)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (provider?.disconnect) await provider.disconnect()
    setPublicKey(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!provider) return
    if (provider.publicKey) setPublicKey(provider.publicKey.toBase58())
    const handleAccountChange = (...args: unknown[]) => {
      const key = args[0] as { toBase58?: () => string } | null
      setPublicKey(key?.toBase58?.() ?? null)
    }
    provider.on?.('accountChanged', handleAccountChange)
    return () => {
      provider.on?.('accountChanged', () => {})
    }
  }, [provider])

  return {
    publicKey,
    connected: !!publicKey,
    isConnecting,
    error,
    connect,
    disconnect,
    hasPhantom: !!provider,
  }
}
