import React, { FC, useMemo, useState } from 'react';
import { BigNumber as _BigNumber } from 'bignumber.js';
import { BigNumber, FixedNumber } from 'ethers';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';
import { formatToken } from 'web3/utils';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import { EnterToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import BalanceTree from 'merkle-distributor/balance-tree';
import { useWallet } from 'wallets/wallet';

export type RedeemModalProps = ModalProps & {
  merkleDistributor?: MerkleRedeemDistributor;
};

const RedeemModal: FC<RedeemModalProps> = props => {
  const { merkleDistributor, ...modalProps } = props;

  const walletCtx = useWallet();

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

  const redeemAmountETH = merkleDistributorContract?.allocatedEth || 0;
  const redeemAmountENTR = merkleDistributorContract?.allocatedTokens || 0;

  const claimAmountETHFromJSON = BigNumber.from(FixedNumber.from(redeemAmountETH)); //TODO where is this being used? 
  const claimAmountENTRFromJSON = BigNumber.from(FixedNumber.from(redeemAmountENTR));

  const redeemIndex = merkleDistributorContract?.redeemIndex ?? -1; //TODO this was merkleDistributorContract?.redeemIndex || -1. Not sure whether was correct tho but needs to be double checked

  const merkleProof = //TODO Hris
    redeemIndex !== -1
      ? tree.getProof(
          +redeemIndex,
          walletCtx.account || '',
          BigNumber.from(redeemAmountENTR),
          BigNumber.from(redeemAmountETH),
        )
      : [];
  // const adjustedAmount = _BigNumber.from(merkleDistributorContract?.adjustedAmount);

  const obj = { // TODO nasty code fix it
    index: redeemIndex,
    account: walletCtx.account,
    tokens: redeemAmountENTR,
    eth: redeemAmountETH,
    merkleProof: merkleProof,
  };

  merkleDistributorContract!.obj = obj; //TODO nasty code. Fix it

  async function claimRedeem() {
    console.log('Redeem initiated');
    setClaiming(true);
    try {
      await merkleDistributorContract?.redeem(
      );

      console.log('Redeem successful'); //TODO tx hash currently not redirect you anywhere
    } catch (e) {
      console.log('error =>>', e);
    }

    setClaiming(false);
    props.onCancel?.();
  }

  async function cancelRedeemModal() {
    props.onCancel?.();
  }

  return (
    <Modal width={416} {...modalProps}>
      <div className="flex flow-row">
        <div className="flex flow-row mb-32">
          <Text type="h2" weight="semibold" color="primary" className="mb-8" font="secondary">
            Redeem reward
          </Text>
          <Text type="p1" weight="500" color="secondary">
            You have claimable tokens from the $ENTR Redeem. This balance will rise over time and as more people exit
            the pool and forfeit their additional rewards. <br></br>
            <Text type="p1" tag="span" weight="bold">
              Warning: You can only claim once!
            </Text>
          </Text>
          <br></br>
          <Text type="p1" weight="bold" color="primary" className="mb-8">
            {/* Available to claim now: {formatToken(adjustedAmount?.unscaleBy(EnterToken.decimals))} */}
          </Text>
        </div>
        <Grid flow="col" justify="space-between">
          <Spin spinning={claiming === true}>
            <Button type="primary" onClick={() => claimRedeem()}>
              Claim
            </Button>
          </Spin>
          <Button type="ghost" onClick={() => cancelRedeemModal()}>
            Cancel
          </Button>
        </Grid>
      </div>
    </Modal>
  );
};

export default RedeemModal;
