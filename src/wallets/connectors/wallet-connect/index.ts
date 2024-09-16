import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from 'wallets/connectors/wallet-connect/v2';

import config from 'config';
import WalletConnectLogo from 'resources/svg/wallets/walletconnect-logo.svg';

import { WalletConnector } from 'wallets/types';

export class UnsupportedChainsWalletConnectError extends Error {
  constructor() {
    super(`Unsupported chains.`);
  }
}

const WalletConnectConfig: WalletConnector = {
  id: 'walletconnect',
  logo: WalletConnectLogo,
  name: 'WalletConnect',
  factory(chainId: number): AbstractConnector {
    return new WalletConnectConnector({
      projectId: config.web3.wallets.walletConnect.appId,
      metadata: {
        name: config.web3.wallets.walletConnect.appName,
        description: "",
        url: config.web3.wallets.walletConnect.appUrl,
        icons: [],
      },
      showQrModal: true,
      chains: [chainId],
      rpcMap: {
        [chainId]: config.web3.rpc.httpsUrl,
      },
    });
  },
  onDisconnect(connector?: WalletConnectConnector): void {
    connector?.deactivate();
  },
  onError(error: Error): Error | undefined {
    // the error is thrown when the user closes the modal
    if (error.message.includes('Connection request reset')) return;
    // the error is thrown when the user reject the connection request
    if (error.message.includes('User rejected methods')) return;
    // the error is thrown when user's active chain is not supported by the app.
    if (error.message.includes('Unsupported chains')) return new UnsupportedChainsWalletConnectError();

    return error;
  },
};

export default WalletConnectConfig;
