import { gql } from '@apollo/client';

import { PaginatedResult } from 'utils/fetch';
import {GraphClient} from '../../web3/graph/client';

export type APIAirdropTotal = {
  totalAirdropClaimed: string;
  totalAirdropRedistributed: string;
};

export function fetchAirdropTotal(
  first = 1,
): Promise<APIAirdropTotal> {
  return GraphClient.get({
    query: gql`
      query($first: Int){
        overviews(first: $first) {
          totalAirdropClaimed
          totalAirdropRedistributed
        }
      }
    `,
    variables: {
      first: first,
    },
  })
  .then(({ data }) => {
    return {
      totalAirdropClaimed: data.overviews.length ? data.overviews[0].totalAirdropClaimed : '0',
      totalAirdropRedistributed: data.overviews.length ? data.overviews[0].totalAirdropRedistributed: '0',
    }
  })
  .catch(e => {
    console.log(e)
    return {
      totalAirdropClaimed: '0',
      totalAirdropRedistributed: '0',
    }
  })
}

export type APIAirdropClaims = {
  adjustedAmount: string;
  redistributedAmount: string;
};

export function fetchAirdropClaims(
  page = 1,
  limit = 10,
): Promise<PaginatedResult<APIAirdropClaims>> {
  return GraphClient.get({
    query: gql`
      query($first: Int){
        claims(first: $first) {
          claimer
          claimAmount
        }
      }
    `,
    variables: {
      first: 1000,
    },
  })
  .then(result => {
    console.log(result)
    return { data: result.data.claims.slice(limit * (page - 1), limit * page), meta: { count: result.data.claims.length, block: page } }
  })
    // .then(({ data }) => {
    //   return {
    //     adjustedAmount: data.claims.length ? data.claims[0].adjustedAmount : '0',
    //     redistributedAmount: data.claims.length ? data.claims[0].redistributedAmount: '0',
    //   }
    // })
  .catch(e => {
    console.log(e)
    return { data: [], meta: { count: 0, block: 0 } }
  })
}
