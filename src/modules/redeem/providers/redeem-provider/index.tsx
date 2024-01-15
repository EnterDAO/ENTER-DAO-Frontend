import React, { FC, createContext, useContext, useEffect, useMemo } from 'react';
import { AbiItem } from 'web3-utils';
import ContractListener from 'web3/components/contract-listener';
import MerkleDistributor from 'web3/merkleDistributor';
import MerkleRedeemDistributor from 'web3/merkleRedeemDistributor';
import Web3Contract from 'web3/web3Contract';

import config from 'config';
import { useReload } from 'hooks/useReload';
import { useWallet } from 'wallets/wallet';

import MerkleDistributorABI from '../../../../merkle-distributor/MerkleDistributor.json';

export type RedeemType = {
  merkleDistributor?: MerkleRedeemDistributor;
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
    const merkleDistributor = new MerkleRedeemDistributor(
      MerkleDistributorABI.abi as AbiItem[],
      '0xf3bFEC2EAE9AdaaDedF8BDcbCAC1A11F4A907353',
    );

    //const merkleDistributor = new MerkleDistributor(MerkleDistributorABI, '0x008cC6e39B764c2AfAd0fdcd1Dd452a2573d7B9F');
    merkleDistributor.on(Web3Contract.UPDATE_DATA, reload);

    return merkleDistributor;
  }, []);

  // useEffect(() => {
  //   merkleDistributor.loadCommonFor().catch(Error);
  // }, []);

  useEffect(() => {
    merkleDistributor.setProvider(walletCtx.provider);
  }, [walletCtx.provider]);

  useEffect(() => {
    merkleDistributor.setAccount(walletCtx.account);
    merkleDistributor.loadUserData().catch(Error);
  }, [walletCtx.account]);

  const value: RedeemType = {
    merkleDistributor,
  };

  return (
    <RedeemContext.Provider value={value}>
      {children}
      <ContractListener contract={merkleDistributor} />
    </RedeemContext.Provider>
  );
};

export default RedeemProvider;
