import React, { FC, useEffect, useState } from 'react';
import { Checkbox, Col, Row } from 'antd';

import Spin from 'components/antd/spin';
import { LandWorksToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import { useWallet } from 'wallets/wallet';

import Erc721Contract from '../../../../web3/erc721Contract';
import { fetchUserAssets } from '../../api';

import './index.scss';

const LANDS = [1, 2, 3, 4, 5, 6, 7, 8];

const LandworksPoolStake: FC = () => {
  const { account } = useWallet();

  const [approved, setApproved] = useState(false);

  const onLandCheckboxChange = (e: any) => {
    console.log(e);
  };

  const handleStake = (e: any) => {
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
    const getAssets = async () => {
      const assets = await fetchUserAssets(account || '');
      console.log(assets);
    };

    if (account) {
      getAssets();
    }
  }, [account]);

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

  return (
    <section className="landworks-pool-stake">
      <Row justify="center">
        <Col>
          <p className="headMsg">Select the land you want to stake from the list</p>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="lands-container">
        {LANDS.map(id => {
          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <div className="landBox">
                <Checkbox className="landCheckbox" onChange={() => onLandCheckboxChange(id)} />
                <span>Land (10, 24) {id}</span>
              </div>
            </Col>
          );
        })}
      </Row>
      <Row className="buttons-container" gutter={[16, 16]}>
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
      </Row>
    </section>
  );
};

export default LandworksPoolStake;
