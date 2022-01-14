import React, { FC, useEffect, useState } from 'react';
import { Checkbox, Col, Row } from 'antd';

import Spin from 'components/antd/spin';
import { LandWorksToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import { useWallet } from 'wallets/wallet';

import Erc721Contract from '../../../../web3/erc721Contract';
import {
  UserNotStakedAssets,
  UserStakedAssetsWithData,
  fetchAssetsById,
  fetchNotStakedAssets,
  fetchStakedAssets,
  getDecentralandAssetName,
} from '../../api';
import { TABS } from '../../views/landowrks-yf-pool-view';

import './index.scss';

interface ILandWorksPoolProps {
  tab: string;
}
const LandworksPoolStake: FC<ILandWorksPoolProps> = (props: ILandWorksPoolProps) => {
  const { account } = useWallet();
  const { tab } = props;
  const [approved, setApproved] = useState(false);
  const [notStakedAssets, setNotStakedAssets] = useState<UserNotStakedAssets[]>([]);
  const [stakedAssets, setStakedAssets] = useState<UserStakedAssetsWithData[]>([]);

  // TODO:: handle stake logic
  // TODO:: handle unstake logic
  // TODO:: handle disable logic for stake button
  // TODO:: handle disable logic for unstake button

  const onLandCheckboxChange = (e: any) => {
    console.log(e);
  };

  const handleStake = (e: any) => {
    console.log(e);
  };

  const handleUnstake = (e: any) => {
    console.log(e);
  };

  const handleEnable = async (e: any) => {
    try {
      const tx = await (LandWorksToken.contract as Erc721Contract).setApprovalForAll(
        config.contracts.yf.landworks || '',
        true,
      );

      if (tx.status) {
        setApproved(tx.status);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getNotStakedAssets = async () => {
      try {
        const data = await fetchNotStakedAssets(account || '');
        if (data.assets.length) {
          setNotStakedAssets(data.assets);
        }
      } catch (e) {
        console.log('Error while trying to fetch not staked user assets !', e);
      }
    };

    const getStakedAssets = async () => {
      try {
        const assets = await fetchStakedAssets(account || '');
        const assetData = await fetchAssetsById(assets.map(a => a.tokenId));
        setStakedAssets(assetData);
      } catch (e) {
        console.log('Error while trying to fetch staked user assets !', e);
      }
    };

    if (account) {
      getNotStakedAssets();
      getStakedAssets();
    }
  }, [account, tab]);

  useEffect(() => {
    const hasApproved = async () => {
      try {
        const approved = await (LandWorksToken.contract as Erc721Contract).isApprovedForAll(
          account || '',
          config.contracts.yf.landworks,
        );

        setApproved(approved);
      } catch (err) {
        console.log(err);
      }
    };

    if (account) {
      hasApproved();
    }
  }, [account]);

  const assets = tab === TABS.STAKE ? notStakedAssets : stakedAssets;

  return (
    <section className="landworks-pool-stake">
      <Row justify="center">
        <Col>
          <p className="headMsg">Select the land you want to stake from the list</p>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="lands-container">
        {assets.map(asset => {
          const name = getDecentralandAssetName(asset.decentralandData);
          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <div className="landBox">
                <Checkbox className="landCheckbox" onChange={() => onLandCheckboxChange(asset.id)} />
                <span>{name}</span>
              </div>
            </Col>
          );
        })}
      </Row>
      <Row className="buttons-container" gutter={[16, 16]}>
        {tab === TABS.STAKE ? (
          <>
            <Col>
              <button type="button" className="button-primary" disabled={false} onClick={handleStake}>
                {false && <Spin spinning />}
                Stake
              </button>
            </Col>

            <Col>
              <button type="button" className="button-primary" disabled={approved} onClick={handleEnable}>
                {false && <Spin spinning />}
                Enable LandWorks NFTs
              </button>
            </Col>
          </>
        ) : (
          <Col>
            <button type="button" className="button-primary" disabled={false} onClick={handleUnstake}>
              {false && <Spin spinning />}
              Unstake
            </button>
          </Col>
        )}
      </Row>
    </section>
  );
};

export default LandworksPoolStake;
