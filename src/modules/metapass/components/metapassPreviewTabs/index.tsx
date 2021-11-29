import React from 'react';

import { PrveiwTab } from '../../views/single-metapass-view/models/MetapassTab';

import './index.scss';

interface IMetapassPreviewTabsProps {
  selectedTab: PrveiwTab;
  setSelectedTab: React.Dispatch<React.SetStateAction<PrveiwTab>>;
}

export const MetapassPreviewTabs: React.FC<IMetapassPreviewTabsProps> = ({ selectedTab, setSelectedTab }) => {
  const changeTab = (tab: PrveiwTab) => {
    setSelectedTab(tab);
  };
  const setSelectedTabClass = (wantedTab: PrveiwTab) => {
    return selectedTab === wantedTab ? 'tab-selected' : '';
  };

  return (
    <div id="metapass-tabs-container">
      <div onClick={() => changeTab(PrveiwTab.Image)} className={`tab ${setSelectedTabClass(PrveiwTab.Image)}`}>
        {PrveiwTab[PrveiwTab.Image]}
      </div>
      <div onClick={() => changeTab(PrveiwTab.Video)} className={`tab ${setSelectedTabClass(PrveiwTab.Video)}`}>
        {PrveiwTab[PrveiwTab.Video]}
      </div>
    </div>
  );
};
