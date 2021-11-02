import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import cn from 'classnames';

import Icon from 'components/custom/icon';

import s from './s.module.scss';
import { useGeneral } from '../../../components/providers/general-provider';
import useMediaQuery from '../../../hooks/useMediaQuery';
import Socials from './components/Socials';

const LayoutFooter: React.FC = () => {
  const { isDarkTheme } = useGeneral();
  const isMobile = useMediaQuery(992);

  const { location: { pathname } } = useHistory();

  const getYear = () => {
    return new Date().getFullYear();
  }

  return (
    <footer className={s.footer}>
      <div className="container-limit">
        <div className={s.row}>
          {!isMobile ? (
              <>
                <div>
                  <Link to="/" >
                    <Icon name={isDarkTheme ? 'png/logo-dark-text' : 'png/logo-light-text'} width="auto" className={s.logo} />
                  </Link>
                </div>
                <div className={s.nav}>
                  <a href='https://fiatdao.com/' target="_blank" rel="noopener" className={cn(s.dropdownLink)}>
                    <span>Home</span>
                  </a>
                  <Link to="/liquidity-mining"  className={cn(s.dropdownLink, { [s.dropdownLink_active]: pathname.split('/')[1] === 'liquidity-mining'  })}>
                    <span>Liquidity mining</span>
                  </Link>
                  {/*<Link to="/fiat-dao" className={s.dropdownLink}>*/}
                  {/*  <span>FIAT DAO</span>*/}
                  {/*</Link>*/}
                </div>
              </>
          ) : (
            <Socials />
          )}
        </div>
      </div>
      <div className={cn(s.row, s.copyrightsBlock)}>
        <div className="container-limit">
          <div className={s.copyrightsBlock__row}>
            {isMobile && (
              <>
                <div className={s.nav}>
                  <a href='https://fiatdao.com/' target="_blank" rel="noopener" className={cn(s.dropdownLink)}>
                    <span>Home</span>
                  </a>
                  <Link to="/liquidity-mining" className={s.dropdownLink}>
                    <span>Liquidity mining</span>
                  </Link>
                  {/*<Link to="/fiat-dao" className={s.dropdownLink}>*/}
                  {/*  <span>FIAT DAO</span>*/}
                  {/*</Link>*/}
                </div>
                <Link to="/" >
                  <Icon name={isDarkTheme ? 'png/logo-dark-text' : 'png/logo-light-text'} width="auto" className={s.logo} />
                </Link>
              </>
            )}
            <div className={s.copyrightLink}>fiatdao.com © {getYear()}. Open-sourced.</div>
            {!isMobile && (
            <div className={s.copyrightLinks}>
                <Socials />
            </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LayoutFooter;
