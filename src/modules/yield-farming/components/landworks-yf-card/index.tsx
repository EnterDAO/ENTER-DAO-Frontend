import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { formatPercent, formatToken } from 'web3/utils';

import Icon from 'components/custom/icon';
import { Hint, Text } from 'components/custom/typography';
import { convertTokenInUSD, EnterToken, KnownTokens, useKnownTokens } from 'components/providers/known-tokens-provider';
import { LandWorksToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';
import { useWallet } from 'wallets/wallet';

import s from './s.module.scss';
import { fetchDecentralandFloor, fetchStakedAssets } from '../../api';
import BigNumber from 'bignumber.js';

const LandworksYfCard: FC = () => {
  const walletCtx = useWallet();
  const landworksCtx = useLandworksYf();
  const knownTokensCtx = useKnownTokens();
  const { landworksYf, landworksContract } = landworksCtx;

  const [apr, setApr] = useState<BigNumber | number | undefined>(undefined);
  const [userTokensStaked, setUserTokensStaked] = useState<BigNumber | number | undefined>(undefined);

  const updateApr = async () => {
    const { periodFinish, totalSupply, rewardForDuration } = landworksYf;
    const landFloor = await fetchDecentralandFloor();
    const landFloorUsdc = convertTokenInUSD(landFloor, KnownTokens.ETH);
    const durationReward = convertTokenInUSD(rewardForDuration, KnownTokens.ENTR);

    if (
      !landFloorUsdc ||
      !totalSupply ||
      !landFloor ||
      !durationReward ||
      !periodFinish ||
      periodFinish < Date.now() / 1_000
    ) {
      setApr(undefined);
      return;
    }

    setApr(durationReward.div(landFloorUsdc.multipliedBy(totalSupply)));
  };

  const updateUserStakedTokens = async (address?: string) => {
    if (!address) {
      setUserTokensStaked(undefined);
      return;
    }

    const userStakedStakedTokens = await fetchStakedAssets(address);
    setUserTokensStaked(userStakedStakedTokens.length);
  };

  useEffect(() => {
    updateApr();
  }, [landworksYf.rewardForDuration, landworksYf.periodFinish, knownTokensCtx.tokens]);

  useEffect(() => {
    updateUserStakedTokens(walletCtx.account);
  }, [walletCtx.account]);

  return (
    <div className="card">
      <div className={cn('card-header', s.cardTitleContainer)}>
        <div className={s.cardTitleTexts}>
          <Icon name="png/landworks" width={40} height={40} className="mr-4" />
          <Text type="p1" weight="semibold" color="primary" ellipsis>
            LandWorks
          </Text>
        </div>
        {walletCtx.isActive && (
          <Link to="/yield-farming/landworks" className="button-primary">
            Deposit
          </Link>
        )}
      </div>
      <div className="card-row card-row-border p-24">
        <Hint
          className="mb-4"
          text={
            <span>
              This number shows the APR for depositing LandWorks NFT wrapping one parcel (Decentraland LAND). When
              depositing LandWorks NFTs your reward is calculated based on the number of parcels you are depositing. In
              the case when you are depositing LandWorks NFT wrapping Estates, you will yield the displayed APR for
              every parcel in the Estate.
            </span>
          }>
          <Text type="lb2" weight="semibold" color="secondary">
            APR
          </Text>
        </Hint>
        <div className="flex flow-col">
          <Text type="p1" weight="semibold" color="primary">
            {formatPercent(apr) ?? '-'}
          </Text>
        </div>
      </div>
      <div className="card-row card-row-border p-24">
        <Text type="lb2" weight="semibold" color="secondary">
          {LandWorksToken.symbol} NFTs Staked
        </Text>
        <div className="flex flow-col">
          <Icon name="png/landworks" className="mr-4" />
          <Text type="p1" weight="semibold" color="primary">
            {formatToken(landworksContract.getBalanceOf(config.contracts.yf.landworks)) ?? '-'}
          </Text>
        </div>
      </div>
      {walletCtx.isActive && (
        <div className="card-row card-row-border p-24">
          <Text type="lb2" weight="semibold" color="secondary">
            My LandWorks NFTs Staked
          </Text>
          <div className="flex flow-col">
            <Icon name="png/landworks" className="mr-4" />
            <Text type="p1" weight="semibold" color="primary">
              {formatToken(userTokensStaked) ?? '-'}
            </Text>
          </div>
        </div>
      )}
      <div className="card-row card-row-border p-24">
        <div className="flex flow-row">
          <Text type="lb2" weight="semibold" color="secondary" className="mb-4">
            {EnterToken.symbol} Rewards
          </Text>
          <Text type="p2" color="secondary">
            out of {formatToken(landworksYf.rewardForDuration)}
          </Text>
        </div>
        <div className="flex flow-col">
          <Icon name="png/enterdao" className="mr-4" />
          <Text type="p1" weight="bold" color="primary">
            {formatToken(landworksYf.rewards)}
          </Text>
        </div>
      </div>
      {walletCtx.isActive && (
        <div className="card-row card-row-border p-24">
          <Text type="lb2" weight="semibold" color="secondary">
            My {EnterToken.symbol} Rewards
          </Text>
          <div className="flex flow-col">
            <Icon name="png/enterdao" className="mr-4" />
            <Text type="p1" weight="semibold" color="primary">
              {formatToken(landworksYf.earned) ?? '-'}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandworksYfCard;
