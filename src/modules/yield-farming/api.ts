import { gql } from '@apollo/client';
import BigNumber from 'bignumber.js';

import { GraphClient } from '../../web3/graph/client';

import { PaginatedResult } from 'utils/fetch';

export enum APIYFPoolActionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export type APIYFPoolTransaction = {
  userAddress: string;
  tokenAddress: string;
  amount: BigNumber;
  transactionHash: string;
  actionType: APIYFPoolActionType;
  blockTimestamp: number;
};

export function fetchYFPoolTransactions(
  page = 1,
  limit = 10,
  tokenAddress: string,
  userAddress: string = 'all',
  actionType: string = 'all',
): Promise<PaginatedResult<APIYFPoolTransaction>> {
  return GraphClient.get({
    query: gql`
    query($actionType: String, $tokenAddress: String, $userAddress: String){
      transactions(first: 1000, orderBy: blockTimestamp, orderDirection: desc, where: {${
        actionType != 'all' ? 'actionType: $actionType,' : ''
      }${tokenAddress != 'all' ? 'tokenAddress: $tokenAddress,' : ''}${
      userAddress != 'all' ? 'userAddress: $userAddress,' : ''
    }}){
        actionType,
        tokenAddress,
        userAddress,
        amount,
        transactionHash,
        blockTimestamp
      }
    }
  `,
    variables: {
      actionType: actionType,
      tokenAddress: tokenAddress != 'all' ? tokenAddress : undefined,
      userAddress: userAddress != 'all' ? userAddress : undefined,
    },
  })
    .catch(e => {
      console.log(e);
      return { data: [], meta: { count: 0, block: 0 } };
    })
    .then(result => {
      console.log(result);
      return {
        data: result.data.transactions.slice(limit * (page - 1), limit * page),
        meta: { count: result.data.transactions.length, block: page },
      };
    })
    .then((result: PaginatedResult<APIYFPoolTransaction>) => {
      return {
        ...result,
        data: (result.data ?? []).map((item: APIYFPoolTransaction) => ({
          ...item,
          amount: new BigNumber(item.amount),
        })),
      };
    });
}

export type UserAssets = {
  id: string;
  assets: any;
};

/**
 * Gets all the assets for a given user.
 * @param address The address of the user
 */
export function fetchUserAssets(address: string): Promise<UserAssets> {
  return GraphClient.get({
    query: gql`
      query GetUser($id: String) {
        user(id: $id) {
          id
          assets {
            id
            metaverseAssetId
            minPeriod
            maxPeriod
            maxFutureTime
            unclaimedRentFee
            pricePerSecond
            lastRentEnd
            status
            paymentToken {
              id
              name
              symbol
              decimals
            }
            decentralandData {
              metadata
              isLAND
              coordinates {
                id
                x
                y
              }
            }
          }
        }
      }
    `,
    variables: {
      id: address.toLowerCase(),
    },
  })
    .then(async response => {
      const result = { ...response.data.user };
      console.log(result);
      // const ownerAndConsumerAssets = [...result.assets, ...result.consumerTo];
      // const uniqueAssets = [...new Map(ownerAndConsumerAssets.map(v => [v.id, v])).values()].sort(
      //   (a: AssetEntity, b: AssetEntity) => Number(b.id) - Number(a.id),
      // );

      // result.ownerAndConsumerAssets = parseAssets(uniqueAssets);
      // result.unclaimedRentAssets = parseAssets(
      //   uniqueAssets.filter((a: any) => BigNumber.from(a.unclaimedRentFee)?.gt(0)),
      // );
      // result.hasUnclaimedRent = result.unclaimedRentAssets.length > 0;
      return result;
    })
    .catch(e => {
      console.log(e);
      return {} as UserAssets;
    });
}
