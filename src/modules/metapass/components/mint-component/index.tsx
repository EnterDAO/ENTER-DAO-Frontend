import React, { FC, useEffect, useState } from 'react';
import { Col, Row, Space } from 'antd';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';

import { useMetapass } from '../../providers/metapass-provider';
import HorizontalSlider from '../horizontal-slider/index';
import QuantityDropdown from '../quantity-dropdown';
import PriceETHIconWhite from './assets/ethereum-white.svg';

import './index.scss';

const MintComponent: FC = () => {
  const metapassCtx = useMetapass();

  const { metapassContract } = metapassCtx;

  const [minting, setMinting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  async function mintMetapass() {
    setMinting(true);
    try {
      await metapassContract?.mint();
    } catch (e) {}

    setMinting(false);
  }

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  if (!metapassContract) {
    return null;
  }

  return (
    <div className="mint-container">
      <div className="content-container">
        <Space direction="vertical" size={100}>
          <Row justify="center">
            <Col xs={24} md={16}>
              <p className="h1-bold text-center mint-heading">MINT A NFT</p>
              <p className="text-white text-center">
                100% of primary sales will be donated to policy and lobby efforts. Secondary sales will be donated to
                groups focused on growing the Ethereum ecosystem. Mint a Lobby Lobster to become part of a community
                that will change the universe!
              </p>
            </Col>
          </Row>

          <Row justify="center">
            <Col xs={24} md={16}>
              <p className="text-center h1-bold mint-at-a-time-heading">You can mint 20 Lobby Lobsters at a time</p>
              <HorizontalSlider min={0} max={100} value={80} color1="red" color2="black" />
            </Col>
            <Col xs={24} md={16}>
              <Row justify="space-between" gutter={16}>
                <Col md={10}>
                  <QuantityDropdown labelText="Quantity" min={1} max={3} value={quantity} onChange={setQuantity} />
                </Col>
                <Col md={6}>
                  <Button type="primary" onClick={() => mintMetapass()}>
                    Mint Now
                  </Button>
                </Col>
                <Col md={8}>
                  <div className="price-block">
                    <p>
                      <span>Price:</span>
                      <span>
                        <img alt="img" className="eth-sign" src={PriceETHIconWhite} />
                        {(quantity * 0.1).toFixed(1)}
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default MintComponent;
