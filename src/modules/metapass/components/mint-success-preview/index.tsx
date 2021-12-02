import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'antd';

import { useMetapass } from '../../providers/metapass-provider';
import MintSuccessNFTCardSkeleton from '../mint-nft-loader-card';
// Temporrary card image
import MintSuccessNFTCard from '../mint-success-nft-card';

import './index.scss';

interface props {
  result: any;
}

const MintSuccessComponent: FC<props> = props => {
  const { result } = props;
  const [nftsMeta, setNftsMeta] = useState<any[]>([]);
  const [showLoaders, setShowLoaders] = useState<boolean>(true);
  const [laderIds, setLoaderIds] = useState<any[]>([]);
  const metapassCtx = useMetapass();
  const { getNftMeta } = metapassCtx;

  useEffect(() => {
    const transferEvents = result?.events?.Transfer;

    if (!transferEvents) return;
    // If we use bulkBuy
    const isBulkBuy = transferEvents.length;
    const ids: Array<number | string> = isBulkBuy
      ? [...transferEvents.map((event: any) => event.returnValues[2])]
      : [transferEvents.returnValues[2]];

    setLoaderIds(ids);

    const getMeta = async () => {
      try {
        const metaPromises = ids.map(async id => getNftMeta(id));
        const meta = await Promise.all(metaPromises);
        setNftsMeta([...meta]);
        setShowLoaders(false);
      } catch (e) {
        // TODO:: handle errors !
        console.log(e);
      }
    };

    getMeta();
  }, [result]);

  return (
    <>
      <div className="mint-success-component-container">
        <Row>
          <Col span={24}>
            {showLoaders ? (
              <p className="text-center congrats-heading">
                The transaction was successful! Please wait for the NFTs to be generated and visualised.
              </p>
            ) : (
              <p className="text-center congrats-heading">Congrats !</p>
            )}
          </Col>
        </Row>
        <Row justify="center" gutter={[20, 20]} className="nft-cards-list">
          {showLoaders
            ? laderIds.map(id => <MintSuccessNFTCardSkeleton />)
            : nftsMeta.map(data => <MintSuccessNFTCard data={data} key={data.name} />)}
        </Row>
      </div>
    </>
  );
};

export default MintSuccessComponent;
