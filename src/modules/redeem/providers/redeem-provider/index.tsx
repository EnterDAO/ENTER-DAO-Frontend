import { FC, createContext, useContext, useEffect, useMemo } from 'react';
import { AbiItem } from 'web3-utils';
import ContractListener from 'web3/components/contract-listener';
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
  merkleDistributor: undefined,
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
      config.contracts.merkleDistributor,
    );
    merkleDistributor.on(Web3Contract.UPDATE_DATA, reload);
    return merkleDistributor;
  }, []);

  useEffect(() => {
    merkleDistributor.setProvider(walletCtx.provider);
  }, [walletCtx.provider]);

  useEffect(() => {
    merkleDistributor.setAccount(walletCtx.account);
    merkleDistributor.loadUserData(undefined).catch(Error);
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
