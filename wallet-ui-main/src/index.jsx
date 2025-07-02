import React from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

import { ConfigProvider } from './contexts/ConfigContext';
import { AuthService } from './services/AuthContext';

import App from './App';
import reportWebVitals from './reportWebVitals';

import 'leaflet/dist/leaflet.css';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <AuthService>
    <ConfigProvider>
      <PrimeReactProvider>
        <GoogleOAuthProvider clientId="862423435465-jh5o9orshpia6klt21cobkq4mjjpcaao.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </PrimeReactProvider>
    </ConfigProvider>
  </AuthService>
);

reportWebVitals();
