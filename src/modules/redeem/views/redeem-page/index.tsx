//TODO remove all airdrop references
import { FC, useState } from 'react';
import { BigNumber as _BigNumber } from 'bignumber.js';
import cn from 'classnames';
import Lottie from 'lottie-react';
import ContractListener from 'web3/components/contract-listener';
import TxConfirmModal, { ConfirmTxModalArgs } from 'web3/components/tx-confirm-modal';
import TxStatusModal from 'web3/components/tx-status-modal';
import { formatToken, shortenAddr } from 'web3/utils';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { Hint } from 'components/custom/typography';
import { useGeneral } from 'components/providers/general-provider';
import { EnterToken, EthToken } from 'components/providers/known-tokens-provider';
import FAQs from 'modules/redeem/components/FAQs';
import RedeemModal from 'modules/redeem/components/ReedemModal';
import { useRedeem } from 'modules/redeem/providers/redeem-provider';
import { useLandworksYf } from 'modules/yield-farming/providers/landworks-yf-provider';
import { useWallet } from 'wallets/wallet';

import { useMediaQuery } from '../../../../hooks';
import graphic1Img from '../../animations/graphic1.svg';
import graphic2Img from '../../animations/graphic2.svg';
import AlreadyRedeemed from '../../components/AlreadyRedeemed';
import NotConnectWallet from '../../components/NotConnectWallet';
import NotEligible from '../../components/NotEligible';
import TextAndImage from '../../components/TextAndImage';

import s from './redeem.module.scss';

const Redeem: FC = () => {
  const redeemCtx = useRedeem();
  const [redeemModalVisible, showRedeemModal] = useState(false);
  const merkleDistributorContract = redeemCtx.merkleDistributor;

  const wallet = useWallet();
  const lockedAirDrop = !merkleDistributorContract?.redeemIndex;

  const totalToBeRedeemed = new _BigNumber(merkleDistributorContract?.totalToBeRedeemed ?? 0).unscaleBy(
    EnterToken.decimals,
  );
  const allocatedEth = new _BigNumber(merkleDistributorContract?.allocatedEth ?? 0).unscaleBy(EthToken.decimals);
  const allocatedTokens = new _BigNumber(merkleDistributorContract?.allocatedTokens ?? 0).unscaleBy(
    EnterToken.decimals,
  );

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
        {/* </Grid> */}
        <Grid
          colsTemplate="1fr 1fr"
          rowsTemplate="auto auto"
          gap={24}
          justify="space-between"
          className={cn(s.card, s.card__head, 'mb-32')}>
          <div className={s.info__vl}>
            <div>
              <Hint text="The amount of $ENTR claimed to date." className="mb-8">
                <Text type="p2" color="secondary" style={{ textTransform: 'none' }}>
                  Total Claimed
                </Text>
              </Hint>
              <div className="flex flow-col align-center">
                <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                <Text type="h3" weight="bold" color="primary">
                  {totalToBeRedeemed?.toString()}
                  {formatToken(totalToBeRedeemed)}
                </Text>
                &nbsp;
                <Text type="h3">ENTR</Text>
              </div>
            </div>
          </div>
          <div className={cn(s.info__vl, s.info__vl__last)}>
            <div>
              <Hint
                text="The amount of remaining $ENTR to be distributed across remaining recipients."
                className="mb-8">
                <Text type="p2" color="secondary" style={{ textTransform: 'none', color: 'black' }}>
                  Total Remaining
                </Text>
              </Hint>
              <div className="flex flow-col align-center">
                <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                <Text type="h3" weight="bold" color="green">
                  TODO calc remaining amount
                  {/* {formatToken(totalRedistributed)} */}
                </Text>
                &nbsp;
                <Text type="h3" color="green">
                  ENTR
                </Text>
              </div>
            </div>
          </div>
          <div
            style={{ gridColumn: '1 / -1' }}
            className={cn(s.card, {
              [s.card__big]: !lockedAirDrop && !merkleDistributorContract?.isRedeemClaimed,
            })}>
            {
              // !wallet.isActive ? (
              //   <div className={s.card__empty}>
              //     <NotConnectWallet />
              //   </div>
              // ) : lockedAirDrop ? (
              //   <div className={s.card__empty}>
              //     <NotEligible />
              //   </div>
              // ) : merkleDistributorContract?.isAirdropClaimed ? (
              //   <div className={s.card__empty}>
              //     <AlreadyRedeemed entrAmount={'400'} ethAmount={'0.08'} />
              //   </div>
              // ) :

              <div className={s.redeem__info__details}>
                <div className={s.redeem__container}>
                  <Text type="h2">{`ENTR Tokens ${shortenAddr(wallet.account, 8, 8)} can redeem`}</Text>
                  <Text type="h1">400 ENTR</Text>
                  <Text type="h2"> 1 ENT = 0.002 ETH 400 ENT = 0.08 ETH</Text>
                </div>
                <div>
                  <button className={cn('button-primary', s.redeem__button)} onClick={handleRedeem}>
                    Redeem {allocatedTokens?.toString()} ENTR for {allocatedEth?.toString()} ETH
                  </button>
                  <span>Pay Attention</span>
                  <span>You can redeem your tokens only once.</span>
                </div>
              </div>
            }
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
        <RedeemModal merkleDistributor={merkleDistributorContract} onCancel={() => showRedeemModal(false)} />
      )}
    </section>
  );
};

export default Redeem;
