import React, { FC, useState } from 'react';
import BigNumber from 'bignumber.js';
import cn from 'classnames';
import TxConfirmModal, { ConfirmTxModalArgs } from 'web3/components/tx-confirm-modal';
import Erc20Contract from 'web3/erc20Contract';
import { formatToken, formatUSD } from 'web3/utils';

import Spin from 'components/antd/spin';
import Tooltip from 'components/antd/tooltip';
import Icon from 'components/custom/icon';
import { Tabs as ElasticTabs } from 'components/custom/tabs';
import { Text } from 'components/custom/typography';
import { EnterToken, convertTokenInUSD, useKnownTokens } from 'components/providers/known-tokens-provider';
import { YfPoolContract } from 'modules/yield-farming/contracts/yfPool';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';
import { useWallet } from 'wallets/wallet';

import { useYFPool } from '../../providers/pool-provider';
import { useYFPools } from '../../providers/pools-provider';

import s from './s.module.scss';
import { YfNftStakingContract } from 'modules/yield-farming/contracts/yfNftStaking';

const LandoworksPoolStatistics: FC = () => {
  const landworksCtx = useLandworksYf();

  const { landworksYf } = landworksCtx;
  const knownTokensCtx = useKnownTokens();
  const walletCtx = useWallet();
  // const yfPoolsCtx = useYFPools();
  // const yfPoolCtx = useYFPool();

  // const { poolMeta } = yfPoolCtx;

  // const [activeToken, setActiveToken] = useState(poolMeta?.tokens[0]);
  const [claiming, setClaiming] = useState(false);
  const [confirmClaimVisible, setConfirmClaimVisible] = useState(false);

  const entrContract = EnterToken.contract as Erc20Contract;
  //  const activeContract = activeToken?.contract as Erc20Contract;

  if (!walletCtx.isActive) {
    return null;
  }

  //const { lastActiveEpoch } = poolMeta.contract;

  //const selectedStakedToken = yfPoolsCtx.stakingContract?.stakedTokens.get(activeToken?.address!);

  function handleTabSelect(tokenSymbol: string) {
    const tokenMeta = knownTokensCtx.getTokenBySymbol(tokenSymbol);
    //setActiveToken(tokenMeta);
  }

  function handleClaim() {
    setConfirmClaimVisible(true);
  }

  const confirmClaim = async <A extends ConfirmTxModalArgs>(args: A) => {
    setConfirmClaimVisible(false);
    setClaiming(true);

    try {
      await landworksYf.getReward(args.gasPrice);
      entrContract.loadBalance().catch(Error);
      (landworksYf as YfNftStakingContract).loadCommon().catch(Error);
    } catch {}

    setClaiming(false);
  };

  const isEnded = false;

  return (
    <div className={cn(s.component, 'flex flow-row')}>
      <div className="card mb-24">
        <div className="card-header">
          <Text type="p1" weight="semibold" color="primary">
            My rewards
          </Text>
        </div>
        <div className="p-24">
          <div className="flex align-center justify-space-between mb-24">
            <Text type="small" weight="semibold" color="secondary">
              {EnterToken.symbol} balance
            </Text>
            <div className="flex align-center">
              <Icon name={EnterToken.icon!} width={16} height={16} className="mr-8" />
              <Text type="p1" weight="semibold" color="primary">
                {formatToken(entrContract.balance?.unscaleBy(EnterToken.decimals)) ?? '-'}
              </Text>
            </div>
          </div>
          {!isEnded && (
            <div className="flex align-center justify-space-between">
              <Text type="small" weight="semibold" color="secondary">
                Potential reward per week
              </Text>
              <div className="flex align-center">
                <Icon name={EnterToken.icon!} width={16} height={16} className="mr-8" />
                <Text type="p1" weight="semibold" color="primary">
                  {formatToken(landworksYf.potentialRewardPerWeek) ?? '-'}
                </Text>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className={cn('flex align-center justify-space-between', s.claimBlock)}>
            <div className="flex flow-row">
              <div className="flex align-center mb-4">
                <Tooltip
                  title={
                    formatToken(landworksYf.earned, {
                      decimals: EnterToken.decimals,
                    }) ?? '-'
                  }>
                  <Text
                    type="h2"
                    weight="semibold"
                    color="primary"
                    className="mr-8 text-ellipsis"
                    style={{ maxWidth: '120px' }}>
                    {formatToken(landworksYf.earned, {
                      decimals: EnterToken.decimals,
                    }) ?? '-'}
                  </Text>
                </Tooltip>
                <Icon name={EnterToken.icon!} width={24} height={24} />
              </div>
              <Text type="small" weight="semibold" color="secondary">
                Current reward
              </Text>
            </div>
            <button
              type="button"
              className="button-primary"
              disabled={!landworksYf.earned || claiming}
              onClick={handleClaim}>
              {claiming && <Spin spinning />}
              Claim reward
            </button>
          </div>
        </div>
      </div>

      <div className="card flex-grow">
        <div className="card-header">
          <Text type="p1" weight="semibold" color="primary">
            My stake
          </Text>
        </div>
        <div className="p-24">
          <div className="flex flow-row">
            <div className="flex align-center justify-space-between mb-24">
              <Text type="small" weight="semibold" color="secondary">
                Staked NFTs
              </Text>
            </div>
          </div>
        </div>
      </div>

      {confirmClaimVisible && (
        <TxConfirmModal
          title="Confirm your claim"
          header={
            <div className="flex col-gap-8 align-center justify-center">
              <Text type="h2" weight="semibold" color="primary">
                {formatToken(landworksYf.earned) ?? '-'}
              </Text>
              <Icon name={EnterToken.icon!} width={32} height={32} />
            </div>
          }
          submitText="Claim"
          onCancel={() => setConfirmClaimVisible(false)}
          onConfirm={confirmClaim}
        />
      )}
    </div>
  );
};

export default LandoworksPoolStatistics;
