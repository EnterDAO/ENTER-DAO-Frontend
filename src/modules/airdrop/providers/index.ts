import React, { FC, createContext, useContext, useEffect, useMemo } from 'react';
import ContractListener from 'web3/components/contract-listener';
import MerkleDistributor from 'web3/merkleDistributor';
import Web3Contract from 'web3/web3Contract';

import config from 'config';
import { useReload } from 'hooks/useReload';
import { useWallet } from 'wallets/wallet';

export type AirdropType = {
  merkleDistributor?: MerkleDistributor;
};

const AirdropContext = createContext<AirdropType>({
  merkleDistributor: undefined,
});

export function useAirdrop(): AirdropType {
  return useContext(AirdropContext);
}

const AirdropProvider: FC = props => {
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


  const value: AirdropType = {
    merkleDistributor
  };

  return (
    <AirdropContext.Provider value={value}>
      {children}
      <ContractListener contract={merkleDistributor} />
    </AirdropContext.Provider>
  );
};

export default AirdropProvider;
