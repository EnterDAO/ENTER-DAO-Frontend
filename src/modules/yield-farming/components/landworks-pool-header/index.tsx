import React, { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, formatToken } from 'web3/utils';

import Icon, { IconNames } from 'components/custom/icon';
import IconsSet from 'components/custom/icons-set';
import { Text } from 'components/custom/typography';
import { EnterToken } from 'components/providers/known-tokens-provider';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';

const LandworksPoolHeader: FC = () => {
  const landworksCtx = useLandworksYf();
  const { landworksYf } = landworksCtx;

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  if (!landworksYf) {
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
          icons={['png/landworks'].map(icon => (
            <Icon key={icon} name={icon as IconNames} />
          ))}
          className="mr-16"
        />
        <div>
          <Text type="p1" weight="semibold" color="primary" className="mb-4">
            {'LandWorks'}
          </Text>
        </div>
      </div>
      <div className="card p-24 flex col-gap-48 mb-24">
        <div>
          <Text type="small" weight="semibold" color="secondary" className="mb-8">
            Staked NFTs
          </Text>
          <div className="flex align-center">
            <Text type="p1" weight="semibold" color="primary">
              {formatToken(landworksYf.totalSupply) ?? '-'}
            </Text>
          </div>
        </div>
        <div>
          <div className="flex flow-row">
            <Text type="small" weight="semibold" color="secondary" className="mb-4">
              {EnterToken.symbol} rewards
            </Text>
            <div className="flex align-center">
              <Icon name="png/enterdao" width={24} height={24} className="mr-8" />
              <Text type="p1" weight="semibold" color="primary" className="mr-8">
                {formatNumber(landworksYf.rewards) ?? '-'}
              </Text>
              <Text type="p1" color="secondary">
                out of {formatToken(landworksYf.rewardForDuration)}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandworksPoolHeader;
