import React, { useState } from 'react';
import { Button, Card, Heading, Text, Input } from '@stellar/design-system';
import { useWallet } from '../providers/WalletProvider';

const Debugger: React.FC = () => {
  const { isConnected, publicKey } = useWallet();
  const [contractId, setContractId] = useState('CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('');

  const executeFunction = () => {
    console.log('Ejecutando función:', {
      contractId,
      functionName,
      args: args.split(',').map(arg => arg.trim())
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Heading as="h1" size="lg" style={{ marginBottom: '20px' }}>
        Debugger de Contratos
      </Heading>
      
      <Card style={{ marginBottom: '20px' }}>
        <Heading as="h2" size="md" style={{ marginBottom: '10px' }}>
          Configuración
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <Text as="label" style={{ display: 'block', marginBottom: '5px' }}>
              Contract ID:
            </Text>
            <Input
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <Text as="label" style={{ display: 'block', marginBottom: '5px' }}>
              Función:
            </Text>
            <Input
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder="initialize, mint, transfer, etc."
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <Text as="label" style={{ display: 'block', marginBottom: '5px' }}>
              Argumentos (separados por comas):
            </Text>
            <Input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="arg1, arg2, arg3"
              style={{ width: '100%' }}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={executeFunction}
            disabled={!isConnected || !contractId || !functionName}
          >
            Ejecutar Función
          </Button>
        </div>
      </Card>

      <Card>
        <Heading as="h2" size="md" style={{ marginBottom: '10px' }}>
          Estado de la Wallet
        </Heading>
        <Text>
          {isConnected ? (
            <>Conectada: <code>{publicKey}</code></>
          ) : (
            'No conectada - Conecta tu wallet para usar el debugger'
          )}
        </Text>
      </Card>
    </div>
  );
};

export default Debugger;
