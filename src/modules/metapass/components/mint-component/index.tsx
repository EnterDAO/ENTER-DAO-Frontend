import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { utils } from 'ethers';

import Button from 'components/antd/button';

import { useMetapass } from '../../providers/metapass-provider';
import Countdwon from '../countdown';
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
    // TODO:: Check if the user is signed in, otherwise prompt a modal with please sign in message
    // TODO:: Disable the mint button during minting
    setMinting(true);

    try {
      const mintTx = quantity === 1 ? await metapassContract?.mint() : await metapassContract?.bulkBuy(quantity);
    } catch (e) {
      console.log(e);
    }

    setMinting(false);
  }

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);

  if (!metapassContract) {
    return null;
  }

  // TODO:: consider useMemo for those calcs
  const maxSupply = metapassContract?.maxSupply?.toNumber() || 0;
  const totalSupply = metapassContract?.totalSupply?.toNumber() || 0;
  const metapassPrice = metapassContract?.metapassPrice?.toString();
  const priceToEth = (metapassPrice && utils.formatEther(metapassPrice)) || 0;
  const maxMintAmount = parseInt(process.env.REACT_APP_MINT_MAX_COUNT || '0', 10);

  return (
    <div className="mint-container">
      <div className="content-container">
        <Row justify="center" className="description">
          <Col xs={24} md={16}>
            <p className="h1-bold text-center mint-heading">MINT A NFT</p>
            <p className="text-white text-center">
              100% of primary sales will be donated to policy and lobby efforts. Secondary sales will be donated to
              groups focused on growing the Ethereum ecosystem. Mint a Lobby Lobster to become part of a community that
              will change the universe!
            </p>
          </Col>
        </Row>

        {totalSupply !== maxSupply && (
          <Row justify="center">
            <Col>
              <Countdwon preSaleStartDate={Date.now() + 10000} publicSaleStartDate={Date.now() + 20000} />
            </Col>
          </Row>
        )}

        <Row justify="center">
          <Col xs={24} md={24}>
            <p className="text-center h1-bold mint-at-a-time-heading">You can mint 20 Lobby Lobsters at a time</p>
            <HorizontalSlider min={0} max={maxSupply} value={totalSupply} color1="white" color2="black" />
          </Col>
          <Col xs={24} md={24}>
            <Row justify="space-between" gutter={16} className="controller-container">
              <Col
                xs={{ order: 1, span: 24 }}
                sm={{ order: 1, span: 24 }}
                md={{ order: 1, span: 8 }}
                lg={{ order: 1, span: 8 }}>
                <QuantityDropdown
                  labelText="Quantity"
                  min={1}
                  max={maxMintAmount}
                  value={quantity}
                  onChange={setQuantity}
                />
              </Col>
              <Col
                xs={{ order: 3, span: 24 }}
                sm={{ order: 3, span: 24 }}
                md={{ order: 2, span: 8 }}
                lg={{ order: 2, span: 8 }}>
                <div className="mint-btn-container">
                  <Button type="primary" className="mint-btn" onClick={() => mintMetapass()}>
                    Mint now
                  </Button>
                </div>
              </Col>
              <Col
                xs={{ order: 2, span: 24 }}
                sm={{ order: 2, span: 24 }}
                md={{ order: 3, span: 8 }}
                lg={{ order: 3, span: 8 }}>
                <div className="price-block">
                  <p>
                    <span>Price:</span>
                    <span>
                      <img alt="img" className="eth-sign" src={PriceETHIconWhite} />
                      {(quantity * parseFloat(priceToEth || '0')).toFixed(1)}
                    </span>
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MintComponent;
