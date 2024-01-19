import { FC, useEffect, useMemo, useState } from 'react';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { BigNumber as _BigNumber } from 'bignumber.js';
import cn from 'classnames';
import { BigNumber } from 'ethers';
import { shortenAddr } from 'web3/utils';

import Spin from 'components/antd/spin';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { Hint } from 'components/custom/typography';
import { EthToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import BalanceTree from 'merkle-distributor/balance-tree';
import FAQs from 'modules/redeem/components/FAQs';
import RedeemModal from 'modules/redeem/components/ReedemModal';
import { useRedeem } from 'modules/redeem/providers/redeem-provider';
import warning from 'resources/svg/warning.svg';
import { useWallet } from 'wallets/wallet';

import tokenAbi from '../../../../ABI/ERC20_Mock_ABI.json';
import redeemData from '../../../../merkle-distributor/tree.json';
import graphic1Img from '../../animations/graphic1.svg';
import graphic2Img from '../../animations/graphic2.svg';
import AlreadyRedeemed from '../../components/AlreadyRedeemed';
import NotConnectWallet from '../../components/NotConnectWallet';
import NotEligible from '../../components/NotEligible';
import TextAndImage from '../../components/TextAndImage';

import s from './redeem.module.scss';

const Redeem: FC = () => {
  const redeemCtx = useRedeem();
  const walletCtx = useWallet();
  const [tokenBalance, setTokenBalance] = useState(0);
  const { account, library } = useWeb3React();
  const erc20TokenContract = useMemo(() => {
    if (library) {
      return new Contract(config.tokens.entr, tokenAbi, library.getSigner());
    }
  }, [library, config.tokens.entr, tokenAbi]);

  const [redeemModalVisible, showRedeemModal] = useState(false);
  const merkleDistributorContract = redeemCtx.merkleDistributor;

  const wallet = useWallet();

  const redeemAmountETH = merkleDistributorContract?.allocatedEth || 0;
  const redeemAmountENTR = merkleDistributorContract?.allocatedTokens || 0;
  const redeemIndex = merkleDistributorContract?.redeemIndex ?? -1;

  const tree = useMemo(() => {
    if (walletCtx.account) {
      const redeemAccounts = Object.entries(redeemData.redemptions).map(([address, data]) => ({
        account: address,
        tokens: BigNumber.from((data as any).tokens),
        eth: BigNumber.from((data as any).eth),
      }));

      return new BalanceTree(redeemAccounts);
    }
  }, [walletCtx]);

  const merkleProof =
    redeemIndex !== -1
      ? tree?.getProof(
          +redeemIndex,
          walletCtx.account || '',
          BigNumber.from(redeemAmountENTR),
          BigNumber.from(redeemAmountETH),
        )
      : [];

  useEffect(() => {
    if (account && library && erc20TokenContract && walletCtx.account) {
      const fetchBalance = async () => {
        const balance = await erc20TokenContract?.balanceOf(account);
        setTokenBalance(balance.toString());
      };
      merkleDistributorContract?.loadCommonFor(walletCtx.account).catch(Error);

      fetchBalance().catch(console.error);
    }
  }, [
    account,
    library,
    config.tokens.entr,
    tokenAbi,
    merkleDistributorContract,
    erc20TokenContract,
    walletCtx.account,
  ]);

  const userData = {
    index: redeemIndex,
    account: walletCtx.account,
    tokens: redeemAmountENTR,
    eth: redeemAmountETH,
    merkleProof: merkleProof,
    actualBalance: tokenBalance,
    library: library,
    erc20: erc20TokenContract,
  };
  merkleDistributorContract!.loadUserData(userData);

  const lockedRedeem =
    merkleDistributorContract?.redeemIndex === -1 || merkleDistributorContract?.redeemIndex === undefined;

  const allocatedEth = new _BigNumber(merkleDistributorContract?.allocatedEth ?? 0).unscaleBy(EthToken.decimals);
  const allocatedTokens = new _BigNumber(merkleDistributorContract?.allocatedTokens ?? 0);
  const redeemedAmountETH = new _BigNumber(merkleDistributorContract?.redeemedAmount ?? 0).unscaleBy(EthToken.decimals);
  const redeemableAmountTokens = new _BigNumber(merkleDistributorContract?.redeemableAmountTokens ?? 0);
  const redeemableAmountETH = new _BigNumber(merkleDistributorContract?.redeemableAmountETH ?? 0).unscaleBy(
    EthToken.decimals,
  );

  if (!merkleDistributorContract?.isInitialized && wallet.isActive) {
    return <Spin />;
  }

  const handleRedeem = () => {
    showRedeemModal(true);
  };

  return (
    <section className={s.page}>
      <Grid colsTemplate={'1fr 1fr'} className={cn(s.grid__container, s.card__big)}>
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
                <Icon width={30} height={30} name="png/eth" className="mr-6" />
                <Text type="h3" weight="bold" color="primary">
                  {!wallet.isActive || lockedRedeem ? (
                    '--'
                  ) : merkleDistributorContract?.isRedeemClaimed === undefined ? (
                    <Spin />
                  ) : merkleDistributorContract?.isRedeemClaimed ? (
                    redeemedAmountETH?.toFixed(5)
                  ) : (
                    '0.00000'
                  )}
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
                <Icon width={30} height={30} name="png/eth" className="mr-6" />
                <Text type="h3" weight="bold" color="green">
                  {!wallet.isActive || lockedRedeem ? (
                    '--'
                  ) : merkleDistributorContract?.isRedeemClaimed === undefined ? (
                    <Spin />
                  ) : merkleDistributorContract?.isRedeemClaimed ? (
                    allocatedEth?.minus(redeemedAmountETH!).toFixed(5)
                  ) : (
                    allocatedEth?.toFixed(5)
                  )}
                </Text>
                &nbsp;
                <Text type="h3" color="green">
                  ETH
                </Text>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {!wallet.isActive ? (
              <div className={s.card__empty}>
                <NotConnectWallet />
              </div>
            ) : lockedRedeem ? (
              <div className={s.card__empty}>
                <NotEligible />
              </div>
            ) : merkleDistributorContract?.isRedeemClaimed === undefined ? (
              <div className={s.card__empty}>
                <Spin />
              </div>
            ) : merkleDistributorContract?.isRedeemClaimed ? (
              <div className={s.card__empty}>
                <AlreadyRedeemed
                  entrAmount={redeemableAmountTokens?.toString()}
                  ethAmount={redeemedAmountETH?.toFixed(5)!}
                />
              </div>
            ) : (
              <div className={s.redeem__info__details}>
                <div className={s.redeem__container}>
                  <Text type="h2">{`ENTR Tokens ${shortenAddr(wallet.account, 5, 3)} can redeem`}</Text>
                  <Text type="h1" style={{ fontSize: '48px' }}>
                    {redeemableAmountTokens?.toString()} ENTR
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Text type="h2" style={{ color: '#625F97', fontSize: '16px' }}>
                      {' '}
                      1 ENTR = 0.002 ETH
                    </Text>

                    <Text type="h2" style={{ color: 'white', fontSize: '16px' }}>
                      {' '}
                      {redeemableAmountTokens?.toString()} ENTR = {redeemableAmountETH?.toFixed(5)} ETH
                    </Text>
                  </div>
                </div>
                <div className={s.redeem__button_container}>
                  <button className={cn('button-primary', s.redeem__button)} onClick={handleRedeem}>
                    Redeem {redeemableAmountTokens?.toString()} ENTR for {redeemableAmountETH?.toFixed(5)} ETH
                  </button>
                  <div className={s.warning__container}>
                    <div>
                      <img src={warning} alt="" style={{ marginRight: '10px' }} />
                    </div>
                    <div>
                      <span style={{ textTransform: 'revert' }}>
                        <b>Pay Attention</b>
                      </span>{' '}
                      <br />
                      <span style={{ color: '#B9B9D3', textTransform: 'revert' }}>
                        You can redeem your tokens only once.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Grid>
      </Grid>
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
          userData={userData}
          merkleDistributor={merkleDistributorContract}
          onCancel={() => showRedeemModal(false)}
          className="redeem__modal"
        />
      )}
    </section>
  );
};

export default Redeem;
