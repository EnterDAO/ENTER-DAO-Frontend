/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';

import './index.scss';

interface IMetapassDescription {
  description: string;
}

const MetapassDescription: React.FC<IMetapassDescription> = ({ description }) => {
  const [readMore, setReadMore] = useState(false);

  const linkName = readMore ? ' Read Less' : ' Read More';
  const toggleReadMore = () => {
    setReadMore(!readMore);
  };
  return (
    <div className="description">
      {readMore ? description : description?.substring(0, 155) + '...'}
      {description ? (
        <a className="read-more-link" onClick={toggleReadMore}>
          <span>{linkName}</span>
        </a>
      ) : (
        <></>
      )}
    </div>
  );
};
export default MetapassDescription;
