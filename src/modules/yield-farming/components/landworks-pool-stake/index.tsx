import React, { FC, useEffect, useImperativeHandle, useState } from 'react';
import { Checkbox, Col, Row, Tabs } from 'antd';

import Alert from 'components/antd/alert';
import Spin from 'components/antd/spin';
import { LandWorksToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';
import { useWallet } from 'wallets/wallet';

import Erc721Contract from '../../../../web3/erc721Contract';
import {
  UserNotStakedAsset,
  UserStakedAssetsWithData,
  fetchAssetsById,
  fetchNotStakedAssets,
  fetchStakedAssets,
  getDecentralandAssetName,
} from '../../api';
import { TABS } from '../../views/landowrks-yf-pool-view';

import './index.scss';
import BigNumber from 'bignumber.js';

interface ILandWorksPoolProps {
  tab: string;
  onStake: (hasUnclaimedRent: boolean) => void;
}
const LandworksPoolStake: FC<ILandWorksPoolProps> = (props: ILandWorksPoolProps) => {
  const { tab, onStake } = props;

  const { account } = useWallet();
  const { landworksYf } = useLandworksYf();
  const walletCtx = useWallet();

  const [approved, setApproved] = useState(true);
  const [notStakedAssets, setNotStakedAssets] = useState<UserNotStakedAsset[]>([]);
  const [stakedAssets, setStakedAssets] = useState<UserStakedAssetsWithData[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  // Loaders
  const [stakeBtnLoading, setStakeBtnLoading] = useState(false);
  const [unstakeBtnLoading, setUnstakeBtnLoading] = useState(false);
  const [approveBtnLoading, setApproveBtnLoading] = useState(false);

  // Disablers
  const [stakeBtnDisabled, setStakeBtnDisabled] = useState(false);
  const [unstakeBtnDisabled, setUnstakeBtnDisabled] = useState(false);
  const [approveBtnDisabled, setApproveBtnDisabled] = useState(false);

  const onLandCheckboxChange = (e: any, id: string) => {
    const checked = e.target.checked;
    const value = Number(id);

    if (checked) {
      const selectedAssetsCopy = [...selectedAssets];
      const updatedCopy = [...selectedAssetsCopy, value];
      setSelectedAssets(updatedCopy);
    } else {
      const selectedAssetsCopy = [...selectedAssets];
      const itemIndex = selectedAssetsCopy.indexOf(value);
      if (itemIndex !== -1) {
        selectedAssetsCopy.splice(itemIndex, 1);
        setSelectedAssets(selectedAssetsCopy);
      }
    }
  };

  const handleConfirm = async () => {
    onStake(hasUnclaimedRent());
  };

  const handleStake = async () => {
    try {
      setStakeBtnLoading(true);
      setStakeBtnDisabled(true);
      const stakeTx = await landworksYf.stake(selectedAssets);

      if (stakeTx.status) {
        // Update the local copy cus the Graph will need some time to gets updated, the Refetch of the assets wont help here
        const notStakedAssetsCopy = [...notStakedAssets];
        const updatedCopy = notStakedAssetsCopy.filter(asset => !selectedAssets.includes(Number(asset.id)));
        setNotStakedAssets(updatedCopy);
        setSelectedAssets([]);
      }
    } catch (e) {
      console.log('Error while trying to stake assets !', e);
    } finally {
      setStakeBtnLoading(false);
      setStakeBtnDisabled(false);
    }
  };

  const hasUnclaimedRent = () => {
    let assets = notStakedAssets.filter(a => new BigNumber(a.unclaimedRentFee).gt(0)).map(a => Number(a.id));
    if (tab === TABS.UNSTAKE) {
      assets = stakedAssets.filter(a => new BigNumber(a.unclaimedRentFee).gt(0)).map(a => Number(a.id));
    }

    return assets.some(a => selectedAssets.indexOf(a) >= 0);
  };

  const handleUnstake = async () => {
    try {
      setUnstakeBtnLoading(true);
      setUnstakeBtnDisabled(true);
      const stakeTx = await landworksYf.unstake(selectedAssets);

      if (stakeTx.status) {
        // Update the local copy cus the Graph will need some time to gets updated, the Refetch of the assets wont help here
        const stakedAssetsCopy = [...stakedAssets];
        const updatedCopy = stakedAssetsCopy.filter(asset => !selectedAssets.includes(Number(asset.id)));
        setStakedAssets(updatedCopy);
        setSelectedAssets([]);
      }
    } catch (e) {
      console.log('Error while trying to stake assets !', e);
    } finally {
      setUnstakeBtnLoading(false);
      setUnstakeBtnDisabled(false);
    }
  };

  const handleEnable = async (e: any) => {
    try {
      setApproveBtnLoading(true);
      setApproveBtnDisabled(true);
      const tx = await (LandWorksToken.contract as Erc721Contract).setApprovalForAll(
        config.contracts.yf.landworks || '',
        true,
      );

      if (tx.status) {
        setApproved(tx.status);
      }

      setApproveBtnDisabled(false);
      setApproveBtnLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getNotStakedAssets = async () => {
    try {
      const assets = await fetchNotStakedAssets(account || '');
      setNotStakedAssets(assets);
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

  useEffect(() => {
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

  useEffect(() => {
    const stakeDisabled = !selectedAssets.length;
    setStakeBtnDisabled(stakeDisabled);
    setUnstakeBtnDisabled(stakeDisabled);
  }, [selectedAssets.length]);

  if (!walletCtx.isActive) {
    return (
      <section className="landworks-pool-stake">
        <Alert className="mb-32" message="Please sign-in in order to stake your LandWorks NFTs." />;
      </section>
    );
  }

  const assets = tab === TABS.STAKE ? notStakedAssets : stakedAssets;

  return (
    <section className="landworks-pool-stake">
      <Row justify="center">
        <Col>
          {(() => {
            if (tab === TABS.UNSTAKE && assets.length === 0) {
              return <Alert className="mb-32" message="You don't have any LandWorks NFTs staked." />;
            }
            if (tab === TABS.STAKE && assets.length === 0) {
              return <Alert className="mb-32" message="You don't have any LandWorks NFTs to stake." />;
            }
            return <p className="headMsg">Select the land you want to stake/unstake from the list</p>;
          })()}
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="lands-container">
        {assets.map(asset => {
          const name = getDecentralandAssetName(asset.decentralandData);
          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={asset.id}>
              <div className="landBox">
                <Checkbox className="landCheckbox" onChange={e => onLandCheckboxChange(e, asset.id)} />
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
              <button
                type="button"
                className="button-primary"
                disabled={stakeBtnDisabled || !approved}
                onClick={handleConfirm}>
                {stakeBtnLoading && <Spin spinning />}
                Stake
              </button>
            </Col>

            <Col>
              {!approved && (
                <button
                  type="button"
                  className="button-primary"
                  disabled={approveBtnDisabled || approved}
                  onClick={handleEnable}>
                  {approveBtnLoading && <Spin spinning />}
                  Enable LandWorks NFTs
                </button>
              )}
            </Col>
          </>
        ) : (
          <Col>
            <button type="button" className="button-primary" disabled={unstakeBtnDisabled} onClick={handleConfirm}>
              {unstakeBtnLoading && <Spin spinning />}
              Unstake
            </button>
          </Col>
        )}
      </Row>
    </section>
  );
};

export default LandworksPoolStake;
