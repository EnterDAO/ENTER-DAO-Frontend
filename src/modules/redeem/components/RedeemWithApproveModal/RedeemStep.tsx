import React from 'react';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
import { Text } from 'components/custom/typography';
import success from 'resources/svg/success.svg';

import { RedeemLoader } from './RedeemLoader';

import s from './RedeemWithApproveModal.module.scss';

enum ButtonState {
  REDEEM = 'Redeem',
  INITIATE = 'Initiate Redeem',
  INITIATED = 'Initiated',
}

export type RedeemStepProps = {
  isLoading: boolean;
  isContract: boolean;
  redeemableAmountETH?: string;
  redeemableAmountTokens?: string;
  redeem: (watchTx: boolean) => Promise<void>;
  onRedeemComplete: () => Promise<void>;
  Header: React.ReactNode;
  Loader: React.ReactNode;
};
export const RedeemStep: React.FunctionComponent<RedeemStepProps> = ({
  isContract,
  isLoading,
  redeemableAmountETH,
  redeemableAmountTokens,
  redeem,
  onRedeemComplete,
  Header,
  Loader,
}) => {
  const [isRedeeming, setIsRedeeming] = React.useState<boolean>(false);
  const [infoMessage, setInfoMessage] = React.useState<string>('');
  const [btnText, setBtnText] = React.useState<string>(ButtonState.REDEEM);

  React.useEffect(() => {
    if (isContract) {
      setBtnText(ButtonState.INITIATE);
      setInfoMessage(
        'You are trying to redeem tokens from a multi-sig address. Please make sure this transaction is not already initiated by another wallet.',
      );
    }
  }, [isContract]);

  async function redeemViaMultiSig() {
    // We do not wait for the transaction to be mined, as it is a multi-sig wallet.
    // We just notify the user that the transaction is being initiated and they need to go to their multi-sig wallet to complete the process.
    // Also, we skip watching the transaction as it is a custom flow.
    redeem(false).catch(() => {
      setBtnText(ButtonState.INITIATE);
      setInfoMessage(
        'You are trying to redeem tokens from a multi-sig address. Please make sure this transaction is not already initiated by another wallet.',
      );
    });

    setBtnText(ButtonState.INITIATED);
    setInfoMessage(
      'The transaction is being initiated. Please, go to your multi-sig wallet and complete the initiation process.',
    );
  }

  async function redeemViaEOA() {
    try {
      setIsRedeeming(true);
      await redeem(true);
      window.location.reload();
    } catch (e) {
      console.error('error', e);
    } finally {
      setIsRedeeming(false);
      onRedeemComplete();
    }
  }

  async function handleRedeem() {
    if (isContract) {
      return await redeemViaMultiSig();
    }

    return await redeemViaEOA();
  }

  if (isRedeeming) {
    return <RedeemLoader redeemableAmountETH={redeemableAmountETH} redeemableAmountTokens={redeemableAmountTokens} />;
  }

  return (
    <div>
      <div className="flex flow-row mb-32 justify-center align-center">
        {Header}
        {isLoading ? (
          Loader
        ) : (
          <>
            <img src={success} alt="approve" style={{ margin: '12px 0', width: '128px', height: '128px' }} />

            <Text type="h3" tag="span" color="primary" style={{ fontSize: '20px', color: 'white' }}>
              Successfully Approved!
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
                {infoMessage}
                {isContract && (
                  <p style={{ marginTop: '20px' }}>
                    Redeem {redeemableAmountTokens} ENTR for {redeemableAmountETH} ETH
                  </p>
                )}
              </Text>
            </Text>
          </>
        )}
      </div>

      <Spin spinning={isRedeeming}>
        <Button
          disabled={btnText === ButtonState.INITIATED}
          type="primary"
          onClick={() => handleRedeem()}
          className={s.redeem__modal__button}>
          {btnText}
        </Button>
      </Spin>
    </div>
  );
};
