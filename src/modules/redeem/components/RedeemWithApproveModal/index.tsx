import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'bignumber.js';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';
import Web3Contract from 'web3/web3Contract';

import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import config from 'config';

import tokenAbi from '../../../../ABI/ENTR_TOKEN_ABI.json';
import { ApproveStep } from './ApproveStep';
import { RedeemStep } from './RedeemStep';

import s from './RedeemWithApproveModal.module.scss';

export type RedeemWithApproveModalProps = ModalProps & {
  userData: any;
  merkleDistributor?: MerkleRedeemDistributor;
  redeemableAmountETH?: string;
  redeemableAmountTokens?: string;
};

const RedeemWithApproveModal: FC<RedeemWithApproveModalProps> = props => {
  const {
    userData,
    merkleDistributor: merkleDistributorContract,
    redeemableAmountETH,
    redeemableAmountTokens,
    ...modalProps
  } = props;
  const { account, library } = useWeb3React();

  const [tokenApproved, setTokenApproved] = useState<BigNumber>(new BigNumber(0));
  const [isContract, setIsContract] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const erc20TokenContract = new Contract(config.tokens.entr, tokenAbi, library.getSigner());

  const redeemAmount = new BigNumber(userData.tokens ?? 0);
  const shouldApprove = tokenApproved.lt(redeemAmount);

  async function loadApprovedTokens() {
    const allowance = await erc20TokenContract.allowance(account, merkleDistributorContract?.address);

    setTokenApproved(new BigNumber(allowance.toString()));
  }

  useEffect(() => {
    if (account && library) {
      const loadInitialAccountData = async () => {
        setIsLoading(true);

        try {
          await loadApprovedTokens();
          const isContract = await Web3Contract.isContract(account);

          setIsContract(isContract);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialAccountData();
    }
  }, [account, library, config.tokens.entr, tokenAbi, merkleDistributorContract]);

  async function redeem(watchTx: boolean = true) {
    if (!account || !library || !merkleDistributorContract) return;

    return merkleDistributorContract?.redeem(watchTx);
  }

  async function approve() {
    if (!shouldApprove) return;
    if (!account || !library || !merkleDistributorContract) return;

    return erc20TokenContract.approve(merkleDistributorContract?.address, redeemAmount.toString());
  }

  return (
    <Modal width={416} {...modalProps} className={s.redeemModal}>
      <div className="flex flow-row">
        <div>
          {shouldApprove ? (
            <ApproveStep
              approve={approve}
              onApproveComplete={loadApprovedTokens}
              isLoading={isLoading}
              isContract={isContract}
              Loader={<Spin type="circle" style={{ padding: '44px 64px 10px 64px' }} />}
              Header={
                <Text
                  type="p1"
                  color="white"
                  className="mb-8"
                  font="secondary"
                  style={{ alignSelf: 'flex-start', fontWeight: '400', fontSize: '12px', lineHeight: '16px' }}>
                  Approve and Redeem
                </Text>
              }
            />
          ) : (
            <RedeemStep
              redeem={redeem}
              onRedeemComplete={() => props.onCancel?.()}
              redeemableAmountETH={redeemableAmountETH}
              redeemableAmountTokens={redeemableAmountTokens}
              isLoading={isLoading}
              isContract={isContract}
              Loader={<Spin type="circle" style={{ padding: '44px 64px 10px 64px' }} />}
              Header={
                <Text
                  type="p1"
                  color="white"
                  className="mb-8"
                  font="secondary"
                  style={{ alignSelf: 'flex-start', fontWeight: '400', fontSize: '12px', lineHeight: '16px' }}>
                  Redeem
                </Text>
              }
            />
          )}
        </div>

        <Grid flow="col" justify="space-between"></Grid>
      </div>
    </Modal>
  );
};

export default RedeemWithApproveModal;
