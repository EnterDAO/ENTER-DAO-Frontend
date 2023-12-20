import Lottie from 'lottie-react';

import { Text } from 'components/custom/typography';
import { useWallet } from 'wallets/wallet';

import walletImg from '../../animations/Wallet.svg';

import s from './NotConnectWallet.module.scss';

const NotConnectWallet = () => {
  const wallet = useWallet();

  const handleConnect = () => {
    wallet.showWalletsModal();
  };

  return (
    <div className={s.block}>
      <img src={walletImg} alt="Wallet" />
      <Text type="p2" color="secondary" className={s.text}>
        To check if you are eligible for a piece of the treasury, connect your wallet.
      </Text>
      <button className="button-primary" onClick={handleConnect}>
        Connect wallet
      </button>
    </div>
  );
};

export default NotConnectWallet;
