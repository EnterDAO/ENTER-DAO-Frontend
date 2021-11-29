import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useLocalStorage } from 'react-use-storage';
import { Col, Image, Row } from 'antd';

import MetapassDescription from 'modules/metapass/components/metapassDescription';
import { MetapassMetadata } from 'modules/metapass/components/metapassMetadata';
import { MetapassPreviewTabs } from 'modules/metapass/components/metapassPreviewTabs';
import { MetapassProperties } from 'modules/metapass/components/metapassProperties';
import { MetapassTabs } from 'modules/metapass/components/metapassTabs';
import SingleNFTCardSkeleton from 'modules/metapass/components/single-nft-loader-card';
import { padMetapassTokenId } from 'modules/metapass/helpers/helpers';
import { MetapassTab, PrveiwTab } from 'modules/metapass/views/single-metapass-view/models/MetapassTab';

import { ShardedMindsOwner, ShardedMindsTraitRarity, getNftMeta, queryShardedMindsGraph } from '../../api';
import loadingWomanImage from '../../components/metapassCard/assets/loadingWoman.png';
import arrowLeft from './assets/arrow-left.svg';
import outLink from './assets/link-out.svg';

import GeneParser from '../../../../utils/ShardedMindsGeneParser';

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
  const [parsedGenes, setParsedGenes] = useState({});
  const [previewTab, setPreviewTab] = useState(PrveiwTab.Image);

  const [theme, setTheme] = useLocalStorage('bb_theme', 'light');

  useEffect(() => {
    setTheme('light');
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const meta = await getNftMeta(tokenId);
      const shardedOwner = await queryShardedMindsGraph(ShardedMindsOwner(tokenId || ''));
      if (shardedOwner?.transferEntities && shardedOwner?.transferEntities[0]) {
        setOwner(shardedOwner?.transferEntities[0]);
      }
      setMetaData(meta);
      setLoading(false);
    };

    fetchData();
  }, [tokenId]);

  useEffect(() => {
    if (owner) {
      const parsed = GeneParser.parse(owner?.gene);
      setParsedGenes(parsed);
    }
  }, [owner]);

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
                <Row>
                  <MetapassPreviewTabs selectedTab={previewTab} setSelectedTab={setPreviewTab} />
                </Row>
                {previewTab === PrveiwTab.Image ? (
                  <img src={metaData?.image} alt="sharded mind" width="100%" />
                ) : metaData?.video ? (
                  <video controls className="jumbo-video" poster={metaData?.image} style={{ maxWidth: '100%' }}>
                    <source src={metaData?.video} type="video/mp4" />
                  </video>
                ) : (
                  <div className="generating-video">
                    <img src={metaData?.image} alt="sharded mind" width="100%" />
                    <p>Video is getting Generated</p>
                  </div>
                )}
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
                  <MetapassProperties properties={metaData?.attributes} parsedGenes={parsedGenes} />
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
