import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthGuard = ({ children }) => {
  const token = Cookies.get('access_token');

  // Token varsa ve valid mi kontrol et
  const isTokenValid = () => {
    if (!token) return false;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return decodedToken.exp > now;
    } catch (error) {
      return false;
    }
  };

  if (!isTokenValid()) {
    window.location.href = '/login';
    return null;
  }

  return children;
};

export default AuthGuard;
