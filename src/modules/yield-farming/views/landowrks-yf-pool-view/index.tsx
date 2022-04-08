import React, { FC, useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import Spin from 'components/antd/spin';
import { Tabs } from 'components/custom/tabs';
import LandoworksPoolStatistics from 'modules/yield-farming/components/landworks-pool-statistics';
import LandworksPoolTransactions from 'modules/yield-farming/components/landworks-pool-transactions';

import LandworksPoolHeader from '../../components/landworks-pool-header';
import LandworksPoolStake from '../../components/landworks-pool-stake';
import LandowrksYfProvider, { useLandworksYf } from '../../providers/landworks-yf-provider';

import s from './s.module.scss';
import LandworksYfStakeModal from '../../components/landworks-yf-stake-modal';

export const TABS = {
  STAKE: 'stake',
  UNSTAKE: 'unstake',
};

const LandworksYfPoolViewInner: FC = () => {
  const [activeTab, setActiveTab] = useState('stake');
  const [modalOpen, setModalOpen] = useState(false);
  const [hasUnclaimedRent, setHasUnclaimedRent] = useState(false);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  const isInitialized = true;

  const handleStake = (hasUnclaimedRent: boolean) => {
    setHasUnclaimedRent(hasUnclaimedRent);
    setModalOpen(true);
  };

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
              {activeTab === TABS.STAKE && <LandworksPoolStake onStake={handleStake} tab={activeTab} />}
              {activeTab === TABS.UNSTAKE && <LandworksPoolStake onStake={handleStake} tab={activeTab} />}
            </div>
          </div>
          <LandoworksPoolStatistics />
        </div>
      </Spin>
      <LandworksPoolTransactions />
      {modalOpen && (
        <LandworksYfStakeModal
          hasUnclaimedRent={hasUnclaimedRent}
          onOk={async () => {
            // TODO: Execute function from child component
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      )}
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
