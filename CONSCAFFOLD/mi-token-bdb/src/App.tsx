import { useState, useEffect } from 'react';
import * as StellarSDK from '@stellar/stellar-sdk';
import './App.css';

// Extraer lo que necesitamos del SDK - Compatible con todas las versiones
const Contract = StellarSDK.Contract;
const TransactionBuilder = StellarSDK.TransactionBuilder;
const Networks = StellarSDK.Networks;
const BASE_FEE = StellarSDK.BASE_FEE;
const scValToNative = StellarSDK.scValToNative;
const nativeToScVal = StellarSDK.nativeToScVal;

// SorobanRpc puede estar en diferentes lugares según la versión
const SorobanRpc = (StellarSDK as any).SorobanRpc || (StellarSDK as any).rpc || {
  Server: (StellarSDK as any).Server,
  Api: (StellarSDK as any).Api
};

// Tipos para Freighter
interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, options: SignTransactionOptions) => Promise<string>;
  getNetwork: () => Promise<string>;
  isAllowed: () => Promise<{ isAllowed: boolean }>;
}

interface SignTransactionOptions {
  network: string;
  networkPassphrase: string;
  accountToSign: string;
}

declare global {
  interface Window {
    freighter?: FreighterAPI;
  }
}

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
}

interface ContractInfo {
  id: string | null;
  network: string;
  totalSupply: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
  });
  
  const [balance, setBalance] = useState<string>('0');
  const [mintAmount, setMintAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contractInfo] = useState<ContractInfo>({
    id: null, // ⭐ IMPORTANTE: Configura aquí tu Contract ID después del deploy
    network: 'Testnet',
    totalSupply: '10,000,000 BDB',
  });

  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const server = new SorobanRpc.Server(rpcUrl);

  const checkFreighterInstalled = (): boolean => {
    return typeof window !== 'undefined' && typeof window.freighter !== 'undefined';
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const connectWallet = async () => {
    if (!checkFreighterInstalled()) {
      showToast('Por favor instala Freighter wallet desde freighter.app', 'error');
      window.open('https://freighter.app', '_blank');
      return;
    }

    try {
      setIsLoading(true);
      
      const { isAllowed } = await window.freighter!.isAllowed();
      if (!isAllowed) {
        showToast('Por favor permite el acceso a Freighter', 'error');
        return;
      }

      const publicKey = await window.freighter!.getPublicKey();
      
      setWallet({ publicKey, isConnected: true });

      showToast('Wallet conectado exitosamente ✨', 'success');
      
      if (contractInfo.id) {
        await fetchBalance(publicKey);
      }
    } catch (error) {
      console.error('Error conectando wallet:', error);
      showToast('Error al conectar wallet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async (publicKey?: string) => {
    const address = publicKey || wallet.publicKey;
    
    if (!address) {
      showToast('Conecta tu wallet primero', 'error');
      return;
    }

    if (!contractInfo.id) {
      showToast('Contract ID no configurado. Despliega el contrato primero.', 'info');
      return;
    }

    try {
      setIsLoading(true);

      const contract = new Contract(contractInfo.id);
      const account = await server.getAccount(address);
      
      const builtTransaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call('balance', nativeToScVal(address, { type: 'address' })))
        .setTimeout(30)
        .build();

      const simulation = await server.simulateTransaction(builtTransaction);

      if (SorobanRpc.Api.isSimulationSuccess(simulation)) {
        const result = simulation.result?.retval;
        if (result) {
          const balanceValue = scValToNative(result);
          const formattedBalance = (Number(balanceValue) / 10000000).toFixed(2);
          setBalance(formattedBalance);
          showToast('Balance actualizado', 'success');
        }
      } else {
        throw new Error('Error en simulación');
      }
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      showToast('Error al obtener balance', 'error');
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      showToast('Conecta tu wallet primero', 'error');
      return;
    }

    if (!contractInfo.id) {
      showToast('Contract ID no configurado', 'error');
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      showToast('Ingresa una cantidad válida', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const contract = new Contract(contractInfo.id);
      const account = await server.getAccount(wallet.publicKey);
      
      const amountInStroop = BigInt(Math.floor(parseFloat(mintAmount) * 10000000));

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call(
          'mint',
          nativeToScVal(wallet.publicKey, { type: 'address' }),
          nativeToScVal(amountInStroop, { type: 'i128' })
        ))
        .setTimeout(30)
        .build();

      const simulation = await server.simulateTransaction(transaction);
      
      if (!SorobanRpc.Api.isSimulationSuccess(simulation)) {
        throw new Error('Error en simulación de mint');
      }

      const preparedTransaction = SorobanRpc.assembleTransaction(transaction, simulation).build();

      const signedXDR = await window.freighter!.signTransaction(preparedTransaction.toXDR(), {
        network: 'TESTNET',
        networkPassphrase: Networks.TESTNET,
        accountToSign: wallet.publicKey,
      });

      const transactionToSubmit = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
      const response = await server.sendTransaction(transactionToSubmit);

      let status = response.status;
      let attempts = 0;
      const maxAttempts = 30;

      while (status === 'PENDING' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const txResponse = await server.getTransaction(response.hash);
        status = txResponse.status;
        attempts++;
      }

      if (status === 'SUCCESS') {
        showToast(`¡${mintAmount} BDB minteados exitosamente! 🎉`, 'success');
        setMintAmount('');
        await fetchBalance();
      } else {
        throw new Error('Transacción no confirmada');
      }
    } catch (error: unknown) {
      console.error('Error minteando tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al mintear tokens';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (checkFreighterInstalled()) {
        try {
          const { isAllowed } = await window.freighter!.isAllowed();
          if (isAllowed) {
            const isConnected = await window.freighter!.isConnected();
            if (isConnected) {
              const publicKey = await window.freighter!.getPublicKey();
              setWallet({ publicKey, isConnected: true });
              
              if (contractInfo.id) {
                await fetchBalance(publicKey);
              }
            }
          }
        } catch (error) {
          console.error('Error verificando conexión:', error);
        }
      }
    };

    checkConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <span className="header-icon">🚀</span>
          Token BDB - Buen Día Builders
        </div>
        <button
          className="connect-wallet-btn"
          onClick={connectWallet}
          disabled={isLoading || wallet.isConnected}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Conectando...
            </>
          ) : wallet.isConnected ? (
            <>🔗 Conectado</>
          ) : (
            <>🔗 Conectar Freighter</>
          )}
        </button>
      </header>

      <div className="content-grid">
        <div className="card">
          <h2 className="card-title">💰 Tu Balance</h2>
          <p className="balance-label">Buen Día Token (BDB)</p>
          <div className="balance-amount">{balance}</div>
          <button
            className="refresh-btn"
            onClick={() => fetchBalance()}
            disabled={isLoading || !wallet.isConnected || !contractInfo.id}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Actualizando...
              </>
            ) : (
              <>🔄 Actualizar Balance</>
            )}
          </button>
          {!wallet.isConnected && (
            <div className="warning-message">⚠️ Conecta tu wallet primero</div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">🪙 Mintear Tokens</h2>
          <input
            type="number"
            className="mint-input"
            placeholder="Cantidad (ej: 1000)"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            disabled={isLoading || !wallet.isConnected}
          />
          <button
            className={`mint-btn ${wallet.isConnected && mintAmount ? 'active' : ''}`}
            onClick={mintTokens}
            disabled={isLoading || !wallet.isConnected || !mintAmount || !contractInfo.id}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Minteando...
              </>
            ) : (
              'Mintear BDB'
            )}
          </button>
          {!wallet.isConnected && (
            <div className="warning-message">⚠️ Conecta tu wallet primero</div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">ℹ️ Información del Contrato</h2>
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Contract ID:</span>
            <span className={`info-value ${!contractInfo.id ? 'pending' : ''}`}>
              {contractInfo.id || 'Pendiente de configurar'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Network:</span>
            <span className="info-value">{contractInfo.network}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Supply:</span>
            <span className="info-value">{contractInfo.totalSupply}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tu Address:</span>
            <span className="info-value">
              {wallet.publicKey 
                ? `${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-8)}`
                : 'No conectado'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="steps-card">
        <h2 className="steps-title">📋 Pasos para conectar Freighter</h2>
        <ol className="steps-list">
          <li className="step-item">
            Busca el ícono de Freighter en tus extensiones (puzzle 🧩 arriba a la derecha)
          </li>
          <li className="step-item">Haz clic en Freighter para abrirla</li>
          <li className="step-item">
            Asegúrate de estar en <strong>Testnet</strong> (Settings → Network → Testnet)
          </li>
          <li className="step-item">Vuelve a esta página</li>
          <li className="step-item">Haz clic en "Conectar Freighter"</li>
          <li className="step-item">Aprueba la conexión en el popup de Freighter</li>
        </ol>
      </div>

      <footer className="footer">
        <p className="footer-text">Construido con 💙 por Niki</p>
        <p className="footer-brand">🚀 Buen Día Builders - Clase 6</p>
      </footer>
    </div>
  );
}

export default App;