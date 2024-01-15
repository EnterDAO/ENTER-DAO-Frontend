import { FC, ReactNode } from 'react';

import s from './TextAndImage.module.scss';

type TextAndImageFlexProps = {
  children: ReactNode;
  image?: string;
  imageFirst?: boolean;
};

const TextAndImage: FC<TextAndImageFlexProps> = ({ children, image, imageFirst }) => {
  return (
    <div className={s.flex__row} style={{ margin: '0 auto', paddingTop: 80 }}>
      {image && <img src={image} alt={`${image}`} style={{ order: imageFirst ? 0 : 1 }} />}
      <div
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          order: imageFirst ? 1 : 0,
          flex: 1,
          padding: 120,
          maxWidth: imageFirst ? '608px' : '850px',
        }}>
        {children}
      </div>
    </div>
  );
};

export default TextAndImage;
