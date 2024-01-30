import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'bignumber.js';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import config from 'config';
import warning from 'resources/svg/warning-2.svg';

import tokenAbi from '../../../../ABI/ENTR_TOKEN_ABI.json';

import s from './RedeemModal.module.scss';

export type RedeemModalProps = ModalProps & {
  merkleDistributor?: MerkleRedeemDistributor;
  userData?: any;
  redeemableAmountETH?: string;
  redeemableAmountTokens?: string;
};

const RedeemModal: FC<RedeemModalProps> = props => {
  const { merkleDistributor, userData, redeemableAmountETH, redeemableAmountTokens, ...modalProps } = props;
  const { account, library } = useWeb3React();

  const [tokenBalance, setTokenBalance] = useState(new BigNumber(0));

  const erc20TokenContract = new Contract(config.tokens.entr, tokenAbi, library.getSigner());
  const [claiming, setClaiming] = useState(false);

  const merkleDistributorContract = merkleDistributor;

  useEffect(() => {
    if (account && library) {
      const fetchBalance = async () => {
        const balance = await erc20TokenContract.balanceOf(account);
        setTokenBalance(new BigNumber(balance.toString()));
      };
      fetchBalance().catch(console.error);
    }
  }, [account, library, config.tokens.entr, tokenAbi, merkleDistributor]);

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

  return (
    <Modal width={416} {...modalProps} className={s.redeemModal}>
      <div className="flex flow-row">
        {claiming === true ? (
          <div className="flex flow-row mb-32" style={{ justifyContent: 'center', alignItems: 'center' }}>
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
                style={{ alignSelf: 'flex-start', fontWeight: '400', fontSize: '12px' }}>
                Redeem ETH
              </Text>
              <img src={warning} alt="" style={{ marginRight: '10px', width: '128px', height: '128px' }} />
              <Text type="h3" tag="span" color="primary" style={{ margin: '16px 0', fontSize: '24px', color: 'white' }}>
                You can only redeem once!
              </Text>
              <Text type="p1" weight="500" color="secondary" className="mb-16">
                {tokenBalance.lt(new BigNumber(userData.tokens)) ? (
                  <Text type="p1" weight="500" color="secondary" align="center" style={{ color: 'white' }}>
                    You have {tokenBalance.toString()} ENTR in wallet but you are eligible for{' '}
                    {userData.tokens.toString()} ENTR.
                    <br />
                    Are you sure?
                  </Text>
                ) : (
                  <Text type="p1" weight="500" color="secondary" align="center">
                    You have {tokenBalance.toString()} ENTR in wallet and you will burn {userData.tokens.toString()}{' '}
                    ENTR.
                  </Text>
                )}
              </Text>
            </div>
            <Spin spinning={claiming}>
              <Button type="primary" onClick={() => claimPermitRedeem()} className={s.redeem__modal__button}>
                Confirm Redeem
              </Button>
            </Spin>
          </div>
        )}
        <Grid flow="col" justify="space-between"></Grid>
      </div>
    </Modal>
  );
};

export default RedeemModal;
