import { gql } from '@apollo/client';
import BigNumber from 'bignumber.js';

import { GraphClient } from '../../web3/graph/client';

import { PaginatedResult } from 'utils/fetch';
import config from 'config';

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

export async function fetchDecentralandFloor(): Promise<number> {
  return fetch(`${config.web3.opensea.url}collection/decentraland/stats`)
    .then(res => res.json())
    .then(result => result.stats.floor_price)
    .catch(Error);
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

export type Data = {
  name: string;
  description: string;
  ipns: string;
  version: string;
};

export function getDecentralandAssetName(decentralandData: DecentralandData): string {
  if (decentralandData === null) {
    return '';
  }

  const data = buildData(decentralandData.metadata);
  if (data != null && data.name != '') {
    return data.name;
  }

  if (decentralandData.metadata !== '') {
    return decentralandData.metadata;
  }
  if (decentralandData.coordinates.length > 1) {
    return `Estate (${decentralandData.coordinates.length} LAND)`;
  }
  const coordinates = decentralandData.coordinates[0];
  return `LAND (${coordinates.x}, ${coordinates.y})`;
}

export function buildData(csv: string): Data | null {
  const dataEntity: Data = {} as Data;

  if (csv.charAt(0) != '0') {
    return null;
  }

  const data = parseCSV(csv);
  if (data.length === 0 || data[0] != '0') {
    return null;
  }

  dataEntity.version = data[0];

  if (data.length > 1) {
    dataEntity.name = data[1];
  }
  if (data.length > 2) {
    dataEntity.description = data[2];
  }
  if (data.length > 3) {
    dataEntity.ipns = data[3];
  }

  return dataEntity;
}

/**
 * Used for parseCSV() below
 */
enum CSVState {
  BETWEEN = 0,
  UNQUOTED_VALUE = 1,
  QUOTED_VALUE = 2,
}

/**
 * Parses a CSV string into an array of strings.
 * @param csv CSV string.
 * @returns Array of strings.
 */
export function parseCSV(csv: string): Array<string> {
  const values = new Array<string>();
  let valueStart = 0;
  let state = CSVState.BETWEEN;

  for (let i = 0; i < csv.length; i++) {
    if (state == CSVState.BETWEEN) {
      if (csv.charAt(i) != ',') {
        if (csv.charAt(i) == '"') {
          state = CSVState.QUOTED_VALUE;
          valueStart = i + 1;
        } else {
          state = CSVState.UNQUOTED_VALUE;
          valueStart = i;
        }
      }
    } else if (state == CSVState.UNQUOTED_VALUE) {
      if (csv.charAt(i) == ',') {
        values.push(csv.substr(valueStart, i - valueStart));
        state = CSVState.BETWEEN;
      }
    } else if (state == CSVState.QUOTED_VALUE) {
      if (csv.charAt(i) == '"') {
        values.push(csv.substr(valueStart, i - valueStart));
        state = CSVState.BETWEEN;
      }
    }
  }

  return values;
}
