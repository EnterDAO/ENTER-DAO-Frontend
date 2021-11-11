import React, { FC } from 'react';
import { Col } from 'antd';

import enterDaoImage from '../../../../resources/png/enterdao.png';
import cardImage from '../metapassCard/assets/woman.png';

import './index.scss';

interface props {
  data: any;
}

const MintSuccessNFTCard: FC<props> = props => {
  const { data } = props;

  return (
    <Col xs={24} sm={24} md={12} xl={8}>
      <div className="nft-container">
        <div className="nft-image">
          <img src={cardImage} alt="nft" />
        </div>
        <div className="nft-description">
          <div className="nft-info">
            <p className="name">Troll God</p>
            <p className="id">ID # {data.id}</p>
          </div>
          <div className="nft-collection-info">
            <img alt="EnterDao Icon" className="enterdao-icon" src={enterDaoImage}></img>
            <span className="metapass-enterdao-name">EnterDAO</span>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default MintSuccessNFTCard;
