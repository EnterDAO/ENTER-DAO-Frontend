import Lottie from 'lottie-react';

import { Text } from 'components/custom/typography';

import lockAnimation from '../../animations/Lock_not_eligible_icon.json';

import s from './NotEligible.module.scss';


const NotEligible = () => {
  return (
    <div className={s.block}>
      <Lottie
        className={s.animation}
        animationData={lockAnimation}
      />
      <Text type="p2" color="secondary">
        Sorry, you are not eligible for this airdrop.
      </Text>
    </div>
  )
}

export default NotEligible;
