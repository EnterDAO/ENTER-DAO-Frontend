import React from 'react';

import Spin from 'components/antd/spin';
import { Text } from 'components/custom/typography';

export type RedeemLoaderProps = {
  redeemableAmountETH?: string;
  redeemableAmountTokens?: string;
};
export const RedeemLoader: React.FunctionComponent<RedeemLoaderProps> = ({
  redeemableAmountETH,
  redeemableAmountTokens,
}) => {
  return (
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
        Redeeming {redeemableAmountTokens?.toString()} ENTR for {redeemableAmountETH?.toString()} ETH
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
  );
};
