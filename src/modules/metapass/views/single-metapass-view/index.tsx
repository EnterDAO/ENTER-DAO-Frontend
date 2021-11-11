import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Col, Image, Row } from 'antd';

import MetapassDescription from 'modules/metapass/components/metapassDescription';
import { MetapassMetadata } from 'modules/metapass/components/metapassMetadata';
import { MetapassProperties } from 'modules/metapass/components/metapassProperties';
import { MetapassTabs } from 'modules/metapass/components/metapassTabs';
import { padMetapassTokenId } from 'modules/metapass/helpers/helpers';
import { MetapassTab } from 'modules/metapass/views/single-metapass-view/models/MetapassTab';

import loadingWomanImage from '../../components/metapassCard/assets/loadingWoman.png';
import womanImage from '../../components/metapassCard/assets/woman.png';
import arrowLeft from './assets/arrow-left.svg';
import outLink from './assets/link-out.svg';
import { IMetapassProperty } from './models/IMetapassProperty';

import './index.scss';

const SingleMetapass: React.FC = () => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(MetapassTab.Properties);
  const { tokenId } = useParams<{ tokenId: string }>();
  const metapassProps: IMetapassProperty[] = [
    { attribute: 'Skin', trait: 'Smooth', rarity: 28 },
    { attribute: 'Clothes', trait: 'None', rarity: 58 },
    { attribute: 'Hole', trait: 'Black', rarity: 10 },
    { attribute: 'Mouth', trait: 'Hialuron', rarity: 1 },
    { attribute: 'Eyes', trait: 'Starry', rarity: 25.54 },
    { attribute: 'Background', trait: 'Cool', rarity: 28.5 },
  ];
  const ownerAddress = '0x75D38741878da8520d1Ae6db298A9BD994A5D241';
  const genome = '10697916225061077973136137627067458743601487325848773842845948686575824521957';
  const description = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vel lobortis metus, nec dignissim lacus.
  Nulla facilisi. Curabitur a diam enim. Maecenas sit amet viverra lorem. Maecenas efficitur quam vel felis
  ultrices finibus. Integer vel mauris quis magna vestibulum porta ac et nisl. Suspendisse tincidunt, nunc
  at tincidunt rhoncus, turpis metus ornare lectus, a placerat nisi nisi quis dui. Aenean dignissim
  scelerisque nisi quis venenatis. Phasellus hendrerit condimentum ex, id ultricies turpis iaculis sed.
  Etiam ornare ornare ante, vitae iaculis enim viverra quis. Duis eget ligula luctus, blandit lorem ut,
  semper leo. Cras vitae malesuada metus. Suspendisse vulputate commodo tincidunt.`;

  return (
    <div className="content-container">
      <Row id="metapass-container">
        <Col>
          <Row>
            <div id="back-button-container" onClick={() => history.push('./owned')}>
              <img src={arrowLeft} alt="back-icon" />
              <span>My NFTs</span>
            </div>
          </Row>
          <Row gutter={32}>
            <Col lg={10} md={9} sm={24}>
              <Image
                placeholder={<Image className="metapass-image" src={loadingWomanImage} preview={false} />}
                className="metapass-image"
                src={womanImage}
              />
            </Col>
            <Col lg={14} md={15} sm={24}>
              <Row className="metapass-name-container">
                <p id="metapass-name">Metapass</p>
              </Row>
              <Row className="metapass-id-container">
                <div id="metapass-id">
                  <span>ID: </span>
                  <span id="metapass-id">#{padMetapassTokenId(tokenId)}</span>
                </div>
              </Row>
              <Row>
                <MetapassDescription description={description} />
              </Row>
              <Row>
                <MetapassTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
              </Row>
              {selectedTab === MetapassTab.Properties ? (
                <MetapassProperties properties={metapassProps} />
              ) : (
                <MetapassMetadata ownerAddress={ownerAddress} genome={genome} />
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
        </Col>
      </Row>
    </div>
  );
};

export default SingleMetapass;
