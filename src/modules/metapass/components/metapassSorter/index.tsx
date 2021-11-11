import React from 'react';

import sortImg from './assets/sorting.svg';
import { SortDirection } from './models/SortDirection';

import './index.scss';

interface IMetapassSorterProps {
  onSortDirectionChange: (sortDir: SortDirection) => void;
  sortDir: SortDirection;
}
export const MetapassSorter: React.FC<IMetapassSorterProps> = ({ onSortDirectionChange, sortDir }) => {
  const transformStyle = sortDir === SortDirection.DESC ? { transform: 'rotateX(180deg)' } : {};
  return (
    <div id="sort-wrapper" onClick={() => onSortDirectionChange(sortDir)}>
      <img style={transformStyle} id="sort-image" alt="asc" src={sortImg}></img>
    </div>
  );
};
