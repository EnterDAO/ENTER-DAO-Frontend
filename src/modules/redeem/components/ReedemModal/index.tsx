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
import BalanceRedeemTree from 'merkle-distributor/balance-redeem-tree';
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
      amount: BigNumber.from((data as any).eth),
      // eth: BigNumber.from((data as any).eth)) // TODO fix this
    }));

    return new BalanceRedeemTree(redeemAccounts);
  }, []);

  const redeemAmountETH = merkleDistributorContract?.allocatedEth || 0;
  const redeemAmountENTR = merkleDistributorContract?.allocatedTokens || 0;

  const claimAmountETHFromJSON = BigNumber.from(FixedNumber.from(redeemAmountETH));
  const claimAmountENTRFromJSON = BigNumber.from(FixedNumber.from(redeemAmountENTR));

  const redeemIndex = merkleDistributorContract?.redeemIndex || -1;
  console.log('redeemIndex, ', redeemIndex);
  const merkleProof =
    redeemIndex !== -1
      ? tree.getProof(redeemIndex || BigNumber.from(0), walletCtx.account || '', claimAmountETHFromJSON)
      : [];
  // const adjustedAmount = _BigNumber.from(merkleDistributorContract?.adjustedAmount);

  async function claimRedeem() {
    console.log('Redeem initiated');
    setClaiming(true);
    try {
      await merkleDistributorContract
        ?.redeem
        // redeemIndex || BigNumber.from(0),
        // merkleDistributorContract.account || '',
        // claimAmountFromJSON.toString(),
        // merkleProof,
        ();
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
