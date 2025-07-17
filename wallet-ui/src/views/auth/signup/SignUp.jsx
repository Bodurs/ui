import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import AuthSignup from './JWTSignup';

const Signup = () => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <div className="mb-4">
                <i className="feather icon-unlock auth-icon" />
              </div>
              <AuthSignup />
              <br />
              <p className="mb-2 text-muted">
                Already have an account?{' '}
              </p>
              <Button className="btn-block mb-12 signin-button" onClick={() => navigate('/login')} size="large" type="submit" variant="outline-primary">
                Login
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signup;
