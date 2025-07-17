import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef } from 'react';

import useWindowSize from '../../hooks/useWindowSize';
import { ConfigContext } from '../../contexts/ConfigContext';
import * as actionType from '../../store/actions';

import Header from './Header';
import Footer from './Footer';


const WebLayout = ({ children }) => {
    const ref = useRef();
    const configContext = useContext(ConfigContext);
    const { dispatch } = configContext;

    useEffect(() => {
        import('./../../web.css');
    }, []);

    return (
        <React.Fragment>
            <Header />
            <main className="web-layout">
                {children}
            </main>
            <Footer />
        </React.Fragment>
    );
};

WebLayout.propTypes = {
    children: PropTypes.node
};
export default WebLayout;
