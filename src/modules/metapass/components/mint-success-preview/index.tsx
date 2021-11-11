import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'antd';

import { useMetapass } from '../../providers/metapass-provider';

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
    setNftsMeta(ids);
  }, [result]);

  return (
    <>
      <Row className="count-component-container">
        <Col xs={24} sm={24} md={8} lg={10} xl={10} className="count-holder">
          <p> Paragrapgh after success</p>;
          {nftsMeta.map(id => (
            <p> show image for id {id}</p>
          ))}
        </Col>
      </Row>
    </>
  );
};

export default MintSuccessComponent;
