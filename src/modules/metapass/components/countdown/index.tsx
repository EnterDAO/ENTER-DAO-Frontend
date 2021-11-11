import React, { FC, useState } from 'react';
import Countdown from 'react-countdown';

import './index.scss';

interface props {
  preSaleStartDate: any;
  publicSaleStartDate: any;
}

const STATES = {
  BEFORE_PRE_SALE: 'Pre-sale starts in: ',
  PRE_SALE_IS_LIVE: 'Pre-sale is live!',
  DURING_PRE_SALE: 'Public sale starts in: ',
  PUBLIC_SALE: 'Public sale is live!',
};

const CountdownComponent: FC<props> = props => {
  const { preSaleStartDate, publicSaleStartDate } = props;
  const before = () => Date.now() < preSaleStartDate;
  const presale = () => Date.now() > preSaleStartDate && Date.now() < publicSaleStartDate;
  const isPublic = () => !before() && !presale();
  const getState = () => (before() ? STATES.BEFORE_PRE_SALE : presale() ? STATES.PRE_SALE_IS_LIVE : STATES.PUBLIC_SALE);
  const getEndDate = () => (before() ? preSaleStartDate : presale() ? publicSaleStartDate : null);
  const [state, setState] = useState(getState());
  const [endDate, setEndDate] = useState(getEndDate());

  return (
    <div className="countdown-container">
      <span className="counter-state" style={{ display: before() ? 'inline-block' : 'block', marginRight: '10px' }}>
        {state}
      </span>
      {!isPublic() && (
        <>
          {presale() && <span className="counter-state">{STATES.DURING_PRE_SALE}</span>}
          <Countdown
            key={endDate}
            daysInHours={true}
            className="countdown"
            date={endDate}
            onComplete={() => {
              setState(getState());
              setEndDate(getEndDate());
            }}
          />
        </>
      )}
    </div>
  );
};

export default CountdownComponent;
