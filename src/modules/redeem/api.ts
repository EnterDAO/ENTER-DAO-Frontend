import { gql } from '@apollo/client';

import { GraphClient } from '../../web3/graph/client';

export type APIRedeemedsEntity = {
  id: string;
  index: string;
  account: string;
  amount: string;
  allocatedEth: string;
  redeemedEth: string;
  transactionHash: string;
  blockNumber: string;
  blockTimestamp: string;
};

export async function fetchRedeemeds(address: string): Promise<APIRedeemedsEntity[]> {
  return GraphClient.get({
    query: gql`
      query GetRedeemeds($address: String!) {
        redeemeds(where: { account: $address }) {
          id
          index
          account
          amount
          allocatedEth
          redeemedEth
          transactionHash
          blockNumber
          blockTimestamp
        }
      }
    `,
    variables: {
      address: address,
    },
  })
    .then(result => {
      return result.data.redeemeds.map((redeemed: any) => ({
        id: redeemed.id,
        index: redeemed.index,
        account: redeemed.account,
        amount: redeemed.amount,
        allocatedEth: redeemed.allocatedEth,
        redeemedEth: redeemed.redeemedEth,
        transactionHash: redeemed.transactionHash,
        blockNumber: redeemed.blockNumber,
        blockTimestamp: redeemed.blockTimestamp,
      }));
    })
    .catch(e => {
      console.log(e);
      return [];
    });
}
