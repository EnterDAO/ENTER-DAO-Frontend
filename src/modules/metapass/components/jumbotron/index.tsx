import React, { FC } from 'react';
import { useHistory } from 'react-router';
import { Col, Row } from 'antd';

import Button from 'components/antd/button';

import jumbotronImage from './assets/jumbotron.png';

import './index.scss';

const JumbotronComponent: FC = () => {
  const history = useHistory();

  return (
    <div className="jumbotron-container">
      <div className="content-container">
        <Row className="jumbotron-row" align="middle">
          <Col xs={24} md={24} lg={10}>
            <div className="jumbotron-myNFTs-container">
              <p className="h1-bold main-heading">EnterDAO NFT</p>
              <p className="sub-heading">THEY WEAR SUITS, SO WE DON'T HAVE TO.</p>
              <Button
                className="myNFTs-button"
                type="primary"
                onClick={() => {
                  history.push('/metapass/owned');
                }}>
                My NFTs
              </Button>
            </div>
          </Col>
          <Col xs={24} md={24} lg={14} className="jumbotron-image-container">
            <img src={jumbotronImage} alt="jumbotron"></img>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default JumbotronComponent;
