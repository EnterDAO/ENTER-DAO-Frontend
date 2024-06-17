import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'bignumber.js';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';
import Web3Contract from 'web3/web3Contract';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import config from 'config';
import signing from 'resources/svg/signing.svg';
import success from 'resources/svg/success.svg';

import tokenAbi from '../../../../ABI/ENTR_TOKEN_ABI.json';

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
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

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

  async function redeem() {
    if (!account || !library || !merkleDistributorContract) return;

    try {
      setIsRedeeming(true);
      await merkleDistributorContract?.redeem();
      window.location.reload();
    } catch (e) {
      console.error('error', e);
    } finally {
      setIsRedeeming(false);
      props.onCancel?.();
    }
  }

  async function approve() {
    if (!shouldApprove) return;
    if (!account || !library || !merkleDistributorContract) return;

    try {
      setIsApproving(true);
      const tx = await erc20TokenContract.approve(merkleDistributorContract?.address, redeemAmount.toString());

      await tx.wait();
      await loadApprovedTokens();
    } catch (error) {
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  }

  // approve or redeem step
  const step = {
    image: shouldApprove ? signing : success,
    name: shouldApprove ? 'Approve and Redeem?' : 'Successfully Approved!',
    infoText: isContract
      ? `You are trying to ${
          shouldApprove ? 'approve' : 'redeem'
        } tokens from a multi-sig address. Please make sure this transaction is not already initiated by another wallet.`
      : null,
    Button: shouldApprove ? (
      <Spin spinning={isApproving}>
        <Button type="primary" onClick={() => approve()} className={s.redeem__modal__button}>
          Approve
        </Button>
      </Spin>
    ) : (
      <Spin spinning={isRedeeming}>
        <Button type="primary" onClick={() => redeem()} className={s.redeem__modal__button}>
          Redeem {redeemableAmountTokens} ENTR for {redeemableAmountETH} ETH
        </Button>
      </Spin>
    ),
  };

  return (
    <Modal width={416} {...modalProps} className={s.redeemModal}>
      <div className="flex flow-row">
        {isRedeeming === true ? (
          <div className="flex flow-row" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Spin type="circle" style={{ padding: '44px 64px 10px 64px' }} />
            <Text type="h2" style={{ fontWeight: '400' }} color="primary" className="mb-8" font="secondary">
              Waiting For Confirmation
            </Text>
            <Text
              type="h2"
              style={{ fontWeight: '400', fontSize: '16px', lineHeight: '24px' }}
              color="primary"
              className="mb-8"
              font="secondary">
              Redeeming {redeemableAmountTokens!.toString()} ENTR for {redeemableAmountETH!.toString()} ETH
            </Text>
            <Text
              type="h2"
              style={{ fontWeight: '400', fontSize: '12px', lineHeight: '16px' }}
              color="primary"
              className="mb-8"
              font="secondary">
              Confirm this transaction in your wallet
            </Text>
          </div>
        ) : (
          <div>
            <div className="flex flow-row mb-32 justify-center align-center">
              <Text
                type="p1"
                color="white"
                className="mb-8"
                font="secondary"
                style={{ alignSelf: 'flex-start', fontWeight: '400', fontSize: '12px', lineHeight: '16px' }}>
                Approve and Redeem
              </Text>
              {isLoading ? (
                <Spin type="circle" style={{ padding: '44px 64px 10px 64px' }} />
              ) : (
                <>
                  <img src={step.image} alt="" style={{ margin: '12px 0', width: '128px', height: '128px' }} />

                  <Text type="h3" tag="span" color="primary" style={{ fontSize: '20px', color: 'white' }}>
                    {step.name}
                  </Text>
                  <Text type="p1" weight="500" color="secondary">
                    <Text
                      type="p1"
                      weight="500"
                      color="secondary"
                      align="center"
                      style={{
                        marginTop: '20px',
                      }}>
                      {step.infoText}
                    </Text>
                  </Text>
                </>
              )}
            </div>
            {step.Button}
          </div>
        )}
        <Grid flow="col" justify="space-between"></Grid>
      </div>
    </Modal>
  );
};

export default RedeemWithApproveModal;
