import React, { FC } from 'react';
import Marquee from 'react-fast-marquee';

import MarqueeFogComponent from '../marquee-fog';

interface props {
  speed: number;
  pauseOnHover: boolean;
  gradient: boolean;
}

const MarqueeComponent: FC<props> = props => {
  const { speed, pauseOnHover, children, gradient } = props;

  return (
    <>
      <Marquee speed={speed} gradient={gradient} pauseOnHover={pauseOnHover}>
        {children}
      </Marquee>
      <MarqueeFogComponent />
    </>
  );
};

export default MarqueeComponent;
