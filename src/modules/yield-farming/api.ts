import { gql } from '@apollo/client';
import BigNumber from 'bignumber.js';

import { GraphClient } from '../../web3/graph/client';

import { PaginatedResult } from 'utils/fetch';

const GRAPHS = {
  LANDWORKS: 'landworks',
  DAO_GOVERNANCE: 'primaryUrl',
};

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
  tokenIds: string[];
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
        blockTimestamp,
        tokenIds
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

export type UserNotStakedAsset = {
  id: string;
  decentralandData: DecentralandData;
}

export type UserStakedAssets = {
  tokenId: string;
};

export type UserStakedAssetsWithData = {
  id: string;
  decentralandData: DecentralandData;
};

/**
 * Gets all the listed assets for a given user.
 * @param address The address of the user
 */
export function fetchNotStakedAssets(address: string): Promise<UserNotStakedAsset[]> {
  return GraphClient.get(
    {
      query: gql`
        query GetUser($id: String) {
          assets(where: { owner: $id, status: "LISTED" }) {
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
      `,
      variables: {
        id: address.toLowerCase(),
      },
    },
    true,
    GRAPHS.LANDWORKS,
  )
    .then(async response => {
      const result = [...response.data.assets];
      return result;
    })
    .catch(e => {
      console.log(e);
      return [] as UserNotStakedAsset[];
    });
}

export function fetchStakedAssets(address: string): Promise<UserStakedAssets[]> {
  return GraphClient.get({
    query: gql`
      query($user: String) {
        erc721StakedTokens(where: { owner: $user }) {
          id
          owner
          tokenId
        }
      }
    `,
    variables: {
      user: address.toLowerCase(),
    },
  })
    .then(async response => {
      const result = [...response.data.erc721StakedTokens];
      return result;
    })
    .catch(e => {
      console.log(e);
      return [] as UserStakedAssets[];
    });
}

export function fetchAssetsById(ids: string[]): Promise<UserStakedAssetsWithData[]> {
  return GraphClient.get(
    {
      query: gql`
        query fetchAssetsDecentralandData($ids: [String]) {
          assets(where: { id_in: $ids }) {
            id
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
      `,
      variables: {
        ids: ids,
      },
    },
    true,
    GRAPHS.LANDWORKS,
  )
    .then(async response => {
      const result = [...response.data.assets];
      return result;
    })
    .catch(e => {
      console.log(e);
      return [] as UserStakedAssetsWithData[];
    });
}

export type DecentralandData = {
  metadata: string;
  isLAND: boolean;
  coordinates: any[];
};

export function getDecentralandAssetName(decentralandData: DecentralandData): string {
  if (decentralandData === null) {
    return '';
  }
  if (decentralandData.metadata !== '') {
    return decentralandData.metadata;
  }
  if (decentralandData.coordinates.length > 1) {
    return `Estate (${decentralandData.coordinates.length} LAND)`;
  }
  const coordinates = decentralandData.coordinates[0].id.split('-');
  return `LAND (${coordinates[0]}, ${coordinates[1]})`;
}
