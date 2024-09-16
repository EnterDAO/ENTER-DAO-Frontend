import React, { Suspense, lazy } from 'react';
import { isMobile } from 'react-device-detect';
import { Redirect, Route, Switch } from 'react-router-dom';
import AntdSpin from 'antd/lib/spin';

import { useWarning } from 'components/providers/warning-provider';

import RedeemProvider from './providers/redeem-provider';

const RedeemView = lazy(() => import('./views/redeem-page'));

const RedeemPageView: React.FC = () => {
  const warning = useWarning();

  React.useEffect(() => {
    let warningDestructor: () => void;

    if (isMobile) {
      warningDestructor = warning.addWarn({
        text: 'Transactions can only be made from the desktop version using Metamask',
        closable: true,
        storageIdentity: 'bb_desktop_metamask_tx_warn',
      });
    }

    return () => {
      warningDestructor?.();
    };
  }, [isMobile]);

  return (
    <RedeemProvider>
      <Suspense fallback={<AntdSpin />}>
        <Switch>
          <Route path="/redeem" exact component={RedeemView} />
          <Redirect to="/redeem" />
        </Switch>
      </Suspense>
    </RedeemProvider>
  );
};

export default RedeemPageView;
