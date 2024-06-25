import React from 'react';

import Button from 'components/antd/button';
import Spin from 'components/antd/spin';
import { Text } from 'components/custom/typography';
import signing from 'resources/svg/signing.svg';

import s from './RedeemWithApproveModal.module.scss';

enum ButtonState {
  APPROVE = 'Approve',
  INITIATE = 'Initiate Approval',
  INITIATED = 'Initiated',
}
export type ApproveStepProps = {
  isLoading: boolean;
  isContract: boolean;
  approve: () => Promise<any>;
  onApproveComplete: () => Promise<void>;
  Header: React.ReactNode;
  Loader: React.ReactNode;
};
export const ApproveStep: React.FunctionComponent<ApproveStepProps> = ({
  isLoading,
  isContract,
  approve,
  onApproveComplete,
  Header,
  Loader,
}) => {
  const [isApproving, setIsApproving] = React.useState<boolean>(false);
  const [infoMessage, setInfoMessage] = React.useState<string>('');
  const [btnText, setBtnText] = React.useState<string>(ButtonState.APPROVE);

  React.useEffect(() => {
    if (isContract) {
      setBtnText(ButtonState.INITIATE);
      setInfoMessage(
        'You are trying to approve tokens from a multi-sig address. Please make sure this transaction is not already initiated by another wallet.',
      );
    }
  }, [isContract]);

  async function approveViaMultiSig() {
    // We do not wait for the transaction to be mined, as it is a multi-sig wallet.
    // We just notify the user that the transaction is being initiated and they need to go to their multi-sig wallet to complete the process.
    approve().catch(() => {
      setBtnText(ButtonState.INITIATE);
      setInfoMessage(
        'You are trying to approve tokens from a multi-sig address. Please make sure this transaction is not already initiated by another wallet.',
      );
    });

    setBtnText(ButtonState.INITIATED);
    setInfoMessage(
      'The transaction is being initiated. Please, go to your multi-sig wallet and complete the initiation process.',
    );
  }

  async function approveViaEOA() {
    try {
      setIsApproving(true);
      const tx = await approve();
      await tx.wait();
    } catch (error) {
      console.error(error);
    } finally {
      setIsApproving(false);
      await onApproveComplete();
    }
  }

  async function handleApprove() {
    if (isContract) {
      return await approveViaMultiSig();
    }

    return await approveViaEOA();
  }

  return (
    <div>
      <div className="flex flow-row mb-32 justify-center align-center">
        {Header}
        {isLoading ? (
          Loader
        ) : (
          <>
            <img src={signing} alt="approve" style={{ margin: '12px 0', width: '128px', height: '128px' }} />

            <Text type="h3" tag="span" color="primary" style={{ fontSize: '20px', color: 'white' }}>
              Approve and Redeem?
            </Text>
            {infoMessage && (
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
                </Text>
              </Text>
            )}
          </>
        )}
      </div>
      <Spin spinning={isApproving}>
        <Button
          disabled={btnText === ButtonState.INITIATED}
          type="primary"
          onClick={() => handleApprove()}
          className={s.redeem__modal__button}>
          {btnText}
        </Button>
      </Spin>
    </div>
  );
};
