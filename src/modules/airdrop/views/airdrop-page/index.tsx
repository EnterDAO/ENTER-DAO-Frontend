import { FC, useState } from 'react';
import { BigNumber as _BigNumber } from 'bignumber.js';
import cn from 'classnames';
import Lottie from 'lottie-react';
import { formatToken } from 'web3/utils';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
// import Tooltip from '../../components/antd/tooltip';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { Hint } from 'components/custom/typography';
import { useGeneral } from 'components/providers/general-provider';
import { LeagueToken } from 'components/providers/known-tokens-provider';
import cupSvgWhite from 'resources/svg/cup_transparent_white.svg';
import cupSvg from 'resources/svg/cup_transparent.svg';
import { useWallet } from 'wallets/wallet';

import { useMediaQuery } from '../../../../hooks';
import cupWaveAnimation from '../../animations/waves.json';
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
    LeagueToken.decimals,
  );
  const totalRedistributed = new _BigNumber(
    merkleDistributorContract?.totalInfo?.totalAirdropRedistributed ?? 0,
  ).unscaleBy(LeagueToken.decimals);

  const userAmount = new _BigNumber(merkleDistributorContract?.claimAmount ?? 0).unscaleBy(LeagueToken.decimals);
  const userAvailable = new _BigNumber(merkleDistributorContract?.adjustedAmount?.airdropAmount ?? 0).unscaleBy(
    LeagueToken.decimals,
  );
  const userBonus = new _BigNumber(merkleDistributorContract?.adjustedAmount?.bonusPart ?? 0).unscaleBy(
    LeagueToken.decimals,
  );

  const [isClaim, setIsClaim] = useState(false);

  const progressPercent = userAvailable
    ?.times(100)
    .div(userAmount ?? 0)
    .toNumber();

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

  if(!merkleDistributorContract?.isInitialized && wallet.isActive) {
    return <Spin />
  }

  return (
    <section className={s.page}>
      <div className="content-container">
        <div className={s.general__info}>
          <Text type="h2" weight="bold" color="primary" className="mb-8">
            Airdrop reward
          </Text>
          <Text type="p3" color="secondary" className="mb-32">
            You may have received claimable token rewards from the LeagueDAO Airdrop. Claiming your airdrop will forfeit
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
              <div>
                <Hint
                  text="This number shows the $LEAG token rewards distributed so far."
                  className="mb-8">
                  <Text type="p2" color="secondary">
                    Total airdropped
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={24} height={24} name="png/league" className="mr-6" />
                  <Text type="h3" weight="bold" color="primary">
                    {formatToken(merkleDistributorContract?.totalAirdropped?.unscaleBy(LeagueToken.decimals)) ?? 0}
                  </Text>
                </div>
              </div>
              <div>
                <Hint text="The amount of LEAG claimed to date." className="mb-8">
                  <Text type="p2" color="secondary">
                    Total claimed
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={24} height={24} name="png/league" className="mr-6" />
                  <Text type="h3" weight="bold" color="primary">
                    {formatToken(totalClaimed)}
                  </Text>
                </div>
              </div>
              <div>
                <Hint text="The amount of forfeited $LEAG redistributed across remaining recipients." className="mb-8">
                  <Text type="p2" color="secondary">
                    Total redistributed
                  </Text>
                </Hint>
                <div className="flex flow-col align-center">
                  <Icon width={24} height={24} name="png/league" className="mr-6" />
                  <Text type="h3" weight="bold" color="green">
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
                  <div className={s.week}>
                    WEEK {merkleDistributorContract?.airdropCurrentWeek}/
                    {merkleDistributorContract?.airdropDurationInWeeks}
                  </div>
                  <div className={s.airdrop__info__details}>
                    <div className={`${s.total__amount} ${s.general__info}`}>
                      <Hint
                        text="This is the total amount of $LEAG you are getting based on your initial airdrop amount + bonus
                    amount from redistributed $LEAG."
                        className="mb-8">
                        <Text type="p2" color="secondary">
                          Your total airdrop amount
                        </Text>
                      </Hint>
                      <div className="flex flow-col align-center">
                        <Icon width={36} height={36} name="png/league" className="mr-8" />
                        <Text type="h1" weight="bold" color="primary">
                          {formatToken(userBonus?.plus(userAmount ?? 0), { decimals: 1 })}
                        </Text>
                      </div>
                    </div>
                    <div className={`${s.total__airdropped} ${s.general__info}`}>
                      <Hint
                        text="The amount of $LEAG token airdrop assigned to you."
                        className="mb-8">
                        <Text type="p2" color="secondary">
                          Total airdropped
                        </Text>
                      </Hint>
                      <span>
                        <Icon width={22} height={22} name="png/league" />
                        {formatToken(userAmount)}
                      </span>
                    </div>

                    <Hint
                      text="This is the amount of additional $LEAG you have received as a result of early claimants
                    forfeiting a portion of their airdrop."
                      className="mb-8">
                      <Text type="p2" color="secondary">
                        Your bonus amount
                      </Text>
                    </Hint>
                    <div className="flex flow-col align-center">
                      <Icon width={22} height={22} name="png/league" className="mr-6" />
                      <Text type="h3" weight="bold" color="green">
                        +{formatToken(userBonus)}
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Grid>
          <div className={cn(s.card, s.card__table, { [s.card__table__empty]: lockedAirDrop || merkleDistributorContract?.isAirdropClaimed })}>
            <Grid gap={15} className={cn(s.airdrop__animateBlock, { [s.airdrop__animateBlock__empty]: lockedAirDrop || merkleDistributorContract?.isAirdropClaimed })}>
              <div className={s.cupBlock}>
                <img src={isDarkTheme ? cupSvg : cupSvgWhite} alt="" />
                {!wallet.isActive && (
                  <div className={s.cupBlock__text}>
                    <Text type="h2" weight="bold" color="primary">
                      {formatToken(userAvailable, { compact: true })}
                      {/*0*/}
                    </Text>
                    <Text type="p2" tag="span" color="primary">
                      available
                    </Text>
                  </div>
                )}
                <Lottie
                  animationData={cupWaveAnimation}
                  style={{
                    transform: `translateY(calc(-${
                      isNaN(progressPercent as number) ? 22 : (progressPercent as number) < 22 ? 22 : progressPercent
                    }% - -10px))`,
                  }}
                  className={s.waveAnimation}
                />
              </div>
              {lockedAirDrop || !merkleDistributorContract?.isAirdropClaimed && (
                <>
                  <div>
                    <Text type="p2" color="secondary">
                      Available to claim now:
                    </Text>
                    <div className="flex flow-col align-center">
                      <Icon width={24} height={24} name="png/league" className="mr-6" />
                      <Text type="h2" weight="bold" color="primary">
                        {formatToken(userAvailable)}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="p2" color="secondary">
                      You forfeit:
                    </Text>
                    <div className="flex flow-col align-center">
                      <Icon width={21} height={21} name="png/league" className="mr-6" />
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
              )}
            </Grid>
          </div>
        </Grid>
      </div>
    </section>
  );
};

export default Airdrop;
