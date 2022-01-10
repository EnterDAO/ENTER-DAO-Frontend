import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { formatPercent, formatToken } from 'web3/utils';

import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { EnterToken } from 'components/providers/known-tokens-provider';
import { LandWorksToken } from 'components/providers/known-tokens-provider';
import { UseLeftTime } from 'hooks/useLeftTime';
import { useDAO } from 'modules/governance/components/dao-provider';
import { useWallet } from 'wallets/wallet';

import s from './s.module.scss';

const LandworksYfCard: FC = () => {
  const walletCtx = useWallet();
  const daoCtx = useDAO();
  const { daoReward, landworksYf } = daoCtx;

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
          <Link to="/governance/wallet/deposit" className="button-primary">
            Deposit
          </Link>
        )}
      </div>
      <div className="card-row card-row-border p-24">
        <Text type="lb2" weight="semibold" color="secondary">
          {LandWorksToken.symbol} NFTs Staked
        </Text>
        <div className="flex flow-col">
          <Icon name="png/landworks" className="mr-4" />
          <Text type="p1" weight="semibold" color="primary">
            {formatToken(landworksYf.totalSupply) ?? '-'}
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
              {formatToken(landworksYf.balance) ?? '-'}
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
