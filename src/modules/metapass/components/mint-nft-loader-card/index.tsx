import 'react-loading-skeleton/dist/skeleton.css';

import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Col } from 'antd';

import './index.scss';

const MintSuccessNFTCardSkeleton: FC = () => {
  return (
    <Col xs={24} sm={24} md={12} xl={12}>
      <div className="nft--card--skeleton">
        <Skeleton className="nft--card--skeleton--body" width={'100%'} height={'140px'} />
        <div className="nft--card--skeleton--footer">
          <div className="nft--name">
            <h4>
              <Skeleton width={60} height={20} style={{ borderRadius: '12px' }} />
            </h4>
          </div>
          <div className="collection--details">
            <Skeleton width={20} height={20} circle />
            <Skeleton width={79} height={12} style={{ marginLeft: '6px', marginTop: '6px' }} />
          </div>
        </div>
      </div>
    </Col>
  );
};

export default MintSuccessNFTCardSkeleton;
