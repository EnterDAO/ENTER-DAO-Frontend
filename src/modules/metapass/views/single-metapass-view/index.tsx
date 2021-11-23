import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Col, Image, Row } from 'antd';

import MetapassDescription from 'modules/metapass/components/metapassDescription';
import { MetapassMetadata } from 'modules/metapass/components/metapassMetadata';
import { MetapassProperties } from 'modules/metapass/components/metapassProperties';
import { MetapassTabs } from 'modules/metapass/components/metapassTabs';
import SingleNFTCardSkeleton from 'modules/metapass/components/single-nft-loader-card';
import { padMetapassTokenId } from 'modules/metapass/helpers/helpers';
import { MetapassTab } from 'modules/metapass/views/single-metapass-view/models/MetapassTab';

import { ShardedMindsOwner, ShardedMindsTraitRarity, getNftMeta, queryShardedMindsGraph } from '../../api';
import loadingWomanImage from '../../components/metapassCard/assets/loadingWoman.png';
import arrowLeft from './assets/arrow-left.svg';
import outLink from './assets/link-out.svg';

import './index.scss';

type Trait = {
  trait_type: string;
  value: string;
};

type Owner = {
  gene: string;
  to: string;
};
interface IMetaData {
  attributes: Trait[];
  description: string;
  external_url: string;
  image: string;
  name: string;
  video: string;
  id: string;
}

const SingleMetapass: React.FC = () => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(MetapassTab.Properties);
  const { tokenId } = useParams<{ tokenId: string }>();
  const [metaData, setMetaData] = useState<IMetaData | undefined>();
  const [owner, setOwner] = useState<Owner | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const meta = await getNftMeta(tokenId);
      const shardedOwner = await queryShardedMindsGraph(ShardedMindsOwner(tokenId || ''));
      const shardedRarity = await queryShardedMindsGraph(ShardedMindsTraitRarity(tokenId || ''));
      console.log(shardedRarity);
      console.log(shardedOwner.transferEntities[0]);
      if (shardedOwner?.transferEntities && shardedOwner?.transferEntities[0]) {
        setOwner(shardedOwner?.transferEntities[0]);
      }
      setMetaData(meta);
      setLoading(false);
    };

    fetchData();
  }, [tokenId]);

  return (
    <div className="content-container">
      <Row id="metapass-container">
        <Col span={24}>
          <Row>
            <div id="back-button-container" onClick={() => history.push('./owned')}>
              <img src={arrowLeft} alt="back-icon" />
              <span>My NFTs</span>
            </div>
          </Row>
          {loading ? (
            <Row>
              <SingleNFTCardSkeleton />
            </Row>
          ) : (
            <Row gutter={32}>
              <Col lg={10} md={9} sm={24}>
                <Image
                  placeholder={<Image className="metapass-image" src={loadingWomanImage} preview={false} />}
                  className="metapass-image"
                  src={metaData?.image}
                />
              </Col>
              <Col lg={14} md={15} sm={24}>
                <Row className="metapass-name-container">
                  <p id="metapass-name">{metaData?.name}</p>
                </Row>
                <Row className="metapass-id-container">
                  <div id="metapass-id">
                    <span>ID: </span>
                    <span id="metapass-id">#{padMetapassTokenId(tokenId)}</span>
                  </div>
                </Row>
                <Row>
                  <MetapassDescription description={metaData?.description || ''} />
                </Row>
                <Row>
                  <MetapassTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                </Row>
                {selectedTab === MetapassTab.Properties ? (
                  <MetapassProperties properties={metaData?.attributes} />
                ) : (
                  <MetapassMetadata ownerAddress={owner?.to || ''} genome={owner?.gene || ''} />
                )}
                <Row className="opensea-link-container">
                  <Col
                    id="metapass-opensea-link"
                    onClick={() =>
                      window
                        .open(`https://opensea.io/assets/${process.env.REACT_APP_METAPASS_ADDR}/${tokenId}`, '_blank')
                        ?.focus()
                    }>
                    <span>View on Opensea</span>
                    <img src={outLink} alt="link" />
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SingleMetapass;
