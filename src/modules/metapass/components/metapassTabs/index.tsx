import React from 'react';

import { MetapassTab } from '../../views/single-metapass-view/models/MetapassTab';

import './index.scss';

interface IMetapassTabsProps {
  selectedTab: MetapassTab;
  setSelectedTab: React.Dispatch<React.SetStateAction<MetapassTab>>;
}
export const MetapassTabs: React.FC<IMetapassTabsProps> = ({ selectedTab, setSelectedTab }) => {
  const changeTab = (tab: MetapassTab) => {
    setSelectedTab(tab);
  };
  const setSelectedTabClass = (wantedTab: MetapassTab) => {
    return selectedTab === wantedTab ? 'tab-selected' : '';
  };

  return (
    <div id="metapass-tabs-container">
      <div
        onClick={() => changeTab(MetapassTab.Properties)}
        className={`tab ${setSelectedTabClass(MetapassTab.Properties)}`}>
        {MetapassTab[MetapassTab.Properties]}
      </div>
      <div
        onClick={() => changeTab(MetapassTab.Metadata)}
        className={`tab ${setSelectedTabClass(MetapassTab.Metadata)}`}>
        {MetapassTab[MetapassTab.Metadata]}
      </div>
    </div>
  );
};
