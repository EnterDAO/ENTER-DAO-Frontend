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
  return (
    <div className={s.block}>
      <Text type="p2" color="secondary">
        {`${shortenAddr(wallet.account, 5, 3)} have successfully redeemed ${entrAmount} ENTR for ${ethAmount} ETH`}
      </Text>
      {/* TODO replace when you get real tx hash */}
      <ExternalLink
        style={{ color: 'white' }}
        href={getEtherscanTxUrl('0x94AA6CF540CE63ECA0499E9537784665FB13B24DCA3FE3ACB62308A2C9C65C69')}>
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
