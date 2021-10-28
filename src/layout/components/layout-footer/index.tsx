import React, { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Antd from 'antd';
import AntdSpin from 'antd/lib/spin';
import cn from 'classnames';

import Tooltip from 'components/antd/tooltip';
import ExternalLink from 'components/custom/externalLink';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import config, { FDT_MARKET_LINK, FDT_MARKET_LIQUIDITY_LINK } from 'config';

import s from './s.module.scss';
import { useGeneral } from '../../../components/providers/general-provider';

const LayoutFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkTheme } = useGeneral();

  const getYear = () => {
    return new Date().getFullYear();
  }

  return (
    <footer className={s.footer}>
      <div className="container-limit">
        <div className={s.row}>
          <div><Icon name={isDarkTheme ? 'png/logo-dark' : 'png/logo-light'} width="auto" height="auto" className={s.logo} /></div>
          <div className={s.nav}>
            <Link to="/" className={s.dropdownLink}>
              <span>Home</span>
            </Link>
            <Link to="/liquidity-mining" className={s.dropdownLink}>
              <span>Liquidity mining</span>
            </Link>
            <Link to="/fiat-dao" className={s.dropdownLink}>
              <span>FIAT DAO</span>
            </Link>
          </div>
        </div>
      </div>
      <div className={cn(s.row, s.copyrightsBlock)}>
        <div className="container-limit">
          <div className={s.copyrightsBlock__row}>
            <div className={s.copyrightLink}>fiatdao.com © {getYear()}. Open-sourced.</div>
            <div className={s.copyrightLinks}>
              <div className={s.sLinksWrap}>
                <ExternalLink href="https://twitter.com/EnterDao" className={s.sLink}>
                  <Icon name="twitter" width="20" height="20" />
                </ExternalLink>
                <ExternalLink href="https://discord.gg/7QJvEctG2G" className={s.sLink}>
                  <Icon name="discord" width="20" height="20" />
                </ExternalLink>
                <ExternalLink href="https://www.coingecko.com/en/coins/enterdao" className={s.sLink}>
                  <Icon name="coingecko" width="20" height="20" />
                </ExternalLink>
                <ExternalLink href="https://medium.com/enterdao" className={s.sLink}>
                  <Icon name="medium" width="20" height="20" />
                </ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LayoutFooter;
