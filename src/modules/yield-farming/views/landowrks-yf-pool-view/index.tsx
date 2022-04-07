import React, { FC, useEffect, useState } from 'react';
import cn from 'classnames';

import Spin from 'components/antd/spin';
import { Tabs } from 'components/custom/tabs';
import LandoworksPoolStatistics from 'modules/yield-farming/components/landworks-pool-statistics';
import LandworksPoolTransactions from 'modules/yield-farming/components/landworks-pool-transactions';

import LandworksPoolHeader from '../../components/landworks-pool-header';
import LandworksPoolStake from '../../components/landworks-pool-stake';
import LandowrksYfProvider, { useLandworksYf } from '../../providers/landworks-yf-provider';

import s from './s.module.scss';

export const TABS = {
  STAKE: 'stake',
  UNSTAKE: 'unstake',
};

const LandworksYfPoolViewInner: FC = () => {
  const yfPoolCtx = useLandworksYf();

  const { landworksYf } = yfPoolCtx;

  const [activeTab, setActiveTab] = useState('stake');

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  const isInitialized = true;

  return (
    <div className="content-container-fix content-container">
      <LandworksPoolHeader />
      <Spin spinning={!isInitialized} wrapperClassName="mb-32">
        <div className="flexbox-grid">
          <div className={cn('card', s.stakeCard)}>
            <div className={cn('card-header pv-0', s.stakeCardHeader)}>
              <Tabs
                tabs={[
                  {
                    id: TABS.STAKE,
                    children: 'Stake',
                    disabled: false,
                  },
                  {
                    id: TABS.UNSTAKE,
                    children: 'Unstake',
                  },
                ]}
                size="small"
                activeKey={activeTab}
                onClick={setActiveTab}
              />
            </div>
            <div className="p-24">
              {activeTab === TABS.STAKE && <LandworksPoolStake tab={activeTab} />}
              {activeTab === TABS.UNSTAKE && <LandworksPoolStake tab={activeTab} />}
            </div>
          </div>
          <LandoworksPoolStatistics />
        </div>
      </Spin>
      <LandworksPoolTransactions />
    </div>
  );
};

const LandworksYfPoolView: FC = () => {
  return (
    <LandowrksYfProvider>
      <LandworksYfPoolViewInner />
    </LandowrksYfProvider>
  );
};

export default LandworksYfPoolView;
