import Lottie from 'lottie-react';
import { useWallet } from 'wallets/wallet';

import { Text } from 'components/custom/typography';

import walletAnimation from '../../animations/Wallet.json';

import s from './NotConnectWallet.module.scss';

const NotConnectWallet = () => {
  const wallet = useWallet();

  const handleConnect = () => {
    wallet.showWalletsModal()
  }

  return (
    <div className={s.block}>
      <Lottie
        className={s.animation}
        animationData={walletAnimation}
      />
      <Text type="p2" color="secondary" className={s.text}>
        To check if you are eligible for the airdrop, connect your wallet.
      </Text>
      <button
        className="button-primary"
        onClick={handleConnect}
      >
        Connect wallet
      </button>
    </div>
  )
}

export default NotConnectWallet;
