import React, { useEffect, useState, useContext } from 'react';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavSearch from './NavSearch';
import useWindowSize from '../../../../hooks/useWindowSize';
import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';
import logo from '../../../../assets/images/web/logo.png'; // ✅ Trust Wallet logo

const NavLeft = () => {
  const configContext = useContext(ConfigContext);
  const { collapseMenu, headerFixedLayout, layout } = configContext.state;
  const { dispatch } = configContext;

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav mr-auto">
        <ListGroup.Item as="li" bsPrefix=" " className="nav-item">
          <Link id="mobile-collapse" onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}>
            <i className="pi pi-bars" />
          </Link>

          {/* ✅ Logo burada değiştirildi */}
          { collapseMenu && <img src={logo} className="collapsed-logo" alt="Trust Wallet Logo" /> }
        </ListGroup.Item>
      </ListGroup>
    </React.Fragment>
  );
};

export default NavLeft;
