import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'antd';

import enterDaoImage from '../../../../resources/png/enterdao.png';
import { useMetapass } from '../../providers/metapass-provider';
// Temporrary card image
import cardImage from '../metapassCard/assets/woman.png';
import MintSuccessNFTCard from '../mint-success-nft-card';

import './index.scss';

interface props {
  result: any;
}

const MintSuccessComponent: FC<props> = props => {
  const { result } = props;
  const [nftsMeta, setNftsMeta] = useState([]);
  const metapassCtx = useMetapass();
  const { getNftMeta } = metapassCtx;

  useEffect(async () => {
    const transferEvents = result?.events?.Transfer;

    if (!transferEvents) return;
    // If we use bulkBuy
    const isBulkBuy = transferEvents.length;
    const ids = isBulkBuy ? transferEvents.map((event: any) => event.returnValues[2]) : transferEvents.returnValues[2];

    // TODO:: fetch the data from the BE and display the images in this component
    // const meta = await getNftMeta('50');
    const updated = isBulkBuy ? [...ids] : [ids];
    setNftsMeta([...updated]);
  }, [result]);

  return (
    <>
      <div className="mint-success-component-container">
        <Row>
          <Col span={24}>
            <p className="text-center congrats-heading">Success !</p>
          </Col>
        </Row>
        <Row justify="center" gutter={20} className="nft-cards-list">
          {nftsMeta.map(id => (
            <MintSuccessNFTCard data={{ id: id }} />
          ))}
        </Row>
      </div>
    </>
  );
};

export default MintSuccessComponent;
