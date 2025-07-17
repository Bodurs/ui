import React, { useState, useEffect, useContext } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ChatList from './ChatList';
import ApiService from './../../../../services/ApiService';
import { useAuth } from './../../../../services/AuthContext';
import useWindowSize from '../../../../hooks/useWindowSize';
import { US, TR } from 'country-flag-icons/react/3x2'

import avatar1 from '../../../../assets/images/user/avatar-1.jpg';
import avatar2 from '../../../../assets/images/user/avatar-2.jpg';
import avatar3 from '../../../../assets/images/user/avatar-3.jpg';
import avatar4 from '../../../../assets/images/user/avatar-4.jpg';

import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';

const NavRight = () => {

  const { t, i18n } = useTranslation();
  const windowSize = useWindowSize();
  let navItemClass = ['nav-item'];
  
  const configContext = useContext(ConfigContext);
  const { dispatch } = configContext;

  const navigate = useNavigate();

  /*if (windowSize.width <= 575) {
    navItemClass = [...navItemClass, 'd-none'];
  }*/

  const { user } = useAuth();
  const [listOpen, setListOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [me, setMe] = useState({});
  const [gtfsFiles, setGtfsFiles] = useState([]);
  const [gtfsFileId, setGtfsFileId] = useState(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      name: 'Joseph William',
      image: avatar2,
      details: 'Purchase New Theme and make payment',
      activity: '30 min'
    },
    {
      name: 'Sara Soudein',
      image: avatar3,
      details: 'currently login',
      activity: '30 min'
    },
    {
      name: 'Suzen',
      image: avatar4,
      details: 'Purchase New Theme and make payment',
      activity: 'yesterday'
    }
  ]);

  useEffect(() => {
    getMe();
    getGtfsFiles();
    setGtfsFileId(Cookies.get('feed_id'));
  }, []);

  const handleChangeLanguage = (lng) => {
    setShowLangDropdown(false);
    if(i18n.language != lng) {
      i18n.changeLanguage(lng);
      Cookies.set('lang', lng, { expires: 30 });
    }
  };

  const logout = () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    Cookies.remove('feed_id', { path: '/' });
    window.location.reload();
  }
  
  async function getMe() {
    try {
      const response = await ApiService.get('/api/0/v1/base/auth/me');
      setMe(response.data.data);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  async function getGtfsFiles() {
    try {
      const response = await ApiService.get('/api/0/v1/gtfs/feeds/get');
      setGtfsFiles(response.data.data);
    } catch (error) {
      throw error;
    }
  }

  const changeGtfsFile = async (fileId) => {
    await ApiService.post('/api/0/v1/base/user/changefeed', { feed_id: fileId });
    Cookies.set('feed_id', fileId, { expires: 7 });
    setGtfsFileId(fileId);
    location.reload();
  };

  const openChat = () => {
    setChatOpen(true);
    //dispatch({ type: actionType.CLOSE_MENU });
    /*const rootDiv = document.getElementById('root');
    if (rootDiv && !rootDiv.classList.contains('chat-open-class')) {
      rootDiv.classList.add('chat-open-class');
    }*/
  };

  const closeChat = () => {
    setChatOpen(false);
    //dispatch({ type: actionType.OPEN_MENU });
    /*const rootDiv = document.getElementById('root');
    if (rootDiv && rootDiv.classList.contains('chat-open-class')) {
      rootDiv.classList.remove('chat-open-class');
    }*/
  };

  const handleToggle = (isOpen) => {
    setShowLangDropdown(isOpen);
  };

  const handleUserToggle = (isOpen) => {
    setShowUserDropdown(isOpen);
  };

  const handleNavigation = (path) => {
    console.log("xxx");
    setShowUserDropdown(false);
    navigate(path);
  };

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        

        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown align={'end'} className="drp-user" show={showUserDropdown} onToggle={handleUserToggle}>
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-profile-image" className="drp-profile-pic">
              <img src={me.profile_pic_url ? me.profile_pic_url : avatar1} className="img-radius profile-menu-image" alt="User Profile" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head">
                <img src={me.profile_pic_url ? me.profile_pic_url : avatar1} className="img-radius" alt="User Profile" />
                <span>{me?.name + ' ' + me?.surname}</span>
                <Link onClick={logout} className="dud-logout" title="Logout">
                  <i className="feather icon-log-out" />
                </Link>
              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={(e) => {
                    e.preventDefault();
                    console.log("xxxx");
                    handleNavigation('/admin/users');
                  }}>
                    <i className="pi pi-cog" /> {t('Settings')}
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
        
        
      </ListGroup>
      <ChatList chatOpen={chatOpen} closed={closeChat} />
    </React.Fragment>
  );
};

export default NavRight;
