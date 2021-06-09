import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';
import { Link, useRouteMatch } from 'react-router-dom';
import cn from 'classnames';

import Button from 'components/antd/button';
import Divider from 'components/antd/divider';
import Popover from 'components/antd/popover';
import Tooltip from 'components/antd/tooltip';
import ExternalLink from 'components/custom/externalLink';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';
import { useGeneral } from 'components/providers/general-provider';
import { useWarning } from 'components/providers/warning-provider';
import ConnectedWallet from 'wallets/components/connected-wallet';
import { useWallet } from 'wallets/wallet';

import s from './s.module.scss';

const modalRoot = document.getElementById('modal-root') || document.body;

const LayoutHeader: React.FC = () => {
  const { navOpen, setNavOpen, toggleDarkTheme, isDarkTheme } = useGeneral();
  const [referenceElement, setReferenceElement] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const [popper1visible, setPopper1visible] = useState<boolean>(false);
  const [popper2visible, setPopper2visible] = useState<boolean>(false);
  const [popper3visible, setPopper3visible] = useState<boolean>(false);
  const wallet = useWallet();
  const { warns } = useWarning();

  const { styles, attributes, forceUpdate, state } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    strategy: 'absolute',
  });

  useEffect(() => {
    forceUpdate?.();
  }, [warns.length]);

  useEffect(() => {
    if (navOpen && window.innerWidth > 768) {
      setNavOpen(false);
    }
  }, [window.innerWidth]);

  const isGovernancePage = useRouteMatch('/governance');

  return (
    <div className={s.component} ref={setReferenceElement}>
      <ExternalLink href="https://universe.xyz/" target="_self">
        <Icon name="png/universe" width="auto" height="auto" className={s.logo} />
      </ExternalLink>
      <div className={s.titleDelimiter} />
      <h1 className={s.title}>{isGovernancePage ? 'Governance' : 'Yield Farming'}</h1>

      <nav className={s.nav}>
        <Popover
          visible={popper1visible}
          onVisibleChange={setPopper1visible}
          trigger={['click', 'hover']}
          noPadding
          content={
            <div className={cn('card', s.dropdown)}>
              <span className={s.dropdownLink} aria-disabled="true">
                <Icon name="auction" width={20} height={20} className={s.dropdownIcon} />
                <Tooltip title="Coming soon" placement="top" hint>
                  <span>Auction house</span>
                </Tooltip>
              </span>
              <span className={s.dropdownLink} aria-disabled="true">
                <Icon name="marketplace" width={20} height={20} className={s.dropdownIcon} />
                <Tooltip title="Coming soon" placement="top" hint>
                  <span>NFT marketplace</span>
                </Tooltip>
              </span>
              <span className={s.dropdownLink} aria-disabled="true">
                <Icon name="social-media" width={20} height={20} className={s.dropdownIcon} />
                <Tooltip title="Coming soon" placement="top" hint>
                  <span>Social media</span>
                </Tooltip>
              </span>
            </div>
          }>
          <Button type="link" className={s.navLink}>
            <Grid flow="col" align="center">
              <Text type="p1" weight="500" color="primary" className="mr-4">
                Products
              </Text>
              <Icon name="dropdown-arrow" width={12} height={12} className={s.dropdownArrow} />
            </Grid>
          </Button>
        </Popover>
        <Popover
          visible={popper2visible}
          onVisibleChange={setPopper2visible}
          trigger={['click', 'hover']}
          noPadding
          content={
            <div className={cn('card', s.dropdown)}>
              <ExternalLink
                href="https://universe.xyz/about"
                className={s.dropdownLink}
                onClick={() => setPopper2visible(false)}>
                <Icon name="about" width={20} height={20} className={s.dropdownIcon} />
                <span>About</span>
              </ExternalLink>
              <ExternalLink
                href="https://github.com/UniverseXYZ/UniverseXYZ-Whitepaper"
                className={s.dropdownLink}
                onClick={() => setPopper2visible(false)}>
                <Icon name="whitepaper" width={20} height={20} className={s.dropdownIcon} />
                <span>Whitepaper</span>
              </ExternalLink>
              <ExternalLink
                href="https://universe.xyz/team"
                className={s.dropdownLink}
                onClick={() => setPopper2visible(false)}>
                <Icon name="team" width={20} height={20} className={s.dropdownIcon} />
                <span>Team</span>
              </ExternalLink>
            </div>
          }>
          <Button type="link" className={s.navLink}>
            <Grid flow="col" align="center">
              <Text type="p1" weight="500" color="primary" className="mr-4">
                Info
              </Text>
              <Icon name="dropdown-arrow" width={12} height={12} className={s.dropdownArrow} />
            </Grid>
          </Button>
        </Popover>
        <Popover
          noPadding
          visible={popper3visible}
          trigger={['click', 'hover']}
          onVisibleChange={setPopper3visible}
          content={
            <div className={cn('card', s.dropdown)}>
              <Link to="/governance" className={s.dropdownLink} onClick={() => setPopper3visible(false)}>
                <Icon name="governance" width={20} height={20} className={s.dropdownIcon} />
                <span>Governance</span>
              </Link>
              <Link to="/yield-farming" className={s.dropdownLink} onClick={() => setPopper3visible(false)}>
                <Icon name="yield-farming" width={20} height={20} className={s.dropdownIcon} />
                <span>Yield farming</span>
              </Link>
              <ExternalLink
                href="https://docs.universe.xyz/"
                className={s.dropdownLink}
                onClick={() => setPopper3visible(false)}>
                <Icon name="docs" width={20} height={20} className={s.dropdownIcon} />
                <span>Docs</span>
              </ExternalLink>
            </div>
          }>
          <Button type="link" className={s.navLink}>
            <Grid flow="col" align="center">
              <Text type="p1" weight="500" color="primary" className="mr-4">
                DAO
              </Text>
              <Icon name="dropdown-arrow" width={12} height={12} className={s.dropdownArrow} />
            </Grid>
          </Button>
        </Popover>
      </nav>
      <ConnectedWallet />
      <Button type="link" className={s.burger} onClick={() => setNavOpen(prevState => !prevState)}>
        <Icon name={navOpen ? 'burger-close' : 'burger'} style={{ color: 'var(--theme-primary-color)' }} />
      </Button>
      {navOpen &&
        ReactDOM.createPortal(
          <div
            ref={setPopperElement}
            className={cn(s.mobileMenu, { [s.open]: navOpen })}
            style={
              {
                ...styles.popper,
                bottom: 0,
                right: 0,
                '--top': `${state?.modifiersData?.popperOffsets?.y || 0}px`,
              } as React.CSSProperties
            }
            {...attributes.popper}>
            <div className={s.mobileInner}>
              <div className={s.mobileMenuInner}>
                <div className={s.mobileMenuBlock}>
                  <h3>Products</h3>
                  <span className={s.dropdownLink} aria-disabled="true">
                    <Icon name="auction" width={20} height={20} className={s.dropdownIcon} />
                    <Tooltip title="Coming soon" placement="top" hint>
                      <span>Auction house</span>
                    </Tooltip>
                  </span>
                  <span className={s.dropdownLink} aria-disabled="true">
                    <Icon name="marketplace" width={20} height={20} className={s.dropdownIcon} />
                    <Tooltip title="Coming soon" placement="top" hint>
                      <span>NFT marketplace</span>
                    </Tooltip>
                  </span>
                  <span className={s.dropdownLink} aria-disabled="true">
                    <Icon name="social-media" width={20} height={20} className={s.dropdownIcon} />
                    <Tooltip title="Coming soon" placement="top" hint>
                      <span>Social media</span>
                    </Tooltip>
                  </span>
                </div>
                <div className={s.mobileMenuBlock}>
                  <h3>Info</h3>
                  <ExternalLink
                    href="https://universe.xyz/about"
                    className={s.dropdownLink}
                    onClick={() => setNavOpen(false)}>
                    <Icon name="about" width={20} height={20} className={s.dropdownIcon} />
                    <span>About</span>
                  </ExternalLink>
                  <ExternalLink
                    href="https://github.com/UniverseXYZ/UniverseXYZ-Whitepaper"
                    className={s.dropdownLink}
                    onClick={() => setNavOpen(false)}>
                    <Icon name="whitepaper" width={20} height={20} className={s.dropdownIcon} />
                    <span>Whitepaper</span>
                  </ExternalLink>
                  <ExternalLink
                    href="https://universe.xyz/team"
                    className={s.dropdownLink}
                    onClick={() => setNavOpen(false)}>
                    <Icon name="team" width={20} height={20} className={s.dropdownIcon} />
                    <span>Team</span>
                  </ExternalLink>
                </div>
                <div className={s.mobileMenuBlock}>
                  <h3>DAO</h3>
                  <Link to="/governance" className={s.dropdownLink} onClick={() => setNavOpen(false)}>
                    <Icon name="governance" width={20} height={20} className={s.dropdownIcon} />
                    <span>Governance</span>
                  </Link>
                  <Link to="/yield-farming" className={s.dropdownLink} onClick={() => setNavOpen(false)}>
                    <Icon name="yield-farming" width={20} height={20} className={s.dropdownIcon} />
                    <span>Yield farming</span>
                  </Link>
                  <ExternalLink
                    href="https://docs.universe.xyz/"
                    className={s.dropdownLink}
                    onClick={() => setNavOpen(false)}>
                    <Icon name="docs" width={20} height={20} className={s.dropdownIcon} />
                    <span>Docs</span>
                  </ExternalLink>
                </div>
                {!wallet.isActive && !isMobile ? (
                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <Divider />
                    <button
                      type="button"
                      className="button-ghost"
                      onClick={() => {
                        setNavOpen(false);
                        wallet.showWalletsModal();
                      }}
                      style={{ margin: '20px auto 0' }}>
                      <span>Sign in</span>
                    </button>
                  </div>
                ) : null}
              </div>
              <button type="button" className={s.themeSwitcher} onClick={toggleDarkTheme}>
                <Icon name={isDarkTheme ? 'theme-switcher-sun' : 'theme-switcher-moon'} width={24} height={24} />
                <span>{isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
            </div>
          </div>,
          modalRoot,
        )}
    </div>
  );
};

export default LayoutHeader;
