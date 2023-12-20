import { FC, ReactNode } from 'react';

import s from './TextAndImage.module.scss';

type TextAndImageFlexProps = {
  children: ReactNode;
  image?: string;
  imageFirst?: boolean;
};

const TextAndImage: FC<TextAndImageFlexProps> = ({ children, image, imageFirst }) => {
  return (
    <div className={s.flex__row} style={{ alignItems: 'center' }}>
      {image && <img src={image} alt={`${image}`} style={{ order: imageFirst ? 0 : 1 }} />}
      <div style={{ justifyContent: 'center', alignItems: 'flex-start', order: imageFirst ? 1 : 0, flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default TextAndImage;
