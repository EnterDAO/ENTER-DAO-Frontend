import React, { FC } from 'react';

import './index.scss';

interface sliderProps {
  min: number;
  max: number;
  value: number;
  color1: string;
  color2: string;
}

const horizontalSlider: FC<sliderProps> = props => {
  const { min, max, value, color1, color2 } = props;

  const calculate = (value: number, max: number, min: number): number => {
    if (value > max) return 100;
    if (value < min) return 0;
    return ((value - min) * 100) / (max - min);
  };

  return (
    <div className="parent--horizontall--slider">
      <div className="child--horizontall--slider" style={{ width: `${calculate(value, max, min)}%` }} />
      <p
        className="horizontall--scroll--value"
        style={{
          width: `${calculate(value, max, min) > 30 ? calculate(value, max, min) : 30}%`,
          color: calculate(value, max, min) < 7 ? color1 : color2,
        }}>
        {value < max ? <span> {`${value}/${max}`} minted</span> : <span>Sold out</span>}
      </p>
    </div>
  );
};

export default horizontalSlider;
