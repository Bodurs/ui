import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';

import NavGroup from './NavGroup';
import NavCard from './NavCard';

const NavContent = ({ navigation }) => {

  const location = useLocation();
  const { t } = useTranslation();

  const [releaseNotesVisible, setReleaseNotesVisible] = useState(false);
  const isAdminPage = location.pathname.startsWith('/admin');
  let navItems = [];

  if (isAdminPage) {
    navItems = navigation.map((item) => {
      if (item.id == 'organization') {
        switch (item.type) {
          case 'group':
            return <NavGroup key={'nav-group-' + item.id} group={item} />;
          default:
            return false;
        }
      }
    });
  } else {
    navItems = navigation.map((item) => {
      if (item.id == 'navigation') {
        switch (item.type) {
          case 'group':
            return <NavGroup key={'nav-group-' + item.id} group={item} />;
          default:
            return false;
        }
      }
    });
  }

  let mainContent = '';

  mainContent = (
    <div className="navbar-content datta-scroll">
      <PerfectScrollbar>
        <ListGroup variant="flush" as="ul" bsPrefix=" " className="nav pcoded-inner-navbar" id="nav-ps-next">
          {navItems}
        </ListGroup>
        {/*<NavCard />*/}
      </PerfectScrollbar>
    </div>
  );

  return <React.Fragment>
    {mainContent}
    <div style={{ bottom: '0px', position: 'absolute', textAlign: 'center', width: '100%', justifyContent: 'center', fontSize: '10px' }}>
      v0.0.5 - <span onClick={() => setReleaseNotesVisible(true)} style={{ cursor: 'pointer' }}>{t('Release Notes')}</span></div>
    <Dialog
      header={t('Release Notes')}
      visible={releaseNotesVisible}
      style={{ width: '50vw' }}
      onHide={() => setReleaseNotesVisible(false)}
      modal
    >
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {/* Sürüm notları buraya */}
        <p>v0.0.5 - Beta version</p>
      </div>
    </Dialog>
  </React.Fragment>;
};

NavContent.propTypes = {
  navigation: PropTypes.array
};

export default NavContent;
