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

export const boldWhiteStyle: React.CSSProperties = {
  color: 'white',
  fontWeight: 700,
  textTransform: 'none' as const,
  fontSize: '24px',
  lineHeight: '36px',
};

export const whiteStyle: React.CSSProperties = {
  color: 'white',
  textTransform: 'none' as const,
  fontWeight: 300,
  fontSize: '24px',
  lineHeight: '36px',
};

const AlreadyRedeemed: React.FC<AlreadyRedeemedProps> = ({ entrAmount, ethAmount }) => {
  const wallet = useWallet();
  const txHash = localStorage.getItem('transactionHash');

  return (
    <div className={s.block}>
      <Text type="p2" color="secondary" style={{ fontSize: '24px', margin: '50px 0' }}>
        <span style={boldWhiteStyle}>{shortenAddr(wallet.account, 5, 3)}</span>
        <span style={whiteStyle}> have successfully</span>
        <br />
        <span style={whiteStyle}> redeemed</span>
        <span style={boldWhiteStyle}> {entrAmount} ENTR</span>
        <span style={whiteStyle}> for</span> <span style={boldWhiteStyle}>{ethAmount} ETH</span>
      </Text>
      <div style={{ marginTop: '50px' }}>
        <ExternalLink
          style={{ color: 'white', fontSize: '16px' }}
          href={getEtherscanTxUrl(txHash!)}
          className={s.external__link}>
          View on Etherscan
          <img width={20} height={20} src={etherscanLink} alt="etherscan link img" />
        </ExternalLink>{' '}
        <Text style={{ marginTop: '15px', color: 'white', fontSize: '16px' }} type="p2" color="secondary">
          Thank you for being part of EnterDAO!
        </Text>
      </div>
    </div>
  );
};

export default AlreadyRedeemed;
