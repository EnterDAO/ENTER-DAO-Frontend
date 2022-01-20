import React, { useMemo } from 'react';
import ContractListener from 'web3/components/contract-listener';
import Erc20Contract from 'web3/erc20Contract';
import Erc721Contract from 'web3/erc721Contract';
import Web3Contract from 'web3/web3Contract';

import { EnterToken, LandWorksToken } from 'components/providers/known-tokens-provider';
import config from 'config';
import useMergeState from 'hooks/useMergeState';
import { useReload } from 'hooks/useReload';
import { YfNftStakingContract } from 'modules/yield-farming/contracts/yfNftStaking';
import { useWallet } from 'wallets/wallet';

type LandowrksYfContextType = {
  landworksYf: YfNftStakingContract;
  landworksContract: Erc721Contract;
};

const LandowrksYfContext = React.createContext<LandowrksYfContextType>({
  landworksYf: undefined as any,
  landworksContract: undefined as any,
});

export function useLandworksYf(): LandowrksYfContextType {
  return React.useContext(LandowrksYfContext);
}

const LandowrksYfProvider: React.FC = props => {
  const { children } = props;

  const walletCtx = useWallet();
  const [reload] = useReload();

  const landworksYf = useMemo(() => {
    const landworksYf = new YfNftStakingContract(config.contracts.yf.landworks);
    landworksYf.on(Web3Contract.UPDATE_DATA, reload);

    return landworksYf;
  }, []);

  const landworksContract = useMemo(() => {
    const landworksContract = new Erc721Contract([], config.tokens.landworks);
    landworksContract.on(Web3Contract.UPDATE_DATA, reload);

    return landworksContract;
  }, []);

  const [state, setState] = useMergeState<LandowrksYfContextType>({
    landworksYf: landworksYf,
    landworksContract: landworksContract,
  });

  React.useEffect(() => {
    landworksYf.setProvider(walletCtx.provider);
  }, [walletCtx.provider]);

  React.useEffect(() => {
    const entrContract = EnterToken.contract as Erc20Contract;

    entrContract.setAccount(walletCtx.account);
    landworksYf.setAccount(walletCtx.account);
    landworksContract.setAccount(walletCtx.account);

    if (walletCtx.isActive) {
      entrContract.loadAllowance(config.contracts.dao.barn).catch(Error);
      landworksYf.loadAccountMethods().catch(Error);
    }
    landworksContract.loadBalance(config.contracts.yf.landworks).catch(Error);
    landworksYf.loadCommon().catch(Error);
  }, [walletCtx.account]);

  return (
    <LandowrksYfContext.Provider
      value={{
        ...state,
        landworksYf,
        landworksContract,
      }}>
      {children}
      <ContractListener contract={landworksYf} />
      <ContractListener contract={landworksContract} />
    </LandowrksYfContext.Provider>
  );
};

export default LandowrksYfProvider;
