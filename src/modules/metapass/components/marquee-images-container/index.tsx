import React, { FC } from 'react';
import { Col, Row } from 'antd';

import MarqueImageOne from './assets/1.png';
import MarqueImageFive from './assets/1.png';
import MarqueImageSeven from './assets/2.png';
import MarqueImageTwo from './assets/3.png';
import MarqueImageEight from './assets/4.png';
import MarqueImageThree from './assets/5.png';
import MarqueImageSix from './assets/6.png';
import MarqueImageFour from './assets/6.png';

import './index.scss';

const MarqueeImagesComponent: FC = () => {
  return (
    <Row className="marquee-images">
      <Col span={3}>
        <img src={MarqueImageOne} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageTwo} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageThree} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageFour} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageFive} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageSix} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageSeven} alt="nft" />
      </Col>
      <Col span={3}>
        <img src={MarqueImageEight} alt="nft" />
      </Col>
    </Row>
  );
};

export default MarqueeImagesComponent;
