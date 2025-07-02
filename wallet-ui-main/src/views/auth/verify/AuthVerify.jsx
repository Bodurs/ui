import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Cookies from 'js-cookie';
import ApiService from './../../../services/ApiService';

const AuthVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Query parametrelerini al
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('user_id');
  const code = searchParams.get('code');

  useEffect(() => {
    const verifyCode = async () => {
      try {
        const response = await ApiService.get(`/auth/verify?user_id=${userId}&code=${code}`);

        if (response.result.code == 0 && response.data && response.data.activation && response.data.activation.status == 0) {
          setIsValid(true);
        } else if(response.data && response.data.activation && response.data.activation.status == 1) {
          setErrorMessage('Code already used.');
        } else {
          setErrorMessage('Invalid or expired verification code.');
        }
      } catch (error) {
        setErrorMessage('Verification failed. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [userId, code]);

  const handleSetPassword = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await ApiService.post('/auth/verify', {
        password: values.password,
        confirm_password: values.confirm_password,
        user_id: userId,
        code: code
      });

      if (response.result.code == 0) {
        navigate('/login');
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Setting password failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" /> Verifying...
      </div>
    );
  }

  if (!isValid) {
    return (
      <Alert variant="danger" className="mt-4">
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Formik
      initialValues={{
        password: '',
        confirm_password: '',
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(5, 'Password must be at least 5 characters')
          .max(255, 'Password can be up to 255 characters.')
          .required('Password is required'),
        confirm_password: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords do not match')
          .required('Confirm password is required'),
      })}
      onSubmit={handleSetPassword}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
              placeholder="Password"
            />
            {touched.password && errors.password && (
              <small className="text-danger form-text">{errors.password}</small>
            )}
          </div>
          <div className="form-group mb-4">
            <input
              className="form-control"
              name="confirm_password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.confirm_password}
              placeholder="Confirm Password"
            />
            {touched.confirm_password && errors.confirm_password && (
              <small className="text-danger form-text">{errors.confirm_password}</small>
            )}
          </div>

          {errors.submit && (
            <Col sm={12}>
              <Alert variant="danger">{errors.submit}</Alert>
            </Col>
          )}

          <Row>
            <Col>
              <Button className="btn-block mb-4" disabled={isSubmitting} type="submit" variant="primary">
                Set Password
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default AuthVerify;
