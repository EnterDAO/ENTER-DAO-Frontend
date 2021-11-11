import React, { FC } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

interface quantityProps {
  labelText: string,
  min: number,
  max: number,
  value: number,
  onChange: func,
}

const QuantityUpDownGroup: FC<quantityProps> = props => {
  const { labelText, min, max, value, onChange, btnLeftText, btnRightText } = props;
  const upClick = (val, setVal) => {
    if (val < max) setVal(val + 1);
  };
  const downClick = (val, setVal) => {
    if (val > min) setVal(val - 1);
  };
  return (
    <div className={`quantity--input--group`}>
      <div className="label--block">
        <p>{labelText} : </p>
      </div>
      <div className="controll-box">
        <button type="button" className="btn--down" onClick={() => downClick(value, onChange)}>
          -
        </button>
        <div className="value">{value}</div>
        <button type="button" className="btn--up" onClick={() => upClick(value, onChange)}>
          +
        </button>
      </div>
    </div>
  );
};

export default QuantityUpDownGroup;
