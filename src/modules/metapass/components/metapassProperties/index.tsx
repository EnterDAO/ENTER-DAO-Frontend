import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Col, Row } from 'antd';

import { ShardedMindsTraitRarity, queryShardedMindsGraph } from '../../api';

import './index.scss';

type Trait = {
  trait_type: string;
  value: string;
};

type TraitWithChance = {
  trait_type: string;
  value: string;
  chance: string;
};
interface IMetapassPropertiesProps {
  properties?: Trait[];
  parsedGenes?: any;
}

export const MetapassProperties: React.FC<IMetapassPropertiesProps> = ({ properties, parsedGenes }) => {
  const [propsWithRarity, setPropsWithRarity] = useState<TraitWithChance[] | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getPropertyRarity = async (properties: IMetapassPropertiesProps['properties'], parsedGenes: any) => {
      const rarityPromises = properties?.map(async (p: any) => {
        const { trait_type } = p;
        const traitId = parsedGenes[trait_type.toUpperCase()];
        const shardedRarity = await queryShardedMindsGraph(ShardedMindsTraitRarity(traitId || ''));
        const newProperty = { ...p };
        newProperty.chance = shardedRarity?.traits[0]?.rarity;
        return newProperty;
      });

      if (rarityPromises?.length) {
        setLoading(true);
        const props = await Promise.all(rarityPromises);
        setPropsWithRarity(props);
        setLoading(false);
      }
    };

    if (properties?.length && parsedGenes) {
      getPropertyRarity(properties, parsedGenes);
    }
  }, [parsedGenes]);
  return (
    <Row
      className="metapass-properties-container"
      gutter={[
        { xs: 19, sm: 19, md: 20, lg: 20 },
        { xs: 19, sm: 19, md: 20, lg: 20 },
      ]}>
      {properties &&
        properties.length &&
        properties.map(prop => {
          const propRarity = propsWithRarity?.find(p => p.trait_type === prop.trait_type);
          const rarity = parseFloat(propRarity?.chance || '');

          return (
            <Col xs={12} md={8}>
              <div className="metapass-prop">
                <div className="metapass-attribute">{prop.trait_type?.toUpperCase()}</div>
                <div className="metapass-trait">{prop.value?.toUpperCase()}</div>
                <div className="metapass-rarity">
                  {loading ? (
                    <Skeleton width={'90%'} height={20} style={{ background: '#DD3DCB' }} />
                  ) : (
                    `${rarity ? rarity?.toFixed(2) + '% have this trait' : 'No Rarity for this trait'}`
                  )}
                </div>
              </div>
            </Col>
          );
        })}
    </Row>
  );
};
