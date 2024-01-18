import { FC, useEffect, useMemo, useState } from 'react';
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
import BalanceTree from 'merkle-distributor/balance-tree';
import { useWallet } from 'wallets/wallet';

import tokenAbi from '../../../../ABI/ERC20_Mock_ABI.json';

import s from './RedeemModal.module.scss';

const tokenAddress = '0xC11d929a6C6d6c68EeF19d305EFb04423f162620'; //TODO change to 0xd779eEA9936B4e323cDdff2529eb6F13d0A4d66e

export type RedeemModalProps = ModalProps & {
  merkleDistributor?: MerkleRedeemDistributor;
};

const RedeemModal: FC<RedeemModalProps> = props => {
  const { merkleDistributor, ...modalProps } = props;
  const { account, library } = useWeb3React();
  const [tokenBalance, setTokenBalance] = useState(0);
  const walletCtx = useWallet();
  const erc20TokenContract = new Contract(tokenAddress, tokenAbi, library.getSigner());
  const [claiming, setClaiming] = useState(false);

  const merkleDistributorContract = merkleDistributor;

  const tree = useMemo(() => {
    let redeemData;
    config.isDev
      ? (redeemData = require(`../../../../merkle-distributor/tree.json`))
      : (redeemData = require(`../../../../merkle-distributor/airdrop.json`));

    const redeemAccounts = Object.entries(redeemData.redemptions).map(([address, data]) => ({
      account: address,
      tokens: BigNumber.from((data as any).tokens),
      eth: BigNumber.from((data as any).eth),
    }));

    return new BalanceTree(redeemAccounts);
  }, []);

  useEffect(() => {
    if (account && library) {
      const fetchBalance = async () => {
        const balance = await erc20TokenContract.balanceOf(account);
        console.log('balance :>> ', balance.toString());
        setTokenBalance(balance.toString());
      };
      fetchBalance().catch(console.error);
    }
  }, [account, library, tokenAddress, tokenAbi, merkleDistributor]);

  const redeemAmountETH = merkleDistributorContract?.allocatedEth || 0;
  const redeemAmountENTR = merkleDistributorContract?.allocatedTokens || 0;

  const redeemIndex = merkleDistributorContract?.redeemIndex ?? -1;

  const merkleProof =
    redeemIndex !== -1
      ? tree.getProof(
          +redeemIndex,
          walletCtx.account || '',
          BigNumber.from(redeemAmountENTR),
          BigNumber.from(redeemAmountETH),
        )
      : [];

  const userData = {
    index: redeemIndex,
    account: walletCtx.account,
    tokens: redeemAmountENTR,
    eth: redeemAmountETH,
    merkleProof: merkleProof,
    actualBalance: tokenBalance,
    library: library,
    erc20: erc20TokenContract,
  };
  console.log('userData.actualBalance :>> ', userData.actualBalance);
  merkleDistributorContract!.loadUserData(userData);

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
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
      window.location.reload();
      props.onCancel?.();
    }
  }

  async function claimPermitRedeem() {
    if (!account || !library || !merkleDistributorContract) return;

    try {
      setClaiming(true);
      await merkleDistributorContract?.permitRedeem();
    } catch (e) {
      console.error("error", e);
    } finally {
      setClaiming(false);
      window.location.reload();
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
