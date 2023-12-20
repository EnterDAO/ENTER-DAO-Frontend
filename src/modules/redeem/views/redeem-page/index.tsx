//TODO remove all airdrop references
import { FC, useState } from 'react';
import { BigNumber as _BigNumber } from 'bignumber.js';
import cn from 'classnames';
import Lottie from 'lottie-react';
import { formatToken } from 'web3/utils';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { Hint } from 'components/custom/typography';
import { useGeneral } from 'components/providers/general-provider';
import { EnterToken } from 'components/providers/known-tokens-provider';
import { useRedeem } from 'modules/redeem/providers/redeem-provider';
import base from 'resources/svg/base.svg';
import loaderForDark from 'resources/svg/dark.svg';
import loaderForWhite from 'resources/svg/light.svg';
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
  const { isDarkTheme } = useGeneral();
  const isTablet = useMediaQuery(992);
  const isMobile = useMediaQuery(720);
  const redeemCtx = useRedeem();

  const merkleDistributorContract = redeemCtx.merkleDistributor;

  const wallet = useWallet();
  const lockedAirDrop = !merkleDistributorContract?.claimIndex;

  const totalClaimed = new _BigNumber(merkleDistributorContract?.totalInfo?.totalAirdropClaimed ?? 0).unscaleBy(
    EnterToken.decimals,
  );
  const totalRedistributed = new _BigNumber(
    merkleDistributorContract?.totalInfo?.totalAirdropRedistributed ?? 0,
  ).unscaleBy(EnterToken.decimals);

  const userAmount = new _BigNumber(merkleDistributorContract?.claimAmount ?? 0).unscaleBy(EnterToken.decimals);
  const userAvailable = new _BigNumber(merkleDistributorContract?.adjustedAmount?.airdropAmount ?? 0).unscaleBy(
    EnterToken.decimals,
  );
  const userBonus = new _BigNumber(merkleDistributorContract?.adjustedAmount?.bonusPart ?? 0).unscaleBy(
    EnterToken.decimals,
  );

  const [isClaim, setIsClaim] = useState(false);

  const progressPercent = userAvailable
    ?.times(100)
    .div(userAmount ?? 0)
    .toNumber();

  // const progressPercent = 100;

  const handleClaim = async () => {
    setIsClaim(true);
    try {
      await merkleDistributorContract?.claim();
    } catch (e) {
      console.log(e);
    } finally {
      setIsClaim(false);
    }
  };

  if (!merkleDistributorContract?.isInitialized && wallet.isActive) {
    return <Spin />;
  }

  return (
    <section className={s.page}>
      <div className="content-container">
        <Grid colsTemplate={'1fr 1fr'} justify={'center'} gap={30} className="mb-12">
          <div style={{ display: 'grid', alignItems: 'center' }}>
            <Grid justifySelf="center">
              <div className={s.general__info}>
                <Text
                  type="h1"
                  color="primary"
                  className="mb-8"
                  style={{ width: '400px', fontSize: '48px', textTransform: 'uppercase' }}>
                  {/* TODO ask for thin fonts */}
                  Redeem <b>ETH</b> for <b>ENTR</b>
                </Text>
                <Text type="p1" color="secondary" className="mb-32" style={{ width: '480px' }}>
                  Use the ENTR Redemption Portal to redeem your ENTR for ETH. You can redeem your ENTR at a fixed rate
                  of 0.0025376 ETH until November 2nd 2024 at 23h59 UTC.
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
            </Grid>
          </div>
          <Grid>
            <Grid
              colsTemplate="1fr 1fr 1fr"
              rowsTemplate="auto auto"
              gap={12}
              justify="space-between"
              className={cn(s.card, s.card__head, 'mb-32')}>
              <div className={s.info__vl}>
                <Hint text="This number shows the total amount of $ENTR token in treasury to." className="mb-8">
                  <Text type="p2" color="secondary" style={{ textTransform: 'none' }}>
                    {/* TODO maybe redesign needed since total would be in the millions */}
                    Total in Treasury
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                  <Text type="h3" weight="bold" color="primary">
                    {formatToken(merkleDistributorContract?.totalAirdropped?.unscaleBy(EnterToken.decimals)) ?? 0}
                  </Text>
                  &nbsp;
                  <Text type="h3">ENTR</Text>
                </div>
              </div>
              <div className={s.info__vl}>
                <Hint text="The amount of $ENTR claimed to date." className="mb-8">
                  <Text type="p2" color="secondary" style={{ textTransform: 'none' }}>
                    Total Claimed
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                  <Text type="h3" weight="bold" color="primary">
                    {formatToken(totalClaimed)}
                  </Text>
                  &nbsp;
                  <Text type="h3">ENTR</Text>
                </div>
              </div>
              <div className={s.info__vl__last}>
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
                    {formatToken(totalRedistributed)}
                  </Text>
                  &nbsp;
                  <Text type="h3" color="green">
                    ENTR
                  </Text>
                </div>
              </div>
              <div
                style={{ gridColumn: '1 / -1' }}
                className={cn(s.card, {
                  [s.card__big]: !lockedAirDrop && !merkleDistributorContract?.isAirdropClaimed,
                })}>
                {!wallet.isActive ? (
                  <div className={s.card__empty}>
                    <NotConnectWallet />
                  </div>
                ) : lockedAirDrop ? (
                  <div className={s.card__empty}>
                    <NotEligible />
                  </div>
                ) : merkleDistributorContract?.isAirdropClaimed ? (
                  <div className={s.card__empty}>
                    <AlreadyRedeemed />
                  </div>
                ) : (
                  <>
                    <div className={s.airdrop__info__details}>
                      <div className={s.total__amount__container}>
                        <div className={`${s.total__amount} ${s.general__info}`}>
                          <Hint
                            text="This is the total amount of $ENTR you are getting based on your initial airdrop amount + bonus
                      amount from redistributed $ENTR."
                            className="mb-8">
                            <Text type="p2" color="secondary">
                              Your total airdrop amount
                            </Text>
                          </Hint>
                          <div className="flex flow-col align-center">
                            <Icon width={36} height={36} name="png/enterdao" className="mr-8" />
                            <Text type="h1" weight="bold" color="primary">
                              {formatToken(userBonus?.plus(userAmount ?? 0), { decimals: 1 })}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <Grid
                        className={s.grid}
                        colsTemplate={!isMobile ? 'max-content max-content' : '1fr'}
                        gap={24}
                        justify="center">
                        <div className={`${s.total__airdropped} ${s.general__info}`}>
                          <Hint text="The amount of $ENTR token airdrop assigned to you." className="mb-8">
                            <Text type="p2" color="secondary">
                              Total airdropped
                            </Text>
                          </Hint>
                          <span>
                            <Icon width={30} height={30} name="png/enterdao" />
                            {formatToken(userAmount)}
                          </span>
                        </div>
                        <div className={`${s.total__bonuses} ${s.general__info}`}>
                          <Hint
                            text="This is the amount of additional $ENTR you have received as a result of early claimants
                      forfeiting a portion of their airdrop."
                            className="mb-8">
                            <Text type="p2" color="secondary">
                              Your bonus amount
                            </Text>
                          </Hint>
                          <div className="flex flow-col align-center">
                            <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                            <Text type="h3" weight="bold" color="green">
                              +{formatToken(userBonus)}
                            </Text>
                          </div>
                        </div>
                      </Grid>
                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Grid>
        </Grid>
        <TextAndImage image={graphic1Img} imageFirst>
          <div className={s.flex__column}>
            <Text type="h1" style={{ alignSelf: 'flex-start', textTransform: 'uppercase' }}>
              How it works
            </Text>
            <Text type="h3">
              Sorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis
              tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit
              sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
            </Text>
          </div>
        </TextAndImage>
        <TextAndImage image={graphic2Img}>
          <div className={s.flex__column}>
            <Text type="h1" style={{ alignSelf: 'flex-start', textTransform: 'uppercase' }}>
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
    </section>
  );
};

export default Redeem;
