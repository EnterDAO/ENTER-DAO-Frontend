import React from 'react';

import { IMetapassProperty } from 'modules/metapass/views/single-metapass-view/models/IMetapassProperty';

import './index.scss';

interface IMetapassPropertiesProps {
  properties?: IMetapassProperty[];
}

export const MetapassProperties: React.FC<IMetapassPropertiesProps> = ({ properties }) => {
  return (
    <div id="metapass-properties-container">
      {properties && properties.length ? (
        properties.map(prop => (
          <div className="metapass-prop">
            <div className="metapass-attribute">{prop.attribute?.toUpperCase()}</div>
            <div className="metapass-trait">{prop.trait?.toUpperCase()}</div>
            <div className="metapass-rarity">{prop.rarity}% have this trait</div>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};
