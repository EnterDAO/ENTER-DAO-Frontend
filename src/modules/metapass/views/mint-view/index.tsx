import React from 'react';

import JumbotronComponent from '../../components/jumbotron';
import MarqueeComponent from '../../components/marquee';
import MarqueeImagesComponent from '../../components/marquee-images-container';
import MintComponent from '../../components/mint-component';
import MissionCountComponent from '../../components/mission-count';
import SectionComponent from '../../components/section';
import blueWoman from './assets/blue-woman.svg';
import redWoman from './assets/red-woman.svg';

const MintView: React.FC = () => {
  return (
    <>
      <JumbotronComponent />
      <div className="content-container-fix content-container">
        <SectionComponent
          pictureLeft={true}
          heading="Story"
          imageUrl={blueWoman}
          firstParagraphText="The failure of legacy institutions, systems and media has led to the emergence of the Web3 metaverse - a parallel digital reality built around technology, decentralization, public goods and, most importantly, vibes.<br><br>
          Leaning on the foundations of decentralized finance, digital art and gaming, the Web3 metaverse is a magical space full of adventure and yield. But the Web3 metaverse is also a fragile space, protected by 'gm' from the constant threats of the non-gm-sayers on the verge of oblivion.<br><br>
          A magical space, yet a space still unaccessible to many. The legend has it that only a sharded mind can enter the metaverse."
        />
        <SectionComponent
          pictureLeft={false}
          heading="EnterDAO"
          imageUrl={redWoman}
          firstParagraphText="EnterDAO Sharded Minds is a collection of 5,000 audiovisual art-pieces created by Angela Pencheva and Raredub as contributors to EnterDAO.<br><br>
          EnterDAO is a decentralized autonomous organization founded with the mission to build the rails of the Web3 metaverse and the decentralized digital economy that encompasses it. The DAO is building a set of DeFi and Gaming products (LandWorks and MetaPortal) in a community-first way.<br><br>
          The EnterDAO Shared Minds collection, alongside LandWorks and MetaPortal, is a fundamental piece in the growth of the DAO, its community, governance, products and upcoming in-game events."
        />
        <MissionCountComponent totalNFTs={10} totalAttributes={133} mission={1} />
      </div>
      <MarqueeComponent speed={10} pauseOnHover={false} gradient={false}>
        <MarqueeImagesComponent />
      </MarqueeComponent>
      <MintComponent></MintComponent>
    </>
  );
};

export default MintView;
