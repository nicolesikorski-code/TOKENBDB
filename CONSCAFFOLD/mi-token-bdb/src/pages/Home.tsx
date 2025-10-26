import React from 'react';
import { Button, Card, Heading, Text } from '@stellar/design-system';
import { useWallet } from '../providers/WalletProvider';

const Home: React.FC = () => {
  const { isConnected, publicKey } = useWallet();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Heading as="h1" size="lg" style={{ marginBottom: '20px' }}>
        Token BDB - Buen Día Token
      </Heading>
      
      <Card style={{ marginBottom: '20px' }}>
        <Heading as="h2" size="md" style={{ marginBottom: '10px' }}>
          Estado de la Wallet
        </Heading>
        <Text>
          {isConnected ? (
            <>Wallet conectada: <code>{publicKey}</code></>
          ) : (
            'Wallet no conectada'
          )}
        </Text>
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <Heading as="h2" size="md" style={{ marginBottom: '10px' }}>
          Funciones del Token
        </Heading>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="primary" disabled={!isConnected}>
            Inicializar Token
          </Button>
          <Button variant="secondary" disabled={!isConnected}>
            Mintear Tokens
          </Button>
          <Button variant="secondary" disabled={!isConnected}>
            Transferir
          </Button>
          <Button variant="secondary" disabled={!isConnected}>
            Consultar Balance
          </Button>
        </div>
      </Card>

      <Card>
        <Heading as="h2" size="md" style={{ marginBottom: '10px' }}>
          Información del Contrato
        </Heading>
        <Text>
          <strong>Nombre:</strong> Buen Día Token<br/>
          <strong>Símbolo:</strong> BDB<br/>
          <strong>Decimales:</strong> 7<br/>
          <strong>Red:</strong> Testnet
        </Text>
      </Card>
    </div>
  );
};

export default Home;
