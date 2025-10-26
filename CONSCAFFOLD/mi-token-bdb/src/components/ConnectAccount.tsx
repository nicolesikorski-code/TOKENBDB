import React from 'react';
import { Button } from '@stellar/design-system';
import { useWallet } from '../providers/WalletProvider';

const ConnectAccount: React.FC = () => {
  const { isConnected, publicKey, connect, disconnect } = useWallet();

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : 'Connected'}
        </span>
        <Button variant="tertiary" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={connect}>
      Connect Wallet
    </Button>
  );
};

export default ConnectAccount;
