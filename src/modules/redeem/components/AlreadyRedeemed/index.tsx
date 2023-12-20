import { Text } from 'components/custom/typography';

import alreadyRedeemedImg from 'resources/png/airdropClaimed.png';

import s from './AlreadyRedeemed.module.scss';


const AlreadyRedeemed = () => {
  return (
    <div className={s.block}>
      <img src={alreadyRedeemedImg} alt="Already Redeemed Img" />
      <Text type="p2" color="secondary">
        You have already redeemed your ENTR for ETH
      </Text>
    </div>
  )
}

export default AlreadyRedeemed;
