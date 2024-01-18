import { FC, useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber as _BigNumber } from 'bignumber.js';
import cn from 'classnames';
import { ethers } from 'ethers';
import { shortenAddr } from 'web3/utils';

import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { Hint } from 'components/custom/typography';
import { EthToken } from 'components/providers/known-tokens-provider';
import FAQs from 'modules/redeem/components/FAQs';
import RedeemModal from 'modules/redeem/components/ReedemModal';
import { useRedeem } from 'modules/redeem/providers/redeem-provider';
import { useWallet } from 'wallets/wallet';

import MerkleDistributorABI from '../../../../merkle-distributor/MerkleDistributor.json';
import graphic1Img from '../../animations/graphic1.svg';
import graphic2Img from '../../animations/graphic2.svg';
import AlreadyRedeemed from '../../components/AlreadyRedeemed';
import NotConnectWallet from '../../components/NotConnectWallet';
import NotEligible from '../../components/NotEligible';
import TextAndImage from '../../components/TextAndImage';

import s from './redeem.module.scss';

const Redeem: FC = () => {
  const redeemCtx = useRedeem();
  const { account, library } = useWeb3React();
  const [currentPoolSize, setCurrentPoolSize] = useState('--');
  const [redeemModalVisible, showRedeemModal] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState('--');
  const merkleDistributorContract = redeemCtx.merkleDistributor;

  const wallet = useWallet();
  const lockedRedeem =
    merkleDistributorContract?.redeemIndex === -1 || merkleDistributorContract?.redeemIndex === undefined;
  console.log('merkleDistributorContract?.isRedeemClaimed :>> ', merkleDistributorContract?.isRedeemClaimed);
  const totalToBeRedeemed = new _BigNumber(merkleDistributorContract?.totalToBeRedeemed ?? 0).unscaleBy(
    EthToken.decimals,
  );
  const allocatedEth = new _BigNumber(merkleDistributorContract?.allocatedEth ?? 0).unscaleBy(EthToken.decimals);
  const allocatedTokens = new _BigNumber(merkleDistributorContract?.allocatedTokens ?? 0);

  useEffect(() => {
    const fetchCurrentPoolSize = async () => {
      if (!library || !merkleDistributorContract || !account) return;

      const contract = new Contract(merkleDistributorContract.address, MerkleDistributorABI.abi, library);
      const currentETHBalance = await library.getBalance(merkleDistributorContract.address);
      const formattedCurrentETHBalance = ethers.utils.formatEther(currentETHBalance);
      const size = await contract.currentPoolSize();
      const formattedSize = ethers.utils.formatEther(size);
      const formattedSizeWithTwoDecimals = Number(formattedSize).toFixed(2);

      setCurrentPoolSize(formattedSizeWithTwoDecimals ?? '0');

      const calculatedValue = allocatedEth?.minus(formattedCurrentETHBalance)?.toFixed(2);
      setTotalClaimed(calculatedValue && !isNaN(parseFloat(calculatedValue)) ? calculatedValue : '--');
    };

    fetchCurrentPoolSize();
  }, [library, merkleDistributorContract, account]);

  if (!merkleDistributorContract?.isInitialized && wallet.isActive) {
    return <Spin />;
  }

  const handleRedeem = () => {
    showRedeemModal(true);
  };

  return (
    <section className={s.page}>
      <Grid colsTemplate={'1fr 1fr'} className={s.grid__container}>
        {/* <Grid> */}
        <div className={s.general__info}>
          <Text
            type="h1"
            color="primary"
            className="mb-8"
            style={{ width: '400px', fontSize: '48px', textTransform: 'uppercase' }}>
            {/* TODO ask for thin fonts */}
            Redeem <b>ETH</b> for <b>ENTR</b>
          </Text>
          <Text type="p1" color="secondary" className="mb-32" style={{ width: '480px', color: 'white' }}>
            Use the ENTR Redemption Portal to redeem your ENTR for ETH. You can redeem your ENTR at a fixed rate of
            0.0025376 ETH until November 2nd 2024 at 23h59 UTC.
          </Text>
          <a
            type="button"
            className="button-ghost"
            style={{ height: '44px', width: '200px', fontSize: '16px' }}
            href="https://medium.com/enterdao">
            {/* TODO add real link to article */}
            <span style={{ fontSize: '12px' }}>Read Medium Article</span>
          </a>
        </div>
        <Grid
          colsTemplate="1fr 1fr"
          rowsTemplate="auto auto"
          gap={24}
          justify="space-between"
          className={cn(s.card, s.card__head, 'mb-32')}>
          <div className={s.info__vl}>
            <div>
              <Hint text="The amount of ETH you have already redeemed." className="mb-8">
                <Text type="p2" color="secondary" style={{ textTransform: 'none' }}>
                  Total Claimed
                </Text>
              </Hint>
              <div className="flex flow-col align-center">
                <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                <Text type="h3" weight="bold" color="primary">
                  {merkleDistributorContract?.isRedeemClaimed ? allocatedEth?.toFixed(5) : '0.00'}
                </Text>
                &nbsp;
                <Text type="h3">ETH</Text>
              </div>
            </div>
          </div>
          <div className={cn(s.info__vl, s.info__vl__last)}>
            <div>
              <Hint text="The amount of remaining ETH you have not redeemed." className="mb-8">
                <Text type="p2" color="secondary" style={{ textTransform: 'none', color: 'black' }}>
                  Total Remaining
                </Text>
              </Hint>
              <div className="flex flow-col align-center">
                <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                <Text type="h3" weight="bold" color="green">
                  {merkleDistributorContract?.isRedeemClaimed ? '0.00' : allocatedEth?.toFixed(5)}
                </Text>
                &nbsp;
                <Text type="h3" color="green">
                  ETH
                </Text>
              </div>
            </div>
          </div>
          <div
            style={{ gridColumn: '1 / -1' }}
            className={cn(s.card, {
              [s.card__big]: !lockedRedeem && !merkleDistributorContract?.isRedeemClaimed,
            })}>
            {!wallet.isActive ? (
              <div className={s.card__empty}>
                <NotConnectWallet />
              </div>
            ) : lockedRedeem ? (
              <div className={s.card__empty}>
                <NotEligible />
              </div>
            ) : merkleDistributorContract?.isRedeemClaimed ? (
              <div className={s.card__empty}>
                <AlreadyRedeemed entrAmount={allocatedTokens?.toString()} ethAmount={allocatedEth?.toFixed(5)!} />
              </div>
            ) : (
              <div className={s.redeem__info__details}>
                <div className={s.redeem__container}>
                  <Text type="h2">{`ENTR Tokens ${shortenAddr(wallet.account, 5, 3)} can redeem`}</Text>
                  <Text type="h1" style={{ fontSize: '48px' }}>
                    {allocatedTokens?.toString()} ENTR
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Text type="h2" style={{ color: '#625F97', fontSize: '16px' }}>
                      {' '}
                      1 ENTR = 0.002 ETH
                    </Text>

                    <Text type="h2" style={{ color: 'white', fontSize: '16px' }}>
                      {' '}
                      {allocatedTokens?.toString()} ENTR = {allocatedEth?.toFixed(5)} ETH
                    </Text>
                  </div>
                </div>
                <div style={{ marginTop: '90px', width: '100%' }}>
                  <button className={cn('button-primary', s.redeem__button)} onClick={handleRedeem}>
                    Redeem {allocatedTokens?.toString()} ENTR for {allocatedEth?.toFixed(5)} ETH
                  </button>
                  <span>Pay Attention</span> <br></br>
                  <span>You can redeem your tokens only once.</span>
                </div>
              </div>
            )}
          </div>
        </Grid>
      </Grid>
      <div className={s.wavy__background}></div>
      <div className={s.container}>
        <TextAndImage image={graphic1Img} imageFirst>
          <div className={s.flex__column}>
            <Text type="h1" style={{ alignSelf: 'flex-start', textTransform: 'uppercase', marginBottom: '32px' }}>
              How it works
            </Text>
            <Text type="h3">
              {' '}
              <b>Step 1</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
            <Text type="h3">
              {' '}
              <b>Step 2</b> Lorem ipsum dolor sit amet, consectetur.
            </Text>
            <Text type="h3">
              {' '}
              <b>Step 3</b> Lorem ipsum dolor sit amet, consectetur adipiscing.
            </Text>
          </div>
        </TextAndImage>
        <TextAndImage image={graphic2Img}>
          <div className={s.flex__column}>
            <Text type="h1" style={{ alignSelf: 'flex-start', textTransform: 'uppercase', marginBottom: '32px' }}>
              Lorem Ipsum
            </Text>
            <Text type="h3">
              Sorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis
              tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit
              sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
            </Text>
          </div>
        </TextAndImage>
      </div>
      <FAQs />
      {redeemModalVisible && (
        <RedeemModal
          merkleDistributor={merkleDistributorContract}
          onCancel={() => showRedeemModal(false)}
          className="redeem__modal"
        />
      )}
    </section>
  );
};

export default Redeem;
