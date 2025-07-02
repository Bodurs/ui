import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

import AuthLogin from './JWTLogin';

const Signin1 = () => {
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
              <AuthLogin />
              <p className="mb-2 text-muted">
                Don't have an account?{' '}
              </p>
              <Button className="btn-block mb-12 signin-button" onClick={() => navigate('/register')} size="large" type="submit" variant="outline-primary">
                Create an account
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
