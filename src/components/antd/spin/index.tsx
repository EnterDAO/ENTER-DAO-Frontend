import React from 'react';
import AntdSpin, { SpinProps as AntdSpinProps } from 'antd/lib/spin';
import cn from 'classnames';

import loading from 'resources/svg/loading.svg';

import s from './s.module.scss';

type Props = AntdSpinProps & {
  type?: 'default' | 'circle';
};

const Spin: React.FC<Props> = props => {
  const { type = 'default', className, ...spinProps } = props;

  const indicator = React.useMemo(() => {
    switch (type) {
      case 'circle':
        return <img src={loading} alt="Loading" className={s.spinner} style={{ width: '128px', height: '128px' }} />; // Use SVG
      default:
        break;
    }

    return undefined;
  }, [type]);

  return <AntdSpin indicator={indicator} className={cn(s.spin, className)} {...spinProps} />;
};

export default Spin;
