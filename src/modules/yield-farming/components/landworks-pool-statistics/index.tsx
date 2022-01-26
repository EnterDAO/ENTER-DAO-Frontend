import React, { FC, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import TxConfirmModal, { ConfirmTxModalArgs } from 'web3/components/tx-confirm-modal';
import Erc20Contract from 'web3/erc20Contract';
import { formatToken } from 'web3/utils';
import Web3Contract from 'web3/web3Contract';

import Spin from 'components/antd/spin';
import Tooltip from 'components/antd/tooltip';
import Icon, { IconNames } from 'components/custom/icon';
import IconsSet from 'components/custom/icons-set';
import { Text } from 'components/custom/typography';
import { EnterToken } from 'components/providers/known-tokens-provider';
import { YfNftStakingContract } from 'modules/yield-farming/contracts/yfNftStaking';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';
import { useWallet } from 'wallets/wallet';

import { UserStakedAssetsWithData, fetchAssetsById, fetchStakedAssets, getDecentralandAssetName } from '../../api';

import s from './s.module.scss';

const LandoworksPoolStatistics: FC = () => {
  const landworksCtx = useLandworksYf();
  const { account } = useWallet();

  const { landworksYf } = landworksCtx;
  const walletCtx = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [confirmClaimVisible, setConfirmClaimVisible] = useState(false);
  const [stakedAssets, setStakedAssets] = useState<UserStakedAssetsWithData[]>([]);

  const entrContract = EnterToken.contract as Erc20Contract;

  function handleClaim() {
    setConfirmClaimVisible(true);
  }

  const getStakedAssets = async () => {
    try {
      const assets = await fetchStakedAssets(account || '');
      const assetData = await fetchAssetsById(assets.map(a => a.tokenId));
      setStakedAssets(assetData);
    } catch (e) {
      console.log('Error while trying to fetch staked user assets !', e);
    }
  };

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

  useEffect(() => {
    if (account) {
      getStakedAssets();
    }
  }, [account]);

  useMemo(() => {
    if (account) {
      landworksYf.on(Web3Contract.UPDATE_DATA, getStakedAssets);
    }
  }, [account]);

  if (!walletCtx.isActive) {
    return null;
  }

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
                      decimals: 2,
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
            <div className="flex align-center justify-space-between mb-12">
              <Text type="small" weight="semibold" color="secondary">
                Staked NFTs
              </Text>
            </div>
            {stakedAssets.map(asset => {
              const name = getDecentralandAssetName(asset.decentralandData);
              return (
                <div className="flex align-center mb-15" key={name}>
                  <IconsSet
                    icons={['png/landworks'].map(icon => (
                      <Icon key={icon} name={icon as IconNames} />
                    ))}
                    className="mr-16"
                  />
                  <div>
                    <Text type="p1" weight="semibold" color="primary" className="mb-4">
                      {name}
                    </Text>
                  </div>
                </div>
              );
            })}
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
