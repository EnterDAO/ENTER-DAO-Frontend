import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import fromUnixTime from 'date-fns/fromUnixTime';
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
    setMinting(true);

    try {
      const isPreSale = await metapassContract?.isPresale();
      const isSale = await metapassContract?.isSale();

      if (isSale) {
        const mintTx = quantity === 1 ? await metapassContract?.mint() : await metapassContract?.bulkBuy(quantity);
      } else if (isPreSale) {
        const mintTx = await metapassContract?.presaleMint();
      }
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
  const preSaleStartTime = metapassContract?.presaleStart?.toNumber() || 0;
  const publicSaleStartTime = metapassContract?.officialSaleStart?.toNumber() || 0;
  const preSale = fromUnixTime(preSaleStartTime);
  const publicSale = fromUnixTime(publicSaleStartTime);

  return (
    <div className="mint-container">
      <div className="content-container">
        <Row justify="center" className="description">
          <Col xs={24} md={16}>
            <p className="text-center mint-heading">Mint a SHARDED MIND</p>
            <p className="text-white text-center">
              Еach EnterDAO Sharded Mind is a unique ERC-721 NFT. It is programmatically assembled on-chain and each
              token has a genome representing its unique combination of traits, including animated backgrounds and
              original tracks.
            </p>
          </Col>
        </Row>

        {totalSupply !== maxSupply && (
          <Row justify="center">
            <Col>
              <Countdwon preSaleStartDate={preSale} publicSaleStartDate={publicSale} />
            </Col>
          </Row>
        )}

        <Row justify="center">
          <Col xs={24} md={24}>
            <p className="text-center h1-bold mint-at-a-time-heading">You can mint 10 Sharded Minds at a time</p>
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
