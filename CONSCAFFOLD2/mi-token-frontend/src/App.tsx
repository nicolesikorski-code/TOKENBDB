import { useState, useEffect } from 'react';
import { setAllowed, isConnected } from '@stellar/freighter-api';

// Configuración de la red
const CONTRACT_ID = 'CA47QDVKM5CO7XX2GUGBIEYNWD44AHQBOUFW5A2NPOMZTXS33GU3U5I4';

function App() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  // Conectar wallet usando la API oficial de Freighter
  const connectWallet = async () => {
    try {
      console.log('Intentando conectar con Freighter...');
      
      // Esperar un poco para que Freighter se cargue completamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar si Freighter está disponible
      const connected = await isConnected();
      console.log('Freighter conectado:', connected);
      
      if (connected) {
        // Ya está conectado, obtener la clave pública usando window.freighterApi
        const freighter = (window as any).freighterApi;
        if (freighter) {
          const pk = await freighter.getPublicKey();
          setPublicKey(pk);
          setConnected(true);
          console.log('Wallet conectada:', pk);
        } else {
          throw new Error('Freighter API no disponible');
        }
      } else {
        // Intentar conectar
        try {
          await setAllowed();
          const freighter = (window as any).freighterApi;
          if (freighter) {
            const pk = await freighter.getPublicKey();
            setPublicKey(pk);
            setConnected(true);
            console.log('Wallet conectada:', pk);
          } else {
            throw new Error('Freighter API no disponible');
          }
        } catch (connectError) {
          console.error('Error conectando:', connectError);
          alert('Por favor conecta tu cuenta en Freighter primero');
        }
      }
    } catch (error) {
      console.error('Error con Freighter:', error);
      alert('Freighter wallet no está instalado o no se detecta correctamente.\n\nPor favor:\n1. Instala Freighter desde https://www.freighter.app/\n2. Refresca esta página\n3. Asegúrate de que la extensión esté habilitada');
    }
  };

  // Obtener información del token (simulado por ahora)
  const getTokenInfo = async () => {
    setTokenInfo({
      name: "Buen Dia Builders",
      symbol: "BDB",
      decimals: 7,
      totalSupply: 1000000
    });
  };

  // Obtener balance (simulado por ahora)
  const getBalance = async () => {
    setLoading(true);
    try {
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalance('1000');
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      setBalance('Error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar información del token al montar el componente
  useEffect(() => {
    getTokenInfo();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efectos de fondo */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: `
          radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ 
            fontSize: '3.5em',
            fontWeight: '800',
            margin: '0 0 10px 0',
            background: 'linear-gradient(45deg, #a855f7, #c084fc, #e879f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            🚀 Token BDB
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.3em',
            margin: '0',
            opacity: 0.9,
            fontWeight: '300'
          }}>
            por Nicole Sikorski
          </p>
          <div style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'inline-block'
          }}>
            <p style={{
              color: '#a855f7',
              margin: '0',
              fontSize: '0.9em',
              fontFamily: 'monospace'
            }}>
              Contract ID: {CONTRACT_ID.slice(0, 8)}...{CONTRACT_ID.slice(-8)}
            </p>
          </div>
        </div>

        {/* Token Info Card */}
        {tokenInfo && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '40px',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ 
              color: '#a855f7', 
              marginTop: '0',
              fontSize: '1.8em',
              fontWeight: '600',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📊 Información del Token
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '15px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <p style={{ color: '#cbd5e1', margin: '0 0 5px 0', fontSize: '0.9em', opacity: 0.8 }}>Nombre</p>
                <p style={{ color: '#a855f7', margin: '0', fontSize: '1.2em', fontWeight: '600' }}>{tokenInfo.name}</p>
              </div>
              <div style={{
                padding: '15px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <p style={{ color: '#cbd5e1', margin: '0 0 5px 0', fontSize: '0.9em', opacity: 0.8 }}>Símbolo</p>
                <p style={{ color: '#a855f7', margin: '0', fontSize: '1.2em', fontWeight: '600' }}>{tokenInfo.symbol}</p>
              </div>
              <div style={{
                padding: '15px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <p style={{ color: '#cbd5e1', margin: '0 0 5px 0', fontSize: '0.9em', opacity: 0.8 }}>Decimales</p>
                <p style={{ color: '#a855f7', margin: '0', fontSize: '1.2em', fontWeight: '600' }}>{tokenInfo.decimals}</p>
              </div>
              <div style={{
                padding: '15px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <p style={{ color: '#cbd5e1', margin: '0 0 5px 0', fontSize: '0.9em', opacity: 0.8 }}>Total Supply</p>
                <p style={{ color: '#a855f7', margin: '0', fontSize: '1.2em', fontWeight: '600' }}>{tokenInfo.totalSupply.toLocaleString()} {tokenInfo.symbol}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        {!connected ? (
          <div style={{ 
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ 
              color: '#a855f7', 
              fontSize: '1.8em',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              🔗 Conectar Wallet
            </h2>
            <p style={{ 
              fontSize: '1.2em', 
              marginBottom: '30px',
              color: '#cbd5e1',
              opacity: 0.9
            }}>
              Conecta tu wallet para empezar a usar TokenBDB
            </p>
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={connectWallet}
                style={{
                  background: 'linear-gradient(45deg, #a855f7, #c084fc)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 35px',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(168, 85, 247, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(168, 85, 247, 0.3)';
                }}
              >
                🔌 Conectar Freighter
              </button>
              <button 
                onClick={() => {
                  setPublicKey('GAA5RL3VNLB3MT4POTNOPT7AF2LLEEZNOBKK6SEMERYPAKOGUIWURVEL');
                  setConnected(true);
                  alert('Modo demo activado - usando tu dirección de testnet');
                }}
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 35px',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)';
                }}
              >
                🎮 Modo Demo
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <h3 style={{ 
                color: '#22c55e', 
                margin: '0 0 10px 0',
                fontSize: '1.3em',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                ✅ Wallet Conectada
              </h3>
              <p style={{ 
                margin: '0', 
                color: '#cbd5e1',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {publicKey}
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={getBalance} 
                disabled={loading}
                style={{
                  background: loading ? 'linear-gradient(45deg, #6b7280, #9ca3af)' : 'linear-gradient(45deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 35px',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  borderRadius: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.3)';
                  }
                }}
              >
                {loading ? '⏳ Cargando...' : '💰 Ver Balance'}
              </button>
              
              <div style={{
                marginTop: '30px',
                padding: '25px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '15px',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <h3 style={{
                  color: '#a855f7',
                  margin: '0 0 15px 0',
                  fontSize: '1.5em',
                  fontWeight: '600'
                }}>
                  💎 Tu Balance
                </h3>
                <p style={{ 
                  fontSize: '2.5em', 
                  fontWeight: 'bold', 
                  color: '#a855f7', 
                  margin: '0',
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
                }}>
                  {balance} BDB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;