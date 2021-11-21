import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const BASE_URL = process.env.REACT_APP_MINT_METADATA_URL;

export async function getNftMeta(id: string | number): Promise<any> {
  const URL = `${BASE_URL}?id=${id}`;

  const req = await fetch(URL);

  const result = await req.text().then(data => JSON.parse(data));
  return result;
}

export type getNftMetaType = (id: string | number) => Promise<any>;

export const queryShardedMindsGraph = async (graphQuery: string) => {
  const client = new ApolloClient({
    uri: process.env.REACT_APP_SUBGRAPH_METAPASS_URL,
    cache: new InMemoryCache(),
  });

  const graphData = await client.query({
    query: gql`
      ${graphQuery}
    `,
  });

  return graphData.data;
};

export const transferShardedMinds = (ownerAddress: string) => `
  query MetaPass {
    transferEntities(first: 1000, where: { to: "${ownerAddress}" }) {
      from
      id
      to
      tokenId
    }
  }
`;

export const ShardedMindsOwner = (tokenId: string) => `
  query MetaPass {
    transferEntities(where: { tokenId: "${tokenId}" }) {
      to,
      gene
    }
  }
`;

export const ShardedMindsTraitRarity = (searchedId: string) => `
  query MetaPass {
    traits(where: {id: ${searchedId}}) {
      id
      rarity
    }
  }
`;
