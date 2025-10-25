import { useState } from 'react'
import './App.css'

function App() {
  const [balance, setBalance] = useState('0')
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    try {
      setLoading(true)
      
      // Verificar si Freighter está disponible
      if (typeof window !== 'undefined' && (window as any).freighterApi) {
        const pubKey = await (window as any).freighterApi.getPublicKey()
        setPublicKey(pubKey)
        setConnected(true)
        alert('✅ Wallet conectada!')
      } else {
        alert('⚠️ Freighter no detectado.\n\n1. Asegúrate de tener la extensión instalada\n2. Recarga esta página\n3. Intenta de nuevo')
      }
    } catch (error: any) {
      console.error('Error:', error)
      if (error?.message?.includes('User declined')) {
        alert('❌ Rechazaste la conexión')
      } else {
        alert('❌ Error al conectar. Verifica que Freighter esté instalado y en Testnet.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    if (!connected) {
      alert('⚠️ Conecta tu wallet primero')
      return
    }
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBalance('1,000,000')
      alert('✅ Balance actualizado!')
    } catch (error) {
      alert('❌ Error al obtener balance')
    } finally {
      setLoading(false)
    }
  }

  const mintTokens = async () => {
    if (!connected) {
      alert('⚠️ Conecta tu wallet primero')
      return
    }

    if (!amount || amount.trim() === '') {
      alert('⚠️ Ingresa una cantidad')
      return
    }

    const numAmount = Number(amount)
    
    if (isNaN(numAmount)) {
      alert('⚠️ Ingresa un número válido')
      return
    }

    if (numAmount <= 0) {
      alert('⚠️ La cantidad debe ser mayor a 0')
      return
    }

    if (numAmount > 1000000000) {
      alert('⚠️ Cantidad demasiado grande (máximo: 1,000,000,000)')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert(`✅ Minteando ${numAmount.toLocaleString()} BDB tokens!`)
      setAmount('')
      
      const currentBalance = Number(balance.replace(/,/g, ''))
      const newBalance = (currentBalance + numAmount).toLocaleString()
      setBalance(newBalance)
    } catch (error) {
      alert('❌ Error al mintear tokens')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>🦈 Token BDB - Buen Día Builders</h1>
        <div className="wallet-connect">
          {connected ? (
            <div>
              <p>✅ Conectado</p>
              <p className="address">{publicKey.slice(0, 8)}...{publicKey.slice(-8)}</p>
            </div>
          ) : (
            <button 
              onClick={connectWallet} 
              className="connect-button"
              disabled={loading}
            >
              {loading ? '🔄 Conectando...' : '🔗 Conectar Freighter'}
            </button>
          )}
        </div>
      </header>
      
      <main>
        <div className="card">
          <h2>💰 Tu Balance</h2>
          <div className="token-info">
            <p className="token-name">Buen Dia Token (BDB)</p>
            <p className="balance">{balance}</p>
            <button 
              onClick={fetchBalance}
              disabled={loading || !connected}
            >
              {loading ? '⏳ Cargando...' : '🔄 Actualizar Balance'}
            </button>
            {!connected && (
              <p className="warning">⚠️ Conecta tu wallet primero</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>🪙 Mintear Tokens</h2>
          <div className="form">
            <input
              type="number"
              placeholder="Cantidad (ej: 1000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              disabled={loading || !connected}
            />
            <button 
              onClick={mintTokens} 
              disabled={loading || !amount || !connected || Number(amount) <= 0}
            >
              {loading ? '⏳ Minteando...' : '✨ Mintear BDB'}
            </button>
            {!connected && (
              <p className="warning">⚠️ Conecta tu wallet primero</p>
            )}
          </div>
        </div>

        <div className="card info-card">
          <h3>ℹ️ Información del Contrato</h3>
          <p><strong>Contract ID:</strong> Pendiente de configurar</p>
          <p><strong>Network:</strong> Testnet</p>
          <p><strong>Total Supply:</strong> 10,000,000 BDB</p>
          <p><strong>Tu Address:</strong> {connected ? publicKey : 'No conectado'}</p>
        </div>

        <div className="card warning-card">
          <h3>📋 Pasos para conectar Freighter</h3>
          <ol>
            <li>Busca el ícono de Freighter en tus extensiones (puzzle 🧩 arriba a la derecha)</li>
            <li>Haz clic en Freighter para abrirla</li>
            <li>Asegúrate de estar en <strong>Testnet</strong> (Settings → Network → Testnet)</li>
            <li>Vuelve a esta página</li>
            <li>Haz clic en "Conectar Freighter"</li>
            <li>Aprueba la conexión en el popup de Freighter</li>
          </ol>
        </div>
      </main>
      
      <footer>
        <p>Construido con 💙 por Niki</p>
        <p>🦈 Buen Día Builders - Clase 6</p>
      </footer>
    </div>
  )
}

export default App