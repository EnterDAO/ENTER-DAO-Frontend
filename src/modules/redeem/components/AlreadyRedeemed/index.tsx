import { getEtherscanTxUrl, shortenAddr } from 'web3/utils';

import ExternalLink from 'components/custom/externalLink';
import { Text } from 'components/custom/typography';
import etherscanLink from 'resources/png/etherscan-link.svg';
import { useWallet } from 'wallets/wallet';

import s from './AlreadyRedeemed.module.scss';

interface AlreadyRedeemedProps {
  entrAmount: string;
  ethAmount: string;
}
const AlreadyRedeemed: React.FC<AlreadyRedeemedProps> = ({ entrAmount, ethAmount }) => {
  const wallet = useWallet();
  const txHash = localStorage.getItem('transactionHash');
  return (
    <div className={s.block}>
      <Text type="p2" color="secondary">
        {`${shortenAddr(wallet.account, 5, 3)} have successfully redeemed ${entrAmount} ENTR for ${ethAmount} ETH`}
      </Text>
      <ExternalLink style={{ color: 'white' }} href={getEtherscanTxUrl(txHash!)}>
        View on Etherscan
        <img width={20} height={20} src={etherscanLink} alt="etherscan link img" />
      </ExternalLink>{' '}
      <Text type="p2" color="secondary">
        Thank you for being part of EnterDAO!
      </Text>
    </div>
  );
};

export default AlreadyRedeemed;
