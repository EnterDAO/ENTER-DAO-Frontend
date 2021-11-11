const BASE_URL = process.env.REACT_APP_MINT_METADATA_URL;

export async function getNftMeta(id: string | number): Promise<any> {
  const URL = `${BASE_URL}?id=${id}`;

  const req = await fetch(URL);

  const result = await req.text().then(data => JSON.parse(data));
  return result;
}

export type getNftMetaType = (id: string | number) => Promise<any>;
