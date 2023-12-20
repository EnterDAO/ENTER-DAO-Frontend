import React, { FC, createContext, useContext, useEffect, useMemo } from 'react';
import ContractListener from 'web3/components/contract-listener';
import MerkleDistributor from 'web3/merkleDistributor';
import Web3Contract from 'web3/web3Contract';

import config from 'config';
import { useReload } from 'hooks/useReload';
import { useWallet } from 'wallets/wallet';

export type RedeemType = {
  merkleDistributor?: MerkleDistributor;
};

const RedeemContext = createContext<RedeemType>({
  merkleDistributor: undefined, // TODO add merkleDistributor
});

export function useRedeem(): RedeemType {
  return useContext(RedeemContext);
}

const RedeemProvider: FC = props => {
  const { children } = props;

  const walletCtx = useWallet();
  const [reload] = useReload();
  const merkleDistributor = useMemo(() => {
    const merkleDistributor = new MerkleDistributor([], config.contracts.merkleDistributor);
    merkleDistributor.on(Web3Contract.UPDATE_DATA, reload);

    return merkleDistributor;
  }, []);

  useEffect(() => {
    merkleDistributor.loadCommonFor().catch(Error);
  }, []);

  useEffect(() => {
    merkleDistributor.setProvider(walletCtx.provider);
  }, [walletCtx.provider]);

  useEffect(() => {
    merkleDistributor.setAccount(walletCtx.account);
    merkleDistributor.loadUserData().catch(Error);
  }, [walletCtx.account]);


  const value: RedeemType = {
    merkleDistributor
  };

  return (
    <RedeemContext.Provider value={value}>
      {children}
      <ContractListener contract={merkleDistributor} />
    </RedeemContext.Provider>
  );
};

export default RedeemProvider;
