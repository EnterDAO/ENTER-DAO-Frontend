import React, { FC } from 'react';
import { useHistory } from 'react-router';
import { Col, Row } from 'antd';

import Button from 'components/antd/button';

import jumbotronVideo from './assets/loopBG.mp4';
import robotImage from './assets/robot-skin.svg';

import './index.scss';

const JumbotronComponent: FC = () => {
  const history = useHistory();

  return (
    <div className="jumbotron-container">
      <video autoPlay muted loop className="jumbo-video">
        <source src={jumbotronVideo} type="video/mp4" />
      </video>
      <div className="content-container">
        <Row className="jumbotron-row" align="middle">
          <Col xs={24} md={24} lg={10}>
            <div className="jumbotron-myNFTs-container">
              <p className="h1-bold main-heading">EnterDAO NFT</p>
              <p className="h1-bold main-heading">Sharded Minds</p>
              <p className="sub-heading">exploring the Web3 metaverse</p>
              <Button
                className="myNFTs-button"
                type="primary"
                onClick={() => {
                  history.push('/sharded-minds/owned');
                }}>
                My NFTs
              </Button>
            </div>
          </Col>
          <Col xs={24} md={24} lg={14} className="jumbotron-image-container">
            <img src={robotImage} alt="jumbotron"></img>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default JumbotronComponent;
