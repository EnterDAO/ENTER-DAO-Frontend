import 'react-loading-skeleton/dist/skeleton.css';

import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Col, Row } from 'antd';

import './index.scss';

const SingleNFTCardSkeleton: FC = () => {
  return (
    <Col span={24}>
      <div className="nft--card--skeleton">
        <Row gutter={32}>
          <Col span={12}>
            <Skeleton className="nft--card--skeleton--body" width={'100%'} height={'140px'} />
          </Col>
          <Col span={12}>
            <Row gutter={[20, 20]}>
              <Col span={24}>
                <Skeleton width={'100%'} height={20} />
              </Col>
              <Col span={24}>
                <Skeleton width={'100%'} height={20} />
              </Col>
              <Col span={24}>
                <Skeleton width={'100%'} height={20} />
              </Col>
              <Col span={24}>
                <Skeleton width={'100%'} height={20} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default SingleNFTCardSkeleton;
