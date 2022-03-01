import { Text } from 'components/custom/typography';

import airdropClaimedImg from 'resources/png/airdropClaimed.png';

import s from './AirdropClaimed.module.scss';


const AirdropClaimed = () => {
  return (
    <div className={s.block}>
      <img src={airdropClaimedImg} alt="airdrop Claimed Img" />
      <Text type="p2" color="secondary">
        You have already claimed your airdrop reward
      </Text>
    </div>
  )
}

export default AirdropClaimed;
