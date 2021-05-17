import React, { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, formatUSD } from 'web3/utils';

import Icon, { IconNames } from 'components/custom/icon';
import IconsSet from 'components/custom/icons-set';
import { Text } from 'components/custom/typography';

import { useYFPool } from '../../providers/pool-provider';

const PoolHeader: FC = () => {
  const yfPoolCtx = useYFPool();

  const { poolMeta, poolBalance, effectivePoolBalance } = yfPoolCtx;

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  if (!poolMeta) {
    return null;
  }

  return (
    <>
      <Link to="/yield-farming" className="flex inline align-center mb-16">
        <Icon name="arrow-back" width={14} height={14} className="mr-8" />
        <Text type="p1" weight="semibold" color="secondary">
          Pools
        </Text>
      </Link>
      <div className="flex align-center mb-40">
        <IconsSet
          icons={poolMeta.icons.map(icon => (
            <Icon key={icon} name={icon as IconNames} />
          ))}
          className="mr-16"
        />
        <div>
          <Text type="p1" weight="semibold" color="primary" className="mb-4">
            {poolMeta.label}
          </Text>
          <Text type="small" weight="semibold" color="primary">
            Week {poolMeta.contract.lastActiveEpoch} / {poolMeta.contract.totalEpochs}
          </Text>
        </div>
      </div>
      <div className="card p-24 flexbox-grid mb-24">
        <div>
          <Text type="small" weight="semibold" color="secondary" className="mb-8">
            Pool balance
          </Text>
          <Text type="p1" weight="semibold" color="primary">
            {formatUSD(poolBalance) ?? '-'}
          </Text>
        </div>
        <div>
          <Text type="small" weight="semibold" color="secondary" className="mb-8">
            Effective pool balance
          </Text>
          <Text type="p1" weight="semibold" color="primary">
            {formatUSD(effectivePoolBalance) ?? '-'}
          </Text>
        </div>
        <div>
          <Text type="small" weight="semibold" color="secondary" className="mb-8">
            Weekly rewards
          </Text>
          <div className="flex align-center">
            <Icon name="png/universe" width={24} height={24} className="mr-8" />
            <Text type="p1" weight="semibold" color="primary">
              {formatNumber(poolMeta.contract.epochReward) ?? '-'}
            </Text>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolHeader;
