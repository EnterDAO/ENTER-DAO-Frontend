import { gql } from '@apollo/client';

import { GraphClient } from '../../web3/graph/client';
import { GRAPHS } from 'modules/yield-farming/api';

export type APIRedeemedsEntity = {
  account: string;
  amount: string;
  redeemedEth: string;
  transactionHash: string;
  actualBalance: string;
};

export async function fetchRedeemeds(address: string): Promise<APIRedeemedsEntity[]> {
  return GraphClient.get(
    {
      query: gql`
        query GetRedeemeds($address: String!) {
          redeemeds(where: { account: $address }) {
            account
            amount
            actualBalance
            redeemedEth
            transactionHash
          }
        }
      `,
      variables: {
        address: address,
      },
    },
    true,
    GRAPHS.REDEEM,
  )
    .then(result => {
      return result.data.redeemeds.map((redeemed: any) => ({
        account: redeemed.account,
        amount: redeemed.amount,
        actualBalance: redeemed.actualBalance,
        redeemedEth: redeemed.redeemedEth,
        transactionHash: redeemed.transactionHash,
      }));
    })
    .catch(e => {
      console.log(e);
      return [];
    });
}
