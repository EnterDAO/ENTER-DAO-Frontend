import React from 'react';
import { Col, Row } from 'antd';

import { IMetapassProperty } from 'modules/metapass/views/single-metapass-view/models/IMetapassProperty';

import './index.scss';

interface IMetapassPropertiesProps {
  properties?: IMetapassProperty[];
}

export const MetapassProperties: React.FC<IMetapassPropertiesProps> = ({ properties }) => {
  return (
    <Row
      className="metapass-properties-container"
      gutter={[
        { xs: 19, sm: 19, md: 20, lg: 20 },
        { xs: 19, sm: 19, md: 20, lg: 20 },
      ]}>
      {properties &&
        properties.length &&
        properties.map(prop => (
          <Col xs={12} md={8}>
            <div className="metapass-prop">
              <div className="metapass-attribute">{prop.attribute?.toUpperCase()}</div>
              <div className="metapass-trait">{prop.trait?.toUpperCase()}</div>
              <div className="metapass-rarity">{prop.rarity}% have this trait</div>
            </div>
          </Col>
        ))}
    </Row>
  );
};
