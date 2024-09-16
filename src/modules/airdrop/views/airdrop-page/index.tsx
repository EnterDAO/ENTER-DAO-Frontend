import { FC, useEffect, useState } from 'react';
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
import base from 'resources/svg/base.svg';
import loaderForDark from 'resources/svg/dark.svg';
import loaderForWhite from 'resources/svg/light.svg';
import { useWallet } from 'wallets/wallet';

import { useMediaQuery } from '../../../../hooks';
import waves2 from '../../animations/waves2.json';
import AirdropClaimed from '../../components/AirdropClaimed';
import NotConnectWallet from '../../components/NotConnectWallet';
import NotEligible from '../../components/NotEligible';
import { useAirdrop } from '../../providers/airdrop-provider';

import s from './airdrop.module.scss';

const Airdrop: FC = () => {
  const { isDarkTheme } = useGeneral();
  const isTablet = useMediaQuery(992);
  const isMobile = useMediaQuery(720);
  const airdropCtx = useAirdrop();

  const merkleDistributorContract = airdropCtx.merkleDistributor;

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
        <div className={s.general__info}>
          <Text type="h1" weight="bold" color="primary" className="mb-8">
            Airdrop reward
          </Text>
          <Text type="p1" color="secondary" className="mb-32">
            You may have received claimable token rewards from the EnterDAO Airdrop. Claiming your airdrop will forfeit
            a portion of your balance. Your total claimable amount will rise whenever someone forfeits a portion of
            their reward.
          </Text>
        </div>
        <Grid colsTemplate={!isTablet ? '1fr 350px' : '1fr'} gap={30} className="mb-12">
          <Grid rowsTemplate="auto 1fr auto">
            <Grid
              colsTemplate={!isMobile ? '1fr 1fr 1fr' : '1fr'}
              gap={24}
              justify="space-between"
              className={cn(s.card, s.card__head, 'mb-32')}>
              <div className={s.info__vl}>
                <Hint text="This number shows the $ENTR token rewards distributed so far." className="mb-8">
                  <Text type="p2" color="secondary">
                    Total airdropped
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                  <Text type="h2" weight="bold" color="primary">
                    {formatToken(merkleDistributorContract?.totalAirdropped?.unscaleBy(EnterToken.decimals)) ?? 0}
                  </Text>
                </div>
              </div>
              <div className={s.info__vl}>
                <Hint text="The amount of $ENTR claimed to date." className="mb-8">
                  <Text type="p2" color="secondary">
                    Total claimed
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                  <Text type="h2" weight="bold" color="primary">
                    {formatToken(totalClaimed)}
                  </Text>
                </div>
              </div>
              <div>
                <Hint text="The amount of forfeited $ENTR redistributed across remaining recipients." className="mb-8">
                  <Text type="p2" color="secondary">
                    Total redistributed
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                  <Text type="h2" weight="bold" color="green">
                    {formatToken(totalRedistributed)}
                  </Text>
                </div>
              </div>
            </Grid>
            <div
              className={cn(s.card, { [s.card__big]: !lockedAirDrop && !merkleDistributorContract?.isAirdropClaimed })}>
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
                  <AirdropClaimed />
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
          <div
            className={cn(s.card, s.card__table, {
              [s.card__table__empty]: lockedAirDrop || merkleDistributorContract?.isAirdropClaimed,
            })}>
            <Grid
              gap={15}
              className={cn(s.airdrop__animateBlock, {
                [s.airdrop__animateBlock__empty]: lockedAirDrop || merkleDistributorContract?.isAirdropClaimed,
              })}>
              <div className={s.phoneBlock}>
                <div className={s.week}>
                  <Text type="small" color="secondary">
                    WEEK
                  </Text>
                  <Text type="small" weight="bold" color="secondary">
                    {merkleDistributorContract?.airdropCurrentWeek}/{merkleDistributorContract?.airdropDurationInWeeks}
                  </Text>
                </div>
                <img src={isDarkTheme ? loaderForDark : loaderForWhite} alt="" />
                {!wallet.isActive && (
                  <Lottie
                    animationData={waves2}
                    style={{
                      transform: `translateY(calc(-${22}%))`,
                    }}
                    className={s.waveAnimation}
                    type="loop"
                  />
                )}
                {wallet.isActive && (
                  <Lottie
                    animationData={waves2}
                    style={{
                      transform: `translateY(calc(-${
                        isNaN(progressPercent as number) ? 22 : (progressPercent as number) < 22 ? 22 : progressPercent
                      }%))`,
                    }}
                    className={s.waveAnimation}
                  />
                )}
              </div>
              {lockedAirDrop ||
                (!merkleDistributorContract?.isAirdropClaimed && (
                  <>
                    <div>
                      <Text type="p2" color="secondary" className={s.uppercase}>
                        Available to claim now:
                      </Text>
                      <div className="flex flow-col align-center">
                        <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                        <Text type="h2" weight="bold" color="primary">
                          {formatToken(userAvailable)}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Text type="p2" color="secondary" className={s.uppercase}>
                        You forfeit:
                      </Text>
                      <div className="flex flow-col align-center">
                        <Icon width={30} height={30} name="png/enterdao" className="mr-6" />
                        <Text type="p2" weight="bold" color="red">
                          {formatToken(userBonus?.plus(userAmount ?? 0)?.minus(userAvailable ?? 0))}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Button
                        type="primary"
                        onClick={handleClaim}
                        disabled={
                          merkleDistributorContract?.adjustedAmount?.airdropAmount === undefined ||
                          merkleDistributorContract?.isAirdropClaimed ||
                          isClaim
                        }>
                        Claim
                      </Button>
                    </div>
                  </>
                ))}
            </Grid>
          </div>
        </Grid>
      </div>
    </section>
  );
};

export default Airdrop;
