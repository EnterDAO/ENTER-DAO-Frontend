import React from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Col, Image, Row } from 'antd';

import { padMetapassTokenId } from 'modules/metapass/helpers/helpers';

import enterDaoImage from '../../../../resources/png/enterdao.png';
import loadingWomanImage from './assets/loadingWoman.png';

import './index.scss';

interface IMetapassCardProps {
  pass: any;
}
const MetapassCard: React.FC<IMetapassCardProps> = ({ pass }) => {
  const history = useHistory();

  return (
    <Col className="metapass-card-wrapper" xl={6} md={8} sm={12} xs={24}>
      <Card className="metapass-card" onClick={() => history.push(`./${pass.id}`)}>
        {/* <Row className="metapass-ranking-row" justify="space-between">
          <Col span={1}>
            <span className="metapass-rank">#1</span>
          </Col>
          <Col span={14}>
            <span className="metapass-rarity-score">Rarity score: 1000</span>
          </Col>
        </Row> */}
        <Row>
          <Image
            placeholder={<Image className="metapass-image" src={loadingWomanImage} preview={false} />}
            className="metapass-image"
            src={pass.imageUrl}
            preview={false}
          />
        </Row>
        <Row className="metapass-info-row" justify="space-between">
          <Col span={17}>
            <span className="metapass-name">Metapass</span>
          </Col>
          <Col style={{ textAlign: 'right' }} span={7}>
            <span className="metapass-id">ID: #{padMetapassTokenId(pass.id)}</span>
          </Col>
        </Row>
        <Row className="metapass-dao-row">
          <img alt="EnterDao Icon" className="enterdao-icon" src={enterDaoImage}></img>
          <span className="metapass-enterdao-name">EnterDAO</span>
        </Row>
      </Card>
    </Col>
  );
};

export default MetapassCard;
