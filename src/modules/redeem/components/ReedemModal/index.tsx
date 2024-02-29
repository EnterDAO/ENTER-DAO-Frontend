import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'bignumber.js';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Spin from 'components/antd/spin';
import ExternalLink from 'components/custom/externalLink';
import Grid from 'components/custom/grid';
import { Text } from 'components/custom/typography';
import { EnterToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import { formatBigNumber } from 'modules/redeem/views/redeem-page';
import warning from 'resources/svg/warning-2.svg';

import tokenAbi from '../../../../ABI/ENTR_TOKEN_ABI.json';

import s from './RedeemModal.module.scss';

export type RedeemModalProps = ModalProps & {
  merkleDistributor?: MerkleRedeemDistributor;
  userData?: any;
  redeemableAmountETH?: string;
  redeemableAmountTokens?: string;
  allocatedEth?: string;
};

const RedeemModal: FC<RedeemModalProps> = props => {
  const {
    merkleDistributor,
    userData,
    redeemableAmountETH,
    redeemableAmountTokens,
    allocatedEth,
    ...modalProps
  } = props;
  const { account, library } = useWeb3React();

  const [tokenBalance, setTokenBalance] = useState<BigNumber>(new BigNumber(0));
  const [isLoading, setIsLoading] = useState(true);
  const erc20TokenContract = new Contract(config.tokens.entr, tokenAbi, library.getSigner());
  const [claiming, setClaiming] = useState(false);

  const merkleDistributorContract = merkleDistributor;

  const hasLessThanAllocatedTokens = (): boolean => {
    return tokenBalance.lt(new BigNumber(userData.tokens));
  };

  useEffect(() => {
    if (account && library) {
      setIsLoading(true);
      const fetchBalance = async () => {
        const balance = await erc20TokenContract.balanceOf(account);
        setTokenBalance(new BigNumber(balance.toString()));
        setIsLoading(false);
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
                Redeem ETH
              </Text>
              {isLoading ? (
                <Spin type="circle" style={{ padding: '44px 64px 10px 64px' }} />
              ) : (
                <>
                  <img src={warning} alt="" style={{ margin: '12px 0', width: '128px', height: '128px' }} />
                  {hasLessThanAllocatedTokens() && (
                    <Text type="h3" tag="span" color="primary" style={{ fontSize: '20px', color: 'white' }}>
                      You will miss out on ETH
                    </Text>
                  )}
                  <Text type="h3" tag="span" color="primary" style={{ fontSize: '20px', color: 'white' }}>
                    YOU CAN ONLY REDEEM ONCE!
                  </Text>
                  <Text type="p1" weight="500" color="secondary">
                    {hasLessThanAllocatedTokens() ? (
                      <Text
                        type="p1"
                        weight="500"
                        color="secondary"
                        align="center"
                        style={{
                          color: '#B9B9D3',
                          fontSize: '12px',
                          fontWeight: '400',
                          lineHeight: '18px',
                          margin: '16px 0',
                        }}>
                        You are about to burn
                        <span style={{ fontWeight: '700' }}>
                          {' '}
                          {formatBigNumber(tokenBalance.unscaleBy(EnterToken.decimals)!)}
                        </span>{' '}
                        ENTR to redeem
                        <span style={{ fontWeight: '700' }}> {redeemableAmountETH?.toString()}</span> ETH.{' '}
                        <span style={{ fontWeight: '800', color: '#fff' }}>
                          You will miss out on{' '}
                          {formatBigNumber(new BigNumber(allocatedEth!).minus(new BigNumber(redeemableAmountETH!)))}{' '}
                          ETH.
                        </span>{' '}
                        Collect{' '}
                        <span style={{ fontWeight: '700' }}>
                          {formatBigNumber(
                            new BigNumber(userData.tokens).minus(tokenBalance!).unscaleBy(EnterToken.decimals)!,
                          )}{' '}
                        </span>
                        ENTR to redeem the full <span style={{ fontWeight: '700' }}>{allocatedEth} </span>ETH amount you
                        are eligible for.
                        <br />
                        <Text
                          type="p1"
                          style={{
                            color: '#B9B9D3',
                            fontSize: '12px',
                            fontWeight: '400',
                            lineHeight: '18px',
                          }}>
                          For detailed information on the redeem mechanism please check{' '}
                          <ExternalLink
                            type="button"
                            href="https://medium.com/enterdao/a-next-step-for-enterdao-2b8714bc0122">
                            <span
                              style={{
                                color: '#ED9199',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}>
                              our announcement
                            </span>
                          </ExternalLink>
                          .
                        </Text>
                      </Text>
                    ) : (
                      <Text
                        type="p1"
                        weight="500"
                        color="secondary"
                        align="center"
                        style={{
                          marginTop: '20px',
                        }}>
                        You have {tokenBalance.toString()} ENTR in wallet and you will burn {userData.tokens.toString()}{' '}
                        ENTR.
                      </Text>
                    )}
                  </Text>
                </>
              )}
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
