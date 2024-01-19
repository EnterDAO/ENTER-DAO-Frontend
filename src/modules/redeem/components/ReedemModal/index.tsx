import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import config from 'config';

import tokenAbi from '../../../../ABI/ERC20_Mock_ABI.json';

import s from './RedeemModal.module.scss';

export type RedeemModalProps = ModalProps & {
  merkleDistributor?: MerkleRedeemDistributor;
  userData?: any;
};

const RedeemModal: FC<RedeemModalProps> = props => {
  const { merkleDistributor, userData, ...modalProps } = props;
  const { account, library } = useWeb3React();

  const [tokenBalance, setTokenBalance] = useState(0);

  const erc20TokenContract = new Contract(config.tokens.entr, tokenAbi, library.getSigner());
  const [claiming, setClaiming] = useState(false);

  const merkleDistributorContract = merkleDistributor;
  useEffect(() => {
    if (account && library) {
      const fetchBalance = async () => {
        const balance = await erc20TokenContract.balanceOf(account);
        setTokenBalance(balance.toString());
      };
      fetchBalance().catch(console.error);
    }
  }, [account, library, config.tokens.entr, tokenAbi, merkleDistributor]);
  async function claimRedeem() {
    if (!account || !library || !merkleDistributorContract) return;

    const actualTokenBalance = BigNumber.from(tokenBalance);
    const allocatedTokens = BigNumber.from(userData.tokens);
    const amountToApprove = actualTokenBalance.lt(allocatedTokens) ? actualTokenBalance : allocatedTokens;

    try {
      setClaiming(true);
      const currentAllowance = await erc20TokenContract.allowance(account, merkleDistributorContract.address);
      if (currentAllowance.lt(amountToApprove)) {
        const approvalTx = await erc20TokenContract.approve(merkleDistributorContract.address, amountToApprove);
        await approvalTx.wait();
      }
      await merkleDistributorContract?.redeem();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
      props.onCancel?.();
    }
  }

  async function claimPermitRedeem() {
    if (!account || !library || !merkleDistributorContract) return;

    try {
      setClaiming(true);
      await merkleDistributorContract?.permitRedeem();
      window.location.reload();
    } catch (e) {
      console.error('error', e);
    } finally {
      setClaiming(false);
      props.onCancel?.();
    }
  }

  async function cancelRedeemModal() {
    props.onCancel?.();
  }

  return (
    <Modal width={416} {...modalProps} className={s.redeemModal}>
      <div className="flex flow-row">
        {claiming === true ? (
          <div className="flex flow-row mb-32" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text type="h2" weight="semibold" color="primary" className="mb-8" font="secondary">
              Processing...
            </Text>
            <Text type="h2" weight="semibold" color="primary" className="mb-8" font="secondary">
              Please wait for Metamask pop-up
            </Text>
          </div>
        ) : (
          <div className="flex flow-row mb-32">
            <Text type="h2" weight="semibold" color="primary" className="mb-8" font="secondary">
              Redeem reward
            </Text>
            <Text type="p1" weight="500" color="secondary">
              You have redeemable ETH from the $ENTR Redeem. <br></br>
              <Text type="p1" tag="span" weight="bold" style={{ textTransform: 'uppercase' }}>
                Warning: You can only claim once!
              </Text>
            </Text>
          </div>
        )}
        <Grid flow="col" justify="space-between">
          <Spin spinning={claiming === true}>
            <Button type="primary" onClick={() => claimRedeem()}>
              Redeem
            </Button>
          </Spin>
          <Spin spinning={claiming === true}>
            <Button type="primary" onClick={() => claimPermitRedeem()}>
              Permit Redeem
            </Button>
          </Spin>
          <Spin spinning={claiming === true}>
            <Button type="ghost" onClick={() => cancelRedeemModal()}>
              Cancel
            </Button>
          </Spin>
        </Grid>
      </div>
    </Modal>
  );
};

export default RedeemModal;
