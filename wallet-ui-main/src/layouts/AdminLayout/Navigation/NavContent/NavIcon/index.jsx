import PropTypes from 'prop-types';
import React from 'react';

const NavIcon = ({ items }) => {
  let navIcons = false;
  if (items.icon) {
    if(items.icon.startsWith('pi ')) {
      navIcons = (
        <span className="pcoded-micon">
          <i className={items.icon} />
        </span>
      );
    } else {
      navIcons = (
        <span className="pcoded-micon">
          <img className="menu-icon-image" src={`assets/images/icons/${items.icon}.png`}/>
        </span>
      );
    }
  }

  return <React.Fragment>{navIcons}</React.Fragment>;
};

NavIcon.propTypes = {
  items: PropTypes.object,
  icon: PropTypes.string
};

export default NavIcon;
