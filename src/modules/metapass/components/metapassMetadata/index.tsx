import React from 'react';
import { shortenAddr } from 'web3/utils';

import './index.scss';

interface IMetapassMetadataProps {
  ownerAddress: string;
  genome: string;
}

export const MetapassMetadata: React.FC<IMetapassMetadataProps> = ({ ownerAddress, genome }) => {
  const etherscanLink = 'https://rinkeby.etherscan.io';

  return (
    <div id="metapass-metadata-container">
      <div className="metapass-metadata-prop">
        <span>Owner</span>
        <a href={`${etherscanLink}/${process.env.REACT_APP_METAPASS_ADDR}?a=${ownerAddress}`}>
          {shortenAddr(ownerAddress)}
        </a>
      </div>
      <div className="metapass-metadata-prop">
        <span>Genome</span>
        <span>{shortenAddr(genome)} </span>
      </div>
    </div>
  );
};
