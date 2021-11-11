import React, { FC } from 'react';
import Marquee from "react-fast-marquee";
interface props {
    speed: number;
    pauseOnHover: boolean;
}

const MarqueeComponent: FC<props> = props => {
    const {speed, pauseOnHover, children } = props;

    return (
        <Marquee speed={speed} pauseOnHover={pauseOnHover}>
            {children}
        </Marquee>
    );
};

export default MarqueeComponent;
